"use client";

import { useCallback, useMemo, useRef } from "react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

type Props = {
  source: string;
  site?: any;
  onChange: (newSource: string) => void;
  className?: string;
};

/**
 * Editable preview pane: renders markdown via MarkdownRenderer with source-position
 * stamps, lets users click headings/paragraphs/list items to edit them inline,
 * and splices the new text back into the source on blur.
 *
 * Important: the source-position plugin sees the body *after* gray-matter strips
 * the frontmatter, so its offsets are body-relative. We compute the frontmatter
 * length here and add it to from/to before splicing into the full source.
 */

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

function getFrontmatterOffset(src: string): number {
  const m = src.match(FRONTMATTER_RE);
  return m ? m[0].length : 0;
}

export function EditablePreview({ source, site, onChange, className }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyOffset = useMemo(() => getFrontmatterOffset(source), [source]);

  // mousedown fires before click — set contentEditable here so the browser's
  // natural caret placement on click lands at the click position, not the end.
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-md-from][data-md-to]",
    );
    if (!target) return;
    if (target.getAttribute("contenteditable") === "plaintext-only") return;

    target.setAttribute("contenteditable", "plaintext-only");
    target.classList.add("md-editing");
    // No manual focus or selection — let the browser handle caret placement
    // from the click that's about to fire.
  }, []);

  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-md-from][data-md-to][contenteditable='plaintext-only']",
      );
      if (!target) return;

      const fromAttr = target.getAttribute("data-md-from");
      const toAttr = target.getAttribute("data-md-to");
      target.removeAttribute("contenteditable");
      target.classList.remove("md-editing");

      const fromBody = fromAttr ? parseInt(fromAttr, 10) : NaN;
      const toBody = toAttr ? parseInt(toAttr, 10) : NaN;
      if (!Number.isFinite(fromBody) || !Number.isFinite(toBody) || toBody <= fromBody) {
        return;
      }

      const from = fromBody + bodyOffset;
      const to = toBody + bodyOffset;
      if (to > source.length) return; // stale offsets, bail

      const newText = (target.innerText || "").replace(/\r?\n+/g, " ").trimEnd();
      const oldText = source.slice(from, to);
      if (newText === oldText) return;

      const nextSource = source.slice(0, from) + newText + source.slice(to);
      onChange(nextSource);
    },
    [source, onChange, bodyOffset],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-md-from][data-md-to][contenteditable='plaintext-only']",
    );
    if (!target) return;

    if (e.key === "Enter") {
      const tag = target.tagName.toLowerCase();
      if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5") {
        e.preventDefault();
        target.blur();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      target.blur();
    }
  }, []);

  return (
    <div
      ref={rootRef}
      onMouseDown={handleMouseDown}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={[
        "editable-preview",
        "[&_[data-md-from]]:cursor-text",
        "[&_[data-md-from]:hover]:outline-1 [&_[data-md-from]:hover]:outline-dashed [&_[data-md-from]:hover]:outline-foreground/15 [&_[data-md-from]:hover]:outline-offset-2",
        "[&_.md-editing]:outline-2 [&_.md-editing]:outline [&_.md-editing]:outline-foreground/30 [&_.md-editing]:outline-offset-2 [&_.md-editing]:rounded-sm",
        className ?? "",
      ].join(" ")}
    >
      <MarkdownRenderer content={source} site={site} enableSourcePositions />
    </div>
  );
}
