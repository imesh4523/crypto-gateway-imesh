import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { amount, currency, address } = body;

        if (!amount || Number(amount) <= 0 || !currency || !address) {
            return NextResponse.json({ error: 'Valid amount, currency, and crypto address are required' }, { status: 400 });
        }

        // Run as a transaction to prevent race conditions when checking balance
        const result = await prisma.$transaction(async (tx: any) => {
            // SECURITY ENHANCEMENT: Atomic Update to prevent Race Conditions
            // If multiple requests hit exactly at the same time, earlier logic would read
            // the same balance before deducting. This enforce DB-level atomic conditions.
            const updatedUsers = await tx.user.updateMany({
                where: {
                    id: userId,
                    availableBalance: { gte: amount }
                },
                data: {
                    availableBalance: { decrement: amount }
                }
            });

            if (updatedUsers.count === 0) {
                throw new Error('Insufficient balance or user not found');
            }

            // Create the withdrawal request
            const withdrawal = await tx.withdrawal.create({
                data: {
                    amount,
                    currency,
                    address,
                    userId,
                    status: 'PENDING',
                }
            });

            return withdrawal;
        });

        return NextResponse.json({ success: true, data: result }, { status: 201 });

    } catch (error: any) {
        console.error('Submit withdrawal error:', error);
        if (error.message === 'Insufficient balance' || error.message === 'User not found' || error.message === 'Insufficient balance or user not found') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
