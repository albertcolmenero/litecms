"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Loader2, Sparkles, Square, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToolCallChip } from "./ToolCallChip";

const SUGGESTIONS = [
  "Build me an elite home page from scratch.",
  "Tighten the hero — make the H1 5 words and emphasize speed.",
  "Add a pricing teaser before the FAQ.",
  "Replace the social proof with a customer logo strip.",
];

export function AgentPanel({
  siteId,
  pageId,
  onClose,
}: {
  siteId: string;
  pageId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState("");

  const transport = useRef(
    new DefaultChatTransport({
      api: "/api/agent/page",
      body: { siteId, pageId },
    }),
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: transport.current,
    onFinish: () => {
      // Refresh page content from the server so the canvas reflects edits.
      router.refresh();
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const isWorking = status === "streaming" || status === "submitted";

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isWorking) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <aside className="flex h-full w-96 shrink-0 flex-col border-l border-border bg-card">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <Sparkles className="h-4 w-4 text-foreground" />
        <span className="text-sm font-medium">Page builder</span>
        <span className="text-[10px] text-muted-foreground font-mono">grok-4-fast</span>
        <button
          onClick={onClose}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">Describe the page you want.</p>
            <p className="mb-4 text-xs">
              Tell me about your company — what you do, who you serve, and what stage you&apos;re at — and I&apos;ll
              build a complete page following B2B SaaS conventions.
            </p>
            <div className="space-y-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="flex w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-left text-xs hover:border-foreground/20 hover:bg-accent transition-colors"
                >
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="space-y-1">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {m.role === "user" ? "You" : "Agent"}
                </div>
                {m.parts?.map((part: any, i: number) => {
                  if (part.type === "text") {
                    return (
                      <p key={i} className="text-sm text-foreground whitespace-pre-wrap leading-6">
                        {part.text}
                      </p>
                    );
                  }
                  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
                    return <ToolCallChip key={i} part={part} />;
                  }
                  if (part.type === "step-start") {
                    return null;
                  }
                  if (part.type === "reasoning") {
                    return (
                      <p key={i} className="text-xs text-muted-foreground italic leading-5">
                        {part.text}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {isWorking ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {status === "submitted" ? "Sending…" : "Thinking…"}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
                {error.message}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border px-3 py-2">
        <div className="flex items-end gap-1.5 rounded-lg border border-border bg-background p-1.5 focus-within:border-foreground/30">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask the agent to build or edit this page…"
            rows={1}
            className="flex-1 resize-none bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground max-h-32"
          />
          {isWorking ? (
            <Button type="button" size="icon" variant="ghost" onClick={() => stop()} className="h-8 w-8">
              <Square className="h-3.5 w-3.5 fill-current" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} className="h-8 w-8">
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Enter to send · Shift+Enter for newline · Esc to close
        </p>
      </form>
    </aside>
  );
}
