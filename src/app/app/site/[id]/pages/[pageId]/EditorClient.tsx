"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowUpRight, Check, Code as CodeIcon, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { Editor } from "@/components/editor/editor";
import { WysiwygEditor } from "@/components/editor/wysiwyg/WysiwygEditor";
import { AgentPanel } from "@/components/agent/AgentPanel";
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
  const [chatOpen, setChatOpen] = useState(false);

  // Sync local content with the latest server-side content. The agent writes
  // directly to the DB, then the AgentPanel calls router.refresh() — that
  // re-fetches the page server component, which passes a new page.content
  // prop here. We mirror it into local state so the editor canvas re-renders.
  // Note: this can fight with in-flight typing; we only sync when there's
  // a real difference and we're not in the middle of a debounced save.
  useEffect(() => {
    if (status === "saving") return;
    const next = page.content || "";
    setContent((prev) => (prev === next ? prev : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.content]);

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

          <Button
            variant={chatOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setChatOpen((v) => !v)}
            className={cn(chatOpen && "bg-foreground text-background")}
            title="Toggle the page-builder agent"
          >
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Ask agent
          </Button>

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

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-h-0 p-3 md:p-4 bg-muted/30">
          {mode === "wysiwyg" ? (
            <WysiwygEditor source={content} site={site} onChange={handleUpdate} />
          ) : (
            <Editor
              initialValue={content}
              onChange={handleUpdate}
              site={site}
              siteId={siteId}
            />
          )}
        </div>
        {chatOpen ? (
          <AgentPanel siteId={siteId} pageId={page.id} onClose={() => setChatOpen(false)} />
        ) : null}
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
