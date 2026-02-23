"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { updateBlogPost } from "@/actions/blog";

export default function BlogPostEditor({ params, post, site }: { params: any, post: any, site: any }) {
    const router = useRouter();
    const [content, setContent] = useState(post.content || "");
    const [status, setStatus] = useState<"saved" | "saving" | "unsaved">("saved");

    // We use a ref to hold the timeout ID so it persists across renders
    const saveTimeoutRef = useState<{ current: NodeJS.Timeout | null }>({ current: null })[0];

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, []);

    const handleUpdate = (markdown: string) => {
        setContent(markdown);
        setStatus("saving");

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            const result = await updateBlogPost(site.id, post.id, markdown);
            if (result.success) {
                setStatus("saved");
                router.refresh();
            } else {
                setStatus("unsaved");
                // toast.error("Failed to save"); // Assuming toast is available or we can just show unsaved
            }
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                <div className="flex items-center gap-4">
                    <Link href={`/app/site/${site.id}/blog`} className="p-2 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{post.title || "Untitled Post"}</h1>
                        <p className="text-xs text-gray-500">
                            {post.published ? (
                                <span className="text-green-600 font-medium">Published</span>
                            ) : (
                                <span className="text-yellow-600 font-medium">Draft</span>
                            )}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {status === "saving" && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Loader2 size={14} className="animate-spin" /> Saving...
                        </div>
                    )}
                    {status === "saved" && (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Save size={14} /> Saved
                        </div>
                    )}
                    {status === "unsaved" && (
                        <div className="text-red-500 text-sm">Unsaved changes</div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-hidden p-6 bg-gray-50">
                <Editor
                    initialValue={content}
                    onChange={handleUpdate}
                    site={site}
                    siteId={site.id}
                />
            </div>
        </div>
    );
}
