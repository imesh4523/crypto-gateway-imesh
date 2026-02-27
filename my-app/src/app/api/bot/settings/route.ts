import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { startBotForToken } from "@/lib/botManager";
import { encrypt } from "@/lib/encryption";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { telegramToken, binancePayId, binanceApiKey, binanceSecretKey } = body;

        const user = await (prisma as any).user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Encrypt the sensitive tokens before saving
        const encryptedTelegramToken = encrypt(telegramToken);
        const encryptedBinanceApiKey = encrypt(binanceApiKey);
        const encryptedBinanceSecretKey = encrypt(binanceSecretKey);

        await (prisma as any).botIntegration.upsert({
            where: { userId: user.id },
            update: {
                telegramToken: encryptedTelegramToken,
                binancePayId,
                binanceApiKey: encryptedBinanceApiKey,
                binanceSecretKey: encryptedBinanceSecretKey,
                status: "ACTIVE",
            },
            create: {
                userId: user.id,
                telegramToken: encryptedTelegramToken,
                binancePayId,
                binanceApiKey: encryptedBinanceApiKey,
                binanceSecretKey: encryptedBinanceSecretKey,
                status: "ACTIVE",
            }
        });

        // Also make sure user.botIntegrationEnabled is set to true
        await (prisma as any).user.update({
            where: { id: user.id },
            data: { botIntegrationEnabled: true }
        });

        // Initialize the bot polling right here so it works immediately after save
        if (telegramToken && telegramToken.trim() !== "") {
            startBotForToken(telegramToken);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Bot settings update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
