import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { encrypt, decrypt } from '@/lib/encryption';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { webhookUrl, action } = body;

        if (action === 'REGENERATE_SECRET') {
            const rawSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const encryptedSecret = encrypt(rawSecret);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { webhookSecret: encryptedSecret }
            });
            return NextResponse.json({ success: true, webhookSecret: rawSecret });
        }

        if (action === 'REGENERATE_PUBLIC_KEY') {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { publicKey: 'pk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) }
            });
            return NextResponse.json({ success: true, publicKey: updatedUser.publicKey });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { webhookUrl: webhookUrl || null }
        });

        return NextResponse.json({ success: true, webhookUrl: updatedUser.webhookUrl });

    } catch (error) {
        console.error('Update Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { webhookUrl: true, webhookSecret: true, publicKey: true }
        });

        if (!user) {
            console.error(`User with ID ${userId} not found in database. Session might be stale.`);
            return NextResponse.json({
                success: false,
                error: 'Account not found. Please logout and register an account.',
                data: { webhookUrl: '', webhookSecret: 'ACCOUNT_NOT_FOUND', publicKey: 'ACCOUNT_NOT_FOUND' }
            });
        }

        // Ensure a secret exists
        let needsUpdate = false;
        const updateData: any = {};

        if (!user.webhookSecret) {
            const rawSecret = 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            updateData.webhookSecret = encrypt(rawSecret);
            needsUpdate = true;
        }

        if (!user.publicKey) {
            updateData.publicKey = 'pk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            needsUpdate = true;
        }

        if (needsUpdate) {
            user = await prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: { webhookUrl: true, webhookSecret: true, publicKey: true }
            });
        }

        // Decrypt for UI display
        if (user.webhookSecret) {
            user.webhookSecret = decrypt(user.webhookSecret);
        }

        return NextResponse.json({ success: true, data: user });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
