import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PaymentsClient from "./PaymentsClient";

export default async function BotPaymentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) redirect("/auth/signin");

    // @ts-ignore
    const payments = await prisma.botPayment.findMany({
        where: { userId: user.id },
        include: { customer: true },
        orderBy: { createdAt: "desc" }
    });

    const serialized = payments.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        customer: p.customer ? {
            telegramId: p.customer.telegramId,
            username: p.customer.username
        } : null
    }));

    return <PaymentsClient initialPayments={serialized} />;
}
