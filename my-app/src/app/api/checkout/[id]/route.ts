import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        const invoiceId = routeParams.id;

        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { transaction: true }
        }) as any;

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Use raw SQL to fetch merchant to ensure new columns are included even if prisma client is outdated
        const merchants: any[] = await prisma.$queryRawUnsafe(
            `SELECT "brandName", "name", "brandLogoUrl", "themeBgColor", "enabledCryptoWallet", "enabledBinancePay" FROM "User" WHERE "id" = $1`,
            invoice.userId
        );
        const merchant = merchants[0];

        // DEBUG LOG TO SEE EXACT KEYS
        const keys = merchant ? Object.keys(merchant) : [];
        require('fs').appendFileSync('debug-checkout.log', `[${new Date().toISOString()}] Merchant Keys: ${JSON.stringify(keys)}, CryptoVal: ${merchant?.enabledCryptoWallet}, LowerVal: ${merchant?.enabledcryptowallet}\n`);

        // Robust check for settings from raw SQL results
        const isCryptoEnabled = merchant?.enabledCryptoWallet !== false && merchant?.enabledcryptowallet !== false;
        const isBinanceEnabled = merchant?.enabledBinancePay !== false && merchant?.enabledbinancepay !== false;

        // DEBUG LOG
        require('fs').appendFileSync('debug-checkout.log', `[${new Date().toISOString()}] Merchant Settings for ${invoice.userId}: Crypto: ${isCryptoEnabled}, Binance: ${isBinanceEnabled}\n`);

        const botIntegration = await (prisma as any).botIntegration.findUnique({
            where: { userId: invoice.userId }
        });

        return NextResponse.json({
            success: true,
            data: {
                id: invoice.id,
                amount: invoice.amount.toString(),
                currency: invoice.currency,
                status: invoice.status,
                merchantName: merchant?.brandName || merchant?.name || 'Merchant',
                merchantBinancePayId: botIntegration?.binancePayId,
                enabledCryptoWallet: isCryptoEnabled,
                enabledBinancePay: isBinanceEnabled,
                brandLogoUrl: merchant?.brandLogoUrl,
                themeBgColor: merchant?.themeBgColor || "#f4f5f8",
                createdAt: invoice.createdAt,
                expiresAt: (() => {
                    const created = new Date(invoice.createdAt).getTime();
                    // If it's a Binance Pay transaction or the invoice itself is marked as some Binance state
                    if (invoice.transaction?.providerTxId?.startsWith('PAY-') || invoice.transaction?.payAddress?.length === 9) {
                        return new Date(created + 7200 * 1000); // 2 hours
                    } else if (invoice.transaction?.payAddress) {
                        return new Date(created + 10800 * 1000); // 3 hours
                    }
                    return new Date(created + 21600 * 1000); // 6 hours default
                })(),
                orderId: invoice.orderId,
                transaction: invoice.transaction ? {
                    status: invoice.transaction.status,
                    payAddress: invoice.transaction.payAddress,
                    amount: invoice.transaction.payAmount ? invoice.transaction.payAmount.toString() : invoice.transaction.amount.toString(),
                    currency: invoice.transaction.payCurrency || invoice.transaction.currency,
                    providerTxId: invoice.transaction.providerTxId
                } : null
            }
        });
    } catch (error) {
        console.error('Fetch Invoice Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
