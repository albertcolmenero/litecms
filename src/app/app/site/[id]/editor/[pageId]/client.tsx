"use client";

import { Editor } from "@/components/editor/editor";
import { updatePage } from "@/app/actions";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";


export default function EditorClient({
    siteId,
    page
}: {
    siteId: string;
    page: { id: string; title: string; slug: string; content: string | null; published: boolean; menuItems?: any[] }
}) {
    const [content, setContent] = useState(page.content || "");
    const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");

    const saveTimeoutRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];

    const handleUpdate = useCallback(async (markdown: string) => {
        setContent(markdown);
        setStatus("saving");

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            const result = await updatePage(siteId, page.id, { content: markdown });
            if (result.success) {
                setStatus("saved");
                // toast.success("Saved"); // Maybe too noisy if frequent
            } else {
                setStatus("unsaved");
                toast.error("Failed to save");
            }
        }, 1000);
    }, [page.id, siteId, saveTimeoutRef]);



    return (
        <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-white">
                <div className="flex items-center gap-4">
                    <Link href={`/app/site/${siteId}`} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold truncate max-w-[300px]">{page.title}</h1>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-500">
                        {page.published ? "Published" : "Draft"}
                    </span>

                </div>

                <div className="flex items-center gap-3">
                    {status === "saving" && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Loader2 size={14} className="animate-spin" /> Saving...
                        </div>
                    )}
                    {status === "saved" && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Check size={14} /> Saved
                        </div>
                    )}
                    {status === "unsaved" && (
                        <div className="text-red-500 text-sm">Unsaved changes</div>
                    )}
                </div>
            </header>

            {/* Editor Area */}
            {/* Editor Area */}
            <main className="flex-1 overflow-hidden bg-gray-50 p-4 flex flex-col">
                <div className="w-full h-full">
                    <Editor
                        initialValue={page.content || ""}
                        onChange={handleUpdate}
                    />
                </div>
            </main>
        </div>
    );
}
