"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import matter from "gray-matter";

// --- Blog Post Actions ---

export async function getBlogPosts(siteId: string) {
    const user = await currentUser();
    if (!user) return [];

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true }
    });
    // Add logic to check if user is admin or owner
    if (!site || site.user.clerkId !== user.id) return [];

    return prisma.blogPost.findMany({
        where: { siteId },
        orderBy: { createdAt: "desc" }
    });
}

export async function getPublicBlogPosts(siteId: string, count: number = 3) {
    const take = typeof count === 'string' ? parseInt(count) : count;
    return prisma.blogPost.findMany({
        where: {
            siteId,
            published: true
        },
        orderBy: { publishedAt: "desc" },
        take: take,
        select: {
            id: true,
            title: true,
            slug: true,
            publishedAt: true,
            description: true,
            image: true,
            author: true,
        }
    });
}

export async function getPublicBlogPost(siteId: string, slug: string) {
    return prisma.blogPost.findUnique({
        where: {
            siteId_slug: { siteId, slug },
            published: true
        }
    });
}

export async function getBlogPost(postId: string) {
    const user = await currentUser();
    if (!user) return null;

    const post = await prisma.blogPost.findUnique({
        where: { id: postId },
        include: { site: { include: { user: true } } }
    });

    if (!post || post.site.user.clerkId !== user.id) return null;
    return post;
}

export async function createBlogPost(siteId: string, title: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true }
    });

    if (!site || site.user.clerkId !== user.id) return { error: "Unauthorized" };

    // Basic slug generation
    let slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
    // Ensure uniqueness handled by DB error or simple retry logic, here we keep it simple for now or let DB fail

    // Check existence
    const existing = await prisma.blogPost.findUnique({
        where: { siteId_slug: { siteId, slug } }
    });
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    const defaultContent = `---
title: ${title}
slug: ${slug}
date: ${new Date().toISOString().split('T')[0]}
published: false
author: ${user.firstName || 'Admin'}
image: 
description: 
---

# ${title}

Write your post content here...
`;

    try {
        const post = await prisma.blogPost.create({
            data: {
                siteId,
                title,
                slug,
                content: defaultContent,
                author: user.firstName || 'Admin',
            }
        });
        revalidatePath(`/app/site/${siteId}/blog`);
        return { success: true, post };
    } catch (e) {
        return { error: "Failed to create post" };
    }
}

export async function updateBlogPost(siteId: string, postId: string, content: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true }
    });

    if (!site || site.user.clerkId !== user.id) return { error: "Unauthorized" };

    try {
        const { data: frontmatter } = matter(content);

        const updateData: any = {
            content,
            title: frontmatter.title,
            description: frontmatter.description,
            image: frontmatter.image,
            author: frontmatter.author,
            publishedAt: frontmatter.date ? new Date(frontmatter.date) : null,
        };

        if ("published" in frontmatter) {
            updateData.published =
                frontmatter.published === true || frontmatter.published === "true";
        }

        // If slug is updated in frontmatter, try to update it
        if (frontmatter.slug) {
            updateData.slug = frontmatter.slug;
        }

        await prisma.blogPost.update({
            where: { id: postId },
            data: updateData,
        });

        revalidatePath(`/app/site/${siteId}/blog`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update post. Slug might be taken." };
    }
}

export async function setBlogPostPublished(
    siteId: string,
    postId: string,
    published: boolean,
) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true },
    });

    if (!site || site.user.clerkId !== user.id) return { error: "Unauthorized" };

    try {
        await prisma.blogPost.update({
            where: { id: postId },
            data: {
                published,
                publishedAt: published ? new Date() : null,
            },
        });
        revalidatePath(`/app/site/${siteId}/blog`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update publish state" };
    }
}

export async function deleteBlogPost(siteId: string, postId: string) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true }
    });

    if (!site || site.user.clerkId !== user.id) return { error: "Unauthorized" };

    await prisma.blogPost.delete({ where: { id: postId } });
    revalidatePath(`/app/site/${siteId}/blog`);
    return { success: true };
}
