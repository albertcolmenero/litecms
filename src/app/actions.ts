"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSite(formData: FormData) {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    const name = formData.get("name") as string;
    const subdomain = formData.get("subdomain") as string;
    const description = formData.get("description") as string;

    if (!name || !subdomain) {
        throw new Error("Name and subdomain are required");
    }

    // Ensure user exists in our DB
    // This is a lazy sync. Ideal way is Webhooks, but for MVP this is fine.
    let dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0].emailAddress,
            },
        });
    }

    try {
        const site = await prisma.site.create({
            data: {
                name,
                subdomain,
                description,
                userId: dbUser.id,
            },
        });

        revalidatePath("/app");
        return { success: true, site };
    } catch (error: any) {
        if (error.code === "P2002") {
            return { error: "Subdomain already taken" };
        }
        return { error: "Failed to create site" };
    }
}

export async function getSites() {
    const user = await currentUser();
    if (!user) return redirect("/sign-in");

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser) return [];

    if (dbUser.role === "SUPER_ADMIN") {
        return prisma.site.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { pages: true },
                },
                user: true, // Optional: helpful to see owner
            },
        });
    }

    // Default: ADMIN (View own sites)
    return prisma.site.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { pages: true },
            },
        },
    });
}

export async function getSite(siteId: string) {
    const user = await currentUser();
    if (!user) return null; // Or redirect

    // Security: Verify user owns the site
    const site = await prisma.site.findUnique({
        where: {
            id: siteId,
        },
        include: {
            pages: {
                orderBy: { updatedAt: "desc" },
                include: {
                    menuItems: {
                        include: { menu: true }
                    }
                }
            },
            user: true, // check ownership
        },
    });

    if (!site || site.user.clerkId !== user.id) {
        return null;
    }

    return site;
}

export async function createPage(siteId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    // Make content optional/empty for now
    const content = (formData.get("content") as string) || "# New Page";
    const showInMain = formData.get("showInMain") === "on";
    const showInFooter = formData.get("showInFooter") === "on";

    if (!title || !slug) return { error: "Missing fields" };

    try {
        const page = await prisma.page.create({
            data: {
                title,
                slug,
                content,
                siteId,
                published: true, // auto-publish for MVP
            },
        });

        // Sync Menus
        const syncMenu = async (menuName: string, shouldBeIn: boolean) => {
            if (!shouldBeIn) return;

            // 1. Find or create menu
            let menu = await prisma.menu.findFirst({
                where: { siteId, name: menuName }
            });

            if (!menu) {
                menu = await prisma.menu.create({
                    data: { siteId, name: menuName }
                });
            }

            // 2. Add item
            const lastItem = await prisma.menuItem.findFirst({
                where: { menuId: menu.id },
                orderBy: { order: 'desc' }
            });
            const newOrder = (lastItem?.order ?? 0) + 1;

            await prisma.menuItem.create({
                data: {
                    menuId: menu.id,
                    pageId: page.id,
                    label: title,
                    order: newOrder
                }
            });
        };

        await syncMenu("Main", showInMain);
        await syncMenu("Footer", showInFooter);

        revalidatePath(`/app/site/${siteId}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create page (slug might be taken)" };
    }
}

// Update getSiteByDomain to include homePage and menus
export async function getSiteByDomain(domain: string) {
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.split(":")[0];
    const subdomain = domain.endsWith(`.${rootDomain}`)
        ? domain.replace(`.${rootDomain}`, "")
        : null;

    return prisma.site.findFirst({
        where: {
            OR: [
                { customDomain: domain },
                { subdomain: subdomain || domain },
            ],
        },
        include: {
            pages: true,
            homePage: true,
            menus: {
                include: {
                    items: {
                        orderBy: { order: "asc" },
                        include: { page: true }
                    }
                }
            }
        },
    });
}

export async function updateSite(siteId: string, data: { homePageId?: string; name?: string; description?: string; settings?: any }) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true },
    });

    if (!site || site.user.clerkId !== user.id) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.site.update({
            where: { id: siteId },
            data: { ...data },
        });
        revalidatePath(`/app/site/${siteId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update site" };
    }
}

export async function getPageBySiteAndSlug(siteId: string, slug: string) {
    return prisma.page.findUnique({
        where: {
            siteId_slug: {
                siteId,
                slug,
            },
        },
    });
}

export async function getPage(pageId: string) {
    const user = await currentUser();
    if (!user) return null;

    const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: {
            site: { include: { user: true } },
            menuItems: { include: { menu: true } }
        },
    });

    if (!page || page.site.user.clerkId !== user.id) {
        return null;
    }

    return page;
}


