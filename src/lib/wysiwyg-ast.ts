/**
 * AST utilities for the WYSIWYG editor.
 *
 * The WYSIWYG keeps the markdown body parsed as an mdast tree (with directive
 * support). All edits — insert, remove, move, update attributes — operate on
 * the tree. The tree is serialized back to markdown on save.
 *
 * Frontmatter is parsed once with gray-matter and threaded through unchanged.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";

export type AstNode = any;
export type AstRoot = { type: "root"; children: AstNode[]; [k: string]: any };
export type Path = number[];

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

function getFrontmatterBlock(source: string): string {
  const m = source.match(FRONTMATTER_RE);
  return m ? m[0] : "";
}

const parser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkDirective);

const stringifier = unified()
  .use(remarkStringify, {
    bullet: "-",
    fences: true,
    incrementListMarker: false,
    listItemIndent: "one",
  })
  .use(remarkGfm)
  .use(remarkDirective);

export function parseMarkdown(source: string): {
  tree: AstRoot;
  frontmatter: string;
} {
  const { content: body } = matter(source || "");
  const tree = parser.parse(body) as unknown as AstRoot;
  const frontmatter = getFrontmatterBlock(source);
  return { tree, frontmatter };
}

export function serializeMarkdown(tree: AstRoot, frontmatter: string): string {
  const body = stringifier.stringify(tree as any);
  if (frontmatter) {
    // Ensure exactly one blank line between frontmatter and body.
    const fm = frontmatter.endsWith("\n") ? frontmatter : frontmatter + "\n";
    return fm + body;
  }
  return body;
}

// ----- Path utilities -----

export function getNodeAtPath(tree: AstRoot, path: Path): AstNode | null {
  let cur: AstNode = tree;
  for (const i of path) {
    if (!cur || !cur.children || !cur.children[i]) return null;
    cur = cur.children[i];
  }
  return cur;
}

export function pathsEqual(a: Path | null, b: Path | null): boolean {
  if (!a || !b) return a === b;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function isAncestor(ancestor: Path, descendant: Path): boolean {
  if (ancestor.length >= descendant.length) return false;
  for (let i = 0; i < ancestor.length; i++) {
    if (ancestor[i] !== descendant[i]) return false;
  }
  return true;
}

// ----- Mutation primitives (return new trees) -----

function clone<T>(x: T): T {
  // structuredClone is available in modern Node + browsers; fall back to JSON
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}

function getParent(tree: AstRoot, path: Path): { parent: AstNode; index: number } | null {
  if (path.length === 0) return null;
  const parentPath = path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  if (!parent || !parent.children) return null;
  return { parent, index: path[path.length - 1] };
}

export function insertAt(tree: AstRoot, parentPath: Path, index: number, newNode: AstNode): AstRoot {
  const next = clone(tree);
  const parent = getNodeAtPath(next, parentPath) ?? next;
  if (!parent.children) parent.children = [];
  parent.children.splice(index, 0, clone(newNode));
  return next;
}

export function removeAt(tree: AstRoot, path: Path): AstRoot {
  if (path.length === 0) return tree;
  const next = clone(tree);
  const ref = getParent(next, path);
  if (!ref) return tree;
  ref.parent.children.splice(ref.index, 1);
  return next;
}

export function moveAt(tree: AstRoot, fromPath: Path, toParentPath: Path, toIndex: number): AstRoot {
  const node = getNodeAtPath(tree, fromPath);
  if (!node) return tree;
  let next = removeAt(tree, fromPath);
  // Adjust target index if removing affected the parent path
  let adjustedIndex = toIndex;
  if (toParentPath.length === fromPath.length - 1) {
    const sameParent = toParentPath.every((v, i) => v === fromPath[i]);
    if (sameParent && fromPath[fromPath.length - 1] < toIndex) {
      adjustedIndex -= 1;
    }
  }
  next = insertAt(next, toParentPath, adjustedIndex, node);
  return next;
}

export function updateAttrs(tree: AstRoot, path: Path, attrs: Record<string, any>): AstRoot {
  const next = clone(tree);
  const node = getNodeAtPath(next, path);
  if (!node) return tree;
  node.attributes = { ...(node.attributes || {}), ...attrs };
  // Strip empty/null/undefined attrs
  for (const k of Object.keys(node.attributes)) {
    const v = node.attributes[k];
    if (v === null || v === undefined || v === "") delete node.attributes[k];
  }
  return next;
}

export function setNodeProperty(tree: AstRoot, path: Path, key: string, value: any): AstRoot {
  const next = clone(tree);
  const node = getNodeAtPath(next, path);
  if (!node) return tree;
  node[key] = value;
  return next;
}

export function replaceChildren(tree: AstRoot, path: Path, children: AstNode[]): AstRoot {
  const next = clone(tree);
  const node = getNodeAtPath(next, path);
  if (!node) return tree;
  node.children = clone(children);
  return next;
}

export function duplicateAt(tree: AstRoot, path: Path): AstRoot {
  if (path.length === 0) return tree;
  const node = getNodeAtPath(tree, path);
  if (!node) return tree;
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  return insertAt(tree, parentPath, index + 1, node);
}

export function moveUp(tree: AstRoot, path: Path): { tree: AstRoot; newPath: Path } {
  if (path.length === 0) return { tree, newPath: path };
  const idx = path[path.length - 1];
  if (idx === 0) return { tree, newPath: path };
  const parentPath = path.slice(0, -1);
  const next = moveAt(tree, path, parentPath, idx - 1);
  return { tree: next, newPath: [...parentPath, idx - 1] };
}

export function moveDown(tree: AstRoot, path: Path): { tree: AstRoot; newPath: Path } {
  if (path.length === 0) return { tree, newPath: path };
  const parentPath = path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  if (!parent || !parent.children) return { tree, newPath: path };
  const idx = path[path.length - 1];
  if (idx >= parent.children.length - 1) return { tree, newPath: path };
  // Move to idx+2 because removeAt shifts, then insertAt at +2 lands at +1.
  const next = moveAt(tree, path, parentPath, idx + 2);
  return { tree: next, newPath: [...parentPath, idx + 1] };
}

// ----- Inline text helpers -----

/**
 * Parse a plain string as inline markdown phrasing content. Returns the children
 * of the resulting paragraph (so we get text, emphasis, strong, link, etc).
 */
