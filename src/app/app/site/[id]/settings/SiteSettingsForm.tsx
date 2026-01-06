"use client";

import { updateSite } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save, Plus, Trash } from "lucide-react";

const GOOGLE_FONTS = [
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

    const handleSubmit = async (formData: FormData) => {
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
        const themeFont = formData.get("theme_font") as string;

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
                },
                customColors: customColors
            }
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

            <div>
                <h2 className="text-xl font-bold mb-4">Theme Settings</h2>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                    <div className="flex gap-2">
                        <select
                            name="theme_font"
                            defaultValue={(site.settings as any)?.theme?.font ?? GOOGLE_FONTS[0]}
                            className="w-full p-2 border rounded focus:ring-black focus:border-black"
                        >
                            <option value="">Default System Font</option>
                            {GOOGLE_FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </option>
                            ))}
                        </select>
                        <div className="text-xs text-gray-500 flex items-center">
                            (Google Fonts)
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
        </form>
    );
}
