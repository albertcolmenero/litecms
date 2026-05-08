import Link from "next/link";
import { Plus, Newspaper, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { POSTS } from "@/components/preview/mock";

export default async function BlogList({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const base = `/preview/site/${id}`;

  return (
    <>
      <PageHeader
        title="Blog"
        description="Posts published to /blog on your live site."
        action={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New post
          </Button>
        }
      />

      <div className="space-y-3">
        {POSTS.map((p) => (
          <Link
            key={p.id}
            href={`${base}/blog/${p.id}`}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground truncate">{p.title}</h3>
                {p.published ? (
                  <StatPill tone="success">Published</StatPill>
                ) : (
                  <StatPill tone="warning">Draft</StatPill>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.excerpt}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{p.author}</span>
                {p.publishedAt ? (
                  <>
                    <span>·</span>
                    <span>{p.publishedAt}</span>
                  </>
                ) : null}
                <span className="font-mono">{p.slug}</span>
              </div>
            </div>
            <button className="invisible group-hover:visible flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </Link>
        ))}
      </div>
    </>
  );
}
