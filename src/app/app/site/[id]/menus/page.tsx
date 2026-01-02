import { getMenus, getSite } from "@/app/actions";
import MenuManager from "@/components/MenuManager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function MenusPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);
    if (!site) notFound();

    const menus = await getMenus(id);

    return (
        <div className="flex min-h-screen flex-col p-8 bg-gray-50">
            <div className="mb-8">
                <Link href={`/app/site/${site.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Menu Manager</h1>
                <p className="text-gray-500">Manage your site's navigation menus.</p>
            </div>

            <MenuManager
                siteId={site.id}
                initialMenus={menus}
                pages={site.pages}
            />
        </div>
    )
}
