const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.user.updateMany({
        data: {
            botIntegrationEnabled: true,
            botClicksQuota: 500,
            botClicksUsed: 350,
            hostingPowerLimit: 1.0,
            trialActive: true
        }
    });
    console.log('Updated user quotas and trial settings');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    });
