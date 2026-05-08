"use client";

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type AstNode,
  type Path,
  type AstRoot,
  getBlockKind,
  getBlockLabel,
  inlineToString,
  parseInline,
  replaceChildren,
  setNodeProperty,
  updateAttrs,
} from "@/lib/wysiwyg-ast";

type Props = {
  node: AstNode | null;
  path: Path | null;
  onMutate: (fn: (tree: AstRoot) => AstRoot) => void;
  onDuplicate: (path: Path) => void;
  onDelete: (path: Path) => void;
};

export function AttributePanel({ node, path, onMutate, onDuplicate, onDelete }: Props) {
  if (!node || !path) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">No block selected</p>
        <p className="text-xs">
          Click any block in the canvas to edit its attributes here. Click between blocks to insert
          a new one.
        </p>
      </div>
    );
  }

  const kind = getBlockKind(node);
  const label = getBlockLabel(node);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium leading-tight">{label}</p>
          <p className="text-[10px] text-muted-foreground font-mono leading-tight">
            {kind}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {kind === "section" && <SectionAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "column" && <BgAlignAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "card" && <BgAlignAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "heading" && <HeadingAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "paragraph" && <ParagraphAttrs />}
        {kind === "list" && <ListAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "listItem" && <ParagraphAttrs />}
        {kind === "button" && <ButtonAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "badge" && <BadgeAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "icon" && <IconAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "form" && <FormAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "blog-posts" && <BlogPostsAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "breakline" && <BreaklineAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "avatar" && <AvatarAttrs node={node} path={path} onMutate={onMutate} />}
        {kind === "colored-text" && <ColoredTextAttrs node={node} path={path} onMutate={onMutate} />}

        <section className="pt-4 border-t border-border">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Actions
          </h3>
          <div className="flex flex-col gap-1.5">
            <Button variant="outline" size="sm" className="justify-start" onClick={() => onDuplicate(path)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="justify-start text-destructive hover:text-destructive"
              onClick={() => onDelete(path)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

// -------- Field helpers --------

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </div>
      {children}
      {hint ? <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-1 focus:ring-foreground/20",
        mono && "font-mono text-xs",
      )}
    />
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 h-7 rounded text-xs font-medium",
            value === o.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorSwatchPicker({
  value,
  onChange,
  options,
}: {
  value: string | undefined;
  onChange: (v: string | undefined) => void;
  options: { label: string; value: string | undefined; preview?: string }[];
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex h-9 items-center justify-center rounded-md border",
            value === opt.value
              ? "border-blue-500 ring-1 ring-blue-200"
              : "border-border hover:border-foreground/30",
          )}
          style={{ background: opt.preview ?? "transparent" }}
          title={opt.label}
        >
          {value === opt.value ? <Check className="h-3.5 w-3.5 text-white drop-shadow" /> : null}
        </button>
      ))}
    </div>
  );
}

// -------- Section --------

const LAYOUT_OPTIONS = [
  { label: "100", value: "100" },
  { label: "50/50", value: "50-50" },
  { label: "33×3", value: "33-33-33" },
  { label: "67/33", value: "67-33" },
  { label: "33/67", value: "33-67" },
  { label: "25×4", value: "25-25-25-25" },
];

const BG_OPTIONS = [
  { label: "None", value: undefined, preview: "transparent" },
  { label: "primary", value: "primary", preview: "var(--color-foreground)" },
  { label: "background", value: "background", preview: "oklch(1 0 0)" },
  { label: "muted", value: "muted", preview: "oklch(0.97 0 0)" },
  { label: "card", value: "card", preview: "oklch(0.99 0 0)" },
];

function SectionAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v }));
  return (
    <>
      <Field label="Layout">
        <div className="grid grid-cols-3 gap-1.5">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => set("layout", opt.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md border p-2 text-[10px] font-medium",
                node.attributes?.layout === opt.value
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30"
                  : "border-border hover:border-foreground/20 hover:bg-accent",
              )}
            >
              <LayoutPreview layout={opt.value} active={node.attributes?.layout === opt.value} />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Background">
        <ColorSwatchPicker
          value={node.attributes?.bg}
          onChange={(v) => set("bg", v)}
          options={BG_OPTIONS}
        />
      </Field>
      <Field label="Alignment">
        <SegmentedControl
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          value={node.attributes?.align ?? "left"}
          onChange={(v) => set("align", v === "left" ? undefined : v)}
        />
      </Field>
      <Field label="Anchor ID" hint='Used for in-page navigation, e.g. <a href="#hero">'>
        <TextInput
          value={node.attributes?.id ?? ""}
          onChange={(v) => set("id", v || undefined)}
          placeholder="hero"
          mono
        />
      </Field>
    </>
  );
}

function LayoutPreview({ layout, active }: { layout: string; active?: boolean }) {
  const parts = layout.split("-").map((p) => parseInt(p));
  const total = 24;
  let x = 0;
  return (
    <svg viewBox="0 0 24 12" className={cn("h-3 w-6", active ? "text-blue-600" : "text-muted-foreground")}>
      {parts.map((p, i) => {
        const w = (p / 100) * total - 1;
        const rect = <rect key={i} x={x} y="0" width={Math.max(w, 0)} height="12" rx="1" fill="currentColor" />;
        x += (p / 100) * total + 1;
        return rect;
      })}
    </svg>
  );
}

// -------- Column / Card shared (bg + align) --------

function BgAlignAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v }));
  return (
    <>
      <Field label="Background">
        <ColorSwatchPicker
          value={node.attributes?.bg}
          onChange={(v) => set("bg", v)}
          options={BG_OPTIONS}
        />
      </Field>
      <Field label="Alignment">
        <SegmentedControl
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          value={node.attributes?.align ?? "left"}
          onChange={(v) => set("align", v === "left" ? undefined : v)}
        />
      </Field>
    </>
  );
}

// -------- Heading --------

function HeadingAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => setNodeProperty(t, path, k, v));
  return (
    <>
      <Field label="Text">
        <TextInput
          value={inlineToString(node.children)}
          onChange={(v) => onMutate((t) => replaceChildren(t, path, parseInline(v)))}
          placeholder="Heading"
        />
      </Field>
      <Field label="Level">
        <SegmentedControl
          options={[
            { label: "H1", value: "1" },
            { label: "H2", value: "2" },
            { label: "H3", value: "3" },
          ]}
          value={String(node.depth ?? 1)}
          onChange={(v) => set("depth", parseInt(v))}
        />
      </Field>
    </>
  );
}

function ParagraphAttrs() {
  return (
    <p className="text-xs text-muted-foreground">
      Paragraphs have no attributes — type into the block to edit text. Markdown syntax like
      <code className="mx-1 rounded bg-muted px-1 font-mono text-[11px]">**bold**</code>
      is preserved on save.
    </p>
  );
}

function ListAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  return (
    <Field label="Type">
      <SegmentedControl
        options={[
          { label: "Bulleted", value: "bullet" },
          { label: "Numbered", value: "ordered" },
        ]}
        value={node.ordered ? "ordered" : "bullet"}
        onChange={(v) => onMutate((t) => setNodeProperty(t, path, "ordered", v === "ordered"))}
      />
    </Field>
  );
}

// -------- Button --------

function ButtonAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v }));
  return (
    <>
      <Field label="Label">
        <TextInput
          value={inlineToString(node.children)}
          onChange={(v) => onMutate((t) => replaceChildren(t, path, parseInline(v)))}
          placeholder="Get started"
        />
      </Field>
      <Field label="Link">
        <TextInput
          value={node.attributes?.href ?? ""}
          onChange={(v) => set("href", v)}
          placeholder="/sign-up"
          mono
        />
      </Field>
      <Field label="Variant">
        <SegmentedControl
          options={[
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ]}
          value={node.attributes?.variant ?? "primary"}
          onChange={(v) => set("variant", v)}
        />
      </Field>
    </>
  );
}

