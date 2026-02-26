export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { prisma } = await import('@/lib/prisma');
            const { startBotForToken } = await import('@/lib/botManager');

            // Fetch all active bot integrations
            // Use ts-ignore temporarily if Prisma types haven't updated yet
            // @ts-ignore
            const botIntegrations = await prisma.botIntegration.findMany({
                where: { status: 'ACTIVE' }
            });

            console.log(`[BotManager] Found ${botIntegrations.length} active Telegram bots to initialize`);

            for (const bot of botIntegrations) {
                if (bot.telegramToken) {
                    startBotForToken(bot.telegramToken);
                }
            }
        } catch (e) {
            console.error("Failed to initialize bots on startup", e);
        }
    }
}
