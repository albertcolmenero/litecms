"use client";

import { useState } from "react";
import { createSite } from "@/app/actions";
import { Plus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is available based on package.json

export default function CreateSiteModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            const res = await createSite(formData);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success("Site created successfully!");
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
                Create Site
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Site</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form action={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                            Site Name
                        </label>
                        <input
                            name="name"
                            type="text"
                            placeholder="My Awesome Blog"
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="subdomain" className="text-sm font-medium text-gray-700">
                            Subdomain
                        </label>
                        <div className="flex rounded-lg shadow-sm">
                            <input
                                name="subdomain"
                                type="text"
                                placeholder="blog"
                                required
                                className="fill-current flex-1 px-3 py-2 border border-r-0 border-gray-200 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-w-0"
                            />
                            <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 border-gray-200 rounded-r-lg">
                                .localhost:3000
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="A brief description of your site..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isLoading ? "Creating..." : "Create Site"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
