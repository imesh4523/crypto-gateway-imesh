import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                availableBalance: true,
                pendingBalance: true,
                totalIncome: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const recentTransactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const totalTransactions = await prisma.transaction.count({
            where: { userId }
        });

        return NextResponse.json({
            data: {
                balances: {
                    available: user.availableBalance,
                    pending: user.pendingBalance,
                    lifetime: user.totalIncome,
                },
                recentTransactions,
                totalTransactions
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
