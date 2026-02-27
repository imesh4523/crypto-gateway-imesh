import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only PNG, JPEG, and SVG are allowed.' }, { status: 400 });
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size too large. Maximum size is 2MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename
        const userId = (session.user as any).id;
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `logo-${userId}-${timestamp}.${extension}`;

        const publicPath = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        if (!existsSync(publicPath)) {
            await mkdir(publicPath, { recursive: true });
        }

        const filePath = join(publicPath, filename);
        await writeFile(filePath, buffer);

        const logoUrl = `/uploads/${filename}`;

        return NextResponse.json({ success: true, url: logoUrl });
    } catch (error) {
        console.error('Logo upload error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
