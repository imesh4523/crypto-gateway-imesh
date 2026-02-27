import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status, txHash } = await request.json();
        const withdrawalId = params.id;

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: { merchant: true }
        });

        if (!withdrawal) {
            return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
        }

        if (status === "COMPLETED") {
            // Update withdrawal status
            await prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: {
                    status: "COMPLETED",
                    txHash: txHash,
                }
            });

            // Note: Merchant balance was already deducted (pending -> completed logic) 
            // usually in merchant withdrawal flow it deducts immediately.
        } else if (status === "REJECTED") {
            // Refund the balance to the merchant
            await prisma.$transaction([
                prisma.withdrawal.update({
                    where: { id: withdrawalId },
                    data: { status: "REJECTED" }
                }),
                prisma.user.update({
                    where: { id: withdrawal.userId },
                    data: {
                        availableBalance: {
                            increment: withdrawal.amount
                        }
                    }
                })
            ]);
        } else if (status === "APPROVED") {
            await prisma.withdrawal.update({
                where: { id: withdrawalId },
                data: { status: "APPROVED" }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update withdrawal error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
