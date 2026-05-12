/**
 * Lists all sites owned by the agent test/eval users, with deep links to the
 * editor. Read-only — does not modify anything.
 */

import { prisma } from "@/lib/prisma";

async function main() {
  const sites = await prisma.site.findMany({
    where: {
      OR: [
        { user: { clerkId: { startsWith: "clerk_agent" } } },
        { subdomain: { startsWith: "eval-" } },
        { subdomain: { startsWith: "flowkan-agent" } },
      ],
    },
    include: {
      user: { select: { email: true, clerkId: true } },
      pages: { select: { id: true, title: true, slug: true, content: true, published: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (sites.length === 0) {
    console.log("No agent-built sites in the DB.");
    await prisma.$disconnect();
    return;
  }

  console.log(`\nFound ${sites.length} agent-built site${sites.length === 1 ? "" : "s"}:\n`);

  for (const s of sites) {
    console.log(`──────────── ${s.name} ────────────`);
    console.log(`  subdomain      : ${s.subdomain}`);
    console.log(`  owner          : ${s.user.email} (${s.user.clerkId})`);
    console.log(`  site dashboard : http://localhost:3000/app/site/${s.id}`);
    console.log(`  admin → site   : http://localhost:3000/app/admin/sites  (then click "${s.name}")`);
    for (const p of s.pages) {
      const urlSlug = p.slug || "(home)";
      const wordCount = (p.content || "").split(/\s+/).filter(Boolean).length;
      console.log(`  page           : ${urlSlug.padEnd(10)} · ${wordCount} words · ${p.published ? "published" : "draft"}`);
      console.log(`     editor      : http://localhost:3000/app/site/${s.id}/pages/${p.id}`);
    }
    console.log();
  }

  console.log(
    `As SUPER_ADMIN, you can also browse all sites at http://localhost:3000/app/admin/sites — the test sites will appear there with their owners (${"clerk_agent-test"} / ${"clerk_agent-eval"}).\n`,
  );

  await prisma.$disconnect();
}

main();
