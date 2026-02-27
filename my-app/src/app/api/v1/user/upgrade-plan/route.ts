import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { plan } = await req.json();

        if (!['FREE', 'PRO', 'PREMIUM'].includes(plan)) {
            return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Define quotas based on plan
        let botClicksQuota = 500;
        let hostingPowerLimit = 1.0;
        let productLimitQuota = 10;
        let trialActive = true;

        if (plan === 'PRO') {
            botClicksQuota = 50000;
            hostingPowerLimit = 2.0;
            productLimitQuota = 500;
            trialActive = false;
        } else if (plan === 'PREMIUM') {
            botClicksQuota = 1000000;
            hostingPowerLimit = 4.0;
            productLimitQuota = 10000; // Effectively unlimited
            trialActive = false;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                plan,
                botClicksQuota,
                hostingPowerLimit,
                productLimitQuota,
                trialActive
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                plan: updatedUser.plan,
                botClicksQuota: updatedUser.botClicksQuota,
                hostingPowerLimit: updatedUser.hostingPowerLimit,
                productLimitQuota: updatedUser.productLimitQuota,
                trialActive: updatedUser.trialActive
            }
        });

    } catch (error: any) {
        console.error("Upgrade error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
