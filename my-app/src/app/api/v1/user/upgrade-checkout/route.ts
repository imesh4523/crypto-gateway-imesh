import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const PLAN_PRICES: Record<string, number> = {
    PRO: 29,
    PREMIUM: 99,
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json();

        if (!["PRO", "PREMIUM"].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan — only PRO or PREMIUM upgrades require payment" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.plan === plan) {
            return NextResponse.json({ error: "Already on this plan" }, { status: 400 });
        }

        const amount = PLAN_PRICES[plan];
        if (!amount) {
            return NextResponse.json({ error: "Plan price not configured" }, { status: 500 });
        }

        // Generate a unique invoice ID for this plan upgrade
        const prefix = process.env.GATEWAY_ID_PREFIX || "ORIYOTO-";
        const customId = `${prefix}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
        const customTxId = `${prefix}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

        // Create a special invoice that identifies this as a plan upgrade
        // We encode the plan in the orderId so webhook handlers can detect and auto-upgrade
        const invoice = await prisma.invoice.create({
            data: {
                id: customId,
                userId: user.id,
                amount: amount,
                currency: "USD",
                orderId: `PLAN_UPGRADE:${plan}`, // Magic key for webhook to detect
                orderDescription: `Bot Plan Upgrade to ${plan} — $${amount}/month`,
                isTestMode: false,
            },
        });

        // Create the initial pending transaction so it appears in the dashboard
        await prisma.transaction.create({
            data: {
                id: customTxId,
                platformTxId: customTxId,
                amount: amount,
                currency: "USD",
                status: "PENDING",
                userId: user.id,
                invoiceId: invoice.id,
                isTestMode: false,
            },
        });

        const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pay/${invoice.id}`;

        return NextResponse.json({
            success: true,
            data: {
                invoiceId: invoice.id,
                checkoutUrl,
                plan,
                amount,
            },
        });

    } catch (error: any) {
        console.error("Upgrade checkout error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
