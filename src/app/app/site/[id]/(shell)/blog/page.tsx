import Link from "next/link";
import { Plus, Newspaper, MoreHorizontal } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getBlogPosts, createBlogPost, deleteBlogPost } from "@/actions/blog";

export default async function BlogList({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: siteId } = await params;
  const posts = await getBlogPosts(siteId);
  const base = `/app/site/${siteId}`;

  async function create() {
    "use server";
    const res = await createBlogPost(siteId, "New blog post");
    if (res.error) console.error(res.error);
    else if (res.post) redirect(`/app/site/${siteId}/blog/${res.post.id}`);
  }

  async function remove(formData: FormData) {
    "use server";
    const postId = formData.get("postId") as string;
    await deleteBlogPost(siteId, postId);
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Posts published to /blog on your live site."
        action={
          <form action={create}>
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              New post
            </Button>
          </form>
        }
      />

      {posts.length === 0 ? (
        <EmptyState
          icon={Newspaper}
          title="No blog posts yet"
          description="Write your first post to start growing an audience."
          action={
            <form action={create}>
              <Button>
                <Plus className="mr-1.5 h-4 w-4" />
                Write first post
              </Button>
            </form>
          }
        />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div
              key={p.id}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
            >
              <Link href={`${base}/blog/${p.id}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`${base}/blog/${p.id}`}
                    className="font-medium text-foreground truncate hover:underline"
                  >
                    {p.title || "Untitled"}
                  </Link>
                  {p.published ? (
                    <StatPill tone="success">Published</StatPill>
                  ) : (
                    <StatPill tone="warning">Draft</StatPill>
                  )}
                </div>
                {p.description ? (
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                ) : null}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  {p.author ? <span>{p.author}</span> : null}
                  <span>·</span>
                  <span>
                    {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {p.slug ? <span className="font-mono">/{p.slug}</span> : null}
                </div>
              </div>
              <form action={remove} className="self-start">
                <input type="hidden" name="postId" value={p.id} />
                <button
                  type="submit"
                  className="invisible group-hover:visible flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                  title="Delete post"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
