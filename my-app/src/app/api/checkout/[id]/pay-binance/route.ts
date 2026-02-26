import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Returns the Binance Pay ID to show to the customer,
// plus creates/updates the transaction with unique note
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: invoiceId } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { transaction: true, merchant: true },
        });

        if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        if (invoice.status === 'COMPLETED') return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });

        const botIntegration = await (prisma as any).botIntegration.findUnique({
            where: { userId: invoice.userId },
        });

        if (!botIntegration?.binancePayId) {
            return NextResponse.json({ error: 'Merchant has not configured Binance Pay ID' }, { status: 422 });
        }

        // Generate a short unique note for this invoice
        const uniqueNote = `PAY-${invoiceId.slice(-8).toUpperCase()}`;

        // Fee calculation
        const amount = Number(invoice.amount);
        const feePlatformRate = 0.03;
        const feePlatform = amount * feePlatformRate;
        const amountMerchant = amount - feePlatform;

        // Create or update pending transaction
        const prefix = process.env.GATEWAY_ID_PREFIX || 'ORIYOTO-';
        const customTxId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

        if (invoice.transaction) {
            await prisma.transaction.update({
                where: { id: invoice.transaction.id },
                data: {
                    providerTxId: uniqueNote,
                    payAddress: botIntegration.binancePayId,
                    currency: 'USDT',
                    amount: amount,
                    feePlatform,
                    amountMerchant,
                    status: 'PENDING',
                },
            });
        } else {
            await prisma.transaction.create({
                data: {
                    id: customTxId,
                    platformTxId: customTxId,
                    providerTxId: uniqueNote,
                    amount,
                    currency: invoice.currency,
                    payAddress: botIntegration.binancePayId,
                    feePlatform,
                    amountMerchant,
                    status: 'PENDING',
                    userId: invoice.userId,
                    invoiceId: invoice.id,
                },
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                binancePayId: botIntegration.binancePayId,
                amount: invoice.amount,
                currency: invoice.currency,
                note: uniqueNote,
            },
        });
    } catch (err: any) {
        console.error('Binance pay init error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
