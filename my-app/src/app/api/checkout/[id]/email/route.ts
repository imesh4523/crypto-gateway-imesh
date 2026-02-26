import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const routeParams = await params;
        const invoiceId = routeParams.id;
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Save email to the transaction associated with this invoice
        // Using raw SQL for reliability during development
        await prisma.$executeRawUnsafe(
            `UPDATE "Transaction" SET "customerEmail" = $1 WHERE "invoiceId" = $2`,
            email,
            invoiceId
        );

        // Also save to debug log for confirmation
        fs.appendFileSync('customer-emails.log', `[${new Date().toISOString()}] Invoice: ${invoiceId}, Email: ${email}\n`);

        return NextResponse.json({ success: true, message: 'Email saved successfully' });
    } catch (error: any) {
        console.error('Save Email Error:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
