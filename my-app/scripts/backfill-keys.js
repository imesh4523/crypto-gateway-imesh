const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { publicKey: null },
                { publicKey: "" }
            ]
        }
    });

    console.log(`Found ${users.length} users with missing publicKey`);

    for (const user of users) {
        const pk = 'pk_' + crypto.randomBytes(16).toString('hex');
        await prisma.user.update({
            where: { id: user.id },
            data: { publicKey: pk }
        });
        console.log(`Generated publicKey for user ${user.id}: ${pk}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
