import { getSite } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, User, ExternalLink } from "lucide-react";
import CreatePageModal from "@/components/CreatePageModal";
import PageTable from "@/components/PageTable";
import { UserButton } from "@clerk/nextjs";

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50/30">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href="/app" className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Back to Sites
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{site.name}</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-mono text-xs border border-gray-200">
                                {site.subdomain}.localhost:3000
                            </span>
                            <a
                                href={`http://${site.subdomain}.localhost:3000`}
                                target="_blank"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/app/site/${site.id}/menus`}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                        >
                            Menus
                        </Link>
                        <Link
                            href={`/app/site/${site.id}/settings`}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm"
                        >
                            Settings
                        </Link>
                        <div className="pl-2 border-l border-gray-200 ml-1">
                            <UserButton />
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">Pages</h2>
                        <CreatePageModal siteId={site.id} />
                    </div>

                    <PageTable siteId={site.id} pages={site.pages} />
                </div>
            </div>
        </div>
    );
}
