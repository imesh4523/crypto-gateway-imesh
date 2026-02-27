import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const merchant = await prisma.user.findUnique({
            where: { id },
            include: {
                apiKeys: true,
                BotIntegration: true,
                _count: {
                    select: {
                        transactions: true,
                        invoices: true,
                        withdrawals: true,
                        botProducts: true,
                        botCustomers: true,
                        botOrders: true,
                    }
                },
                transactions: {
                    take: 10,
                    orderBy: { createdAt: "desc" }
                },
                withdrawals: {
                    take: 5,
                    orderBy: { createdAt: "desc" }
                },
                botCustomers: {
                    take: 5,
                    orderBy: { createdAt: "desc" }
                },
                botOrders: {
                    take: 5,
                    include: { product: true, customer: true },
                    orderBy: { createdAt: "desc" }
                }
            }
        });

        if (!merchant) {
            return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
        }

        // Deep trace: Get summary of store activity
        const storeStats = {
            totalCustomers: merchant._count.botCustomers,
            totalOrders: merchant._count.botOrders,
            totalProducts: merchant._count.botProducts,
            recentTransactions: merchant.transactions,
            recentWithdrawals: merchant.withdrawals,
            recentCustomers: (merchant as any).botCustomers || [],
            recentOrders: (merchant as any).botOrders || []
        };

        return NextResponse.json({
            ...merchant,
            availableBalance: Number(merchant.availableBalance),
            totalIncome: Number(merchant.totalIncome),
            testBalance: Number(merchant.testBalance),
            stats: storeStats
        });
    } catch (error: any) {
        console.error("Merchant Detail API Error:", error);
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
    }
}
