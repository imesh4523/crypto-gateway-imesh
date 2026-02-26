import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import BroadcastClient from "./BroadcastClient";

export default async function BotBroadcastPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, trialActive: true }
    });
    if (!user) redirect("/auth/signin");

    const products = await (prisma as any).botProduct.findMany({
        where: { userId: user.id },
        select: { id: true, name: true }
    });

    return <BroadcastClient products={products} trialActive={user.trialActive} />;
}
