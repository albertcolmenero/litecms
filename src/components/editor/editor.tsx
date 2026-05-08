"use client";

import { useState, useRef } from "react";
import { HelpCircle, ImageIcon, Sparkles, Eye, Code as CodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownGuide } from "./markdown-guide";
import { MediaPicker } from "./media-picker";
import { EditablePreview } from "./EditablePreview";

interface EditorProps {
  initialValue?: string;
  onChange?: (markdown: string) => void;
  editable?: boolean;
  site?: any;
  siteId?: string;
}

export function Editor({ initialValue = "", onChange, site, siteId }: EditorProps) {
  const [markdownContent, setMarkdownContent] = useState(initialValue);
  const [showGuide, setShowGuide] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateMarkdown = (newVal: string) => {
    setMarkdownContent(newVal);
    onChange?.(newVal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateMarkdown(e.target.value);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateMarkdown(markdownContent + "\n" + text);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = markdownContent.slice(0, start);
    const after = markdownContent.slice(end);

    const needsNewline = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
    const newVal = before + needsNewline + text + "\n" + after;
    updateMarkdown(newVal);

    requestAnimationFrame(() => {
      const cursorPos = start + needsNewline.length + text.length + 1;
      textarea.selectionStart = cursorPos;
      textarea.selectionEnd = cursorPos;
      textarea.focus();
    });
  };

  const handleMediaSelect = (markdown: string) => {
    insertAtCursor(markdown);
  };

  const resolvedSiteId = siteId || site?.id;
  const lineCount = markdownContent.split("\n").length;

  return (
    <div className="flex h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Left: WYSIWYG-enabled preview */}
      <div className="flex h-full w-1/2 flex-col overflow-hidden border-r border-border">
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span>Preview</span>
          <span className="ml-auto inline-flex items-center gap-1 normal-case tracking-normal text-[11px] text-muted-foreground/80">
            <Sparkles className="h-3 w-3" /> click to edit text
          </span>
        </div>
        <div className="flex-1 overflow-y-auto bg-background p-8">
          <EditablePreview source={markdownContent} site={site} onChange={updateMarkdown} />
        </div>
      </div>

      {/* Right: raw markdown source */}
      <div className="relative flex h-full w-1/2 flex-col">
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 text-xs">
          <CodeIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium uppercase tracking-wide text-muted-foreground">Markdown</span>
          <div className="ml-auto flex items-center gap-1">
            {resolvedSiteId ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setShowMediaPicker(true)}
              >
                <ImageIcon className="mr-1 h-3.5 w-3.5" /> Image
              </Button>
            ) : null}
            <Button
              variant={showGuide ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowGuide(!showGuide)}
            >
              <HelpCircle className="mr-1 h-3.5 w-3.5" /> Guide
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={markdownContent}
            onChange={handleChange}
            className="h-full flex-1 resize-none bg-background p-4 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
            placeholder="Type markdown here…"
            spellCheck={false}
          />

          {showGuide ? (
            <div className="h-full w-80 shrink-0 overflow-y-auto border-l border-border bg-card">
              <MarkdownGuide />
            </div>
          ) : null}
        </div>

        {/* Status bar */}
        <div className="flex h-7 shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-4 text-[11px] text-muted-foreground">
          <span>Markdown</span>
          <span>·</span>
          <span className="font-mono">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <span>·</span>
          <span>UTF-8</span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <span className="rounded bg-background border border-border px-1.5 py-0.5 font-mono text-[10px]">
              WYSIWYG: text only
            </span>
          </span>
        </div>
      </div>

      {showMediaPicker && resolvedSiteId ? (
        <MediaPicker
          siteId={resolvedSiteId}
          onSelect={handleMediaSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      ) : null}
    </div>
  );
}
