const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const invoice = await prisma.invoice.findFirst({
        where: { id: { endsWith: '478D3514' } },
        include: { transaction: true }
    });

    console.log(JSON.stringify(invoice, null, 2));
    process.exit(0);
}

check();
