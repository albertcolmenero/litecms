"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Columns,
  Copy,
  Eye,
  FileText,
  FormInput,
  GripVertical,
  Heart,
  Image as ImageIcon,
  Layout,
  LayoutGrid,
  MoreHorizontal,
  Newspaper,
  Plus,
  Pilcrow,
  Rocket,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  SquareDashedBottom,
  Trash2,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { Topbar } from "@/components/dashboard/Topbar";
import { SITES } from "@/components/preview/mock";

// ---------- Demo block definitions ----------

type BlockId =
  | "hero"
  | "features"
  | "form"
  | "card-fast"
  | "card-beautiful"
  | "card-powerful";

type BlockMeta = {
  id: BlockId;
  type: "Section" | "Heading" | "Paragraph" | "Button" | "Card" | "Form" | "Column";
  label: string;
  parentId?: BlockId;
};

const BLOCK_META: Record<BlockId, BlockMeta> = {
  hero: { id: "hero", type: "Section", label: "Hero · 50/50" },
  features: { id: "features", type: "Section", label: "Features · 33/33/33" },
  form: { id: "form", type: "Section", label: "Lead capture" },
  "card-fast": { id: "card-fast", type: "Card", label: "Card · Fast", parentId: "features" },
  "card-beautiful": { id: "card-beautiful", type: "Card", label: "Card · Beautiful", parentId: "features" },
  "card-powerful": { id: "card-powerful", type: "Card", label: "Card · Powerful", parentId: "features" },
};

// ---------- Slash menu library (visual only) ----------

type SlashItem = {
  group: string;
  name: string;
  description: string;
  icon: LucideIcon;
  shortcut?: string;
};

const SLASH_LIBRARY: SlashItem[] = [
  { group: "Layout", name: "Section · 100", description: "Full-width section", icon: Layout },
  { group: "Layout", name: "Section · 50/50", description: "Two equal columns", icon: LayoutGrid, shortcut: "/2" },
  { group: "Layout", name: "Section · 33/33/33", description: "Three equal columns", icon: Columns, shortcut: "/3" },
  { group: "Layout", name: "Card", description: "Bordered container", icon: SquareDashedBottom },
  { group: "Text", name: "Heading 1", description: "Top-level title", icon: Type, shortcut: "/h1" },
  { group: "Text", name: "Heading 2", description: "Section title", icon: Type, shortcut: "/h2" },
  { group: "Text", name: "Paragraph", description: "Body text", icon: Pilcrow },
  { group: "Media", name: "Image", description: "From media library", icon: ImageIcon },
  { group: "Media", name: "Icon", description: "Lucide icon", icon: Sparkles },
  { group: "Components", name: "Button", description: "Primary or secondary CTA", icon: ArrowUpRight, shortcut: "/btn" },
  { group: "Components", name: "Badge", description: "Rounded pill with optional icon and link", icon: SquareDashedBottom },
  { group: "Components", name: "Form", description: "Embed a form by ID", icon: FormInput },
  { group: "Components", name: "Blog posts", description: "Recent posts grid", icon: Newspaper },
];

// ---------- Page ----------

