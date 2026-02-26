import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrdersClient from "./OrdersClient";

export default async function BotOrdersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) redirect("/auth/signin");

    // @ts-ignore
    const orders = await prisma.botOrder.findMany({
        where: { userId: user.id },
        include: { product: true, customer: true, credential: true },
        orderBy: { createdAt: "desc" }
    });

    const serializedOrders = orders.map((o: any) => ({
        id: o.id,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
        product: o.product ? {
            name: o.product.name,
            price: Number(o.product.price)
        } : null,
        customer: o.customer ? {
            telegramId: o.customer.telegramId,
            username: o.customer.username
        } : null,
        credential: o.credential ? {
            content: o.credential.content
        } : null
    }));

    return <OrdersClient initialOrders={serializedOrders} />;
}
