import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In a real app, this would be an env variable: NOWPAYMENTS_MASTER_KEY
const MASTER_API_KEY = process.env.NOWPAYMENTS_API_KEY || 'your-master-nowpayments-key';
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export async function POST(req: Request) {
    try {
        let merchantId: string;

        // 1. Authenticate: Try API Key first, then fallback to Session
        const authHeader = req.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKeyStr = authHeader.split(' ')[1];
            const apiKey = await prisma.apiKey.findUnique({
                where: { key: apiKeyStr },
                select: { userId: true, active: true }
            });

            if (!apiKey || !apiKey.active) {
                return NextResponse.json({ error: 'Invalid or inactive API Key' }, { status: 401 });
            }
            merchantId = apiKey.userId;
        } else {
            // Fallback to Session (for Dashboard Manual Creation)
            const session = await getServerSession(authOptions);
            if (!session || !(session.user as any)?.id) {
                return NextResponse.json({ error: 'Missing Authorization header or active session' }, { status: 401 });
            }
            merchantId = (session.user as any).id;
        }

        const merchant = await prisma.user.findUnique({ where: { id: merchantId } });
        if (!merchant) {
            return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
        }

        // 2. Parse incoming request body
        const body = await req.json();
        const { amount, currency = 'USD', orderId, orderDescription } = body;

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
        }

        const requestedAmount = Number(amount);

        // 3. Call Underlying Provider (e.g., NowPayments) to generate the invoice
        // MOCK MODE: If using sample key, return a mock response to show UI working
        var providerData: any;
        var isMock = false;
        if (MASTER_API_KEY === 'your-sample-api-key' || MASTER_API_KEY === 'your-master-nowpayments-key') {
            console.log("Using Mock Mode for Invoice Creation");
            const mockProviderData = {
                payment_id: `mock_${Date.now()}`,
                invoice_url: `https://nowpayments.io/payment/?payment_id=mock_${Date.now()}`,
                pay_address: "TKv6z8...kR7hN3",
                amount: requestedAmount,
                currency: currency
            };

            // Proceed as if provider answered
            providerData = mockProviderData;
            isMock = true;
        } else {
            const providerResponse = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
                method: 'POST',
                headers: {
                    'x-api-key': MASTER_API_KEY,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price_amount: requestedAmount,
                    price_currency: currency,
                    pay_currency: 'USDTTRC20', // Defaulting to USDT for example, could be dynamic
                    ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/nowpayments`,
                    order_id: `platform_${Date.now()}`, // Temporary order ID
                    order_description: orderDescription || `Order ${orderId}`,
                }),
            });

            providerData = await providerResponse.json();

            if (!providerResponse.ok) {
                console.error('Provider Error (NowPayments):', providerData);
                return NextResponse.json({
                    error: 'Failed to create invoice with payment provider',
                    details: providerData.message || 'Unknown provider error',
                    hint: 'Please update NOWPAYMENTS_API_KEY in your .env file'
                }, { status: 502 });
            }
        }

        // 4. Calculate Platform Fees
        // Platform fee: 3.0%, Provider fee: 0.5%, Profit: 2.5%
        const feePlatformRate = 0.03;
        const feeProviderRate = 0.005;

        const feePlatform = requestedAmount * feePlatformRate;
        const feeProvider = requestedAmount * feeProviderRate;
        const profitPlatform = feePlatform - feeProvider;
        const amountMerchant = requestedAmount - feePlatform;

        // 5. Save the Pending Transaction in our Database
        const transaction = await prisma.transaction.create({
            data: {
                providerTxId: providerData.payment_id?.toString() || providerData.id?.toString(),
                amount: requestedAmount,
                currency: currency,
                feePlatform: feePlatform,
                feeProvider: feeProvider,
                profitPlatform: profitPlatform,
                amountMerchant: amountMerchant,
                payAddress: providerData.pay_address || providerData.payin_address || null,
                status: 'PENDING',
                userId: merchant.id,
            },
        });

        // 6. Return the generated invoice details to the Merchant
        return NextResponse.json({
            success: true,
            data: {
                platformTxId: transaction.platformTxId,
                paymentUrl: providerData.invoice_url,
                amount: requestedAmount,
                currency: currency,
                status: 'WAITING_FOR_PAYMENT',
            },
            merchantFeeSummary: {
                totalCharged: requestedAmount,
                fee: feePlatform, // 3%
                expectedSettlement: amountMerchant, // 97%
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Create Invoice Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
