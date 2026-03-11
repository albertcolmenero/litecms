import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeFormFields, sanitizeFormLayout } from '@/lib/forms';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        layout: true,
        ctaText: true,
        fields: true,
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...form,
      layout: sanitizeFormLayout(form.layout),
      ctaText: form.ctaText || 'Submit',
      fields: sanitizeFormFields(form.fields),
    });
  } catch (error) {
    console.error('Error fetching form config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
