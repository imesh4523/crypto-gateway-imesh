const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const invoiceId = 'IMESH-94D686EC';
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        select: { userId: true }
    });
    console.log('Invoice:', invoice);
    if (invoice) {
        const user = await prisma.user.findUnique({
            where: { id: invoice.userId },
            select: { id: true, enabledCryptoWallet: true, enabledBinancePay: true }
        });
        console.log('User Settings:', user);
    }
    process.exit(0);
}

check();
