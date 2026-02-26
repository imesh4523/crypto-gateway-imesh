import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET: list products for logged in merchant
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const products = await prisma.botProduct.findMany({
        where: { userId: user.id },
        include: { credentials: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
}

// POST: create product
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { name, description, type, price } = body;

    if (!name || !type || price == null) {
        return NextResponse.json({ error: "name, type, and price are required" }, { status: 400 });
    }

    const product = await prisma.botProduct.create({
        data: { name, description, type, price: parseFloat(price), userId: user.id },
    });

    return NextResponse.json(product);
}

// PATCH: update product
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { id, name, description, type, price, status } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const product = await prisma.botProduct.updateMany({
        where: { id, userId: user.id },
        data: { name, description, type, price: price != null ? parseFloat(price) : undefined, status },
    });

    return NextResponse.json(product);
}

// DELETE: delete product
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    await prisma.botProduct.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
}