export function parseInline(text: string): AstNode[] {
  if (!text) return [{ type: "text", value: "" }];
  const wrapped = parser.parse(text) as any;
  const firstPara = wrapped.children?.find((c: any) => c.type === "paragraph");
  return firstPara?.children ?? [{ type: "text", value: text }];
}

/**
 * Extract plain text from inline mdast children (for editing).
 */
export function inlineToString(children: AstNode[] | undefined): string {
  if (!children) return "";
  return children
    .map((n) => {
      if (n.type === "text" || n.type === "inlineCode") return n.value || "";
      if (n.children) return inlineToString(n.children);
      return "";
    })
    .join("");
}

// ----- Block factories (sensible defaults for new blocks) -----

export const BlockFactories = {
  section(layout = "50-50"): AstNode {
    return {
      type: "containerDirective",
      name: "section",
      attributes: { layout },
      children: [
        BlockFactories.column([BlockFactories.heading(2, "Heading"), BlockFactories.paragraph("Body text.")]),
        BlockFactories.column([BlockFactories.paragraph("Right column.")]),
      ],
    };
  },
  fullSection(): AstNode {
    return {
      type: "containerDirective",
      name: "section",
      attributes: { layout: "100" },
      children: [
        BlockFactories.column([BlockFactories.heading(2, "Section heading"), BlockFactories.paragraph("Section body.")]),
      ],
    };
  },
  threeColSection(): AstNode {
    return {
      type: "containerDirective",
      name: "section",
      attributes: { layout: "33-33-33" },
      children: [
        BlockFactories.column([BlockFactories.paragraph("First.")]),
        BlockFactories.column([BlockFactories.paragraph("Second.")]),
        BlockFactories.column([BlockFactories.paragraph("Third.")]),
      ],
    };
  },
  column(children: AstNode[] = [BlockFactories.paragraph("New column.")]): AstNode {
    return {
      type: "containerDirective",
      name: "column",
      attributes: {},
      children,
    };
  },
  card(): AstNode {
    return {
      type: "containerDirective",
      name: "card",
      attributes: {},
      children: [BlockFactories.heading(3, "Card title"), BlockFactories.paragraph("Card body.")],
    };
  },
  heading(level: 1 | 2 | 3, text = "Heading"): AstNode {
    return {
      type: "heading",
      depth: level,
      children: [{ type: "text", value: text }],
    };
  },
  paragraph(text = "Type something…"): AstNode {
    return {
      type: "paragraph",
      children: [{ type: "text", value: text }],
    };
  },
  bulletedList(): AstNode {
    return {
      type: "list",
      ordered: false,
      spread: false,
      children: [
        { type: "listItem", spread: false, children: [BlockFactories.paragraph("Item one")] },
        { type: "listItem", spread: false, children: [BlockFactories.paragraph("Item two")] },
      ],
    };
  },
  numberedList(): AstNode {
    return {
      type: "list",
      ordered: true,
      start: 1,
      spread: false,
      children: [
        { type: "listItem", spread: false, children: [BlockFactories.paragraph("Item one")] },
        { type: "listItem", spread: false, children: [BlockFactories.paragraph("Item two")] },
      ],
    };
  },
  button(label = "Get started", href = "/"): AstNode {
    return {
      type: "leafDirective",
      name: "button",
      attributes: { href, variant: "primary" },
      children: [{ type: "text", value: label }],
    };
  },
  badge(label = "New"): AstNode {
    return {
      type: "leafDirective",
      name: "badge",
      attributes: { icon: "Sparkles" },
      children: [{ type: "text", value: label }],
    };
  },
  icon(name = "Sparkles"): AstNode {
    return {
      type: "leafDirective",
      name: "icon",
      attributes: { name },
      children: [],
    };
  },
  form(id = ""): AstNode {
    return {
      type: "leafDirective",
      name: "form",
      attributes: { id },
      children: [],
    };
  },
  blogPosts(count = "3"): AstNode {
    return {
      type: "leafDirective",
      name: "blog-posts",
      attributes: { count },
      children: [],
    };
  },
  breakline(height = "2rem"): AstNode {
    return {
      type: "leafDirective",
      name: "breakline",
      attributes: { height },
      children: [],
    };
  },
  avatar(label = "JD"): AstNode {
    return {
      type: "leafDirective",
      name: "avatar",
      attributes: {},
      children: [{ type: "text", value: label }],
    };
  },
  coloredText(text = "highlight", color = "primary"): AstNode {
    return {
      type: "textDirective",
      name: "text",
      attributes: { color },
      children: [{ type: "text", value: text }],
    };
  },
};

