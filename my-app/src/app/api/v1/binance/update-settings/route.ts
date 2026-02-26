import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { binancePayId, binanceApiKey, binanceSecretKey } = await req.json();

    if (!binancePayId) {
        return NextResponse.json({ error: 'Binance Pay ID is required' }, { status: 400 });
    }

    // Upsert BotIntegration record (we reuse same model to store Binance credentials per merchant)
    await prisma.botIntegration.upsert({
        where: { userId },
        create: {
            userId,
            binancePayId,
            binanceApiKey: binanceApiKey || null,
            binanceSecretKey: binanceSecretKey || null,
            status: 'ACTIVE',
        },
        update: {
            binancePayId,
            binanceApiKey: binanceApiKey || null,
            binanceSecretKey: binanceSecretKey || null,
        },
    });

    return NextResponse.json({ success: true });
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const integration = await prisma.botIntegration.findUnique({ where: { userId } });

    return NextResponse.json({
        success: true,
        data: {
            binancePayId: integration?.binancePayId || '',
            hasBinanceApiKey: !!integration?.binanceApiKey,
        }
    });
}
