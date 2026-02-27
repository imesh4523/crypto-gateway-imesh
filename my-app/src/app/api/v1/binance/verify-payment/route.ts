import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
    try {
        const { invoiceId } = await req.json();
        if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { transaction: true, merchant: true },
        });

        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        if (invoice.status === 'COMPLETED') return NextResponse.json({ success: true, message: 'Already completed' });

        // Get merchant's Binance credentials
        const botIntegration = await (prisma as any).botIntegration.findUnique({
            where: { userId: invoice.userId },
        });

        if (!botIntegration?.binancePayId) {
            return NextResponse.json({ error: 'Merchant has no Binance Pay ID configured' }, { status: 422 });
        }

        const amount = Number(invoice.amount);
        const pendingNote = invoice.transaction?.providerTxId || '';

        const decryptedBinanceApiKey = decrypt(botIntegration.binanceApiKey);
        const decryptedBinanceSecretKey = decrypt(botIntegration.binanceSecretKey);

        if (!decryptedBinanceApiKey || !decryptedBinanceSecretKey) {
            return NextResponse.json({
                success: false,
                error: 'api_keys_missing',
                message: 'Merchant Binance API keys not configured. Cannot verify automatically.'
            }, { status: 422 });
        }

        // --- Query Binance Pay Transaction History (Personal Account) ---
        // GET /sapi/v1/pay/transactions — works with normal Binance API key
        const timestamp = Date.now();
        const startTime = timestamp - 3600000; // last 1 hour
        const endTime = timestamp;

        const queryString = `timestamp=${timestamp}&startTime=${startTime}&endTime=${endTime}&limit=100&recvWindow=5000`;

        // HMAC SHA256 signature
        const signature = crypto
            .createHmac('sha256', decryptedBinanceSecretKey)
            .update(queryString)
            .digest('hex');

        const endpoints = [
            'https://api.binance.com',
            'https://api1.binance.com',
            'https://api2.binance.com',
            'https://api3.binance.com',
            'https://api-gpro.binance.com'
        ];

        let binanceRes: any = null;
        let lastError = '';
        let errorTextFromBinance = ''; // To store the actual error text from Binance if available

        for (const base of endpoints) {
            try {
                console.log(`Trying Binance endpoint: ${base}`);
                binanceRes = await fetch(
                    `${base}/sapi/v1/pay/transactions?${queryString}&signature=${signature}`,
                    {
                        method: 'GET',
                        headers: { 'X-MBX-APIKEY': decryptedBinanceApiKey },
                        signal: AbortSignal.timeout(5000)
                    }
                );
                if (binanceRes.ok) break;
                const errTxt = await binanceRes.text();
                lastError = `${binanceRes.status}: ${errTxt}`;
                errorTextFromBinance = errTxt; // Store the error text
                console.error(`Endpoint ${base} failed: ${lastError}`);
            } catch (e: any) {
                lastError = e.message;
                console.error(`Endpoint ${base} error: ${e.message}`);
            }
        }

        if (!binanceRes || !binanceRes.ok) {
            const logMsg = `[${new Date().toISOString()}] Binance API Error Final: ${lastError}\n`;
            require('fs').appendFileSync('binance_error.log', logMsg);
            console.error(logMsg);

            // Parse Binance error
            try {
                const errData = JSON.parse(errorTextFromBinance); // Use the stored errorTextFromBinance
                if (errData.code === -2015 || errData.code === -1022) {
                    return NextResponse.json({
                        success: false,
                        error: 'invalid_api_key',
                        message: 'Binance API key is invalid or expired. Please update in settings.'
                    });
                }
                if (errData.code === -1021) {
                    return NextResponse.json({
                        success: false,
                        error: 'timestamp_error',
                        message: 'Server time sync error. Please try again.'
                    });
                }
            } catch (e) { }

            return NextResponse.json({
                success: false,
                error: 'binance_api_error',
                message: 'Failed to query Binance. Please try again.'
            });
        }

        const binanceData = await binanceRes.json();

        // binanceData.data is an array of Pay transactions
        // Each has: orderType, amount, currency, fundsDetail, transactionId, note etc.
        const transactions: any[] = binanceData?.data || [];

        // Log transactions for debugging
        require('fs').appendFileSync('binance_error.log', `[${new Date().toISOString()}] Binance Transactions Found: ${transactions.length}\n${JSON.stringify(transactions, null, 2)}\n`);

        console.log(`Found ${transactions.length} Binance Pay transactions in last hour`);

        // Find matching transaction: received USDT with matching amount & note
        const matchedTx = transactions.find((tx: any) => {
            // We want incoming (received) payments
            // orderType: "C2C" for user-to-user transfers
            // transactionType: "PAY" 
            const isReceived = tx.orderType === 'C2C' || tx.transactionType === 'PAY';

            // Check amount — fundsDetail array has the actual amounts
            let txAmount = 0;
            if (tx.fundsDetail && Array.isArray(tx.fundsDetail)) {
                const usdtFund = tx.fundsDetail.find((f: any) => f.currency === 'USDT');
                if (usdtFund) txAmount = parseFloat(usdtFund.amount || '0');
            }
            // Fallback to top-level amount
            if (txAmount === 0) txAmount = parseFloat(tx.amount || '0');

            const amountMatch = Math.abs(txAmount - amount) < 0.01;

            // Check note/remark contains our reference
            const noteMatch = !pendingNote ||
                (tx.note && tx.note.includes(pendingNote)) ||
                (tx.remark && tx.remark.includes(pendingNote));

            const statusOk = tx.status === 'SUCCESS' || tx.status === 'COMPLETED' || tx.status === 'ACCEPTED';

            return isReceived && amountMatch && noteMatch && statusOk;
        });

        if (!matchedTx) {
            return NextResponse.json({
                success: false,
                error: 'not_found',
                message: `Payment not found yet. Make sure you sent exactly ${amount} USDT with note "${pendingNote}". Please wait and try again.`,
            });
        }

        // Found! Mark transaction as complete
        const feePlatformRate = 0.03;
        const feePlatform = amount * feePlatformRate;
        const amountMerchant = amount - feePlatform;

        if (invoice.transaction) {
            await prisma.transaction.update({
                where: { id: invoice.transaction.id },
                data: {
                    status: 'SUCCESS',
                    providerTxId: matchedTx.transactionId || matchedTx.orderId || pendingNote,
                    amountMerchant,
                    feePlatform,
                },
            });
        } else {
            const prefix = process.env.GATEWAY_ID_PREFIX || 'ORIYOTO-';
            const customTxId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            await prisma.transaction.create({
                data: {
                    id: customTxId,
                    platformTxId: customTxId,
                    providerTxId: matchedTx.transactionId || matchedTx.orderId || pendingNote,
                    amount,
                    currency: 'USDT',
                    feePlatform,
                    amountMerchant,
                    status: 'SUCCESS',
                    userId: invoice.userId,
                    invoiceId: invoice.id,
                },
            });
        }

        // SECURITY ENHANCEMENT: Atomic Update to prevent Race Conditions 
        // Ensures if multiple requests hit this verification at the exact same millisecond,
        // only ONE can successfully transition from PENDING to COMPLETED and credit the account.
        const updatedInvoices = await prisma.invoice.updateMany({
            where: {
                id: invoiceId,
                status: { not: 'COMPLETED' }
            },
            data: { status: 'COMPLETED' },
        });

        if (updatedInvoices.count === 0) {
            // The invoice was already completed by a concurrent request
            return NextResponse.json({ success: true, message: 'Payment already verified concurrently' });
        }

        // Only credit merchant balance IF we were the one to mark it COMPLETED
        await prisma.user.update({
            where: { id: invoice.userId },
            data: {
                availableBalance: { increment: amountMerchant },
                totalIncome: { increment: amountMerchant },
            },
        });

        // Auto-fulfill Bot Payments
        if (invoice.orderId && invoice.orderDescription?.startsWith("Bot Deposit")) {
            try {
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
                    console.log(`[BinanceVerify] Successfully credited BotCustomer ${botPayment.customerId} with ${botPayment.amount}`);
                }
            } catch (botErr) {
                console.error("[BinanceVerify] Error fulfilling bot payment:", botErr);
            }
        }

        return NextResponse.json({ success: true, message: 'Payment verified successfully!' });
    } catch (err: any) {
        console.error('Binance verify error:', err);
        return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
    }
}
