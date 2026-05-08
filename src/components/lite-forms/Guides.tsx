import Link from "next/link";
import Image from "next/image";

const guides = [
    {
        title: "How to create a contact form with Lite Forms",
        excerpt:
            "Contact forms are one of the best ways to convert visitors. Wire your HTML to an endpoint, style it your way, and start collecting leads.",
        date: "Mar 20, 2025",
        category: "Tutorial",
        image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=2670&auto=format&fit=crop",
        href: "#guides",
        author: "Lite Forms",
        readTime: "6 min read",
    },
    {
        title: "Add file uploads to your HTML form in five steps",
        excerpt:
            "File uploads are often the slowest part of building forms. Here is a minimal multipart setup that works with static hosting.",
        date: "Mar 12, 2025",
        category: "How-to",
        image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
        href: "#guides",
        author: "Lite Forms",
        readTime: "5 min read",
    },
    {
        title: "Submit forms with fetch (AJAX) and JSON",
        excerpt:
            "Keep users on the page with async submissions. Handle success and errors without a full reload—works with the same endpoint URL.",
        date: "Feb 28, 2025",
        category: "API",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
        href: "#guides",
        author: "Lite Forms",
        readTime: "4 min read",
    },
];

export function LiteFormsGuides() {
    return (
        <div id="guides" className="py-24 sm:py-32 bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Useful to read</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Short guides for shipping forms, uploads, and keeping every submission in your Lite Forms lead inbox.
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {guides.map((post) => (
                        <article key={post.title} className="flex flex-col items-start justify-between">
                            <div className="relative w-full">
                                <div className="aspect-[16/9] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                                    <Image src={post.image} alt="" fill className="object-cover" />
                                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                                </div>
                            </div>
                            <div className="max-w-xl">
                                <div className="mt-8 flex items-center gap-x-4 text-xs">
                                    <time dateTime={post.date} className="text-gray-500 dark:text-gray-400">
                                        {post.date}
                                    </time>
                                    <span className="relative z-10 rounded-full bg-gray-50 dark:bg-gray-800 px-3 py-1.5 font-medium text-gray-600 dark:text-gray-300">
                                        {post.category}
                                    </span>
                                </div>
                                <div className="group relative">
                                    <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300">
                                        <Link href={post.href}>
                                            <span className="absolute inset-0" />
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">{post.excerpt}</p>
                                </div>
                                <div className="relative mt-8 flex items-center gap-x-4">
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
                    <Link href="#guides" className="text-sm font-semibold leading-6 text-blue-600 dark:text-blue-500 hover:text-blue-500">
                        View all guides <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
