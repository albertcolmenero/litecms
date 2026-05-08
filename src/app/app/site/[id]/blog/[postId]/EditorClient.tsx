"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { Editor } from "@/components/editor/editor";
import { setBlogPostPublished, updateBlogPost } from "@/actions/blog";

type SaveStatus = "saved" | "saving" | "unsaved";

export default function BlogEditorClient({
  siteId,
  site,
  post,
}: {
  siteId: string;
  site: any;
  post: {
    id: string;
    title: string | null;
    slug: string;
    content: string | null;
    published: boolean;
  };
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [published, setPublished] = useState(post.published);
  const [publishPending, startPublishTransition] = useTransition();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUpdate = useCallback(
    (markdown: string) => {
      setStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        const result = await updateBlogPost(siteId, post.id, markdown);
        if (result.success) {
          setStatus("saved");
        } else {
          setStatus("unsaved");
          toast.error("Failed to save");
        }
      }, 1000);
    },
    [post.id, siteId],
  );

  const togglePublish = () => {
    const next = !published;
    startPublishTransition(async () => {
      const res = await setBlogPostPublished(siteId, post.id, next);
      if (res.success) {
        setPublished(next);
        toast.success(next ? "Post published" : "Post unpublished");
      } else {
        toast.error("Failed to update publish state");
      }
    });
  };

  const liveUrl = site.customDomain
    ? `https://${site.customDomain}/blog/${post.slug}`
    : `http://${site.subdomain}.localhost:3000/blog/${post.slug}`;

  return (
    <div className="flex h-svh flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/app/site/${siteId}/blog`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Blog
          </Link>
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="font-medium text-foreground truncate">
            {post.title || "Untitled"}
          </span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
            /blog/{post.slug}
          </span>
        </div>

        <SaveIndicator status={status} />

        <div className="ml-auto flex items-center gap-2">
          {published ? (
            <StatPill tone="success">Published</StatPill>
          ) : (
            <StatPill tone="warning">Draft</StatPill>
          )}

          <Button variant="outline" size="sm" asChild>
            <a href={liveUrl} target="_blank" rel="noreferrer">
              View live
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>

          <Button
            size="sm"
            variant={published ? "outline" : "default"}
            onClick={togglePublish}
            disabled={publishPending}
          >
            {publishPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {published ? "Unpublishing…" : "Publishing…"}
              </>
            ) : published ? (
              "Unpublish"
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-3 md:p-4 bg-muted/30">
        <Editor
          initialValue={post.content || ""}
          onChange={handleUpdate}
          site={site}
          siteId={siteId}
        />
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </div>
    );
  }
  if (status === "unsaved") {
    return (
      <div className="hidden md:flex items-center gap-1.5 text-xs text-destructive">
        Unsaved changes
      </div>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5 text-emerald-600" />
      Saved
    </div>
  );
}
