import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import speakeasy from 'speakeasy';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: '2FA setup not initialized' }, { status: 400 });
        }

        // Verify the 6-digit code using speakeasy
        const isValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: token,
            window: 1 // Allow 1 step of drift (30s)
        });

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid verification token' }, { status: 401 });
        }

        // Fully enable 2FA for the user
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorEnabled: true }
        });

        return NextResponse.json({ success: true, message: '2FA enabled successfully' }, { status: 200 });

    } catch (error) {
        console.error('2FA Verify Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
