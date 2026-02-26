import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const MASTER_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'your-master-nowpayments-key';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        const invoiceId = routeParams.id;
        const { payCurrency } = await req.json();

        if (!payCurrency) {
            return NextResponse.json({ error: 'payCurrency is required' }, { status: 400 });
        }

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { transaction: true, merchant: true }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
        }

        // Check if there is already a PENDING transaction
        // We will update it later instead of deleting it.
        // if (invoice.transaction && invoice.transaction.status === 'PENDING') {
        //     await prisma.transaction.delete({ where: { id: invoice.transaction.id } });
        // }

        // Call NowPayments Create Payment API
        const reqBody = {
            price_amount: Number(invoice.amount),
            price_currency: invoice.currency, // USD
            pay_currency: payCurrency, // USDTTRC20, BTC, etc
            ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/nowpayments`,
            order_id: invoiceId,
            order_description: invoice.orderDescription || `Invoice ${invoiceId}`,
        };

        let paymentData: any;

        if (invoice.isTestMode || MASTER_API_KEY === 'your-master-nowpayments-key' || MASTER_API_KEY === 'your-sample-api-key') {
            // TEST MODE or MOCK MODE
            paymentData = {
                payment_id: `test_${Date.now()}`,
                pay_address: "TEST_WALLET_ADDRESS_DO_NOT_PAY",
                pay_amount: Number(invoice.amount),
                pay_currency: payCurrency,
                order_id: invoiceId
            };
        } else {
            const providerResponse = await fetch(`${NOWPAYMENTS_API_URL}/payment`, {
                method: 'POST',
                headers: {
                    'x-api-key': MASTER_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reqBody),
            });
            paymentData = await providerResponse.json();

            if (!providerResponse.ok) {
                return NextResponse.json({
                    error: 'Failed to create payment with provider',
                    details: paymentData
                }, { status: 502 });
            }
        }

        // Calculate Fees
        const feePlatformRate = 0.03;
        const feeProviderRate = 0.005;
        const requestedAmount = Number(invoice.amount);
        const feePlatform = requestedAmount * feePlatformRate;
        const feeProvider = requestedAmount * feeProviderRate;
        const profitPlatform = feePlatform - feeProvider;
        const amountMerchant = requestedAmount - feePlatform;

        // Generate Custom Unique ID for the site via config if no transaction exists yet
        const prefix = process.env.GATEWAY_ID_PREFIX || 'IMESH-';
        const customTxId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // Save or Update Transaction
        let transaction;
        if (invoice.transaction) {
            transaction = await prisma.transaction.update({
                where: { id: invoice.transaction.id },
                data: {
                    providerTxId: paymentData.payment_id?.toString() || `mock_${Date.now()}`,
                    feePlatform: feePlatform,
                    feeProvider: feeProvider,
                    profitPlatform: profitPlatform,
                    amountMerchant: amountMerchant,
                    payAddress: paymentData.pay_address,
                    payAmount: paymentData.pay_amount,
                    payCurrency: paymentData.pay_currency,
                    status: 'PENDING',
                    isTestMode: invoice.isTestMode
                }
            });
        } else {
            transaction = await prisma.transaction.create({
                data: {
                    id: customTxId,
                    platformTxId: customTxId,
                    providerTxId: paymentData.payment_id?.toString() || `mock_${Date.now()}`,
                    amount: requestedAmount,
                    currency: invoice.currency,
                    feePlatform: feePlatform,
                    feeProvider: feeProvider,
                    profitPlatform: profitPlatform,
                    amountMerchant: amountMerchant,
                    payAddress: paymentData.pay_address,
                    payAmount: paymentData.pay_amount,
                    payCurrency: paymentData.pay_currency,
                    status: 'PENDING',
                    userId: invoice.userId,
                    invoiceId: invoice.id,
                    isTestMode: invoice.isTestMode
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                paymentId: transaction.providerTxId,
                payAddress: paymentData.pay_address,
                payAmount: paymentData.pay_amount,
                payCurrency: paymentData.pay_currency,
                orderId: invoiceId
            }
        });

    } catch (error) {
        console.error('Checkout Pay Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
