import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        const invoiceId = routeParams.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { transaction: true }
        });

        if (!invoice || !invoice.isTestMode) {
            return NextResponse.json({ error: 'Invoice not found or not in test mode' }, { status: 404 });
        }

        // 1. Update Invoice status atomically
        const updatedInvoices = await prisma.invoice.updateMany({
            where: {
                id: invoiceId,
                status: { not: 'COMPLETED' }
            },
            data: { status: 'COMPLETED' }
        });

        if (updatedInvoices.count === 0) {
            return NextResponse.json({ error: 'Invoice already completed concurrently' }, { status: 400 });
        }

        // 2. Update Transaction status
        if (invoice.transaction) {
            await prisma.transaction.update({
                where: { id: invoice.transaction.id },
                data: { status: 'SUCCESS' }
            });

            // Test mode simulation should not increment real merchant balance.
            // Balance logic removed entirely for simulated test transactions.
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Simulation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
