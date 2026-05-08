import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { SiteForChrome } from "@/components/dashboard/types";

function siteAccent(site: { settings: any }): string | undefined {
  const primary = site.settings?.theme?.colors?.primary;
  return typeof primary === "string" && primary.length > 0 ? primary : undefined;
}

export async function getDashboardChrome(currentSiteId: string) {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  const showAdmin = dbUser?.role === "SUPER_ADMIN";

  const sites = await prisma.site.findMany({
    where: { user: { clerkId: user.id } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      subdomain: true,
      customDomain: true,
      settings: true,
    },
  });

  const current = sites.find((s) => s.id === currentSiteId);
  if (!current) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const unreadLeads = await prisma.lead.count({
    where: {
      form: { siteId: currentSiteId },
      createdAt: { gte: sevenDaysAgo },
    },
  });

  const toChrome = (s: typeof sites[number]): SiteForChrome => ({
    id: s.id,
    name: s.name,
    subdomain: s.subdomain,
    customDomain: s.customDomain,
    accent: siteAccent(s),
  });

  return {
    site: toChrome(current),
    sites: sites.map(toChrome),
    unreadLeads,
    showAdmin,
  };
}
