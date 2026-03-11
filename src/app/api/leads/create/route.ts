import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sanitizeFormFields, validateFormValues } from '@/lib/forms';

export async function POST(req: Request) {
    try {
        const { formId, values } = await req.json();

        if (!formId || !values || typeof values !== 'object') {
            return NextResponse.json({ error: 'Missing formId or values' }, { status: 400 });
        }

        const form = await prisma.form.findUnique({
            where: { id: formId },
        });
        if (!form) {
            return NextResponse.json({ error: 'Form not found' }, { status: 404 });
        }

        const fields = sanitizeFormFields(form.fields);
        const { errors, normalized, extractedEmail } = validateFormValues(fields, values as Record<string, unknown>);

        if (Object.keys(errors).length > 0) {
            return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
        }

        const lead = await prisma.lead.create({
            data: {
                email: extractedEmail,
                data: normalized,
                formId,
            },
        });

        if (form.additionalSubmitUrl) {
            try {
                const url = new URL(form.additionalSubmitUrl);
                await fetch(url.toString(), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        formId: form.id,
                        formName: form.name,
                        fields,
                        values: normalized,
                        leadId: lead.id,
                        createdAt: lead.createdAt,
                    }),
                    signal: AbortSignal.timeout(5000),
                });
            } catch (forwardError) {
                console.error('Error forwarding lead:', forwardError);
            }
        }

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error) {
        console.error('Error creating lead:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
