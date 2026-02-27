import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        let merchantId: string;
        let isTestKey = false;

        // 1. Authenticate: Try API Key first, then fallback to Session
        const authHeader = req.headers.get('Authorization');

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKeyStr = authHeader.split(' ')[1];
            const apiKey = await prisma.apiKey.findUnique({
                where: { key: apiKeyStr },
                select: { userId: true, active: true, isTestMode: true }
            });

            if (!apiKey || !apiKey.active) {
                return NextResponse.json({ error: 'Invalid or inactive API Key' }, { status: 401 });
            }
            merchantId = apiKey.userId;
            isTestKey = apiKey.isTestMode;
        } else {
            // Fallback to Session (for Dashboard Manual Creation)
            const session = await getServerSession(authOptions);
            if (!session || !(session.user as any)?.id) {
                return NextResponse.json({ error: 'Missing Authorization header or active session' }, { status: 401 });
            }
            merchantId = (session.user as any).id;

            // Check if user has Test Mode enabled via cookie in session context (optional, but for simplicity let's stick to API key for now)
            // Or maybe just check the request for a query param or header
            isTestKey = false;
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

        // Generate Custom Unique ID for the site via env var
        const prefix = process.env.GATEWAY_ID_PREFIX || 'ORIYOTO-';
        const customId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        const customTxId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        // 3. Create strictly an Invoice in our DB
        const invoice = await prisma.invoice.create({
            data: {
                id: customId,
                userId: merchant.id,
                amount: requestedAmount,
                currency: currency,
                orderId: orderId?.toString(),
                orderDescription: orderDescription?.toString(),
                isTestMode: isTestKey
            }
        });

        // Create the initial Transaction so it appears in the dashboard immediately
        await prisma.transaction.create({
            data: {
                id: customTxId,
                platformTxId: customTxId,
                amount: requestedAmount,
                currency: currency,
                status: 'PENDING',
                userId: merchant.id,
                invoiceId: invoice.id,
                isTestMode: isTestKey
            }
        });

        // The checkout URL will be on our domain, not NowPayments
        const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pay/${invoice.id}`;

        // 4. Return the generated invoice details to the Merchant
        return NextResponse.json({
            success: true,
            data: {
                invoiceId: invoice.id,
                platformTxId: customTxId,
                paymentUrl: checkoutUrl,
                amount: requestedAmount,
                currency: currency,
                status: 'CREATED',
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Create Invoice Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
