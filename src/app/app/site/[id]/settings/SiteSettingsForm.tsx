"use client";

import { updateSite } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save, Plus, Trash, ExternalLink, Globe, Info, Code, FileCode } from "lucide-react";

const FONT_OPTIONS = [
    "Geist",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Oswald",
    "Source Sans Pro",
    "Slabo 27px",
    "Raleway",
    "PT Sans",
    "Merriweather",
    "Nunito",
    "Inter",
    "Playfair Display",
    "Ubuntu",
    "Rubik",
    "Lora",
    "Work Sans",
    "Nunito Sans",
    "Fira Sans"
];

interface SiteSettingsFormProps {
    site: any;
}

export default function SiteSettingsForm({ site }: SiteSettingsFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [customColors, setCustomColors] = useState<{ id: string; value: string }[]>(
        (site.settings?.theme?.customColors as { id: string; value: string }[]) || []
    );

    const [scripts, setScripts] = useState<{ id: string; name: string; type: "url" | "code"; value: string }[]>(
        (site.settings?.scripts as { id: string; name: string; type: "url" | "code"; value: string }[]) || []
    );

    const handleSubmit = async (formData: FormData) => {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const homePageId = formData.get("homePageId") as string;
        const customDomain = formData.get("customDomain") as string;

        const data: any = {};
        if (name) data.name = name;
        if (description) data.description = description;
        if (homePageId) data.homePageId = homePageId === "__default__" ? null : homePageId;
        // Handle custom domain - allow clearing by setting to null
        data.customDomain = customDomain?.trim() || null;

        // Handle Theme Settings
        const themePrimary = formData.get("theme_primary") as string;
        const themeBackground = formData.get("theme_background") as string;
        const themeText = formData.get("theme_text") as string;
        const themeIconBackground = formData.get("theme_icon_background") as string;
        const themeIconColor = formData.get("theme_icon_color") as string;
        const themeFont = formData.get("theme_font") as string;
        const themeButtonBackground = formData.get("theme_button_background") as string;
        const themeButtonText = formData.get("theme_button_text") as string;
        const themeButtonSecondaryBackground = formData.get("theme_button_secondary_background") as string;
        const themeButtonSecondaryText = formData.get("theme_button_secondary_text") as string;

        const settings = (site.settings as any) || {};
        const newSettings = {
            ...settings,
            theme: {
                ...settings.theme,
                font: themeFont,
                colors: {
                    ...settings.theme?.colors,
                    primary: themePrimary,
                    background: themeBackground,
                    text: themeText,
                    iconBackground: themeIconBackground,
                    iconColor: themeIconColor,
                },
                buttons: {
                    background: themeButtonBackground,
                    text: themeButtonText,
                    secondaryBackground: themeButtonSecondaryBackground,
                    secondaryText: themeButtonSecondaryText,
                },
                customColors: customColors
            },
            scripts: scripts
        };
        data.settings = newSettings;

        startTransition(async () => {
            const res = await updateSite(site.id, data);
            if (res.success) {
                router.refresh(); // Refresh current route to show updated data if any
                // Optionally redirect or show success toast
            } else {
                alert("Failed to update site settings");
            }
        });
    };

    const addCustomColor = () => {
        setCustomColors([...customColors, { id: `color-${Date.now()}`, value: "#000000" }]);
    };

    const removeCustomColor = (index: number) => {
        const newColors = [...customColors];
        newColors.splice(index, 1);
        setCustomColors(newColors);
    };

    const updateCustomColor = (index: number, field: "id" | "value", newValue: string) => {
        const newColors = [...customColors];
        newColors[index] = { ...newColors[index], [field]: newValue };
        setCustomColors(newColors);
    };

    const addScript = () => {
        setScripts([...scripts, { id: `script-${Date.now()}`, name: "New Script", type: "code", value: "" }]);
    };

    const removeScript = (index: number) => {
        const newScripts = [...scripts];
        newScripts.splice(index, 1);
        setScripts(newScripts);
    };

    const updateScript = (index: number, field: "name" | "type" | "value", newValue: string) => {
        const newScripts = [...scripts];
        newScripts[index] = { ...newScripts[index], [field]: newValue };
        setScripts(newScripts);
    };

    return (
        <form key={site.updatedAt?.toString()} action={handleSubmit} className="space-y-6">
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
                    {site.pages && site.pages.map((page: any) => (
                        <option key={page.id} value={page.id}>
                            {page.title} (/{page.slug})
                        </option>
                    ))}
                </select>
            </div>

            <hr className="my-8" />

            {/* Scripts Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Custom Scripts</h2>
                    <button
                        type="button"
                        onClick={addScript}
                        className="text-xs bg-black hover:bg-gray-800 text-white px-3 py-2 rounded flex items-center gap-2 transition-colors"
                    >
                        <Plus size={14} /> Add Script
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Add custom scripts to your site (e.g. Google Analytics, Chat Widgets, etc.).
                    Scripts are injected into the head/body of your public site.
                </p>

                <div className="space-y-4">
                    {scripts.length === 0 && (
                        <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                            <Code className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No scripts added yet</p>
                            <p className="text-sm text-gray-400 mt-1">Click "Add Script" to get started</p>
                        </div>
                    )}

                    {scripts.map((script, index) => (
                        <div key={script.id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Script Name</label>
                                        <input
                                            type="text"
                                            value={script.name}
                                            onChange={(e) => updateScript(index, 'name', e.target.value)}
                                            placeholder="e.g. Google Analytics"
                                            className="w-full text-sm p-2 border rounded focus:ring-black focus:border-black"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Type</label>
                                        <div className="flex bg-white rounded border p-1">
                                            <button
                                                type="button"
                                                onClick={() => updateScript(index, 'type', 'url')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${script.type === 'url' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <ExternalLink size={12} /> URL Source
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateScript(index, 'type', 'code')}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${script.type === 'code' ? 'bg-black text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                <FileCode size={12} /> Inline Code
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeScript(index)}
                                    className="text-gray-400 hover:text-red-600 p-1 transition-colors mt-6"
                                    title="Remove Script"
                                >
                                    <Trash size={18} />
                                </button>
                            </div>

                            {/* Value Input */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
                                    {script.type === 'url' ? 'Script URL (src)' : 'Script Code'}
                                </label>
                                {script.type === 'url' ? (
                                    <input
                                        type="url"
                                        value={script.value}
                                        onChange={(e) => updateScript(index, 'value', e.target.value)}
                                        placeholder="https://example.com/script.js"
                                        className="w-full text-sm p-2 border rounded font-mono text-gray-600 focus:ring-black focus:border-black"
                                    />
                                ) : (
                                    <textarea
                                        value={script.value}
                                        onChange={(e) => updateScript(index, 'value', e.target.value)}
                                        placeholder="console.log('Hello');"
                                        rows={4}
                                        className="w-full text-sm p-2 border rounded font-mono text-gray-600 focus:ring-black focus:border-black bg-white"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="my-8" />

            {/* Domains Section */}
            <div>
                <h2 className="text-xl font-bold mb-4">Domains</h2>

                {/* Subdomain (read-only) */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 p-2 bg-gray-50 border rounded text-gray-600 font-mono text-sm">
                            {site.subdomain}.lite-cms.com
                        </div>
                        <a
                            href={`https://${site.subdomain}.lite-cms.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-black transition-colors"
                            title="Open site"
                        >
                            <ExternalLink size={18} />
                        </a>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Your site is always available at this URL.</p>
                </div>

                {/* Custom Domain */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Globe size={14} className="inline mr-1" />
                        Custom Domain
                    </label>
                    <input
                        name="customDomain"
                        type="text"
                        defaultValue={site.customDomain || ""}
                        placeholder="yourdomain.com"
                        className="w-full p-2 border rounded focus:ring-black focus:border-black font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter your custom domain without &quot;https://&quot; or &quot;www.&quot;
                    </p>
                </div>

                {/* DNS Instructions */}
                {site.customDomain && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium text-blue-800 mb-2">DNS Configuration Required</p>
                                <p className="text-blue-700 mb-2">Point your domain to our servers by adding one of these DNS records:</p>
                                <div className="bg-white p-3 rounded border border-blue-100 font-mono text-xs space-y-1">
                                    <p><span className="text-gray-500">Type:</span> CNAME</p>
                                    <p><span className="text-gray-500">Name:</span> @ or www</p>
                                    <p><span className="text-gray-500">Value:</span> cname.vercel-dns.com</p>
                                </div>
                                <p className="text-blue-600 mt-2 text-xs">DNS changes may take up to 48 hours to propagate.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <hr className="my-8" />

            <div>
                <h2 className="text-xl font-bold mb-4">Theme Settings</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <div className="flex gap-2">
                        <select
                            name="theme_font"
                            defaultValue={(site.settings as any)?.theme?.font ?? FONT_OPTIONS[0]}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        >
                            <option value="">Default System Font</option>
                            {FONT_OPTIONS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font === "Geist" ? "var(--font-geist-sans)" : font }}>
                                    {font}
                                </option>
                            ))}
                        </select>
                        <div className="text-xs text-gray-500 flex items-center">
                            (Font Options)
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_primary"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.colors?.primary || "#000000"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">primary</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_background"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.colors?.background || "#ffffff"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">background</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_text"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.colors?.text || "#000000"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">text</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_button_background"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.buttons?.background || "#000000"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">btn-bg</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_button_text"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.buttons?.text || "#ffffff"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">btn-text</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_button_secondary_background"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.buttons?.secondaryBackground || "#ffffff"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">sec-btn-bg</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button Text</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_button_secondary_text"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.buttons?.secondaryText || "#000000"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">sec-btn-text</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_icon_background"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.colors?.iconBackground || (site.settings as any)?.theme?.colors?.primary || "#2563eb"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">icon-bg</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Icon Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                name="theme_icon_color"
                                type="color"
                                defaultValue={(site.settings as any)?.theme?.colors?.iconColor || "#ffffff"}
                                className="w-10 h-10 p-1 border rounded cursor-pointer"
                            />
                            <span className="text-xs text-gray-500">icon-fg</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Custom Colors</label>
                        <button
                            type="button"
                            onClick={addCustomColor}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                        >
                            <Plus size={12} /> Add Color
                        </button>
                    </div>

                    <div className="space-y-3">
                        {customColors.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No custom colors added.</p>
                        )}
                        {customColors.map((color, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-100">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Color ID</label>
                                    <input
                                        type="text"
                                        value={color.id}
                                        onChange={(e) => updateCustomColor(index, 'id', e.target.value)}
                                        placeholder="e.g. secondary-btn"
                                        className="w-full text-sm p-1 border rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                                    <input
                                        type="color"
                                        value={color.value}
                                        onChange={(e) => updateCustomColor(index, 'value', e.target.value)}
                                        className="w-10 h-10 p-1 border rounded cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Hex</label>
                                    <input
                                        type="text"
                                        value={color.value}
                                        readOnly
                                        className="w-20 text-sm p-1 border rounded bg-gray-100 text-gray-500"
                                    />
                                </div>
                                <div className="pt-5">
                                    <button
                                        type="button"
                                        onClick={() => removeCustomColor(index)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Save size={16} />
                {isPending ? "Saving..." : "Save Changes"}
            </button>
        </form >
    );
}
