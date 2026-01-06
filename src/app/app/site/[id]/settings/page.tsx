import { getSite } from "@/app/actions";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SiteSettingsForm from "./SiteSettingsForm";

export default async function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) {
        notFound();
    }

    return (
        <div className="flex min-h-screen flex-col p-8 bg-white">
            <div className="mb-8">
                <Link href={`/app/site/${site.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Site Settings</h1>
            </div>

            <div className="max-w-2xl">
                <SiteSettingsForm site={site} />
            </div>
        </div>
    );
}
