import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'Invalid password format (minimum 6 characters required)' }, { status: 400 });
        }

        const userId = (session.user as any).id;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.password) {
            return NextResponse.json({ error: 'Bad user account or missing local password' }, { status: 400 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