// ----- Block-type identification -----

export type BlockKind =
  | "section"
  | "column"
  | "card"
  | "heading"
  | "paragraph"
  | "list"
  | "listItem"
  | "button"
  | "badge"
  | "icon"
  | "form"
  | "blog-posts"
  | "breakline"
  | "avatar"
  | "colored-text"
  | "unknown";

export function getBlockKind(node: AstNode): BlockKind {
  if (!node) return "unknown";
  if (node.type === "heading") return "heading";
  if (node.type === "paragraph") return "paragraph";
  if (node.type === "list") return "list";
  if (node.type === "listItem") return "listItem";
  if (node.type === "containerDirective") {
    if (node.name === "section") return "section";
    if (node.name === "column") return "column";
    if (node.name === "card") return "card";
  }
  if (node.type === "leafDirective") {
    if (node.name === "button") return "button";
    if (node.name === "badge") return "badge";
    if (node.name === "icon") return "icon";
    if (node.name === "form") return "form";
    if (node.name === "blog-posts") return "blog-posts";
    if (node.name === "breakline" || node.name === "br") return "breakline";
    if (node.name === "avatar") return "avatar";
  }
  if (node.type === "textDirective" && (node.name === "text" || node.name === "t" || node.name === "color")) {
    return "colored-text";
  }
  return "unknown";
}

export function getBlockLabel(node: AstNode): string {
  const kind = getBlockKind(node);
  switch (kind) {
    case "section":
      return `Section · ${node.attributes?.layout ?? "100"}`;
    case "column":
      return "Column";
    case "card":
      return "Card";
    case "heading":
      return `Heading ${node.depth ?? 1}`;
    case "paragraph":
      return "Paragraph";
    case "list":
      return node.ordered ? "Numbered list" : "Bulleted list";
    case "listItem":
      return "List item";
    case "button":
      return "Button";
    case "badge":
      return "Badge";
    case "icon":
      return `Icon · ${node.attributes?.name ?? "?"}`;
    case "form":
      return "Form";
    case "blog-posts":
      return "Blog posts";
    case "breakline":
      return "Spacer";
    case "avatar":
      return "Avatar";
    case "colored-text":
      return "Colored text";
    default:
      return "Block";
  }
}
