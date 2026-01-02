import { getSite, updateSite } from "@/app/actions";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default async function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) {
        notFound();
    }

    const updateSiteWithId = updateSite.bind(null, site.id);

    return (
        <div className="flex min-h-screen flex-col p-8 bg-white">
            <div className="mb-8">
                <Link href={`/app/site/${site.id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold">Site Settings</h1>
            </div>

            <div className="max-w-2xl">
                <form action={async (formData) => {
                    "use server";
                    const name = formData.get("name") as string;
                    const description = formData.get("description") as string;
                    const homePageId = formData.get("homePageId") as string;

                    const data: any = {};
                    if (name) data.name = name;
                    if (description) data.description = description;
                    if (homePageId) data.homePageId = homePageId === "__default__" ? null : homePageId;

                    // Handle Theme Settings
                    const themePrimary = formData.get("theme_primary") as string;
                    const themeBackground = formData.get("theme_background") as string;
                    const themeText = formData.get("theme_text") as string;

                    const settings = (site.settings as any) || {};
                    const newSettings = {
                        ...settings,
                        theme: {
                            ...settings.theme,
                            colors: {
                                ...settings.theme?.colors,
                                primary: themePrimary,
                                background: themeBackground,
                                text: themeText,
                            }
                        }
                    };
                    data.settings = newSettings;

                    await updateSite(site.id, data);
                    redirect(`/app/site/${site.id}`); // redirect back or stay? stay usually better but for simplicity redirect
                }} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                        <input
                            name="name"
                            type="text"
                            defaultValue={site.name}
                            required
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            defaultValue={site.description || ""}
                            rows={3}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Home Page</label>
                        <p className="text-sm text-gray-500 mb-2">Select which page should be displayed at the root URL (/).</p>
                        <select
                            name="homePageId"
                            defaultValue={site.homePageId || "__default__"}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        >
                            <option value="__default__">Default (Welcome Page if empty)</option>
                            {site.pages.map(page => (
                                <option key={page.id} value={page.id}>
                                    {page.title} (/{page.slug})
                                </option>
                            ))}
                        </select>
                    </div>

                    <hr className="my-8" />

                    <div>
                        <h2 className="text-xl font-bold mb-4">Theme Settings</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                <input
                                    name="theme_primary"
                                    type="color"
                                    defaultValue={(site.settings as any)?.theme?.colors?.primary || "#000000"}
                                    className="w-full h-10 p-1 border rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                <input
                                    name="theme_background"
                                    type="color"
                                    defaultValue={(site.settings as any)?.theme?.colors?.background || "#ffffff"}
                                    className="w-full h-10 p-1 border rounded cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                <input
                                    name="theme_text"
                                    type="color"
                                    defaultValue={(site.settings as any)?.theme?.colors?.text || "#000000"}
                                    className="w-full h-10 p-1 border rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 flex items-center justify-center gap-2">
                        <Save size={16} /> Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}
