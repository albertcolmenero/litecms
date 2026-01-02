import { getSites } from "@/app/actions";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import SiteTable from "@/components/SiteTable";
import CreateSiteModal from "@/components/CreateSiteModal";

export default async function DashboardPage() {
    const sites = await getSites();
    const user = await currentUser();
    // No easy way to check DB role here without extra call, but actions handles the fetching.
    // If we want to show "All Sites" title vs "My Sites", we'd need the role.
    // But for now "Sites" or "Dashboard" is fine.

    // We can infer role if we fetch user again or just use sites.
    // Let's keep it simple. If we needed role for UI, we could fetch it.
    // But the prompt says "the first page an ADMIN sees should display all their sites".

    return (
        <div className="flex min-h-screen flex-col bg-gray-50/30">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sites</h1>
                        <p className="text-gray-500 mt-1">Manage and organize your web content.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <UserButton />
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="flex justify-end">
                        <CreateSiteModal />
                    </div>

                    <SiteTable sites={sites} showOwner={false} />

                    {/* Note: We could pass showOwner={true} if user is SUPER_ADMIN, but for now defaulting to false as requested */}
                </div>
            </div>
        </div>
    );
}
