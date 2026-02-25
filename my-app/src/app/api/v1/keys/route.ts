import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const keys = await prisma.apiKey.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ data: keys }, { status: 200 });
    } catch (error) {
        console.error('Fetch keys error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        const rawSecret = crypto.randomBytes(32).toString('hex');
        const fullKey = `sk_live_${rawSecret}`;
        const displayPrefix = `sk_live_${rawSecret.substring(0, 6)}...`;

        const newKey = await prisma.apiKey.create({
            data: {
                key: fullKey,
                prefix: displayPrefix,
                name: name || 'Default API Key',
                userId: (session.user as any).id,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                ...newKey,
                secretWarning: 'Copy the secret key now. You will not be able to see it again!'
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Create API Key error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }

        const userId = (session.user as any).id;

        // Ensure we only delete a key that belongs to this user
        await prisma.apiKey.deleteMany({
            where: {
                id: id,
                userId: userId
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Delete API Key error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
