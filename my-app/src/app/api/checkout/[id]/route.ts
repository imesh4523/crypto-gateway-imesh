import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        const invoiceId = routeParams.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { merchant: true, transaction: true }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: {
                id: invoice.id,
                amount: invoice.amount.toString(),
                currency: invoice.currency,
                status: invoice.status,
                merchantName: invoice.merchant.name || 'Merchant',
                orderId: invoice.orderId,
                transaction: invoice.transaction ? {
                    status: invoice.transaction.status,
                    payAddress: invoice.transaction.payAddress,
                    amount: invoice.transaction.payAmount ? invoice.transaction.payAmount.toString() : invoice.transaction.amount.toString(),
                    currency: invoice.transaction.payCurrency || invoice.transaction.currency
                } : null
            }
        });
    } catch (error) {
        console.error('Fetch Invoice Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
