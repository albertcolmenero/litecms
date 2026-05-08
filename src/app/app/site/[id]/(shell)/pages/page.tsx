import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Home, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getSite } from "@/app/actions";
import CreatePageModal from "@/components/CreatePageModal";

export default async function PagesList({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const base = `/app/site/${id}`;
  const pages = site.pages;

  return (
    <>
      <PageHeader
        title="Pages"
        description="Static pages on your site. Click any page to open the editor."
        action={<CreatePageModal siteId={id} />}
      />

      {pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No pages yet"
          description="Create your first page to start building your site."
          action={<CreatePageModal siteId={id} />}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Title</th>
                <th className="px-5 py-2.5 font-medium">Slug</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Menus</th>
                <th className="px-5 py-2.5 font-medium">Updated</th>
                <th className="px-5 py-2.5 font-medium w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((p) => {
                const isHome = p.id === site.homePageId;
                return (
                  <tr key={p.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`${base}/pages/${p.id}`}
                        className="flex items-center gap-2.5 font-medium text-foreground"
                      >
                        {isHome ? (
                          <Home className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                        <span>{p.title}</span>
                        {isHome ? (
                          <StatPill tone="info" className="ml-1">
                            Home
                          </StatPill>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      /{p.slug}
                    </td>
                    <td className="px-5 py-3">
                      {p.published ? (
                        <StatPill tone="success">Published</StatPill>
                      ) : (
                        <StatPill tone="warning">Draft</StatPill>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.menuItems?.map((mi: any, i: number) => (
                          <span
                            key={i}
                            className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {mi.menu.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(p.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <button className="invisible group-hover:visible flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
