"use client";

import { useState } from "react";
import { createMenu, deleteMenu, upsertMenuItem, deleteMenuItem } from "@/app/actions";
import { Plus, Trash2, Link as LinkIcon, FileText, Save } from "lucide-react";
import { useRouter } from "next/navigation";

// Define Types locally if not available easily from Prisma
type Page = { id: string; title: string; slug: string };
type MenuItem = { id: string; label: string; url: string | null; pageId: string | null; order: number; page?: Page | null };
type Menu = { id: string; name: string; items: MenuItem[] };

export default function MenuManager({ initialMenus, siteId, pages }: { initialMenus: Menu[]; siteId: string; pages: Page[] }) {
    const [menus, setMenus] = useState<Menu[]>(initialMenus);
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(initialMenus.length > 0 ? initialMenus[0].id : null);
    const [isCreating, setIsCreating] = useState(false);
    const [newMenuName, setNewMenuName] = useState("");
    const router = useRouter();

    const selectedMenu = menus.find(m => m.id === selectedMenuId);

    // Menu Actions
    const handleCreateMenu = async () => {
        if (!newMenuName) return;
        const newMenu = await createMenu(siteId, newMenuName);
        if (newMenu) {
            setMenus([...menus, { ...newMenu, items: [] }]);
            setSelectedMenuId(newMenu.id);
            setNewMenuName("");
            setIsCreating(false);
            router.refresh();
        }
    };

    const handleDeleteMenu = async (id: string) => {
        if (!confirm("Are you sure you want to delete this menu?")) return;
        await deleteMenu(id);
        const remaining = menus.filter(m => m.id !== id);
        setMenus(remaining);
        if (selectedMenuId === id) setSelectedMenuId(remaining.length > 0 ? remaining[0].id : null);
        router.refresh();
    };

    // Item Actions
    const handleDeleteItem = async (itemId: string) => {
        await deleteMenuItem(itemId);
        router.refresh(); // Simple refresh to sync state
    };


    return (
        <div className="flex flex-col md:flex-row gap-8 bg-white rounded-lg border p-6 min-h-[500px]">
            {/* Sidebar: Menu List */}
            <div className="w-full md:w-1/4 border-r pr-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Menus</h2>
                    <button onClick={() => setIsCreating(true)} className="text-sm bg-black text-white p-1 rounded hover:opacity-80">
                        <Plus size={16} />
                    </button>
                </div>

                {isCreating && (
                    <div className="mb-4 p-2 bg-gray-50 border rounded">
                        <input
                            autoFocus
                            placeholder="Menu Name"
                            className="w-full text-sm p-1 border rounded mb-2"
                            value={newMenuName}
                            onChange={(e) => setNewMenuName(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <button onClick={handleCreateMenu} className="text-xs bg-black text-white px-2 py-1 rounded">Save</button>
                            <button onClick={() => setIsCreating(false)} className="text-xs text-gray-500 hover:text-black">Cancel</button>
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    {menus.map(menu => (
                        <button
                            key={menu.id}
                            onClick={() => setSelectedMenuId(menu.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${selectedMenuId === menu.id ? "bg-gray-100 font-semibold" : "hover:bg-gray-50 mb-1"}`}
                        >
                            {menu.name}
                        </button>
                    ))}
                    {menus.length === 0 && !isCreating && (
                        <p className="text-sm text-gray-400 italic">No menus yet.</p>
                    )}
                </div>
            </div>

            {/* Main Area: Menu Items */}
            <div className="flex-1">
                {selectedMenu ? (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{selectedMenu.name} Items</h2>
                            <button onClick={() => handleDeleteMenu(selectedMenu.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-8">
                            {selectedMenu.items.length === 0 ? (
                                <p className="text-gray-400 italic">No items in this menu.</p>
                            ) : (
                                selectedMenu.items.map((item, idx) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 border rounded bg-gray-50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-400 text-xs w-4">{idx + 1}</span>
                                            <div>
                                                <p className="font-medium text-sm">{item.label}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    {item.page ? (
                                                        <><FileText size={10} /> Page: {item.page.title}</>
                                                    ) : (
                                                        <><LinkIcon size={10} /> URL: {item.url}</>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Add Item Form */}
                        <div className="border-t pt-6">
                            <h3 className="font-semibold mb-4">Add Menu Item</h3>
                            <AddItemForm pages={pages} onAdd={async (label, type, value) => {
                                const data: any = {
                                    label,
                                    order: (selectedMenu?.items.length || 0) + 1
                                };

                                if (type === "page") data.pageId = value;
                                else data.url = value;

                                await upsertMenuItem(selectedMenuId!, null, data);
                                router.refresh();
                            }} />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        Select a menu to edit
                    </div>
                )}
            </div>
        </div>
    );
}

function AddItemForm({ pages, onAdd }: { pages: Page[], onAdd: (label: string, type: string, value: string) => Promise<void> }) {
    const [type, setType] = useState<"page" | "url">("page");
    const [label, setLabel] = useState("");
    const [value, setValue] = useState(pages.length > 0 ? pages[0].id : "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd(label, type, value);
        setLabel("");

        // Don't reset value fully, just strict check
        if (type === 'page' && pages.length > 0) setValue(pages[0].id);
        else if (type === 'url') setValue("");
    }

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                <input
                    required
                    placeholder="Label"
                    className="w-full p-2 border rounded text-sm"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                />
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                <select
                    className="w-full p-2 border rounded text-sm"
                    value={type}
                    onChange={(e) => {
                        const newType = e.target.value as "page" | "url";
                        setType(newType);
                        if (newType === 'page') setValue(pages.length > 0 ? pages[0].id : "");
                        else setValue("");
                    }}
                >
                    <option value="page">Page</option>
                    <option value="url">External URL</option>
                </select>
            </div>
            <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Destination</label>
                {type === "page" ? (
                    <select
                        className="w-full p-2 border rounded text-sm"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select Page</option>
                        {pages.map(p => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        required
                        placeholder="https://example.com"
                        type="url"
                        className="w-full p-2 border rounded text-sm"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                    />
                )}
            </div>
            <div className="md:col-span-1">
                <button type="submit" className="w-full bg-black text-white p-2 rounded text-sm hover:opacity-80">Add Item</button>
            </div>
        </form>
    )
}
