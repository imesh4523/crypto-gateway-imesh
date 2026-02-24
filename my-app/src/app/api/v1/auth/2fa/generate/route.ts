import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.twoFactorEnabled) {
            return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 });
        }

        // Generate a new TOTP secret using speakeasy
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `Soltio Gateway (${user.email})`
        });

        // Generate QR code from the otpauth_url
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

        // Store base32 secret temporarily (not yet enabled)
        await prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret.base32 }
        });

        return NextResponse.json({
            success: true,
            data: {
                secret: secret.base32,
                qrCodeUrl
            }
        }, { status: 200 });

    } catch (error) {
        console.error('2FA Generate Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
