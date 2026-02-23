"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAssets(siteId: string) {
    const user = await currentUser();
    if (!user) return [];

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true },
    });

    if (!site || site.user.clerkId !== user.id) return [];

    return prisma.asset.findMany({
        where: { siteId },
        orderBy: { createdAt: "desc" },
    });
}

export async function updateAssetAlt(assetId: string, siteId: string, alt: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true },
    });

    if (!site || site.user.clerkId !== user.id) {
        return { error: "Unauthorized" };
    }

    const asset = await prisma.asset.findUnique({ where: { id: assetId } });
    if (!asset || asset.siteId !== siteId) {
        return { error: "Asset not found" };
    }

    await prisma.asset.update({
        where: { id: assetId },
        data: { alt },
    });

    revalidatePath(`/app/site/${siteId}/media`);
    return { success: true };
}
