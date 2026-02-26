const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const integrations = await prisma.botIntegration.findMany();
    console.log("Bot Integrations:", JSON.stringify(integrations, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
