"use client";

import { ReactNode, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type AstNode,
  type Path,
  type AstRoot,
  getBlockKind,
  getBlockLabel,
  inlineToString,
  parseInline,
  pathsEqual,
  replaceChildren,
} from "@/lib/wysiwyg-ast";
import { ActionBar } from "./ActionBar";
import { InsertAffordance } from "./InsertAffordance";

// -------- Inline rendering --------

function InlineChildren({ nodes }: { nodes: AstNode[] | undefined }) {
  if (!nodes) return null;
  return (
    <>
      {nodes.map((n, i) => {
        if (n.type === "text") return <span key={i}>{n.value}</span>;
        if (n.type === "strong") return <strong key={i}><InlineChildren nodes={n.children} /></strong>;
        if (n.type === "emphasis") return <em key={i}><InlineChildren nodes={n.children} /></em>;
        if (n.type === "inlineCode") return <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">{n.value}</code>;
        if (n.type === "link") return (
          <a key={i} href={n.url} className="text-primary underline-offset-2 hover:underline">
            <InlineChildren nodes={n.children} />
          </a>
        );
        if (n.type === "break") return <br key={i} />;
        if (n.type === "image") return <img key={i} src={n.url} alt={n.alt ?? ""} className="max-w-full" />;
        if (n.type === "textDirective" && n.name === "text") {
          const color = n.attributes?.color;
          return (
            <span key={i} style={color ? { color: `var(--color-${color})` } : undefined}>
              <InlineChildren nodes={n.children} />
            </span>
          );
        }
        // Fallback for unknown inline nodes
        if (n.children) return <span key={i}><InlineChildren nodes={n.children} /></span>;
        return null;
      })}
    </>
  );
}

// -------- Block context --------

export type BlockContext = {
  selectedPath: Path | null;
  onSelect: (path: Path | null) => void;
  onMutate: (fn: (tree: AstRoot) => AstRoot) => void;
  onMutateAndSelect: (fn: (tree: AstRoot) => { tree: AstRoot; newPath: Path }) => void;
  onInsertAt: (parentPath: Path, index: number) => void; // opens slash menu
  onMoveUp: (path: Path) => void;
  onMoveDown: (path: Path) => void;
  onDuplicate: (path: Path) => void;
  onDelete: (path: Path) => void;
};

// -------- BlockShell: wraps a rendered block with selection chrome --------

