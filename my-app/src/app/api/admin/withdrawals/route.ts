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

        const withdrawals = await prisma.withdrawal.findMany({
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

        const serializedWithdrawals = withdrawals.map(w => ({
            ...w,
            amount: Number(w.amount),
        }));

        return NextResponse.json(serializedWithdrawals);
    } catch (error) {
        console.error("Fetch admin withdrawals error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
