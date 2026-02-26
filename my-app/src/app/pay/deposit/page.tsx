import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export default async function DepositPageWrapper({ searchParams }: { searchParams: Promise<{ id?: string; amount?: string; gateway?: string }> }) {
    const params = await searchParams;
    const { id, amount, gateway } = params;

    if (!id || !amount) {
        return <div className="p-10 text-center font-bold text-rose-500">Invalid Request: Missing Customer ID or Amount</div>;
    }

    const customer = await (prisma as any).botCustomer.findUnique({
        where: { id: id },
    });

    if (!customer) {
        return <div className="p-10 text-center font-bold text-rose-500">Invalid Customer Configuration</div>;
    }

    const requestedAmount = Number(amount);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        return <div className="p-10 text-center font-bold text-rose-500">Invalid Deposit Amount</div>;
    }

    // Try to find the exact pending BotPayment to link
    const pendingPayment = await (prisma as any).botPayment.findFirst({
        where: {
            customerId: customer.id,
            status: "pending",
            amount: requestedAmount,
        },
        orderBy: { createdAt: "desc" }
    });

    const prefix = process.env.GATEWAY_ID_PREFIX || 'ORIYOTO-';

    if (pendingPayment) {
        // Find if we already created an invoice for this pending payment
        const existingInvoice = await (prisma as any).invoice.findFirst({
            where: {
                orderId: pendingPayment.id,
                status: 'PENDING'
            },
            orderBy: { createdAt: "desc" }
        });

        if (existingInvoice) {
            redirect(`/checkout/${existingInvoice.id}`);
        }
    }

    const customId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const customTxId = `${prefix}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Link the BotPayment ID as the inner orderId so we can fulfill it later
    const invoice = await (prisma as any).invoice.create({
        data: {
            id: customId,
            userId: customer.userId,
            amount: requestedAmount,
            currency: "USD",
            orderId: pendingPayment ? pendingPayment.id : null,
            orderDescription: `Bot Deposit for ${customer.telegramId}`,
            isTestMode: false
        }
    });

    await (prisma as any).transaction.create({
        data: {
            id: customTxId,
            platformTxId: customTxId,
            amount: requestedAmount,
            currency: "USD",
            status: 'PENDING',
            userId: customer.userId,
            invoiceId: invoice.id,
            isTestMode: false
        }
    });

    redirect(`/checkout/${invoice.id}`);
}
