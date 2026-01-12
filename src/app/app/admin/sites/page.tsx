import { getSites } from "@/app/actions";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminSitesPage() {
    const sites = await getSites();

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">All Sites</h1>
                <div className="text-sm text-muted-foreground">
                    Total: {sites.length}
                </div>
            </div>

            <div className="border rounded-md">
                <table className="w-full text-sm text-left">
                    <thead className="text-muted-foreground bg-muted/50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Domain</th>
                            <th className="px-4 py-3 font-medium">Owner</th>
                            <th className="px-4 py-3 font-medium">Pages</th>
                            <th className="px-4 py-3 font-medium">Created</th>
                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {sites.map((site) => (
                            <tr key={site.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {site.name}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xs">{site.subdomain}.{process.env.NEXT_PUBLIC_ROOT_DOMAIN}</span>
                                        {site.customDomain && (
                                            <span className="text-muted-foreground text-xs">{site.customDomain}</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col text-xs">
                                        <span className="font-medium">{(site as any).user?.email || "Unknown"}</span>
                                        <span className="text-muted-foreground text-[10px] font-mono">{(site as any).user?.id}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {site._count.pages}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">
                                    {new Date(site.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/app/site/${site.id}`}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