function BlockShell({
  path,
  ctx,
  className,
  innerClassName,
  children,
  showActionBar = true,
  label,
}: {
  path: Path;
  ctx: BlockContext;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  showActionBar?: boolean;
  label?: string;
}) {
  const selected = pathsEqual(ctx.selectedPath, path);

  return (
    <div className={cn("group relative", className)}>
      {selected && showActionBar ? (
        <ActionBar path={path} ctx={ctx} label={label} />
      ) : null}
      <div
        onClick={(e) => {
          e.stopPropagation();
          ctx.onSelect(path);
        }}
        className={cn(
          "relative cursor-pointer rounded-md transition-all",
          selected
            ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-background"
            : "hover:ring-1 hover:ring-foreground/15 hover:ring-offset-2 hover:ring-offset-background",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

// -------- Editable text wrapper for headings/paragraphs/listItems --------
//
// Always contentEditable. Selection is handled via mousedown so the browser's
// natural caret-placement on click lands at the user's click position. Selection
// updates on focus too (in case of keyboard nav).

function EditableText({
  node,
  path,
  ctx,
  asTag,
  className,
}: {
  node: AstNode;
  path: Path;
  ctx: BlockContext;
  asTag: keyof React.JSX.IntrinsicElements;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  // Sync DOM textContent with AST when not focused (e.g. after a remote mutation)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (document.activeElement === el) return;
    const expected = inlineToString(node.children);
    if (el.textContent !== expected) {
      el.textContent = expected;
    }
  }, [node]);

  const Tag = asTag as any;
  return (
    <Tag
      ref={ref as any}
      contentEditable={"plaintext-only" as any}
      suppressContentEditableWarning
      onMouseDown={(e: React.MouseEvent) => {
        // Select on mousedown so the action bar shows up. Don't stopPropagation
        // — we need React state to update, but the browser still gets to place
        // the caret at the click position via the natural click handler.
        ctx.onSelect(path);
      }}
      onFocus={() => ctx.onSelect(path)}
      onBlur={(e: React.FocusEvent) => {
        const newText = (e.currentTarget as HTMLElement).innerText.replace(/\r?\n+/g, " ").trimEnd();
        const oldText = inlineToString(node.children);
        if (newText === oldText) return;
        const newChildren = parseInline(newText);
        ctx.onMutate((tree) => replaceChildren(tree, path, newChildren));
      }}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (asTag === "h1" || asTag === "h2" || asTag === "h3")) {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        } else if (e.key === "Escape") {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
      className={cn(className, "outline-none cursor-text")}
    >
      <InlineChildren nodes={node.children} />
    </Tag>
  );
}

// -------- Container blocks --------

// Always show columns side-by-side in the editor regardless of viewport. We
// size for the canvas (max-w-3xl), not the viewport — `md:` would never
// activate when canvas equals the breakpoint.
const LAYOUT_TO_GRID: Record<string, string> = {
  "100": "grid-cols-1",
  "50-50": "grid-cols-2",
  "33-67": "grid-cols-[1fr_2fr]",
  "67-33": "grid-cols-[2fr_1fr]",
  "33-33-33": "grid-cols-3",
  "25-25-25-25": "grid-cols-4",
  "60-40": "grid-cols-[3fr_2fr]",
  "40-60": "grid-cols-[2fr_3fr]",
  "30-70": "grid-cols-[3fr_7fr]",
  "70-30": "grid-cols-[7fr_3fr]",
  "20-60-20": "grid-cols-[1fr_3fr_1fr]",
};

function SectionBlock({ node, path, ctx, children }: { node: AstNode; path: Path; ctx: BlockContext; children: ReactNode }) {
  const layout = node.attributes?.layout ?? "100";
  const bg = node.attributes?.bg;
  const align = node.attributes?.align;
  const id = node.attributes?.id;
  const gridClass = LAYOUT_TO_GRID[layout] ?? LAYOUT_TO_GRID["100"];
  const isEmpty = !node.children || node.children.length === 0;
  return (
    <BlockShell path={path} ctx={ctx} label={`Section · ${layout}`}>
      <section
        id={id}
        className={cn(
          "rounded-md p-6",
          align === "center" && "text-center",
          align === "right" && "text-right",
          !bg && (isEmpty ? "bg-muted/20 border border-dashed border-border" : "bg-transparent"),
        )}
        style={bg ? { backgroundColor: `var(--color-${bg}, var(--color-muted))` } : undefined}
      >
        <div className={cn("grid gap-4", gridClass)}>{children}</div>
      </section>
    </BlockShell>
  );
}

function ColumnBlock({ node, path, ctx, children }: { node: AstNode; path: Path; ctx: BlockContext; children: ReactNode }) {
  const align = node.attributes?.align;
  const bg = node.attributes?.bg;
  const isEmpty = !node.children || node.children.length === 0;
  return (
    <BlockShell path={path} ctx={ctx} label="Column">
      <div
        className={cn(
          "rounded-md p-2 min-h-[40px]",
          align === "center" && "text-center",
          align === "right" && "text-right",
          !bg && (isEmpty ? "bg-card/40 border border-dashed border-border/60" : "bg-transparent"),
        )}
        style={bg ? { backgroundColor: `var(--color-${bg}, var(--color-muted))` } : undefined}
      >
        <div
          className={cn(
            "space-y-2 flex flex-col",
            align === "center" && "items-center",
            align === "right" && "items-end",
          )}
        >
          {children}
        </div>
      </div>
    </BlockShell>
  );
}

function CardBlock({ node, path, ctx, children }: { node: AstNode; path: Path; ctx: BlockContext; children: ReactNode }) {
  const align = node.attributes?.align;
  const bg = node.attributes?.bg;
  return (
    <BlockShell path={path} ctx={ctx} label="Card">
      <div
        className={cn(
          "rounded-xl border border-border bg-card p-5 shadow-sm",
          align === "center" && "text-center",
          align === "right" && "text-right",
        )}
        style={bg ? { backgroundColor: `var(--color-${bg}, var(--color-card))` } : undefined}
      >
        <div className="space-y-2">{children}</div>
      </div>
    </BlockShell>
  );
}

// Heading & paragraph styles match the public renderer in markdown-renderer.tsx
// so the WYSIWYG view is a faithful preview of the published page.
function HeadingBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const depth = (node.depth ?? 1) as 1 | 2 | 3;
  const tagMap = { 1: "h1", 2: "h2", 3: "h3" } as const;
  const sizeMap = {
    1: "text-4xl sm:text-5xl font-extrabold tracking-tight mb-4",
    2: "text-base font-semibold leading-7 text-primary mb-2",
    3: "text-2xl sm:text-3xl font-bold tracking-tight mb-3",
  } as const;

  return (
    <BlockShell path={path} ctx={ctx} label={`Heading ${depth}`}>
      <EditableText
        node={node}
        path={path}
        ctx={ctx}
        asTag={tagMap[depth]}
        className={cn(sizeMap[depth], "px-1")}
      />
    </BlockShell>
  );
}

function ParagraphBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  return (
    <BlockShell path={path} ctx={ctx} label="Paragraph">
      <EditableText
        node={node}
        path={path}
        ctx={ctx}
        asTag="p"
        className="text-base leading-7 text-muted-foreground px-1"
      />
    </BlockShell>
  );
}

function ListBlock({ node, path, ctx, children }: { node: AstNode; path: Path; ctx: BlockContext; children: ReactNode }) {
  const Tag = (node.ordered ? "ol" : "ul") as any;
  return (
    <BlockShell path={path} ctx={ctx}>
      <Tag className={cn("space-y-1 px-1", node.ordered ? "list-decimal" : "list-disc", "ml-5")}>
        {children}
      </Tag>
    </BlockShell>
  );
}

function ListItemBlock({ node, path, ctx, children }: { node: AstNode; path: Path; ctx: BlockContext; children: ReactNode }) {
  // listItem children are usually a single paragraph; we render paragraph children
  // inside the <li> directly. The BlockRenderer recursion handles this.
  return (
    <BlockShell path={path} ctx={ctx} showActionBar={false}>
      <li className="text-sm">{children}</li>
    </BlockShell>
  );
}

// -------- Leaf blocks --------

function ButtonBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const label = inlineToString(node.children) || "Button";
  const variant = node.attributes?.variant ?? "primary";
  const isPrimary = variant !== "secondary";
  return (
    <BlockShell path={path} ctx={ctx} className="inline-block" label="Button">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
          isPrimary
            ? "bg-foreground text-background"
            : "border border-foreground bg-background text-foreground",
        )}
      >
        {label}
      </span>
    </BlockShell>
  );
}

function BadgeBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const label = inlineToString(node.children) || "Badge";
  const iconName = node.attributes?.icon;
  const iconColor = node.attributes?.iconColor;
  const link = node.attributes?.link;
  const linkLabel = node.attributes?.linkLabel ?? "Read more";
  const variant = node.attributes?.variant;

  const Icon = iconName ? resolveLucideIcon(iconName) : null;
  const isSubtle = variant === "subtle";

  return (
    <BlockShell path={path} ctx={ctx} className="inline-block">
      <span
        className={cn(
          "inline-flex items-center gap-3 rounded-full px-4 py-1.5 text-sm",
          isSubtle ? "bg-muted/40 border border-transparent" : "bg-card border border-border shadow-sm",
        )}
      >
        {Icon ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{
              backgroundColor: iconColor || "var(--color-amber, #fef3c7)",
              color: iconColor ? "white" : "#b45309",
            }}
          >
            <Icon className="h-3 w-3" />
          </span>
        ) : null}
        <span>{label}</span>
        {link ? (
          <span className="ml-1 inline-flex items-center gap-0.5 font-medium text-primary">
            {linkLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </span>
    </BlockShell>
  );
}

function IconBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const name = node.attributes?.name ?? "Sparkles";
  const Icon = resolveLucideIcon(name);
  return (
    <BlockShell path={path} ctx={ctx} className="inline-block">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
        {Icon ? <Icon className="h-5 w-5" /> : <span className="text-[10px]">?</span>}
      </span>
    </BlockShell>
  );
}

function FormBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const id = node.attributes?.id;
  return (
    <BlockShell path={path} ctx={ctx}>
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          {(() => {
            const Form = LucideIcons.FormInput;
            return <Form className="h-4 w-4 text-muted-foreground" />;
          })()}
        </div>
        <p className="mt-2 text-sm font-medium">Form</p>
        <p className="mt-0.5 text-xs text-muted-foreground font-mono">
          {id ? `id="${id}"` : "no form selected"}
        </p>
      </div>
    </BlockShell>
  );
}

function BlogPostsBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const count = node.attributes?.count ?? "3";
  return (
    <BlockShell path={path} ctx={ctx}>
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Blog posts</p>
        <p className="mt-1 text-sm">Recent {count} posts will render here on the public site.</p>
      </div>
    </BlockShell>
  );
}

function BreaklineBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const height = node.attributes?.height ?? node.attributes?.h ?? "1rem";
  const selected = pathsEqual(ctx.selectedPath, path);
  // Render as a thin, subtle line — only show the label when hovered or selected.
  return (
    <BlockShell path={path} ctx={ctx} label={`Spacer · ${height}`}>
      <div
        className={cn(
          "group/br relative w-full flex items-center",
          selected && "bg-blue-50/40",
        )}
        style={{ height }}
      >
        <span className="h-px w-full bg-border/50" />
        <span className="absolute left-1/2 -translate-x-1/2 rounded bg-background border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground opacity-0 group-hover/br:opacity-100 transition-opacity">
          spacer · {height}
        </span>
      </div>
    </BlockShell>
  );
}

function AvatarBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  const label = inlineToString(node.children) || "JD";
  return (
    <BlockShell path={path} ctx={ctx} className="inline-block">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-foreground">
        {label}
      </span>
    </BlockShell>
  );
}

function ColoredTextBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  // textDirectives are inline; we render them inline but still allow click selection
  const color = node.attributes?.color;
  const text = inlineToString(node.children);
  return (
    <BlockShell path={path} ctx={ctx} className="inline-block">
      <span style={color ? { color: `var(--color-${color})` } : undefined}>{text}</span>
    </BlockShell>
  );
}

function UnknownBlock({ node, path, ctx }: { node: AstNode; path: Path; ctx: BlockContext }) {
  // Compact pill so unrecognized directives don't blow up the layout.
  return (
    <BlockShell path={path} ctx={ctx} className="inline-block" label={node.name ?? node.type}>
      <span className="inline-flex items-center rounded border border-dashed border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
        {node.type}
        {node.name ? ` · ${node.name}` : ""}
      </span>
    </BlockShell>
  );
}

// -------- Lucide resolver --------

function toPascalCase(str: string) {
  return str.replace(/(^\w|-\w)/g, (m) => m.replace(/-/, "").toUpperCase());
}
function resolveLucideIcon(name?: string): any {
  if (!name) return null;
  const all = LucideIcons as any;
  return all[name] ?? all[toPascalCase(name)] ?? all[`${toPascalCase(name)}Icon`] ?? null;
}

// -------- Main BlockRenderer --------

