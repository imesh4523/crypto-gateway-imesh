import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { withdrawalIds, action, txHash } = body; // action: "APPROVE", "REJECT", "COMPLETE"

        if (!withdrawalIds || !Array.isArray(withdrawalIds)) {
            return NextResponse.json({ error: "Withdrawal IDs array required" }, { status: 400 });
        }

        let status;
        switch (action) {
            case "APPROVE": status = "APPROVED"; break;
            case "REJECT": status = "REJECTED"; break;
            case "COMPLETE": status = "COMPLETED"; break;
            default: return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const results = await prisma.withdrawal.updateMany({
            where: {
                id: { in: withdrawalIds }
            },
            data: {
                status: status as any,
                txHash: action === "COMPLETE" ? txHash : undefined
            }
        });

        // If rejecting, we need to return the balance to the merchant.
        // updateMany doesn't let us easily iterate and check original values, 
        // so for REJECT we might need a loop or more complex logic if balance was deducted on request.
        // Assuming balance IS deducted at request time:
        if (action === "REJECTED") {
            // This would require a loop to revert each merchant's balance
            const withdrawals = await prisma.withdrawal.findMany({
                where: { id: { in: withdrawalIds } }
            });

            for (const w of withdrawals) {
                await prisma.user.update({
                    where: { id: w.userId },
                    data: {
                        availableBalance: { increment: w.amount }
                    }
                });
            }
        }

        // Log the batch action
        if ((prisma as any).auditLog) {
            await (prisma as any).auditLog.create({
                data: {
                    adminId: (session.user as any).id,
                    adminName: session.user.name,
                    action: `BATCH_WITHDRAWAL_${action}`,
                    details: `Processed ${withdrawalIds.length} withdrawals in batch. Action: ${action}`
                }
            });
        }

        return NextResponse.json({ success: true, count: results.count });
    } catch (error) {
        console.error("Batch withdrawal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
