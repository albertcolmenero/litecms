import { getBlogPosts, createBlogPost, deleteBlogPost } from "@/actions/blog";
import { Plus, Trash2, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BlogParams({ params }: { params: Promise<{ id: string }> }) {
    const { id: siteId } = await params;
    const posts = await getBlogPosts(siteId);

    async function create() {
        "use server";
        const res = await createBlogPost(siteId, "New Blog Post");
        if (res.error) console.error(res.error);
        else if (res.post) redirect(`/app/site/${siteId}/blog/${res.post.id}`);
    }

    async function remove(formData: FormData) {
        "use server";
        const postId = formData.get("postId") as string;
        await deleteBlogPost(siteId, postId);
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <Link href={`/app/site/${siteId}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-6 transition-colors">
                <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
            </Link>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Blog Posts</h1>
                <form action={create}>
                    <button className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:opacity-90">
                        <Plus size={16} />
                        New Post
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
                {posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <p>No blog posts yet.</p>
                        <p className="text-sm">Create one to get started.</p>
                    </div>
                ) : (
                    <ul className="divide-y">
                        {posts.map((post) => (
                            <li key={post.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <Link href={`/app/site/${siteId}/blog/${post.id}`} className="font-semibold text-lg hover:underline block">
                                        {post.title || "Untitled"}
                                    </Link>
                                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                        <span className={`px-2 py-0.5 rounded ${post.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {post.published ? "Published" : "Draft"}
                                        </span>
                                        <span>• {new Date(post.createdAt).toLocaleDateString()}</span>
                                        {post.slug && <span>• /{post.slug}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/app/site/${siteId}/blog/${post.id}`} className="p-2 text-gray-500 hover:text-black">
                                        <Edit size={16} />
                                    </Link>
                                    <form action={remove}>
                                        <input type="hidden" name="postId" value={post.id} />
                                        <button className="p-2 text-gray-500 hover:text-red-600">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
