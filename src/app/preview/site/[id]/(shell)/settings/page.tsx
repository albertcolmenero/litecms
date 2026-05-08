import { Globe, Code, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { getSite } from "@/components/preview/mock";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSite(id);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Domain, custom scripts, and the danger zone."
      />

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Domain</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Your site is reachable at the subdomain by default. Add a custom domain when you're ready.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subdomain" value={`${site.subdomain}.lite`} mono />
            <Field
              label="Custom domain"
              value={site.customDomain ?? "Not configured"}
              mono
              meta={site.customDomain ? <StatPill tone="success">Active</StatPill> : null}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Custom scripts</h2>
            </div>
            <Button variant="ghost" size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add script
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Inject analytics, chat widgets, or any third-party JS. Scripts run on the public site.
          </p>
          <ul className="divide-y divide-border rounded-md border border-border">
            <li className="flex items-center gap-3 px-3 py-2.5">
              <StatPill tone="info">url</StatPill>
              <span className="text-sm font-medium">Plausible</span>
              <span className="font-mono text-xs text-muted-foreground truncate">
                https://plausible.io/js/script.js
              </span>
              <Button variant="ghost" size="sm" className="ml-auto">
                Edit
              </Button>
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="text-sm font-medium text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete this site, all its pages, posts, forms, and leads. This cannot be
            undone.
          </p>
          <div className="mt-4">
            <Button variant="destructive" size="sm">
              Delete site
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  mono,
  meta,
}: {
  label: string;
  value: string;
  mono?: boolean;
  meta?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        {meta}
      </div>
      <div className="mt-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm">
        <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
      </div>
    </div>
  );
}
