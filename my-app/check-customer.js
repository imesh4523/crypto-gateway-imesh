const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const telegramId = "7507799896";
    const customer = await prisma.botCustomer.findFirst({
        where: { telegramId: telegramId }
    });
    console.log("Customer found:", JSON.stringify(customer, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
