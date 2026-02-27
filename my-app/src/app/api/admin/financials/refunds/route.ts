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

        if (!(prisma as any).refund) return NextResponse.json([]);

        const refunds = await (prisma as any).refund.findMany({
            include: {
                transaction: true,
                merchant: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        const serializedRefunds = refunds.map((r: any) => ({
            ...r,
            amount: Number(r.amount),
            transaction: {
                ...r.transaction,
                amount: Number(r.transaction.amount)
            }
        }));

        return NextResponse.json(serializedRefunds);
    } catch (error) {
        console.error("Refunds fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { transactionId, amount, reason } = body;

        if (!transactionId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

        // Check if amount is valid
        if (Number(amount) > Number(transaction.amount)) {
            return NextResponse.json({ error: "Refund amount exceeds transaction amount" }, { status: 400 });
        }

        const refund = await (prisma as any).refund.create({
            data: {
                transactionId,
                amount,
                reason,
                userId: transaction.userId,
                status: "COMPLETED" // In a real system this might be pending until actual crypto transfer
            }
        });

        // Update transaction status
        await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                status: (Number(amount) === Number(transaction.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED") as any
            }
        });

        // Log action
        if ((prisma as any).auditLog) {
            await (prisma as any).auditLog.create({
                data: {
                    adminId: (session.user as any).id,
                    adminName: session.user.name,
                    action: "PROCESS_REFUND",
                    targetId: transactionId,
                    details: `Processed refund of ${amount} ${transaction.currency} for Tx: ${transaction.platformTxId}`
                }
            });
        }

        return NextResponse.json(refund);
    } catch (error) {
        console.error("Refund creation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
