import Link from "next/link";
import { ArrowUpRight, Globe } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { getSites } from "@/app/actions";

export default async function AdminSitesPage() {
  const sites = await getSites();

  return (
    <>
      <PageHeader
        title="All sites"
        description={`${sites.length} site${sites.length === 1 ? "" : "s"} across all users.`}
      />
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-2.5 font-medium">Site</th>
              <th className="px-5 py-2.5 font-medium">Domain</th>
              <th className="px-5 py-2.5 font-medium">Owner</th>
              <th className="px-5 py-2.5 font-medium">Pages</th>
              <th className="px-5 py-2.5 font-medium">Created</th>
              <th className="px-5 py-2.5 font-medium w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{site.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs">
                      {site.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}
                    </span>
                    {site.customDomain ? (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {site.customDomain}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-3 text-xs">
                  <span className="font-medium">{(site as any).user?.email ?? "—"}</span>
                </td>
                <td className="px-5 py-3">
                  <StatPill tone="neutral">{site._count.pages}</StatPill>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {new Date(site.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href={`/app/site/${site.id}`}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
