import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const userEmail = session?.user?.email;

        console.log("SESSION_FETCHED:", userEmail, userRole);

        if (!session || userRole !== "ADMIN") {
            console.log("UNAUTHORIZED_ACCESS_ATTEMPT:", userEmail);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const merchants = await prisma.user.findMany({
            where: {
                role: "MERCHANT",
            },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
                availableBalance: true,
                totalIncome: true,
                botClicksQuota: true,
                botClicksUsed: true,
                productLimitQuota: true,
                trialActive: true,
                twoFactorEnabled: true,
                // isSuspended: true, // Temporarily disabled due to Prisma engine lock
                createdAt: true,
                webhookUrl: true,
                brandName: true,
                _count: {
                    select: {
                        transactions: true,
                        invoices: true,
                        withdrawals: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });

        console.log("MERCHANTS_FETCHED_COUNT:", merchants.length);
        const serializedMerchants = merchants.map(m => ({
            ...m,
            availableBalance: Number(m.availableBalance),
            totalIncome: Number(m.totalIncome),
            isSuspended: (m as any).isSuspended || false
        }));

        return NextResponse.json(serializedMerchants);
    } catch (error: any) {
        console.error("Fetch merchants error:", error);
        return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password, plan } = body;

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newMerchant = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "MERCHANT",
                plan: plan || "FREE",
                publicKey: `pk_live_${crypto.randomBytes(16).toString('hex')}`,
                webhookSecret: `wh_${crypto.randomBytes(16).toString('hex')}`,
            }
        });

        return NextResponse.json({ success: true, merchantId: newMerchant.id });
    } catch (error: any) {
        console.error("Create merchant error:", error);
        if (error.code === 'P2002') return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { merchantId, action, data } = body;

        if (!merchantId) return NextResponse.json({ error: "Merchant ID required" }, { status: 400 });

        const merchant = await prisma.user.findUnique({ where: { id: merchantId } });
        if (!merchant) return NextResponse.json({ error: "Merchant not found" }, { status: 404 });

        const adminId = (session.user as any).id;
        const adminName = session.user.name || "Administrator";

        switch (action) {
            case "UPDATE_PROFILE":
                await prisma.user.update({
                    where: { id: merchantId },
                    data: {
                        name: data.name,
                        email: data.email,
                        brandName: data.brandName,
                        webhookUrl: data.webhookUrl,
                    }
                });
                await (prisma as any).auditLog?.create({
                    data: {
                        adminId,
                        adminName,
                        action: "UPDATE_MERCHANT_PROFILE",
                        targetId: merchantId,
                        details: `Updated profile for merchant ${merchant.email}`
                    }
                });
                break;

            case "CHANGE_PLAN":
                await prisma.user.update({
                    where: { id: merchantId },
                    data: {
                        plan: data.plan,
                        trialActive: data.trialActive ?? merchant.trialActive,
                        botClicksQuota: data.botClicksQuota ?? merchant.botClicksQuota,
                        productLimitQuota: data.productLimitQuota ?? merchant.productLimitQuota,
                    }
                });
                await (prisma as any).auditLog?.create({
                    data: {
                        adminId,
                        adminName,
                        action: "CHANGE_MERCHANT_PLAN",
                        targetId: merchantId,
                        details: `Changed plan to ${data.plan} for merchant ${merchant.email}`
                    }
                });
                break;

            case "ADJUST_BALANCE":
                await prisma.user.update({
                    where: { id: merchantId },
                    data: {
                        availableBalance: {
                            [data.type === 'INCREMENT' ? 'increment' : 'decrement']: data.amount
                        }
                    }
                });
                await (prisma as any).auditLog?.create({
                    data: {
                        adminId,
                        adminName,
                        action: "ADJUST_MERCHANT_BALANCE",
                        targetId: merchantId,
                        details: `Adjusted balance by ${data.type === 'INCREMENT' ? '+' : '-'}${data.amount} for merchant ${merchant.email}`
                    }
                });
                break;

            case "GENERATE_IMPERSONATION":
                const token = crypto.randomBytes(32).toString('hex');
                return NextResponse.json({ impersonationToken: token });

            case "SUSPEND":
                await (prisma.user as any).update({
                    where: { id: merchantId },
                    data: { isSuspended: data.isSuspended }
                });
                await (prisma as any).auditLog?.create({
                    data: {
                        adminId,
                        adminName,
                        action: data.isSuspended ? "SUSPEND_MERCHANT" : "UNSUSPEND_MERCHANT",
                        targetId: merchantId,
                        details: `${data.isSuspended ? 'Suspended' : 'Unsuspended'} merchant ${merchant.email}`
                    }
                });
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Merchant PATCH error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
