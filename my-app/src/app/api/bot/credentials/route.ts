import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET: list credentials (optionally by productId)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const credentials = await prisma.botCredential.findMany({
        where: { userId: user.id, ...(productId ? { productId } : {}) },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(credentials);
}

// POST: add credentials (bulk)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { productId, lines } = body; // lines: string[] - each line is one credential

    if (!productId || !lines || !Array.isArray(lines)) {
        return NextResponse.json({ error: "productId and lines[] are required" }, { status: 400 });
    }

    // Verify product belongs to this user
    const product = await prisma.botProduct.findFirst({ where: { id: productId, userId: user.id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const validLines = lines.map((l: string) => l.trim()).filter((l: string) => l.length > 0);

    const created = await prisma.botCredential.createMany({
        data: validLines.map((content: string) => ({ productId, content, userId: user.id, status: "available" })),
    });

    return NextResponse.json({ created: created.count });
}

// DELETE: delete a credential
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.botCredential.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
}

// PATCH: edit a credential
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { id, content, status, productId } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updated = await prisma.botCredential.updateMany({
        where: { id, userId: user.id },
        data: {
            content: content !== undefined ? content : undefined,
            status: status !== undefined ? status : undefined,
            productId: productId !== undefined ? productId : undefined
        }
    });

    return NextResponse.json({ success: true, updated: updated.count });
}
