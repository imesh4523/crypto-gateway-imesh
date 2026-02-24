import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password } = body;

        if (!email || !password || password.length < 6) {
            return NextResponse.json({ error: 'Valid email and a password (min 6 chars) are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }

        // Hash the password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
            data: {
                name: name || 'Merchant',
                email,
                password: hashedPassword,
                role: 'MERCHANT',
            }
        });

        // Initialize their balances and default settings
        // Prisma schema defaults are 0.0 for balances, so it's already set

        // Do not return password hash
        const { password: _, ...userSafe } = newUser;

        return NextResponse.json({ success: true, data: userSafe }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
