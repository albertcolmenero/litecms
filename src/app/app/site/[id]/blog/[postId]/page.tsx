import { notFound } from "next/navigation";
import { getBlogPost } from "@/actions/blog";
import BlogEditorClient from "./EditorClient";

export default async function BlogEditorRoute({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id: siteId, postId } = await params;
  const post = await getBlogPost(postId);
  if (!post) notFound();
  if (post.siteId !== siteId) notFound();

  return <BlogEditorClient siteId={siteId} site={post.site} post={post} />;
}
