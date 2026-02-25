import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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
        // In production, uncomment the following check:
        /*
        if (!verifySignature(body, signature)) {
          console.error('Invalid Webhook Signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
        */

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

        // 3. Update the Transaction Status
        // Decide status based on NowPayments status
        const resolvedStatus = payment_status === 'partially_paid' ? 'SUCCESS' : 'SUCCESS';
        // Note: For partial payments, actual received amount should be logged. We'll mark as SUCCESS for simplicity, 
        // but with the exact amount settled if needed. 

        // Ensure we don't double credit
        if (transaction.status === 'SUCCESS') {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        const updatedTransaction = await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: resolvedStatus },
        });

        // Also update the linked invoice 
        if (transaction.invoiceId) {
            await prisma.invoice.update({
                where: { id: transaction.invoiceId },
                data: { status: 'COMPLETED' }
            });
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
                        platformTxId: updatedTransaction.platformTxId,
                        status: updatedTransaction.status,
                        amount: updatedTransaction.amount.toString(),
                        currency: updatedTransaction.currency,
                        netSettled: updatedTransaction.amountMerchant.toString(),
                        paidCurrency: pay_currency,
                        paidCryptoAmount: actually_paid,
                    }
                };

                // Generate Signature if merchant has a secret
                let signatureHeader = {};
                if (updatedMerchant.webhookSecret) {
                    const hmac = crypto.createHmac('sha512', updatedMerchant.webhookSecret);
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
