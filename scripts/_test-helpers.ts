/**
 * Shared helpers for the agent test + eval scripts.
 *
 * - findTargetUser(): returns the real Clerk-signed-in user (clerkId starts
 *   with "user_") so seeded test data shows up in their dashboard. Falls back
 *   to creating a placeholder agent-test user if no real user exists yet
 *   (CI / fresh database).
 *
 * - uniqueSubdomain(): appends a short timestamp suffix so consecutive runs
 *   don't collide on the unique subdomain constraint.
 *
 * - cleanAgentSites(): destructive cleanup, scoped to subdomain prefixes our
 *   scripts own (`flowkan-agent-`, `eval-`). Optionally further scoped to a
 *   target user. Only called when the script receives `--clean`.
 */

import { prisma } from "@/lib/prisma";

export type TargetUser = { id: string; clerkId: string; email: string };

/** Reproducible suffix for a test run; short and URL-safe. */
export function runSuffix(): string {
  return Date.now().toString(36).slice(-6);
}

/** A subdomain that won't collide with previous runs. */
export function uniqueSubdomain(base: string): string {
  return `${base}-${runSuffix()}`;
}

/** Find the real signed-in user, or create a placeholder if running in CI. */
export async function findTargetUser(): Promise<TargetUser> {
  const real = await prisma.user.findFirst({
    where: { clerkId: { startsWith: "user_" } },
    orderBy: { createdAt: "asc" },
  });
  if (real) return real;

  const placeholder = await prisma.user.upsert({
    where: { clerkId: "clerk_agent-test-fallback" },
    update: {},
    create: {
      clerkId: "clerk_agent-test-fallback",
      email: "agent-fallback@example.test",
      role: "ADMIN",
    },
  });
  return placeholder;
}

const SUBDOMAIN_PATTERNS = ["flowkan-agent-", "eval-"];

type CleanOptions = { ownerClerkId?: string };

/**
 * Delete agent-built test sites (and their pages/forms/menus/leads/assets).
 *
 * - Scopes to subdomains starting with our test prefixes — never touches the
 *   user's real sites.
 * - If `ownerClerkId` is set, only deletes sites owned by that user. Otherwise
 *   wipes all agent sites regardless of owner.
 * - Cleans up the legacy placeholder users (`clerk_agent-test`, `clerk_agent-eval`)
 *   if they're left with no remaining sites.
 */
export async function cleanAgentSites(opts: CleanOptions = {}): Promise<number> {
  const subdomainFilter = { OR: SUBDOMAIN_PATTERNS.map((p) => ({ subdomain: { startsWith: p } })) };
  const where: any = subdomainFilter;
  if (opts.ownerClerkId) {
    where.user = { clerkId: opts.ownerClerkId };
  }

  const targets = await prisma.site.findMany({
    where,
    select: { id: true, subdomain: true },
  });
  if (targets.length === 0) return 0;

  const siteIds = targets.map((s) => s.id);
  await prisma.lead.deleteMany({ where: { form: { siteId: { in: siteIds } } } });
  await prisma.form.deleteMany({ where: { siteId: { in: siteIds } } });
  await prisma.menuItem.deleteMany({ where: { menu: { siteId: { in: siteIds } } } });
  await prisma.menuCta.deleteMany({ where: { menu: { siteId: { in: siteIds } } } });
  await prisma.socialLink.deleteMany({ where: { menu: { siteId: { in: siteIds } } } });
  await prisma.menu.deleteMany({ where: { siteId: { in: siteIds } } });
  await prisma.asset.deleteMany({ where: { siteId: { in: siteIds } } });
  await prisma.site.updateMany({ where: { id: { in: siteIds } }, data: { homePageId: null } });
  await prisma.page.deleteMany({ where: { siteId: { in: siteIds } } });
  await prisma.site.deleteMany({ where: { id: { in: siteIds } } });

  // Sweep abandoned placeholder users
  await prisma.user.deleteMany({
    where: {
      clerkId: { in: ["clerk_agent-test", "clerk_agent-eval", "clerk_agent-test-fallback"] },
      sites: { none: {} },
    },
  });

  return targets.length;
}
