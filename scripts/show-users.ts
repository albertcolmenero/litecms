import { prisma } from "@/lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      clerkId: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { sites: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  for (const u of users) {
    console.log(
      `${u.email}\n  clerkId=${u.clerkId}\n  dbUserId=${u.id}\n  role=${u.role}\n  sites=${u._count.sites}\n  created=${u.createdAt.toISOString()}\n`,
    );
  }
  await prisma.$disconnect();
}

main();
