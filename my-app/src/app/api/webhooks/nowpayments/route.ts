import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { decrypt } from '@/lib/encryption';

// The IPN secret key configured in NowPayments Dashboard for our Master Account
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || 'your-ipn-secret';

// Helper to verify NowPayments IPN signature
function verifySignature(payload: any, signature: string | null): boolean {
    if (!signature) return false;

    // Sort keys and stringify exactly as NowPayments requires
    const keys = Object.keys(payload).sort();
    const sortedPayload = keys.reduce((acc: any, key) => {
        acc[key] = payload[key];
        return acc;
    }, {});

    const dataString = JSON.stringify(sortedPayload);
    const hmac = crypto.createHmac('sha512', IPN_SECRET);
    hmac.update(dataString);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
}

export async function POST(req: Request) {
    try {
        const signature = req.headers.get('x-nowpayments-sig');
        const body = await req.json();

        // 1. Verify the webhook payload comes from our authentic provider
        // STRICT SECURITY: We MUST verify signature to prevent fake balance updates
        if (!verifySignature(body, signature)) {
            console.error('CRITICAL: Invalid Webhook Signature Detected! Possible Attack.');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const { payment_id, payment_status, actually_paid, pay_currency } = body;

        // We only care about finalized successful payments or partially paid for this logic
        if (payment_status !== 'finished' && payment_status !== 'partially_paid') {
            // Return 200 so they stop retrying, but we don't process it as a balance addition yet
            return NextResponse.json({ received: true, status: `ignored_${payment_status}` });
        }

        // 2. Find the pending transaction in our database
        const transaction = await prisma.transaction.findFirst({
            where: {
                providerTxId: payment_id.toString(),
                status: 'PENDING',
            },
            include: {
                merchant: true, // Need merchant data to update balance and send their webhook
            },
        });

        if (!transaction) {
            console.error(`Transaction not found or already processed for payment_id: ${payment_id}`);
            return NextResponse.json({ error: 'Transaction not found or already processed' }, { status: 404 });
        }

        // 3. Update the Transaction Status Atomically
        const resolvedStatus = payment_status === 'partially_paid' ? 'SUCCESS' : 'SUCCESS';

        // SECURITY ENHANCEMENT: Atomic Update to prevent Race Conditions 
        // If webhooks are duplicated/retried and hit at the exact same millisecond, 
        // they both read 'PENDING'. This atomic update ensures ONLY ONE request 
        // can change the status from PENDING to SUCCESS.
        const updatedTransactions = await prisma.transaction.updateMany({
            where: {
                id: transaction.id,
                status: 'PENDING'
            },
            data: { status: resolvedStatus },
        });

        if (updatedTransactions.count === 0) {
            // Already processed by another concurrent request
            return NextResponse.json({ success: true, message: 'Already processed concurrently' });
        }

        // We know we are the ONE request that transitioned it. Now safely update balances.

        // Update the linked invoice 
        if (transaction.invoiceId) {
            const invoice = await prisma.invoice.update({
                where: { id: transaction.invoiceId },
                data: { status: 'COMPLETED' }
            });

            // ============================================================
            // AUTO PLAN UPGRADE: Detect bot subscription payment
            // orderId format: "PLAN_UPGRADE:PRO" or "PLAN_UPGRADE:PREMIUM"
            // ============================================================
            if (invoice.orderId && invoice.orderId.startsWith('PLAN_UPGRADE:')) {
                const planId = invoice.orderId.replace('PLAN_UPGRADE:', '');

                let botClicksQuota = 500;
                let hostingPowerLimit = 1.0;
                let productLimitQuota = 10;
                let trialActive = true;

                if (planId === 'PRO') {
                    botClicksQuota = 50000;
                    hostingPowerLimit = 2.0;
                    productLimitQuota = 500;
                    trialActive = false;
                } else if (planId === 'PREMIUM') {
                    botClicksQuota = 1000000;
                    hostingPowerLimit = 4.0;
                    productLimitQuota = 10000;
                    trialActive = false;
                }

                if (['PRO', 'PREMIUM'].includes(planId)) {
                    await prisma.user.update({
                        where: { id: invoice.userId },
                        data: {
                            plan: planId as any,
                            botClicksQuota,
                            hostingPowerLimit,
                            productLimitQuota,
                            trialActive,
                        },
                    });
                    console.log(`[Plan Upgrade] User ${invoice.userId} upgraded to ${planId} after payment.`);
                }
            }

            // Auto-fulfill Bot Deposits
            if (invoice.orderId && invoice.orderDescription?.startsWith("Bot Deposit")) {
                // @ts-ignore
                const botPayment = await prisma.botPayment.update({
                    where: { id: invoice.orderId },
                    data: { status: "completed" },
                    include: { customer: true }
                });

                if (botPayment) {
                    // @ts-ignore
                    await prisma.botCustomer.update({
                        where: { id: botPayment.customerId },
                        data: {
                            balance: { increment: botPayment.amount }
                        }
                    });
                }
            }
        }

        // 4. Update the Merchant's Balance
        const updatedMerchant = await prisma.user.update({
            where: { id: transaction.userId },
            data: {
                availableBalance: {
                    increment: transaction.amountMerchant, // Add the 97% to their available balance
                },
                totalIncome: {
                    increment: transaction.amountMerchant, // Update lifetime stats
                },
            },
        });

        // 5. Fire Webhook to the Merchant (if configured)
        if (updatedMerchant.webhookUrl) {
            try {
                // Create a signature so the merchant can verify our payload (using their API Key or a dedicated webhook secret)
                // For now, we will just send a POST request with the transaction data

                const merchantPayload = {
                    event: 'payment.success',
                    payment: {
                        platformTxId: transaction.platformTxId,
                        status: resolvedStatus,
                        amount: transaction.amount.toString(),
                        currency: transaction.currency,
                        netSettled: transaction.amountMerchant.toString(),
                        paidCurrency: pay_currency,
                        paidCryptoAmount: actually_paid,
                    }
                };

                // Generate Signature if merchant has a secret
                let signatureHeader = {};
                const rawMerchantSecret = decrypt(updatedMerchant.webhookSecret);
                if (rawMerchantSecret) {
                    const hmac = crypto.createHmac('sha512', rawMerchantSecret);
                    hmac.update(JSON.stringify(merchantPayload));
                    const signature = hmac.digest('hex');
                    signatureHeader = { 'x-soltio-signature': signature };
                }

                // Execute async webhook dispatch (un-awaited to respond quickly to provider)
                fetch(updatedMerchant.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...signatureHeader
                    },
                    body: JSON.stringify(merchantPayload),
                }).catch(err => {
                    console.error(`Failed to deliver webhook to merchant ${updatedMerchant.id}:`, err);
                });

            } catch (webhookError) {
                console.error('Merchant webhook dispatch error:', webhookError);
            }
        }

        // 6. Return immediate success to the provider
        return NextResponse.json({ success: true, message: 'Webhook processed' });

    } catch (error) {
        console.error('Webhook Processing Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
