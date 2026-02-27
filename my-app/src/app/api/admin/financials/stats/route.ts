import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get total platform revenue (using revenue from successful transactions)
        const stats = await prisma.transaction.aggregate({
            where: { status: "SUCCESS" },
            _sum: {
                profitPlatform: true,
                feePlatform: true,
                amount: true
            }
        });

        // Get total merchant balances
        const balances = await prisma.user.aggregate({
            where: { role: "MERCHANT" },
            _sum: {
                availableBalance: true,
                pendingBalance: true
            }
        });

        // Get daily revenue for charts
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = new Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const dailyRevenue = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayStats = await prisma.transaction.aggregate({
                where: {
                    status: "SUCCESS",
                    createdAt: {
                        gte: date,
                        lt: nextDay
                    }
                },
                _sum: {
                    profitPlatform: true
                }
            });

            return {
                date: date.toISOString(),
                revenue: Number(dayStats._sum.profitPlatform || 0)
            };
        }));

        // Liquidity check: Real funds in system should be >= merchant available balances
        const systemLiquidity = {
            totalRevenue: Number(stats._sum.profitPlatform || 0),
            totalVolume: Number(stats._sum.amount || 0),
            merchantObligations: Number(balances._sum.availableBalance || 0),
            merchantPending: Number(balances._sum.pendingBalance || 0),
            dailyRevenue
        };

        return NextResponse.json(systemLiquidity);
    } catch (error) {
        console.error("Financial stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
