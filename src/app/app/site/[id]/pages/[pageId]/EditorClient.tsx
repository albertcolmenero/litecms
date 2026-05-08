"use client";

import Link from "next/link";
import { useCallback, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowUpRight, Check, Code as CodeIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { Editor } from "@/components/editor/editor";
import { WysiwygEditor } from "@/components/editor/wysiwyg/WysiwygEditor";
import { updatePage } from "@/app/actions";

type SaveStatus = "saved" | "saving" | "unsaved";
type Mode = "wysiwyg" | "source";

export default function EditorClient({
  siteId,
  site,
  page,
}: {
  siteId: string;
  site: any;
  page: {
    id: string;
    title: string;
    slug: string;
    content: string | null;
    published: boolean;
  };
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [published, setPublished] = useState(page.published);
  const [publishPending, startPublishTransition] = useTransition();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [content, setContent] = useState<string>(page.content || "");
  const [mode, setMode] = useState<Mode>("source");

  const handleUpdate = useCallback(
    async (markdown: string) => {
      setContent(markdown);
      setStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        const result = await updatePage(siteId, page.id, { content: markdown });
        if (result.success) {
          setStatus("saved");
        } else {
          setStatus("unsaved");
          toast.error("Failed to save");
        }
      }, 1000);
    },
    [page.id, siteId],
  );

  const togglePublish = () => {
    const next = !published;
    startPublishTransition(async () => {
      const res = await updatePage(siteId, page.id, { published: next });
      if (res.success) {
        setPublished(next);
        toast.success(next ? "Page published" : "Page unpublished");
      } else {
        toast.error("Failed to update publish state");
      }
    });
  };

  const liveUrl = site.customDomain
    ? `https://${site.customDomain}/${page.slug}`
    : `http://${site.subdomain}.localhost:3000/${page.slug}`;

  return (
    <div className="flex h-svh flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/app/site/${siteId}/pages`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Pages
          </Link>
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="font-medium text-foreground truncate">{page.title}</span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">/{page.slug}</span>
        </div>

        <SaveIndicator status={status} />

        <div className="ml-auto flex items-center gap-2">
          <ModeToggle mode={mode} setMode={setMode} />

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
        {mode === "wysiwyg" ? (
          <WysiwygEditor source={content} site={site} onChange={handleUpdate} />
        ) : (
          // Don't put a content-derived `key` here — it would force a remount
          // (and focus loss) on every keystroke. The Editor manages its own
          // internal state from `initialValue` on mount; switching modes
          // unmounts/remounts naturally because the JSX branch changes.
          <Editor
            initialValue={content}
            onChange={handleUpdate}
            site={site}
            siteId={siteId}
          />
        )}
      </div>
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div className="hidden md:flex items-center gap-0.5 rounded-md border border-border p-0.5">
      <button
        onClick={() => setMode("source")}
        className={cn(
          "flex h-7 items-center gap-1 rounded px-2 text-xs font-medium",
          mode === "source"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-accent",
        )}
        title="Markdown source"
      >
        <CodeIcon className="h-3.5 w-3.5" />
        Source
      </button>
      <button
        onClick={() => setMode("wysiwyg")}
        className={cn(
          "flex h-7 items-center gap-1 rounded px-2 text-xs font-medium",
          mode === "wysiwyg"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-accent",
        )}
        title="Visual editor"
      >
        <Sparkles className="h-3.5 w-3.5" />
        WYSIWYG
      </button>
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
