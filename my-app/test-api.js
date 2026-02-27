const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Fetching merchants...');
        const merchants = await prisma.user.findMany({
            where: {
                role: "MERCHANT",
            },
            select: {
                id: true,
                name: true,
                email: true,
                plan: true,
                availableBalance: true,
                totalIncome: true,
                botClicksQuota: true,
                botClicksUsed: true,
                productLimitQuota: true,
                trialActive: true,
                twoFactorEnabled: true,
                isSuspended: true,
                createdAt: true,
                webhookUrl: true,
                brandName: true,
                _count: {
                    select: {
                        transactions: true,
                        invoices: true,
                        withdrawals: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            }
        });
        console.log('RESULT_COUNT:', merchants.length);
        console.log('FIRST_MERCHANT:', JSON.stringify(merchants[0], null, 2));
    } catch (err) {
        console.error('API_SIMULATION_ERROR:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
