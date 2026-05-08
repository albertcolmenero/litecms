import Link from "next/link";
import { Plus, FileText, Home, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { PAGES } from "@/components/preview/mock";

export default async function PagesList({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = `/preview/site/${id}`;

  return (
    <>
      <PageHeader
        title="Pages"
        description="Static pages on your site. Click any page to open the editor."
        action={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New page
          </Button>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Title</th>
              <th className="px-5 py-2.5 font-medium">Slug</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Updated</th>
              <th className="px-5 py-2.5 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PAGES.map((p) => (
              <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <Link
                    href={`${base}/pages/${p.id}`}
                    className="flex items-center gap-2.5 font-medium text-foreground"
                  >
                    {p.isHome ? (
                      <Home className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>{p.title}</span>
                    {p.isHome ? (
                      <StatPill tone="info" className="ml-1">Home</StatPill>
                    ) : null}
                  </Link>
                  <p className="mt-0.5 ml-6 text-xs text-muted-foreground">{p.description}</p>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                <td className="px-5 py-3">
                  {p.published ? (
                    <StatPill tone="success">Published</StatPill>
                  ) : (
                    <StatPill tone="warning">Draft</StatPill>
                  )}
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{p.updatedAt}</td>
                <td className="px-5 py-3">
                  <button className="invisible group-hover:visible flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
