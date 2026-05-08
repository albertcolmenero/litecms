import Link from "next/link";
import {
  FileText,
  Newspaper,
  Inbox,
  Image as ImageIcon,
  ArrowUpRight,
  Plus,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { getSite, PAGES, POSTS, LEADS } from "@/components/preview/mock";

export default async function SiteOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSite(id);
  const base = `/preview/site/${id}`;
  const unread = LEADS.filter((l) => l.unread).length;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Recent activity and quick actions for this site."
        action={
          <Button asChild>
            <Link href={`${base}/pages/home`}>
              <Pencil className="mr-1.5 h-4 w-4" />
              Edit home page
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Pages" value={PAGES.length} href={`${base}/pages`} icon={FileText} />
        <StatCard label="Blog posts" value={POSTS.length} href={`${base}/blog`} icon={Newspaper} />
        <StatCard
          label="Unread leads"
          value={unread}
          href={`${base}/leads`}
          icon={Inbox}
          highlight={unread > 0}
        />
        <StatCard label="Media" value={6} href={`${base}/media`} icon={ImageIcon} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Recent activity</h2>
            <Link
              href={`${base}/pages`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {[
              { what: "Updated", target: "Home", when: "2 hours ago", tone: "neutral" as const },
              { what: "Published", target: "Why we built lite", when: "yesterday", tone: "success" as const },
              { what: "New lead", target: "amelia@nova.io", when: "12 min ago", tone: "info" as const },
              { what: "Updated", target: "Pricing", when: "3 days ago", tone: "neutral" as const },
            ].map((row, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                <StatPill tone={row.tone}>{row.what}</StatPill>
                <span className="font-medium text-foreground">{row.target}</span>
                <span className="ml-auto text-xs text-muted-foreground">{row.when}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium">Quick actions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Jump into common jobs.</p>
          <ul className="mt-4 space-y-2">
            <QuickAction href={`${base}/pages/home`} label="Edit home page" icon={Pencil} />
            <QuickAction href={`${base}/blog`} label="Write a blog post" icon={Plus} />
            <QuickAction href={`${base}/media`} label="Upload media" icon={ImageIcon} />
            <QuickAction href={`${base}/theme`} label="Change theme" icon={ArrowUpRight} />
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
