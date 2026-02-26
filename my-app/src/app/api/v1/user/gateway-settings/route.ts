import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import fs from 'fs';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Using raw SQL to bypass outdated Prisma client dmmf
        const users: any[] = await prisma.$queryRawUnsafe(
            `SELECT "brandName", "brandLogoUrl", "themeBgColor", "themeCardColor", "enabledCryptoWallet", "enabledBinancePay" FROM "User" WHERE "id" = $1`,
            userId
        );

        return NextResponse.json({ success: true, data: users[0] || {} });
    } catch (error) {
        console.error('Fetch Gateway Settings Error:', error);
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
        const userId = (session.user as any).id;
        fs.appendFileSync('debug-settings.log', `[${new Date().toISOString()}] Body: ${JSON.stringify(body)}, User: ${userId}\n`);

        const { brandName, brandLogoUrl, themeBgColor, themeCardColor, enabledCryptoWallet, enabledBinancePay } = body;

        // Use Raw SQL update to bypass "Unknown argument" error from outdated Prisma client
        await prisma.$executeRawUnsafe(
            `UPDATE "User" SET "brandName" = $1, "brandLogoUrl" = $2, "themeBgColor" = $3, "themeCardColor" = $4, "enabledCryptoWallet" = $5, "enabledBinancePay" = $6 WHERE "id" = $7`,
            brandName,
            brandLogoUrl,
            themeBgColor,
            themeCardColor,
            enabledCryptoWallet,
            enabledBinancePay,
            userId
        );

        fs.appendFileSync('debug-settings.log', `[${new Date().toISOString()}] Raw Update Success for ${userId}\n`);

        return NextResponse.json({
            success: true,
            data: {
                brandName,
                brandLogoUrl,
                themeBgColor,
                themeCardColor,
                enabledCryptoWallet,
                enabledBinancePay
            }
        });
    } catch (error: any) {
        console.error('Update Gateway Settings Error:', error);
        fs.appendFileSync('debug-settings.log', `[${new Date().toISOString()}] Raw Update FAILED: ${error.message}\n`);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
