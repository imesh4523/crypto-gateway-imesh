const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const userId = 'cmm1qass400087dr8...'; // Get full ID from previous output
    const invoice = await prisma.invoice.findFirst({
        where: { id: { endsWith: '478D3514' } }
    });

    const bot = await prisma.botIntegration.findUnique({
        where: { userId: invoice.userId }
    });

    console.log('Bot Integration:', JSON.stringify(bot, null, 2));
    process.exit(0);
}

check();
