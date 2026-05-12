/**
 * Page-builder agent tools.
 *
 * Factory pattern: `makeTools(ctx)` so the agent's context (userId, siteId,
 * pageId) is closed over each tool's `execute`. The HTTP route resolves Clerk
 * → userId; the test script provides userId directly.
 *
 * Tools are intentionally few-but-rich: one `page_editBlocks` with typed ops
 * beats a dozen micro-tools. Anthropic "Writing tools for agents".
 */

import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  type AstNode,
  type AstRoot,
  duplicateAt,
  getBlockKind,
  getBlockLabel,
  getNodeAtPath,
  inlineToString,
  insertAt,
  moveAt,
  parseMarkdown,
  removeAt,
  replaceChildren,
  serializeMarkdown,
  setNodeProperty,
  updateAttrs,
} from "@/lib/wysiwyg-ast";
import { getBrandVoice, getRecipe, type PageRecipe } from "./recipes";

export type AgentContext = {
  userId: string; // db user id (NOT clerkId)
  siteId: string;
  pageId: string;
};

// ---------- Path/blockId helpers ----------

function pathToId(path: number[]): string {
  return path.length === 0 ? "root" : path.join(".");
}

function idToPath(id: string): number[] {
  if (id === "root" || id === "") return [];
  return id.split(".").map((n) => parseInt(n, 10));
}

// ---------- Block summary ----------

function summarizeNode(node: AstNode): string {
  const kind = getBlockKind(node);
  if (kind === "heading" || kind === "paragraph") {
    const text = inlineToString(node.children).trim();
    return text.length > 80 ? text.slice(0, 80) + "…" : text;
  }
  if (kind === "button" || kind === "badge") {
    const label = inlineToString(node.children).trim();
    return label || "(empty)";
  }
  if (kind === "section") return `${node.attributes?.layout ?? "100"} layout`;
  if (kind === "card" || kind === "column") {
    const childCount = (node.children || []).length;
    return `${childCount} child${childCount === 1 ? "" : "ren"}`;
  }
  if (kind === "icon") return node.attributes?.name ?? "(no name)";
  if (kind === "form") return node.attributes?.id ? `id=${node.attributes.id}` : "(no id)";
  if (kind === "blog-posts") return `count=${node.attributes?.count ?? "3"}`;
  if (kind === "breakline") return `height=${node.attributes?.height ?? "default"}`;
  return "";
}

function flattenBlocks(tree: AstRoot): Array<{
  id: string;
  path: number[];
  kind: string;
  label: string;
  summary: string;
  attributes: Record<string, any>;
  childCount: number;
  depth: number;
}> {
  const out: any[] = [];
  function walk(node: AstNode, path: number[], depth: number) {
    if (path.length > 0) {
      out.push({
        id: pathToId(path),
        path,
        kind: getBlockKind(node),
        label: getBlockLabel(node),
        summary: summarizeNode(node),
        attributes: node.attributes ?? {},
        childCount: (node.children || []).length,
        depth,
      });
    }
    // Recurse into containers (section/column/card/list/listItem)
    const kind = getBlockKind(node);
    const isContainer =
      kind === "section" ||
      kind === "column" ||
      kind === "card" ||
      kind === "list" ||
      kind === "listItem" ||
      path.length === 0;
    if (isContainer && node.children) {
      node.children.forEach((child: AstNode, i: number) => {
        walk(child, [...path, i], depth + 1);
      });
    }
  }
  walk(tree, [], 0);
  return out;
}

// ---------- DB helpers ----------

async function loadPage(ctx: AgentContext) {
  const page = await prisma.page.findUnique({
    where: { id: ctx.pageId },
    include: { site: { select: { id: true, userId: true } } },
  });
  if (!page) throw new Error("Page not found");
  if (page.site.userId !== ctx.userId) throw new Error("Unauthorized");
  if (page.siteId !== ctx.siteId) throw new Error("Page does not belong to this site");
  return page;
}

async function savePageContent(ctx: AgentContext, content: string) {
  await prisma.page.update({
    where: { id: ctx.pageId },
    data: { content },
  });
}

// ---------- Tools ----------