// -------- Badge --------

function BadgeAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <>
      <Field label="Label">
        <TextInput
          value={inlineToString(node.children)}
          onChange={(v) => onMutate((t) => replaceChildren(t, path, parseInline(v)))}
          placeholder="New: AI-Powered Layouts"
        />
      </Field>
      <Field label="Icon (Lucide name)">
        <TextInput
          value={node.attributes?.icon ?? ""}
          onChange={(v) => set("icon", v)}
          placeholder="Sparkles"
          mono
        />
      </Field>
      <Field label="Icon color">
        <TextInput
          value={node.attributes?.iconColor ?? ""}
          onChange={(v) => set("iconColor", v)}
          placeholder="#f59e0b or 'primary'"
          mono
        />
      </Field>
      <Field label="Link URL">
        <TextInput
          value={node.attributes?.link ?? ""}
          onChange={(v) => set("link", v)}
          placeholder="/whats-new"
          mono
        />
      </Field>
      <Field label="Link label">
        <TextInput
          value={node.attributes?.linkLabel ?? ""}
          onChange={(v) => set("linkLabel", v)}
          placeholder="Read more"
        />
      </Field>
      <Field label="Variant">
        <SegmentedControl
          options={[
            { label: "Default", value: "default" },
            { label: "Subtle", value: "subtle" },
          ]}
          value={node.attributes?.variant ?? "default"}
          onChange={(v) => set("variant", v === "default" ? undefined : v)}
        />
      </Field>
    </>
  );
}

// -------- Icon --------

function IconAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <>
      <Field label="Icon name (Lucide)">
        <TextInput
          value={node.attributes?.name ?? ""}
          onChange={(v) => set("name", v)}
          placeholder="Rocket"
          mono
        />
      </Field>
      <Field label="Color (theme token)">
        <TextInput
          value={node.attributes?.color ?? ""}
          onChange={(v) => set("color", v)}
          placeholder="primary"
          mono
        />
      </Field>
    </>
  );
}

// -------- Form --------

function FormAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <Field label="Form ID" hint="Find this on the Forms page next to each form.">
      <TextInput
        value={node.attributes?.id ?? ""}
        onChange={(v) => set("id", v)}
        placeholder="cmkqx..."
        mono
      />
    </Field>
  );
}

// -------- Blog posts --------

function BlogPostsAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <Field label="Number of posts">
      <TextInput
        value={node.attributes?.count ?? "3"}
        onChange={(v) => set("count", v)}
        placeholder="3"
        mono
      />
    </Field>
  );
}

// -------- Breakline --------

function BreaklineAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <Field label="Height" hint="CSS units, e.g. 2rem, 32px, 8vh.">
      <TextInput
        value={node.attributes?.height ?? "2rem"}
        onChange={(v) => set("height", v)}
        placeholder="2rem"
        mono
      />
    </Field>
  );
}

// -------- Avatar --------

function AvatarAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  return (
    <Field label="Initials">
      <TextInput
        value={inlineToString(node.children)}
        onChange={(v) => onMutate((t) => replaceChildren(t, path, parseInline(v)))}
        placeholder="JD"
      />
    </Field>
  );
}

// -------- Colored text --------

function ColoredTextAttrs({ node, path, onMutate }: { node: AstNode; path: Path; onMutate: Props["onMutate"] }) {
  const set = (k: string, v: any) => onMutate((t) => updateAttrs(t, path, { [k]: v || undefined }));
  return (
    <>
      <Field label="Text">
        <TextInput
          value={inlineToString(node.children)}
          onChange={(v) => onMutate((t) => replaceChildren(t, path, parseInline(v)))}
        />
      </Field>
      <Field label="Color (theme token)">
        <TextInput
          value={node.attributes?.color ?? ""}
          onChange={(v) => set("color", v)}
          placeholder="primary"
          mono
        />
      </Field>
    </>
  );
}
