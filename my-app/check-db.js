const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const merchants = await prisma.user.findMany({
            where: { role: 'MERCHANT' }
        });
        console.log('MERCHANTS_FOUND:', JSON.stringify(merchants, null, 2));
    } catch (err) {
        console.error('ERROR_CHECKING:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
