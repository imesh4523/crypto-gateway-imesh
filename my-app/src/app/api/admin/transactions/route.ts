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

        const transactions = await prisma.transaction.findMany({
            include: {
                merchant: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        const serializedTransactions = transactions.map(tx => ({
            ...tx,
            amount: Number(tx.amount),
            feePlatform: Number(tx.feePlatform),
            profitPlatform: Number(tx.profitPlatform),
        }));

        return NextResponse.json(serializedTransactions);
    } catch (error) {
        console.error("Fetch admin transactions error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
