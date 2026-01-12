import { getBlogPost } from "@/actions/blog";
import { notFound } from "next/navigation";
import BlogPostEditor from "./client";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
    const { id: siteId, postId } = await params;

    // Fetch data
    const post = await getBlogPost(postId);

    if (!post) return notFound();

    return <BlogPostEditor params={params} post={post} site={post.site} />;
}
