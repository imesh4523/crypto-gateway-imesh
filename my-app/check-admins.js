const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' }
        });
        console.log('ADMINS_FOUND:', JSON.stringify(admins, null, 2));
    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