export function makeTools(ctx: AgentContext) {
  return {
    /**
     * Read site context, theme, and other pages. Call this BEFORE generating a
     * new page so the output matches the brand.
     */
    page_getContext: tool({
      description:
        "Read the current site context — name, theme, fonts, the user's other pages, and the current page metadata. Call this BEFORE generating new content from scratch so the page matches the brand. No input needed.",
      inputSchema: z.object({}),
      execute: async () => {
        const site = await prisma.site.findUnique({
          where: { id: ctx.siteId },
          include: {
            pages: { select: { id: true, title: true, slug: true } },
            blogPosts: {
              where: { published: true },
              orderBy: { publishedAt: "desc" },
              take: 5,
              select: { title: true, slug: true, publishedAt: true },
            },
          },
        });
        if (!site || site.userId !== ctx.userId) throw new Error("Site not found");
        const page = site.pages.find((p) => p.id === ctx.pageId);
        const isHome = site.homePageId === ctx.pageId;
        return {
          site: {
            name: site.name,
            description: site.description,
            subdomain: site.subdomain,
            customDomain: site.customDomain,
            theme: (site.settings as any)?.theme ?? null,
          },
          currentPage: page
            ? {
                id: page.id,
                title: page.title,
                slug: page.slug,
                isHome,
              }
            : null,
          otherPages: site.pages.filter((p) => p.id !== ctx.pageId),
          recentBlogPosts: site.blogPosts,
        };
      },
    }),

    /**
     * Read a structural summary of the current page — block IDs, types,
     * one-line summaries. Use this to orient before editing. For full markdown
     * of a specific block, call page_expandBlock.
     */
    page_read: tool({
      description:
        "Read a structural summary of the current page — list of all block IDs, their types, and one-line summaries. Use this to orient before editing. For the full markdown of a specific block, call page_expandBlock.",
      inputSchema: z.object({}),
      execute: async () => {
        const page = await loadPage(ctx);
        const { tree, frontmatter } = parseMarkdown(page.content);
        const blocks = flattenBlocks(tree);
        return {
          frontmatter: frontmatter || "(none)",
          blockCount: blocks.length,
          blocks,
        };
      },
    }),

    /**
     * Get the full markdown for one specific block by ID.
     */
    page_expandBlock: tool({
      description:
        "Get the full markdown for one specific block. Use sparingly — prefer page_read for orientation.",
      inputSchema: z.object({
        blockId: z.string().describe("Block ID from page_read, e.g. '0' or '0.1.2'"),
      }),
      execute: async ({ blockId }) => {
        const page = await loadPage(ctx);
        const { tree } = parseMarkdown(page.content);
        const path = idToPath(blockId);
        const node = getNodeAtPath(tree, path);
        if (!node) return { error: `No block at id "${blockId}"` };
        // Serialize this single subtree
        const subtree: AstRoot = { type: "root", children: [node] };
        const markdown = serializeMarkdown(subtree, "");
        return { blockId, kind: getBlockKind(node), markdown };
      },
    }),

    /**
     * Apply typed operations to the page. The workhorse write tool.
     */
    page_editBlocks: tool({
      description: `Apply a typed list of operations to the current page. Operations are applied in order. Returns the updated block list.

Operation types:
- "insert": add a new block under a parent at a specific index. parentId="root" for top-level.
- "replace": swap an existing block's content with new markdown.
- "updateAttrs": change attributes of an existing block (e.g. layout="50-50", bg="primary").
- "delete": remove a block.
- "move": move a block to a new parent + index.

Examples:
- Insert a new heading at the top: { type: "insert", parentId: "root", index: 0, markdown: "# Welcome" }
- Change a section's layout: { type: "updateAttrs", blockId: "0", attrs: { layout: "50-50" } }
- Replace a paragraph: { type: "replace", blockId: "0.1", markdown: "New paragraph text." }`,
      inputSchema: z.object({
        ops: z
          .array(
            z.discriminatedUnion("type", [
              z.object({
                type: z.literal("insert"),
                parentId: z.string().describe("Parent block ID; 'root' for top-level"),
                index: z.number().int().min(0),
                markdown: z.string().describe("Markdown for the new block (a single block)"),
              }),
              z.object({
                type: z.literal("replace"),
                blockId: z.string(),
                markdown: z.string(),
              }),
              z.object({
                type: z.literal("updateAttrs"),
                blockId: z.string(),
                attrs: z.record(z.string(), z.any()),
              }),
              z.object({
                type: z.literal("delete"),
                blockId: z.string(),
              }),
              z.object({
                type: z.literal("move"),
                blockId: z.string(),
                parentId: z.string(),
                index: z.number().int().min(0),
              }),
            ]),
          )
          .min(1)
          .max(20),
        reason: z.string().describe("One-sentence description of what this batch does"),
      }),
      execute: async ({ ops, reason }) => {
        try {
          const page = await loadPage(ctx);
          let { tree, frontmatter } = parseMarkdown(page.content);

          for (const op of ops) {
            if (op.type === "insert") {
              const parentPath = idToPath(op.parentId);
              const { tree: subtree } = parseMarkdown(op.markdown);
              const newNode = subtree.children[0];
              if (!newNode) {
                return { applied: false, error: `insert op produced no block from markdown: "${op.markdown.slice(0, 60)}"` };
              }
              tree = insertAt(tree, parentPath, op.index, newNode);
            } else if (op.type === "replace") {
              const path = idToPath(op.blockId);
              const node = getNodeAtPath(tree, path);
              if (!node) return { applied: false, error: `block id "${op.blockId}" not found` };
              const { tree: subtree } = parseMarkdown(op.markdown);
              const newNode = subtree.children[0];
              if (!newNode) {
                return { applied: false, error: `replace produced no block from markdown` };
              }
              const parentPath = path.slice(0, -1);
              const idx = path[path.length - 1];
              tree = removeAt(tree, path);
              tree = insertAt(tree, parentPath, idx, newNode);
            } else if (op.type === "updateAttrs") {
              tree = updateAttrs(tree, idToPath(op.blockId), op.attrs);
            } else if (op.type === "delete") {
              tree = removeAt(tree, idToPath(op.blockId));
            } else if (op.type === "move") {
              tree = moveAt(tree, idToPath(op.blockId), idToPath(op.parentId), op.index);
            }
          }

          const newSource = serializeMarkdown(tree, frontmatter);
          await savePageContent(ctx, newSource);
          const blocks = flattenBlocks(tree);
          return { applied: true, reason, blockCount: blocks.length, blocks };
        } catch (e: any) {
          return { applied: false, error: `Edit failed: ${e?.message ?? String(e)}` };
        }
      },
    }),

    /**
     * Replace the entire page with new markdown. Use for "build from scratch".
     */
    page_replaceWhole: tool({
      description: `Replace the entire page body with new markdown (frontmatter + body). Use this when building a page from scratch, or when the user explicitly asks for a full rewrite.

The markdown should be a complete page including:
- YAML frontmatter at the top (---title, description---)
- Following the structural recipe from style_getRecipe
- Properly nested directives (every ::::section closes with ::::, every :::column closes with :::)`,
      inputSchema: z.object({
        markdown: z
          .string()
          .min(100)
          .describe("The complete page markdown including frontmatter"),
        reason: z.string().describe("One-sentence description of what was built"),
      }),
      execute: async ({ markdown, reason }) => {
        try {
          // Verify it parses without throwing
          const { tree, frontmatter } = parseMarkdown(markdown);
          const blocks = flattenBlocks(tree);
          if (blocks.length < 3) {
            return {
              applied: false,
              error: `Page only produced ${blocks.length} blocks. Pages should have at least 7 sections following the recipe. Check that your ::::section directives are properly closed with matching ::::.`,
            };
          }
          await savePageContent(ctx, markdown);
          return {
            applied: true,
            reason,
            blockCount: blocks.length,
            topLevelBlocks: blocks.filter((b) => b.depth === 1).map((b) => ({ id: b.id, kind: b.kind, label: b.label })),
          };
        } catch (e: any) {
          return { applied: false, error: `Failed to apply: ${e?.message ?? String(e)}` };
        }
      },
    }),

    /**
     * Search the user's media library.
     */
    media_search: tool({
      description:
        "Search the user's media library by filename. Returns up to 10 results with URLs you can use in markdown image syntax: ![alt](url).",
      inputSchema: z.object({
        query: z.string().optional().describe("Search filename or alt text; omit for all"),
      }),
      execute: async ({ query }) => {
        const where: any = { siteId: ctx.siteId };
        if (query) where.filename = { contains: query, mode: "insensitive" };
        const assets = await prisma.asset.findMany({
          where,
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            filename: true,
            url: true,
            mimeType: true,
            size: true,
            alt: true,
          },
        });
        return { count: assets.length, results: assets };
      },
    }),

    /**
     * List forms on this site.
     */
    forms_list: tool({
      description: "List the user's forms on this site. Use the form ID in ::form{id=\"...\"} directives.",
      inputSchema: z.object({}),
      execute: async () => {
        const forms = await prisma.form.findMany({
          where: { siteId: ctx.siteId },
          select: {
            id: true,
            name: true,
            type: true,
            fields: true,
            _count: { select: { leads: true } },
          },
        });
        return {
          count: forms.length,
          forms: forms.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            fieldCount: Array.isArray(f.fields) ? (f.fields as any[]).length : 0,
            submissions: f._count.leads,
          })),
        };
      },
    }),

    /**
     * Get the structural recipe for a page type.
     */
    style_getRecipe: tool({
      description: `Get the canonical structural recipe for a page type. Returns section sequence, layout choices, copy-length targets, brand voice rules, and anti-patterns. Call this FIRST before generating any page from scratch.

Recommended pageType values: "home", "pricing".`,
      inputSchema: z.object({
        pageType: z.string().describe('Page type: "home", "pricing", "features", "customers", "about". Defaults to "home".'),
      }),
      execute: async ({ pageType }) => {
        const recipe: PageRecipe = getRecipe(pageType);
        return recipe;
      },
    }),

    /**
     * Get the brand voice guide.
     */
    style_getBrandVoice: tool({
      description: `Get the brand voice guide — tone, audience, do/don't lists, and example headlines/subheads/CTAs. Optionally pass a vertical to specialize (e.g. devtool, ops, creative). Per-site overrides come from Site.settings.brandVoice when present.`,
      inputSchema: z.object({
        vertical: z
          .string()
          .optional()
          .describe('Optional vertical: "devtool" (Linear/Vercel-style), "ops" (Ramp/Mercury-style), "creative" (Framer/Webflow-style)'),
      }),
      execute: async ({ vertical }) => {
        const site = await prisma.site.findUnique({
          where: { id: ctx.siteId },
          select: { settings: true },
        });
        const siteOverride = (site?.settings as any)?.brandVoice ?? null;
        return getBrandVoice({ vertical, siteOverride });
      },
    }),
  };
}

export type AgentTools = ReturnType<typeof makeTools>;
