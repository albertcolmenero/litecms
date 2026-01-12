import { Header } from "@/components/home/Header";
import { Footer } from "@/components/home/Footer";
import { BLOG_POSTS } from "@/lib/marketing-blog";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    // Fallback content if rich content isn't defined in the mock yet
    const content = post.content || `
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    <h2>Introduction</h2>
    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    <blockquote>
      "The best way to predict the future is to create it."
    </blockquote>
    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
    <h2>Key Takeaways</h2>
    <ul>
      <li>Content ownership is critical in 2024.</li>
      <li>Markdown offers portability and speed.</li>
      <li>Static sites are winning the SEO game.</li>
    </ul>
    <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
  `;

    return (
        <div className="bg-white dark:bg-black min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pt-24 pb-16">
                <article className="mx-auto max-w-3xl px-6 lg:px-8">
                    <div className="mb-8">
                        <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog
                        </Link>
                    </div>

                    <div className="space-y-4 text-center mb-10">
                        <div className="flex items-center justify-center gap-x-4 text-xs font-medium">
                            <time dateTime={post.date} className="text-gray-500 dark:text-gray-400">
                                {post.date}
                            </time>
                            <span className="relative z-10 rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-gray-600 dark:text-gray-300">
                                {post.category}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                {post.readTime}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-center space-x-2 pt-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {post.author}
                            </p>
                        </div>
                    </div>

                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 bg-gray-100 dark:bg-gray-800 border dark:border-gray-800 shadow-sm">
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>

                    <div
                        className="prose prose-lg prose-blue dark:prose-invert mx-auto
                prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl
                prose-a:text-blue-600 dark:prose-a:text-blue-400
                prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                </article>
            </main>
            <Footer />
        </div>
    );
}
