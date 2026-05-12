/**
 * Reassign all agent-test/agent-eval sites to a real user so they're visible
 * in the dashboard.
 *
 *   npx tsx --env-file=.env scripts/claim-test-sites.ts <clerkId>
 *
 * If you don't pass a clerkId, prints available users.
 */

import { prisma } from "@/lib/prisma";

const TEST_CLERK_IDS = ["clerk_agent-test", "clerk_agent-eval"];

async function main() {
  const targetClerkId = process.argv[2];
  if (!targetClerkId) {
    console.log("Usage: npx tsx --env-file=.env scripts/claim-test-sites.ts <clerkId>");
    console.log("\nAvailable real users:");
    const users = await prisma.user.findMany({
      where: { clerkId: { startsWith: "user_" } },
      select: { clerkId: true, email: true },
    });
    for (const u of users) console.log(`  ${u.clerkId}  ${u.email}`);
    await prisma.$disconnect();
    return;
  }

  const target = await prisma.user.findUnique({ where: { clerkId: targetClerkId } });
  if (!target) {
    console.error(`No user with clerkId="${targetClerkId}"`);
    process.exit(1);
  }

  const testUsers = await prisma.user.findMany({
    where: { clerkId: { in: TEST_CLERK_IDS } },
    include: { sites: { select: { id: true, name: true, subdomain: true } } },
  });

  if (testUsers.length === 0) {
    console.log("No agent test sites found in the DB.");
    await prisma.$disconnect();
    return;
  }

  let totalSites = 0;
  for (const u of testUsers) totalSites += u.sites.length;
  console.log(`Reassigning ${totalSites} site(s) from ${testUsers.length} test user(s) → ${target.email}\n`);

  const reassigned: { id: string; name: string; subdomain: string }[] = [];
  for (const u of testUsers) {
    for (const s of u.sites) {
      await prisma.site.update({ where: { id: s.id }, data: { userId: target.id } });
      reassigned.push(s);
      console.log(`  ✓ ${s.name.padEnd(12)} (${s.subdomain})`);
    }
  }

  // Delete now-empty test users
  const ids = testUsers.map((u) => u.id);
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`\n  ✓ removed ${testUsers.length} placeholder test user(s)\n`);

  console.log("Open in your dashboard:");
  for (const s of reassigned) {
    // Look up the page id for the site to build a deep link to the editor
    const homeAndPages = await prisma.site.findUnique({
      where: { id: s.id },
      include: { pages: { select: { id: true, title: true, slug: true } } },
    });
    console.log(`\n  ${s.name} · ${s.subdomain}`);
    console.log(`    site:   http://localhost:3000/app/site/${s.id}`);
    for (const p of homeAndPages?.pages ?? []) {
      console.log(`    page:   /${p.slug || "(home)"} → http://localhost:3000/app/site/${s.id}/pages/${p.id}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
