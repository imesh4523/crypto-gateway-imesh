import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!(prisma as any).ipBlacklist) {
            return NextResponse.json([]);
        }

        const blacklist = await (prisma as any).ipBlacklist.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(blacklist);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ipAddress, reason } = body;

        if (!ipAddress) return NextResponse.json({ error: "IP Address required" }, { status: 400 });

        if (!(prisma as any).ipBlacklist) {
            return NextResponse.json({ error: "Security subsystem offline" }, { status: 503 });
        }

        const blacklisted = await (prisma as any).ipBlacklist.create({
            data: { ipAddress, reason }
        });

        // Log the action
        if ((prisma as any).auditLog) {
            await (prisma as any).auditLog.create({
                data: {
                    adminId: (session.user as any).id,
                    adminName: session.user.name,
                    action: "ADD_IP_BLACKLIST",
                    targetId: ipAddress,
                    details: `Blacklisted IP: ${ipAddress}. Reason: ${reason || 'N/A'}`
                }
            });
        }

        return NextResponse.json(blacklisted);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user || (session.user as any)?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        if (!(prisma as any).ipBlacklist) return NextResponse.json({ error: "Service Unavailable" }, { status: 503 });

        const item = await (prisma as any).ipBlacklist.findUnique({ where: { id } });

        await (prisma as any).ipBlacklist.delete({ where: { id } });

        // Log the action
        if ((prisma as any).auditLog) {
            await (prisma as any).auditLog.create({
                data: {
                    adminId: (session.user as any).id,
                    adminName: session.user.name,
                    action: "REMOVE_IP_BLACKLIST",
                    targetId: item?.ipAddress,
                    details: `Removed IP from blacklist: ${item?.ipAddress}`
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
