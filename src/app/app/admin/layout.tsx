import Link from "next/link";
import { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/dashboard/Topbar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
    redirect("/app");
  }

  const navItems = [
    { name: "Sites", href: "/app/admin/sites", icon: Globe },
    { name: "Users", href: "/app/admin/users", icon: Users },
  ];

  return (
    <div className="min-h-svh bg-background">
      <Topbar />
      <div className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center gap-1 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 border-b-2 border-transparent px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-border transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
