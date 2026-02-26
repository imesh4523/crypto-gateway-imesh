const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const users = await prisma.user.findMany();
    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`User: ${u.email}, Brand: ${u.brandName}, Logo: ${u.brandLogoUrl}, BG: ${u.themeBgColor}`);
    });

    const invoices = await prisma.invoice.findMany({ include: { merchant: true } });
    console.log('Invoices found:', invoices.length);
    invoices.forEach(i => {
        console.log(`Invoice: ${i.id}, Merchant: ${i.merchant.email}, Brand: ${i.merchant.brandName}`);
    });
}

check().catch(console.error).finally(() => prisma.$disconnect());
