'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createForm(siteId: string, name: string) {
    try {
        const form = await prisma.form.create({
            data: {
                name,
                siteId,
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
