"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Columns,
  FormInput,
  Image as ImageIcon,
  Layout,
  LayoutGrid,
  List as ListIcon,
  ListOrdered,
  Newspaper,
  Pilcrow,
  Search,
  Sparkles,
  SquareDashedBottom,
  Type,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { BlockFactories, type AstNode } from "@/lib/wysiwyg-ast";

type Item = {
  group: string;
  name: string;
  description: string;
  icon: LucideIcon;
  factory: () => AstNode;
};

const LIBRARY: Item[] = [
  // Layout
  { group: "Layout", name: "Section · 100", description: "Full-width section", icon: Layout, factory: BlockFactories.fullSection },
  { group: "Layout", name: "Section · 50/50", description: "Two equal columns", icon: LayoutGrid, factory: () => BlockFactories.section("50-50") },
  { group: "Layout", name: "Section · 33/33/33", description: "Three equal columns", icon: Columns, factory: BlockFactories.threeColSection },
  { group: "Layout", name: "Section · 67/33", description: "Wide left column", icon: LayoutGrid, factory: () => BlockFactories.section("67-33") },
  { group: "Layout", name: "Column", description: "Column inside a section", icon: LayoutGrid, factory: () => BlockFactories.column() },
  { group: "Layout", name: "Card", description: "Bordered container", icon: SquareDashedBottom, factory: BlockFactories.card },
  // Text
  { group: "Text", name: "Heading 1", description: "Top-level title", icon: Type, factory: () => BlockFactories.heading(1, "Heading") },
  { group: "Text", name: "Heading 2", description: "Section title", icon: Type, factory: () => BlockFactories.heading(2, "Heading") },
  { group: "Text", name: "Heading 3", description: "Subheading", icon: Type, factory: () => BlockFactories.heading(3, "Heading") },
  { group: "Text", name: "Paragraph", description: "Body text", icon: Pilcrow, factory: () => BlockFactories.paragraph("Type something…") },
  { group: "Text", name: "Bulleted list", description: "Unordered list", icon: ListIcon, factory: BlockFactories.bulletedList },
  { group: "Text", name: "Numbered list", description: "Ordered list", icon: ListOrdered, factory: BlockFactories.numberedList },
  // Media
  { group: "Media", name: "Icon", description: "Lucide icon", icon: Sparkles, factory: () => BlockFactories.icon("Sparkles") },
  { group: "Media", name: "Avatar", description: "Initials circle", icon: UserCircle, factory: () => BlockFactories.avatar() },
  // Components
  { group: "Components", name: "Button", description: "Primary or secondary CTA", icon: ArrowUpRight, factory: () => BlockFactories.button() },
  { group: "Components", name: "Badge", description: "Rounded pill with optional icon and link", icon: SquareDashedBottom, factory: () => BlockFactories.badge() },
  { group: "Components", name: "Form", description: "Embed a form by ID", icon: FormInput, factory: () => BlockFactories.form() },
  { group: "Components", name: "Blog posts", description: "Recent posts grid", icon: Newspaper, factory: () => BlockFactories.blogPosts("3") },
  { group: "Components", name: "Spacer", description: "Vertical gap", icon: ImageIcon, factory: () => BlockFactories.breakline("2rem") },
];

export function SlashMenu({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (factory: () => AstNode) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = query
    ? LIBRARY.filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.description.toLowerCase().includes(query.toLowerCase()),
      )
    : LIBRARY;

  if (!open) return null;

  const groups = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (item) {
        onPick(item.factory);
        onClose();
      }
    }
  };

  // Compute flat index for highlighting across groups
  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-foreground/5 backdrop-blur-[1px]" />
      <div
        className="relative w-full max-w-md rounded-lg border border-border bg-popover shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Filter blocks…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            esc
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto py-1">
          {Object.keys(groups).length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No blocks match "{query}"
            </div>
          ) : (
            Object.entries(groups).map(([group, list]) => (
              <div key={group}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {group}
                </div>
                <ul>
                  {list.map((item) => {
                    flatIndex++;
                    const isActive = flatIndex === activeIndex;
                    const Icon = item.icon;
                    const captureIndex = flatIndex;
                    return (
                      <li key={item.name}>
                        <button
                          onMouseEnter={() => setActiveIndex(captureIndex)}
                          onClick={() => {
                            onPick(item.factory);
                            onClose();
                          }}
                          className={
                            "flex w-full items-center gap-3 px-3 py-2 text-left " +
                            (isActive ? "bg-accent" : "hover:bg-accent")
                          }
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
                            <Icon className="h-3.5 w-3.5 text-foreground" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-foreground">
                              {item.name}
                            </span>
                            <span className="block text-xs text-muted-foreground truncate">
                              {item.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
          <span>
            <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↵</kbd> insert
          </span>
          <span>{filtered.length} blocks</span>
        </div>
      </div>
    </div>
  );
}
