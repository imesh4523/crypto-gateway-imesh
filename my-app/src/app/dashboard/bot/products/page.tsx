import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BotProductsClient from "./BotProductsClient";

export default async function BotProductsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) redirect("/auth/signin");

    const products = await prisma.botProduct.findMany({
        where: { userId: user.id },
        include: { credentials: true },
        orderBy: { createdAt: "desc" }
    });

    const serialized = products.map((p) => ({
        ...p,
        price: Number(p.price),
        createdAt: p.createdAt.toISOString(),
        credentials: p.credentials.map((c) => ({
            id: c.id,
            content: c.content,
            status: c.status,
        })),
    }));

    return (
        <div className="max-w-7xl mx-auto w-full py-6 px-4">
            <BotProductsClient initialProducts={serialized} />
        </div>
    );
}
