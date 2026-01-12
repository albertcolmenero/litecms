"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPublicBlogPosts } from "@/actions/blog";
import { Loader2 } from "lucide-react";

export default function BlogPosts({ count = 3, siteId }: { count?: number, siteId?: string }) {
    // We can't access siteId directly if it's not passed properly, checking logic below.
    // In markdown-renderer, we pass { site } usually.
    // But remark-sections transforms `::blog-posts` to `blog-posts-component`.
    // The renderer maps `blog-posts-component` to this component.
    // The props passed are the attributes from markdown + whatever `react-markdown` passes?
    // Actually, `markdown-renderer` mapping: `"blog-posts-component": BlogPosts`
    // It does NOT pass `site` implicitly unless we wrap it.
    // We need to check how `form-component` gets data.
    // In `markdown-renderer.tsx`:
    /*
      "form-component": Form
    */
    // `Form` takes `id` from attributes.
    // `BlogPosts` takes `count` from attributes.
    // It DOES NOT receive `site` by default.
    // We need to modify `markdown-renderer.tsx` to wrap this component and inject `site`.

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (siteId) {
            const numCount = typeof count === 'string' ? parseInt(count) : count;
            getPublicBlogPosts(siteId, numCount).then(res => {
                setPosts(res);
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [siteId, count]);

    if (!siteId) return null; // Or some placeholder

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    if (posts.length === 0) {
        return null;
    }

    return (
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
                <article key={post.id} className="flex flex-col items-start justify-between text-left">
                    <div className="relative w-full">
                        <div className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                            {post.image ? (
                                <img
                                    src={post.image}
                                    alt={post.title || "Post image"}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                                    <span className="text-sm">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                        </div>
                    </div>
                    <div className="max-w-xl">
                        <div className="mt-8 flex items-center gap-x-4 text-xs">
                            <time dateTime={post.publishedAt ? new Date(post.publishedAt).toISOString() : ""} className="text-gray-500 dark:text-gray-400">
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : "Draft"}
                            </time>
                            {/* Category is not yet in DB, can add later or omit */}
                            {/*
                            <span className="relative z-10 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                Category
                            </span>
                            */}
                        </div>
                        <div className="group relative">
                            <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                <Link href={`/blog/${post.slug}`}>
                                    <span className="absolute inset-0" />
                                    {post.title}
                                </Link>
                            </h3>
                            <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                {post.description}
                            </p>
                        </div>
                        <div className="relative mt-8 flex items-center gap-x-4">
                            {/* Author logic if available */}
                            <div className="text-sm leading-6">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                    <span className="absolute inset-0" />
                                    {post.author || "Admin"}
                                </p>
                                {/* Read time dummy or calc */}
                                {/* <p className="text-gray-600 dark:text-gray-400">5 min read</p> */}
                            </div>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}
