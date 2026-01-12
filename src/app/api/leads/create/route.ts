import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { formId, email } = await req.json();

        if (!formId || !email) {
            return NextResponse.json({ error: 'Missing formId or email' }, { status: 400 });
        }

        // Validate email format (simple regex)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const lead = await prisma.lead.create({
            data: {
                email,
                formId,
            },
        });

        return NextResponse.json(lead);
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
