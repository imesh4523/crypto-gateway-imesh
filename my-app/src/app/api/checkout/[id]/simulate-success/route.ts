import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: apply plan upgrade quotas to user
async function applyPlanUpgrade(userId: string, planId: string) {
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
            where: { id: userId },
            data: {
                plan: planId as any,
                botClicksQuota,
                hostingPowerLimit,
                productLimitQuota,
                trialActive,
            },
        });
        console.log(`[Simulate] User ${userId} upgraded to ${planId}.`);
    }
}

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
        }

        // 3. AUTO PLAN UPGRADE: If this was a plan upgrade invoice, apply it
        if (invoice.orderId && invoice.orderId.startsWith('PLAN_UPGRADE:')) {
            const planId = invoice.orderId.replace('PLAN_UPGRADE:', '');
            await applyPlanUpgrade(invoice.userId, planId);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Simulation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
