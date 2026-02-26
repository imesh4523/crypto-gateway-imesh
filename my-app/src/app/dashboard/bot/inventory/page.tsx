import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InventoryClient from "./InventoryClient";

export default async function BotInventoryPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) redirect("/auth/signin");

    const credentials = await prisma.botCredential.findMany({
        where: { userId: user.id },
        include: { product: true },
        orderBy: { createdAt: "desc" }
    });

    const products = await prisma.botProduct.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, type: true }
    });

    const serializedCreds = credentials.map(c => ({
        id: c.id,
        productId: c.productId,
        content: c.content,
        status: c.status,
        product: { id: c.product.id, name: c.product.name, type: c.product.type }
    }));

    return <InventoryClient initialCredentials={serializedCreds} products={products} />;
}