export default function WysiwygPreview() {
  const site = SITES[0];
  const [selectedId, setSelectedId] = useState<BlockId>("hero");
  const [slashOpen, setSlashOpen] = useState(true);
  const [slashQuery, setSlashQuery] = useState("");

  const selected = BLOCK_META[selectedId];
  const filteredSlash = slashQuery
    ? SLASH_LIBRARY.filter(
        (i) =>
          i.name.toLowerCase().includes(slashQuery.toLowerCase()) ||
          i.description.toLowerCase().includes(slashQuery.toLowerCase()),
      )
    : SLASH_LIBRARY;

  return (
    <div className="flex h-svh flex-col bg-background">
      <Topbar site={site} basePath="/preview" />

      {/* Editor toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4 md:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/preview/site/${site.id}/pages/home`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to current editor
          </Link>
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span className="font-medium text-foreground truncate">Home</span>
          <span className="font-mono text-xs text-muted-foreground hidden sm:inline">/</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Saved
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Mode tabs */}
          <div className="hidden md:flex items-center gap-0.5 rounded-md border border-border p-0.5">
            <button className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-accent">
              Source
            </button>
            <button className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium bg-foreground text-background">
              <Sparkles className="h-3 w-3" />
              WYSIWYG
            </button>
            <button className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-accent">
              Split
            </button>
          </div>

          <StatPill tone="warning">Draft</StatPill>

          <Button variant="outline" size="sm">
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View live
          </Button>
          <Button size="sm">Publish</Button>
        </div>
      </div>

      {/* Preview banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex items-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        <span className="font-medium">WYSIWYG preview</span>
        <span className="text-amber-800/80">
          Click any block in the canvas to switch the right rail. Slash menu, drag handles, and action bar buttons are
          visual only.
        </span>
      </div>

      {/* Body: 3-col canvas */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Center canvas */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="mx-auto max-w-3xl px-6 py-12 space-y-1">
            {/* Block 1: Hero (selected by default) */}
            <BlockShell
              id="hero"
              selected={selectedId === "hero"}
              onSelect={() => setSelectedId("hero")}
            >
              <div className="grid grid-cols-2 gap-6 rounded-lg bg-foreground p-8 text-background">
                <div className="flex flex-col justify-center">
                  <h1 className="text-3xl font-semibold tracking-tight">Welcome to {site.name}</h1>
                  <p className="mt-2 text-sm text-background/70">
                    Build elegant sites without writing code.
                  </p>
                  <div>
                    <span className="mt-4 inline-flex rounded-md bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                      Get started
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/10">
                    <Rocket className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </BlockShell>

            {/* Insert affordance with slash menu OPEN */}
            <InsertAffordance expanded onToggle={() => setSlashOpen(!slashOpen)}>
              {slashOpen ? (
                <SlashMenu items={filteredSlash} query={slashQuery} setQuery={setSlashQuery} />
              ) : null}
            </InsertAffordance>

            {/* Block 2: Features (a section with 3 cards) */}
            <BlockShell
              id="features"
              selected={selectedId === "features"}
              onSelect={() => setSelectedId("features")}
            >
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-card p-6">
                {[
                  { id: "card-fast" as BlockId, icon: Sparkles, title: "Fast", body: "Ship in minutes." },
                  { id: "card-beautiful" as BlockId, icon: Heart, title: "Beautiful", body: "Designed by humans." },
                  { id: "card-powerful" as BlockId, icon: Zap, title: "Powerful", body: "All the tools you need." },
                ].map((c) => {
                  const Icon = c.icon;
                  const isSel = selectedId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId(c.id);
                      }}
                      className={`text-left rounded-lg border p-3 transition-all ${
                        isSel
                          ? "border-blue-500 ring-2 ring-blue-200 bg-card"
                          : "border-border bg-card hover:border-foreground/20"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-foreground" />
                      <h3 className="mt-2 text-xs font-semibold">{c.title}</h3>
                      <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{c.body}</p>
                    </button>
                  );
                })}
              </div>
            </BlockShell>

            <InsertAffordance />

            {/* Block 3: Form */}
            <BlockShell
              id="form"
              selected={selectedId === "form"}
              onSelect={() => setSelectedId("form")}
            >
              <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
                <FormInput className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">Waitlist form</p>
                <p className="mt-0.5 text-xs text-muted-foreground font-mono">
                  ::form{`{id="waitlist"}`}
                </p>
                <div className="mt-4 mx-auto max-w-xs space-y-2">
                  <div className="h-9 rounded-md border border-border bg-background" />
                  <div className="h-9 rounded-md bg-foreground" />
                </div>
              </div>
            </BlockShell>

            <InsertAffordance />
          </div>
        </main>

        {/* Right rail: attribute panel for selected block */}
        <aside className="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-border bg-card overflow-y-auto">
          <AttributePanel block={selected} />
        </aside>
      </div>
    </div>
  );
}

// ---------- Block shell ----------

function BlockShell({
  id,
  selected,
  onSelect,
  children,
}: {
  id: BlockId;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  const meta = BLOCK_META[id];
  return (
    <div className="group relative">
      {/* Drag handle (visual only) */}
      <div className="absolute -left-7 top-1/2 -translate-y-1/2 hidden group-hover:flex flex-col items-center gap-1">
        <button
          className="flex h-6 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button
          className="flex h-5 w-5 items-center justify-center rounded bg-foreground text-background hover:bg-foreground/90"
          title="Insert below"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>

      {/* Floating action bar (selected only) */}
      {selected ? (
        <div className="absolute left-0 -top-9 flex items-center gap-1 rounded-md border border-border bg-popover px-1 py-0.5 shadow-sm z-10">
          <span className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
            {meta.label}
          </span>
          <span className="h-4 w-px bg-border" />
          <button
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
            title="More"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      {/* Block body */}
      <div
        onClick={onSelect}
        className={`relative cursor-pointer rounded-lg transition-all ${
          selected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-muted/20"
            : "hover:ring-1 hover:ring-foreground/15 hover:ring-offset-2 hover:ring-offset-muted/20"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ---------- Insert affordance ----------

function InsertAffordance({
  expanded,
  onToggle,
  children,
}: {
  expanded?: boolean;
  onToggle?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group relative ${expanded ? "py-2" : "py-1.5"}`}>
      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity data-[expanded=true]:opacity-100"
           data-expanded={expanded ? "true" : "false"}>
        <span className="h-px flex-1 bg-border" />
        <button
          onClick={onToggle}
          className={`flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs ${
            expanded
              ? "bg-foreground text-background"
              : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Plus className="h-3 w-3" />
          {expanded ? "Insert" : "Add block"}
        </button>
        <span className="h-px flex-1 bg-border" />
      </div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

// ---------- Slash menu ----------

function SlashMenu({
  items,
  query,
  setQuery,
}: {
  items: SlashItem[];
  query: string;
  setQuery: (v: string) => void;
}) {
  const groups = items.reduce<Record<string, SlashItem[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter blocks…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          esc
        </kbd>
      </div>
      <div className="max-h-80 overflow-y-auto py-1">
        {Object.entries(groups).map(([group, list]) => (
          <div key={group}>
            <div className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {group}
            </div>
            <ul>
              {list.map((item, i) => {
                const Icon = item.icon;
                const isFirst = group === "Layout" && i === 1; // pretend "Section · 50/50" is highlighted
                return (
                  <li key={item.name}>
                    <button
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left ${
                        isFirst ? "bg-accent" : "hover:bg-accent"
                      }`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card">
                        <Icon className="h-3.5 w-3.5 text-foreground" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{item.name}</span>
                        <span className="block text-xs text-muted-foreground truncate">{item.description}</span>
                      </span>
                      {item.shortcut ? (
                        <kbd className="rounded bg-muted border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border bg-muted/30 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>
          <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono">↵</kbd> insert
        </span>
        <span>{items.length} blocks</span>
      </div>
    </div>
  );
}

// ---------- Right-rail attribute panel ----------

function AttributePanel({ block }: { block: BlockMeta }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
            {block.type === "Section" ? <LayoutGrid className="h-3.5 w-3.5" /> :
             block.type === "Card" ? <SquareDashedBottom className="h-3.5 w-3.5" /> :
             block.type === "Form" ? <FormInput className="h-3.5 w-3.5" /> :
             <FileText className="h-3.5 w-3.5" />}
          </span>
          <div>
            <p className="text-sm font-medium leading-tight">{block.type}</p>
            <p className="text-[10px] text-muted-foreground font-mono leading-tight">{block.label}</p>
          </div>
        </div>
        <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent">
          <SettingsIcon className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {block.type === "Section" ? <SectionAttributes /> : null}
        {block.type === "Card" ? <CardAttributes /> : null}
        {block.type === "Form" ? <FormAttributes /> : null}
        {block.type === "Heading" ? <HeadingAttributes /> : null}
        {block.type === "Paragraph" ? <ParagraphAttributes /> : null}
        {block.type === "Button" ? <ButtonAttributes /> : null}

        <section>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Children
          </h3>
          <ul className="space-y-1 text-xs">
            {block.id === "hero" ? (
              <>
                <ChildRow icon={LayoutGrid} label="Column · text" />
                <ChildRow icon={LayoutGrid} label="Column · icon" />
              </>
            ) : block.id === "features" ? (
              <>
                <ChildRow icon={SquareDashedBottom} label="Card · Fast" />
                <ChildRow icon={SquareDashedBottom} label="Card · Beautiful" />
                <ChildRow icon={SquareDashedBottom} label="Card · Powerful" />
              </>
            ) : block.type === "Card" ? (
              <>
                <ChildRow icon={Sparkles} label="Icon" />
                <ChildRow icon={Type} label="Heading 3" />
                <ChildRow icon={Pilcrow} label="Paragraph" />
              </>
            ) : (
              <li className="text-muted-foreground italic">No children</li>
            )}
          </ul>
        </section>

        <section className="pt-2 border-t border-border">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Actions
          </h3>
          <div className="flex flex-col gap-1.5">
            <Button variant="outline" size="sm" className="justify-start">
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm" className="justify-start">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Insert below
            </Button>
            <Button variant="outline" size="sm" className="justify-start text-destructive hover:text-destructive">
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ChildRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span>{label}</span>
      <ArrowUpRight className="ml-auto h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </li>
  );
}

// ---------- Block-type-specific attribute UIs ----------

function SectionAttributes() {
  return (
    <>
      <Field label="Layout">
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: "100", svg: <rect x="0" y="0" width="24" height="12" rx="1" fill="currentColor" /> },
            { label: "50/50", svg: (
              <>
                <rect x="0" y="0" width="11" height="12" rx="1" fill="currentColor" />
                <rect x="13" y="0" width="11" height="12" rx="1" fill="currentColor" />
              </>
            ), selected: true },
            { label: "33/33/33", svg: (
              <>
                <rect x="0" y="0" width="7" height="12" rx="1" fill="currentColor" />
                <rect x="9" y="0" width="6" height="12" rx="1" fill="currentColor" />
                <rect x="17" y="0" width="7" height="12" rx="1" fill="currentColor" />
              </>
            ) },
            { label: "67/33", svg: (
              <>
                <rect x="0" y="0" width="15" height="12" rx="1" fill="currentColor" />
                <rect x="17" y="0" width="7" height="12" rx="1" fill="currentColor" />
              </>
            ) },
            { label: "33/67", svg: (
              <>
                <rect x="0" y="0" width="7" height="12" rx="1" fill="currentColor" />
                <rect x="9" y="0" width="15" height="12" rx="1" fill="currentColor" />
              </>
            ) },
            { label: "25×4", svg: (
              <>
                <rect x="0" y="0" width="5" height="12" rx="1" fill="currentColor" />
                <rect x="6.5" y="0" width="5" height="12" rx="1" fill="currentColor" />
                <rect x="13" y="0" width="5" height="12" rx="1" fill="currentColor" />
                <rect x="19.5" y="0" width="4.5" height="12" rx="1" fill="currentColor" />
              </>
            ) },
          ].map((opt) => (
            <button
              key={opt.label}
              className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-colors ${
                opt.selected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-border hover:border-foreground/20 hover:bg-accent"
              }`}
            >
              <svg viewBox="0 0 24 12" className={`h-3 w-6 ${opt.selected ? "text-blue-600" : "text-muted-foreground"}`}>
                {opt.svg}
              </svg>
              <span className="text-[10px] font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Background">
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { name: "none", color: "transparent", border: true },
            { name: "primary", color: "var(--color-foreground)", selected: true },
            { name: "muted", color: "oklch(0.97 0 0)" },
            { name: "card", color: "oklch(1 0 0)", border: true },
            { name: "custom", color: "linear-gradient(45deg, #f59e0b, #ef4444)" },
          ].map((c) => (
            <button
              key={c.name}
              className={`flex h-9 items-center justify-center rounded-md border ${
                c.selected ? "border-blue-500 ring-1 ring-blue-200" : "border-border"
              } ${c.border ? "" : ""}`}
              style={{ background: c.color }}
              title={c.name}
            >
              {c.selected ? <Check className="h-3.5 w-3.5 text-white drop-shadow" /> : null}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Alignment">
        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          {["Left", "Center", "Right", "Justify"].map((a, i) => (
            <button
              key={a}
              className={`flex-1 h-7 text-xs ${i === 0 ? "bg-foreground text-background rounded" : "text-muted-foreground hover:bg-accent rounded"}`}
            >
              {a}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Anchor ID">
        <input
          defaultValue="hero"
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-mono"
        />
      </Field>
    </>
  );
}

function CardAttributes() {
  return (
    <>
      <Field label="Background">
        <div className="grid grid-cols-5 gap-1.5">
          {["transparent", "oklch(1 0 0)", "oklch(0.97 0 0)", "oklch(0.95 0 0)", "var(--color-foreground)"].map((c, i) => (
            <button
              key={i}
              className={`h-9 rounded-md border ${i === 1 ? "border-blue-500 ring-1 ring-blue-200" : "border-border"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>
      <Field label="Padding">
        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          {["S", "M", "L"].map((s, i) => (
            <button
              key={s}
              className={`flex-1 h-7 text-xs ${i === 1 ? "bg-foreground text-background rounded" : "text-muted-foreground hover:bg-accent rounded"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function FormAttributes() {
  return (
    <>
      <Field label="Form">
        <select className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm">
          <option>Waitlist · 124 submissions</option>
          <option>Contact · 36 submissions</option>
          <option>+ New form…</option>
        </select>
      </Field>
      <Field label="Heading">
        <input
          defaultValue="Join the waitlist"
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
      </Field>
    </>
  );
}

function HeadingAttributes() {
  return (
    <Field label="Level">
      <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
        {["H1", "H2", "H3"].map((h, i) => (
          <button
            key={h}
            className={`flex-1 h-7 text-xs font-medium ${i === 0 ? "bg-foreground text-background rounded" : "text-muted-foreground hover:bg-accent rounded"}`}
          >
            {h}
          </button>
        ))}
      </div>
    </Field>
  );
}

function ParagraphAttributes() {
  return (
    <p className="text-xs text-muted-foreground">
      Paragraphs have no attributes — type into the block to edit text. Apply inline marks (bold, italic, link) via the
      floating text toolbar.
    </p>
  );
}

function ButtonAttributes() {
  return (
    <>
      <Field label="Label">
        <input
          defaultValue="Get started"
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
        />
      </Field>
      <Field label="Link">
        <input
          defaultValue="/sign-up"
          className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-mono"
        />
      </Field>
      <Field label="Variant">
        <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
          {["Primary", "Secondary"].map((v, i) => (
            <button
              key={v}
              className={`flex-1 h-7 text-xs ${i === 0 ? "bg-foreground text-background rounded" : "text-muted-foreground hover:bg-accent rounded"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}
