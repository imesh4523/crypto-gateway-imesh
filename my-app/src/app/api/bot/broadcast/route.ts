import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import TelegramBot from "node-telegram-bot-api";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await (prisma as any).user.findUnique({ where: { email: session.user.email }, include: { BotIntegration: true } });
    if (!user || !user.BotIntegration?.telegramToken) return NextResponse.json({ error: "No bot integrated" }, { status: 400 });

    const decryptedTelegramToken = decrypt(user.BotIntegration.telegramToken);
    if (!decryptedTelegramToken) return NextResponse.json({ error: "No bot integrated" }, { status: 400 });

    const formData = await req.formData();
    const content = formData.get("content") as string;
    const buttonText = formData.get("buttonText") as string;
    const buttonUrl = formData.get("buttonUrl") as string;
    const buttonActionData = formData.get("buttonActionData") as string;

    // Process Media File
    const mediaFile = formData.get("media") as File | null;
    let fileBuffer: Buffer | null = null;
    let filename = "";
    let fileMime = "";

    if (mediaFile) {
        const bytes = await mediaFile.arrayBuffer();
        fileBuffer = Buffer.from(bytes);
        filename = mediaFile.name;
        fileMime = mediaFile.type;
    }

    if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

    // Save message history
    const messageRecord = await (prisma as any).botBroadcastMessage.create({
        data: {
            content,
            imageUrl: mediaFile ? `[Media: ${filename}]` : undefined,
            buttonText,
            buttonUrl: buttonUrl || buttonActionData,
            userId: user.id
        }
    });

    const bot = new TelegramBot(decryptedTelegramToken);

    // Fetch customers
    const customers = await (prisma as any).botCustomer.findMany({ where: { userId: user.id } });
    let sentCount = 0;

    // Construct options
    const replyMarkup: any = {};
    if (buttonText && (buttonUrl || buttonActionData)) {
        const btn: any = { text: buttonText };
        if (buttonUrl) btn.url = buttonUrl;
        else if (buttonActionData) btn.callback_data = buttonActionData;

        replyMarkup.inline_keyboard = [[btn]];
    }

    const opts: any = { parse_mode: "Markdown" };
    if (Object.keys(replyMarkup).length > 0) {
        opts.reply_markup = replyMarkup;
    }

    // Send asynchronously so we don't block
    Promise.allSettled(
        customers.map((c: any) => {
            if (fileBuffer) {
                const photoOpts = { ...opts, caption: content };
                const fileOpts = { filename, contentType: fileMime };

                if (fileMime.startsWith("video/")) {
                    return (bot as any).sendVideo(c.telegramId, fileBuffer, photoOpts, fileOpts).then(() => { sentCount++; });
                } else if (fileMime === "image/gif") {
                    return (bot as any).sendAnimation(c.telegramId, fileBuffer, photoOpts, fileOpts).then(() => { sentCount++; });
                } else {
                    return (bot as any).sendPhoto(c.telegramId, fileBuffer, photoOpts, fileOpts).then(() => { sentCount++; });
                }
            } else {
                return bot.sendMessage(c.telegramId, content, opts).then(() => { sentCount++; });
            }
        })
    ).then(async () => {
        // Update sent count when done
        await (prisma as any).botBroadcastMessage.update({
            where: { id: messageRecord.id },
            data: { sentCount, status: "completed" }
        });
    });

    return NextResponse.json({ success: true, targets: customers.length, messageId: messageRecord.id });
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const messages = await (prisma as any).botBroadcastMessage.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(messages);
}
