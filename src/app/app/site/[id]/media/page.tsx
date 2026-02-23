import { getSite } from "@/app/actions";
import { getAssets } from "@/actions/assets";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import MediaLibrary from "@/components/MediaLibrary";

export default async function MediaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) {
        notFound();
    }

    const assets = await getAssets(id);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50/30">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link
                            href={`/app/site/${id}`}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-2 transition-colors"
                        >
                            <ArrowLeft size={16} className="mr-1" /> Back to Site
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Media Library</h1>
                        <p className="text-sm text-gray-500">
                            Upload and manage images for <span className="font-medium text-gray-700">{site.name}</span>
                        </p>
                    </div>
                </header>

                <MediaLibrary siteId={id} initialAssets={assets} />
            </div>
        </div>
    );
}
