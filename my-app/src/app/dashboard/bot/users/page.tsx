import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UsersClient from "./UsersClient";

export default async function BotUsersPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) redirect("/auth/signin");

    // @ts-ignore
    const customers = await prisma.botCustomer.findMany({
        where: { userId: user.id },
        include: { orders: true, payments: true },
        orderBy: { createdAt: "desc" }
    });

    const serialized = customers.map((c: any) => ({
        id: c.id,
        telegramId: c.telegramId,
        username: c.username,
        firstName: c.firstName,
        lastName: c.lastName,
        balance: c.balance.toNumber(),
        ordersCount: c.orders.length
    }));

    return <UsersClient initialCustomers={serialized} />;
}
