import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET /api/admin/settings
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all system settings
        const settings = await (prisma as any).systemSetting.findMany();

        // Convert to a record for easier frontend usage
        const settingsMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // Return core defaults if missing
        return NextResponse.json({
            siteName: settingsMap['SITE_NAME'] || "Soltio Admin",
            siteEmail: settingsMap['SITE_EMAIL'] || "admin@soltio.com",
            maintenanceMode: settingsMap['MAINTENANCE_MODE'] === 'true',
            platformFee: parseFloat(settingsMap['PLATFORM_FEE'] || "3.5"),
            minWithdrawal: parseFloat(settingsMap['MIN_WITHDRAWAL'] || "100"),
            require2FA: settingsMap['REQUIRE_2FA'] === 'true',
            sessionTimeout: parseInt(settingsMap['SESSION_TIMEOUT'] || "60"),
            webhookSecret: settingsMap['WEBHOOK_SECRET'] || "wh_live_xxxxxxxx",
        });

    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/settings
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { key, value } = body;

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        // Upsert the setting
        const setting = await (prisma as any).systemSetting.upsert({
            where: { key },
            update: { value: value.toString() },
            create: { key, value: value.toString() }
        });

        // Audit log the change
        await (prisma as any).auditLog.create({
            data: {
                adminId: (session.user as any).id,
                adminName: session.user?.name || 'Administrator',
                action: 'UPDATE_SYSTEM_SETTING',
                targetId: key,
                details: `Updated ${key} to ${value}`,
                ipAddress: req.headers.get('x-forwarded-for') || '0.0.0.0'
            }
        });

        return NextResponse.json({ success: true, data: setting });

    } catch (error) {
        console.error('Update setting error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
