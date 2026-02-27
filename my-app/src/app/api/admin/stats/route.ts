import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Transaction Stats
        const txStats = await prisma.transaction.aggregate({
            _sum: {
                profitPlatform: true,
                amount: true,
            },
            _count: {
                id: true,
            },
            where: {
                status: "SUCCESS",
            }
        });

        // 2. User Stats
        const merchantCount = await prisma.user.count({
            where: {
                role: "MERCHANT",
            }
        });

        // 3. Pending Withdrawals
        const pendingWithdrawals = await prisma.withdrawal.count({
            where: {
                status: "PENDING",
            }
        });

        // 4. Recent Transactions
        const recentTransactions = await prisma.transaction.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                merchant: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        });

        // 5. Volume by Currency (Pie Chart Data)
        const volumeByCurrency = await prisma.transaction.groupBy({
            by: ["currency"],
            _sum: {
                amount: true,
            },
            where: {
                status: "SUCCESS",
            }
        });

        return NextResponse.json({
            totalProfit: txStats._sum.profitPlatform || 0,
            totalVolume: txStats._sum.amount || 0,
            successTransactions: txStats._count.id || 0,
            merchantCount,
            pendingWithdrawals,
            recentTransactions,
            volumeByCurrency,
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