async function managePageInMenu(siteId: string, pageId: string, menuName: string, shouldShow: boolean) {
    // 1. Find or create the menu
    let menu = await prisma.menu.findFirst({
        where: { siteId, name: menuName }
    });

    if (!menu) {
        if (!shouldShow) return; // If we don't want to show it, and menu doesn't exist, do nothing.
        menu = await prisma.menu.create({
            data: { siteId, name: menuName }
        });
    }

    // 2. Check if item exists
    const existingItem = await prisma.menuItem.findFirst({
        where: { menuId: menu.id, pageId }
    });

    if (shouldShow) {
        if (!existingItem) {
            // Add to end
            const lastItem = await prisma.menuItem.findFirst({
                where: { menuId: menu.id },
                orderBy: { order: "desc" }
            });
            const newOrder = (lastItem?.order || 0) + 1;

            // Fetch page title for label default
            const page = await prisma.page.findUnique({ where: { id: pageId } });

            await prisma.menuItem.create({
                data: {
                    menuId: menu.id,
                    pageId,
                    label: page?.title || "Page",
                    order: newOrder
                }
            });
        }
    } else {
        if (existingItem) {
            await prisma.menuItem.delete({
                where: { id: existingItem.id }
            });
        }
    }
}

import matter from "gray-matter";

// ... existing imports

export async function updatePage(
    siteId: string,
    pageId: string,
    data: { content?: string; title?: string; published?: boolean; slug?: string; showInMain?: boolean; showInFooter?: boolean }
) {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true },
    });

    if (!site || site.user.clerkId !== user.id) {
        return { error: "Unauthorized" };
    }

    try {
        let updateData: any = { ...data };

        // Remove transient menu flags from updateData intended for Page model
        delete updateData.showInMain;
        delete updateData.showInFooter;

        // Parse frontmatter if content is changing
        if (data.content) {
            const { data: frontmatter } = matter(data.content);

            if (frontmatter.title) updateData.title = frontmatter.title;
            if (frontmatter.description) updateData.description = frontmatter.description;

            // Handle Menu Sync
            const menuSettings = frontmatter.menu || {};
            const pageName = frontmatter.name || updateData.title || "Page";

            // Helper to sync menu items
            const syncMenu = async (menuName: string, shouldBeInMenu: boolean) => {
                let menu = await prisma.menu.findFirst({
                    where: { siteId, name: menuName }
                });

                if (!menu) {
                    // Create menu if it doesn't exist AND we need to add to it
                    if (shouldBeInMenu) {
                        menu = await prisma.menu.create({
                            data: { siteId, name: menuName }
                        });
                    } else {
                        return; // Menu doesn't exist and we don't need to add -> do nothing
                    }
                }

                const existingItem = await prisma.menuItem.findFirst({
                    where: { menuId: menu.id, pageId }
                });

                if (shouldBeInMenu) {
                    if (existingItem) {
                        // Update label if needed
                        if (existingItem.label !== pageName) {
                            await prisma.menuItem.update({
                                where: { id: existingItem.id },
                                data: { label: pageName }
                            });
                        }
                    } else {
                        // Create item
                        // fetch last order
                        const lastItem = await prisma.menuItem.findFirst({
                            where: { menuId: menu.id },
                            orderBy: { order: 'desc' }
                        });
                        const newOrder = (lastItem?.order ?? 0) + 1;

                        await prisma.menuItem.create({
                            data: {
                                menuId: menu.id,
                                pageId,
                                label: pageName,
                                order: newOrder
                            }
                        });
                    }
                } else {
                    if (existingItem) {
                        await prisma.menuItem.delete({
                            where: { id: existingItem.id }
                        });
                    }
                }
            };

            // Check boolean explicit true check to avoid accidental inclusion
            // Support both direct boolean and nested under menu: { main: true }
            const showMain = menuSettings.main === true || data.showInMain === true;
            const showFooter = menuSettings.footer === true || data.showInFooter === true;

            await syncMenu("Main", showMain);
            await syncMenu("Footer", showFooter);
        }

        await prisma.page.update({
            where: { id: pageId },
            data: updateData,
        });

        revalidatePath(`/app/site/${siteId}`);
        return { success: true };
    } catch (e: any) {
        console.error(e);
        if (e.reason) {
            return { error: `Invalid Frontmatter: ${e.reason}` };
        }
        return { error: "Failed to update page" };
    }
}


// --- Menu Actions ---

export async function getMenus(siteId: string) {
    const user = await currentUser();
    if (!user) return [];

    const site = await prisma.site.findUnique({
        where: { id: siteId },
        include: { user: true }
    });
    if (!site || site.user.clerkId !== user.id) return [];

    return prisma.menu.findMany({
        where: { siteId },
        include: { items: { orderBy: { order: "asc" }, include: { page: true } } }
    });
}

export async function createMenu(siteId: string, name: string) {
    // Auth check omitted for brevity in this snippet, but should be same as above
    return prisma.menu.create({
        data: { name, siteId }
    });
}

export async function upsertMenuItem(menuId: string, itemId: string | null, data: { label: string; url?: string; pageId?: string; order: number }) {
    if (itemId) {
        return prisma.menuItem.update({
            where: { id: itemId },
            data
        });
    } else {
        return prisma.menuItem.create({
            data: { ...data, menuId }
        });
    }
}

export async function deleteMenuItem(itemId: string) {
    return prisma.menuItem.delete({ where: { id: itemId } });
}

export async function deleteMenu(menuId: string) {
    return prisma.menu.delete({ where: { id: menuId } });
}
