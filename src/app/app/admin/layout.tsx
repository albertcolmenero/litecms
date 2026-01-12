import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LayoutDashboard, Users, Globe } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const dbUser = await prisma.user.findUnique({
        where: { clerkId: user.id },
    });

    if (!dbUser || dbUser.role !== "SUPER_ADMIN") {
        redirect("/app");
    }

    const navItems = [
        {
            name: "Dashboard",
            href: "/app/admin",
            icon: LayoutDashboard,
        },
        {
            name: "All Sites",
            href: "/app/admin/sites",
            icon: Globe,
        },
        {
            name: "All Users",
            href: "/app/admin/users",
            icon: Users,
        },
    ];

    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="flex h-16 items-center justify-between py-4 px-8">
                    <div className="flex gap-6 md:gap-10">
                        <Link href="/app" className="flex items-center space-x-2">
                            <span className="inline-block font-bold">LiteCMS Super Admin</span>
                        </Link>
                        <nav className="flex gap-6">
                            {navItems.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>
            <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] px-8">
                <aside className="hidden w-[200px] flex-col md:flex">
                    <nav className="grid items-start gap-2">
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
                                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