export function BlockRenderer({
  node,
  path,
  ctx,
  isRoot = false,
}: {
  node: AstNode;
  path: Path;
  ctx: BlockContext;
  isRoot?: boolean;
}) {
  const kind = getBlockKind(node);

  // Container blocks recurse to render children
  const renderChildren = (childContainerPath: Path = path) => {
    if (!node.children) return null;
    return (
      <>
        {/* InsertAffordance before first child */}
        <InsertAffordance
          onClick={() => ctx.onInsertAt(childContainerPath, 0)}
          compact
        />
        {node.children.map((child: AstNode, i: number) => (
          <div key={i}>
            <BlockRenderer node={child} path={[...childContainerPath, i]} ctx={ctx} />
            <InsertAffordance
              onClick={() => ctx.onInsertAt(childContainerPath, i + 1)}
              compact
            />
          </div>
        ))}
      </>
    );
  };

  if (isRoot) {
    return <>{renderChildren(path)}</>;
  }

  switch (kind) {
    case "section":
      // Sections are grid containers — render children directly as grid items.
      // Inserting between columns is done via the right-rail (or by changing
      // the layout attribute), not via inline "+" affordances which would
      // become rogue grid items.
      return (
        <SectionBlock node={node} path={path} ctx={ctx}>
          {(node.children || []).map((child: AstNode, i: number) => (
            <BlockRenderer key={i} node={child} path={[...path, i]} ctx={ctx} />
          ))}
        </SectionBlock>
      );
    case "column":
      return <ColumnBlock node={node} path={path} ctx={ctx}>{renderChildrenInline(node, path, ctx)}</ColumnBlock>;
    case "card":
      return <CardBlock node={node} path={path} ctx={ctx}>{renderChildrenInline(node, path, ctx)}</CardBlock>;
    case "heading":
      return <HeadingBlock node={node} path={path} ctx={ctx} />;
    case "paragraph":
      return <ParagraphBlock node={node} path={path} ctx={ctx} />;
    case "list":
      // Lists need <li> as direct children of <ul>/<ol>; wrapping in <div>
      // breaks marker rendering.
      return (
        <ListBlock node={node} path={path} ctx={ctx}>
          {(node.children || []).map((child: AstNode, i: number) => (
            <BlockRenderer key={i} node={child} path={[...path, i]} ctx={ctx} />
          ))}
        </ListBlock>
      );
    case "listItem":
      return (
        <ListItemBlock node={node} path={path} ctx={ctx}>
          {(node.children || []).map((child: AstNode, i: number) => (
            <BlockRenderer key={i} node={child} path={[...path, i]} ctx={ctx} />
          ))}
        </ListItemBlock>
      );
    case "button":
      return <ButtonBlock node={node} path={path} ctx={ctx} />;
    case "badge":
      return <BadgeBlock node={node} path={path} ctx={ctx} />;
    case "icon":
      return <IconBlock node={node} path={path} ctx={ctx} />;
    case "form":
      return <FormBlock node={node} path={path} ctx={ctx} />;
    case "blog-posts":
      return <BlogPostsBlock node={node} path={path} ctx={ctx} />;
    case "breakline":
      return <BreaklineBlock node={node} path={path} ctx={ctx} />;
    case "avatar":
      return <AvatarBlock node={node} path={path} ctx={ctx} />;
    case "colored-text":
      return <ColoredTextBlock node={node} path={path} ctx={ctx} />;
    default:
      return <UnknownBlock node={node} path={path} ctx={ctx} />;
  }
}

function renderChildrenInline(node: AstNode, path: Path, ctx: BlockContext) {
  if (!node.children || node.children.length === 0) {
    return (
      <InsertAffordance
        compact
        onClick={() => ctx.onInsertAt(path, 0)}
        emptyHint
      />
    );
  }
  return (
    <>
      <InsertAffordance compact onClick={() => ctx.onInsertAt(path, 0)} />
      {node.children.map((child: AstNode, i: number) => (
        <div key={i}>
          <BlockRenderer node={child} path={[...path, i]} ctx={ctx} />
          <InsertAffordance compact onClick={() => ctx.onInsertAt(path, i + 1)} />
        </div>
      ))}
    </>
  );
}

// Re-export for convenience
export { getBlockLabel };
