"use client";

import { useState } from "react";
import { createPage } from "@/app/actions";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function CreatePageModal({ siteId }: { siteId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const res = await createPage(siteId, formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Page created successfully!");
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium text-sm shadow-sm hover:shadow-md"
            >
                <Plus size={16} />
                Create Page
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Page</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700">
                            Page Title
                        </label>
                        <input
                            name="title"
                            type="text"
                            placeholder="e.g. About Us"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="slug" className="text-sm font-medium text-gray-700">
                            Slug
                        </label>
                        <div className="flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg">
                                /
                            </span>
                            <input
                                name="slug"
                                type="text"
                                placeholder="about"
                                required
                                className="fill-current flex-1 px-3 py-2 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-w-0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                            <input type="checkbox" name="showInMain" className="rounded border-gray-300 text-black focus:ring-black" />
                            Show in Main Menu
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                            <input type="checkbox" name="showInFooter" className="rounded border-gray-300 text-black focus:ring-black" />
                            Show in Footer Menu
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isLoading ? "Creating..." : "Create Page"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
