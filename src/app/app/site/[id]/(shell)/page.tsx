import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  Newspaper,
  Inbox,
  Image as ImageIcon,
  ArrowUpRight,
  Plus,
  Pencil,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { getSite } from "@/app/actions";
import { prisma } from "@/lib/prisma";

export default async function SiteOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const base = `/app/site/${id}`;

  const [postCount, assetCount, leadCount, recentPages, recentPosts, recentLeads] =
    await Promise.all([
      prisma.blogPost.count({ where: { siteId: id } }),
      prisma.asset.count({ where: { siteId: id } }),
      prisma.lead.count({ where: { form: { siteId: id } } }),
      prisma.page.findMany({
        where: { siteId: id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, title: true, slug: true, updatedAt: true, published: true },
      }),
      prisma.blogPost.findMany({
        where: { siteId: id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        select: { id: true, title: true, updatedAt: true, published: true },
      }),
      prisma.lead.findMany({
        where: { form: { siteId: id } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, email: true, createdAt: true, form: { select: { name: true } } },
      }),
    ]);

  const homePage = site.homePageId
    ? site.pages.find((p) => p.id === site.homePageId)
    : site.pages[0];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Recent activity and quick actions for this site."
        action={
          homePage ? (
            <Button asChild>
              <Link href={`${base}/pages/${homePage.id}`}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit home page
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={`${base}/pages`}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create first page
              </Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Pages" value={site.pages.length} href={`${base}/pages`} icon={FileText} />
        <StatCard label="Blog posts" value={postCount} href={`${base}/blog`} icon={Newspaper} />
        <StatCard
          label="Total leads"
          value={leadCount}
          href={`${base}/leads`}
          icon={Inbox}
          highlight={leadCount > 0}
        />
        <StatCard label="Media" value={assetCount} href={`${base}/media`} icon={ImageIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Recent activity</h2>
            <Link
              href={`${base}/pages`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View pages
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentPages.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <StatPill tone={p.published ? "success" : "warning"}>
                  {p.published ? "Page" : "Draft"}
                </StatPill>
                <Link
                  href={`${base}/pages/${p.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {p.title}
                </Link>
                <span className="text-xs text-muted-foreground font-mono">/{p.slug}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(p.updatedAt)}
                </span>
              </li>
            ))}
            {recentPosts.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <StatPill tone={p.published ? "success" : "warning"}>
                  {p.published ? "Post" : "Draft"}
                </StatPill>
                <Link
                  href={`${base}/blog/${p.id}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {p.title || "Untitled post"}
                </Link>
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(p.updatedAt)}
                </span>
              </li>
            ))}
            {recentLeads.map((l) => (
              <li key={l.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                <StatPill tone="info">Lead</StatPill>
                <span className="font-medium text-foreground truncate">{l.email ?? "—"}</span>
                <span className="text-xs text-muted-foreground">{l.form.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {timeAgo(l.createdAt)}
                </span>
              </li>
            ))}
            {recentPages.length === 0 && recentPosts.length === 0 && recentLeads.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No activity yet. Create your first page to get started.
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Quick actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Jump into common jobs.</p>
          <ul className="mt-4 space-y-2">
            {homePage ? (
              <QuickAction
                href={`${base}/pages/${homePage.id}`}
                label="Edit home page"
                icon={Pencil}
              />
            ) : null}
            <QuickAction href={`${base}/blog`} label="Write a blog post" icon={Plus} />
            <QuickAction href={`${base}/media`} label="Upload media" icon={ImageIcon} />
            <QuickAction href={`${base}/theme`} label="Change theme" icon={Palette} />
          </ul>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors"
    >
      <div className="flex items-start justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {highlight ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
      >
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="flex-1">{label}</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
      </Link>
    </li>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
