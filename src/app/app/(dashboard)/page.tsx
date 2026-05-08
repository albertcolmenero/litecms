import Link from "next/link";
import { ArrowUpRight, Globe, Plus } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/Topbar";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getSites } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import CreateSiteModal from "@/components/CreateSiteModal";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const sites = await getSites();

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true },
  });
  const isSuperAdmin = dbUser?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-svh bg-background">
      <Topbar />
      <main className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <p className="text-sm text-muted-foreground">
                Welcome{user.firstName ? `, ${user.firstName}` : " back"}.
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                Your sites
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isSuperAdmin ? (
                <Button variant="outline" asChild>
                  <Link href="/app/admin">Admin</Link>
                </Button>
              ) : null}
              <CreateSiteModal />
            </div>
          </div>

          {sites.length === 0 ? (
            <EmptyState
              icon={Globe}
              title="No sites yet"
              description="Create your first site to start building. You'll get a subdomain by default and can wire up a custom domain later."
              action={<CreateSiteModal />}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => {
                const accent =
                  (site as any)?.settings?.theme?.colors?.primary ?? "oklch(0.205 0 0)";
                return (
                  <Link
                    key={site.id}
                    href={`/app/site/${site.id}`}
                    className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className="h-9 w-9 rounded-lg"
                        style={{ backgroundColor: accent }}
                        aria-hidden
                      />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-4 font-medium text-foreground">{site.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                      <Globe className="h-3 w-3" />
                      {site.customDomain ?? `${site.subdomain}.localhost:3000`}
                    </p>
                    <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <span className="text-foreground font-medium">{site._count.pages}</span>{" "}
                        pages
                      </span>
                      <span className="ml-auto">
                        {new Date(site.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}

              <NewSiteCard />
            </div>
          )}

          <div className="mt-16 rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-medium text-foreground">Getting started</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Three things every site needs before you go live.
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-3">
              <li className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground">01</span>
                <p className="mt-1 text-sm font-medium">Set your theme</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Colors, font, brand.</p>
              </li>
              <li className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground">02</span>
                <p className="mt-1 text-sm font-medium">Build your home page</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Sections, columns, CTAs.</p>
              </li>
              <li className="rounded-lg border border-border p-3">
                <span className="text-xs font-mono text-muted-foreground">03</span>
                <p className="mt-1 text-sm font-medium">Capture leads</p>
                <p className="mt-0.5 text-xs text-muted-foreground">A form on your home page.</p>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function NewSiteCard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-5 text-center min-h-[180px]">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
        <Plus className="h-4 w-4" />
      </div>
      <p className="mt-3 text-sm font-medium">Create another site</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Each site gets its own subdomain and content.
      </p>
    </div>
  );
}
