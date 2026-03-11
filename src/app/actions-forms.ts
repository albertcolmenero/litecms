'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DEFAULT_FORM_FIELDS, FormLayout, sanitizeFormFields, sanitizeFormLayout } from '@/lib/forms';

type UpdateFormPayload = {
    name: string;
    ctaText: string;
    additionalSubmitUrl: string | null;
    fields: unknown;
    layout: FormLayout;
};

export async function createForm(siteId: string, name: string) {
    try {
        const form = await prisma.form.create({
            data: {
                name,
                siteId,
                type: 'custom',
                layout: 'stacked',
                ctaText: 'Submit',
                fields: DEFAULT_FORM_FIELDS,
            },
        });
        revalidatePath(`/app/site/${siteId}/forms`);
        return form;
    } catch (error) {
        console.error('Error creating form:', error);
        throw new Error('Failed to create form');
    }
}

export async function getForms(siteId: string) {
    try {
        const forms = await prisma.form.findMany({
            where: {
                siteId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                _count: {
                    select: { leads: true },
                },
            },
        });
        return forms;
    } catch (error) {
        console.error('Error fetching forms:', error);
        return [];
    }
}

export async function deleteForm(formId: string, siteId: string) {
    try {
        const form = await prisma.form.findFirst({
            where: {
                id: formId,
                siteId,
            },
        });

        if (!form) throw new Error('Form not found');

        await prisma.form.delete({
            where: {
                id: formId,
            },
        });
        revalidatePath(`/app/site/${siteId}/forms`);
    } catch (error) {
        console.error('Error deleting form:', error);
        throw new Error('Failed to delete form');
    }
}

export async function getForm(formId: string, siteId: string) {
    try {
        const form = await prisma.form.findFirst({
            where: {
                id: formId,
                siteId,
            },
        });
        if (!form) return null;
        return {
            ...form,
            layout: sanitizeFormLayout(form.layout),
            ctaText: form.ctaText || 'Submit',
            fields: sanitizeFormFields(form.fields),
        };
    } catch (error) {
        console.error('Error fetching form:', error);
        return null;
    }
}

export async function updateForm(formId: string, siteId: string, payload: UpdateFormPayload) {
    try {
        const form = await prisma.form.findFirst({
            where: {
                id: formId,
                siteId,
            },
        });
        if (!form) throw new Error('Form not found');

        const fields = sanitizeFormFields(payload.fields);
        const layout = sanitizeFormLayout(payload.layout);
        const name = payload.name.trim();
        const ctaText = payload.ctaText.trim() || 'Submit';
        const additionalSubmitUrlRaw = payload.additionalSubmitUrl?.trim() || null;
        let additionalSubmitUrl = additionalSubmitUrlRaw;

        if (additionalSubmitUrlRaw) {
            try {
                additionalSubmitUrl = new URL(additionalSubmitUrlRaw).toString();
            } catch {
                throw new Error('Invalid additional submit URL');
            }
        }

        const updated = await prisma.form.update({
            where: { id: formId },
            data: {
                name: name || form.name,
                ctaText,
                additionalSubmitUrl,
                fields,
                layout,
                type: 'custom',
            },
        });

        revalidatePath(`/app/site/${siteId}/forms`);
        revalidatePath(`/app/site/${siteId}/forms/${formId}`);
        revalidatePath(`/app/site/${siteId}/leads`);
        return updated;
    } catch (error) {
        console.error('Error updating form:', error);
        throw new Error('Failed to update form');
    }
}

export async function getLeads(siteId: string) {
    try {
        const leads = await prisma.lead.findMany({
            where: {
                form: {
                    siteId: siteId
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                form: true,
            },
        });
        return leads;
    } catch (error) {
        console.error('Error fetching leads:', error);
        return [];
    }
}
