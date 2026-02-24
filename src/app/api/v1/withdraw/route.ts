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
            const user = await tx.user.findUnique({ where: { id: userId } });

            if (!user) {
                throw new Error('User not found');
            }

            if (Number(user.availableBalance) < Number(amount)) {
                throw new Error('Insufficient balance');
            }

            // Deduct from available balance and move to pending balance? 
            // Better to simply deduct from available.
            await tx.user.update({
                where: { id: userId },
                data: {
                    availableBalance: {
                        decrement: amount
                    }
                }
            });

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
        if (error.message === 'Insufficient balance' || error.message === 'User not found') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
