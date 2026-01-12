import { BLOG_POSTS } from "@/lib/marketing-blog";
import Link from "next/link";
import Image from "next/image";

export function RecentPosts() {
    const recentPosts = BLOG_POSTS.slice(0, 3);

    return (
        <div className="py-24 sm:py-32 bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        From the Blog
                    </h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Learn how to grow your business and build better websites.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {recentPosts.map((post) => (
                        <article key={post.slug} className="flex flex-col items-start justify-between">
                            <div className="relative w-full">
                                <div className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                    <Image
                                        src={post.image}
                                        alt={post.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                                </div>
                            </div>
                            <div className="max-w-xl">
                                <div className="mt-8 flex items-center gap-x-4 text-xs">
                                    <time dateTime={post.date} className="text-gray-500 dark:text-gray-400">
                                        {post.date}
                                    </time>
                                    <span className="relative z-10 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="group relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                        <Link href={`/blog/${post.slug}`}>
                                            <span className="absolute inset-0" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                                        {post.excerpt}
                                    </p>
                                </div>
                                <div className="relative mt-8 flex items-center gap-x-4">
                                    {/* Placeholder for author avatar or just name */}
                                    <div className="text-sm leading-6">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            <span className="absolute inset-0" />
                                            {post.author}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">{post.readTime}</p>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
                <div className="mt-12 text-center">
                    <Link href="/blog" className="text-sm font-semibold leading-6 text-blue-600 dark:text-blue-500 hover:text-blue-500">
                        View all posts <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
