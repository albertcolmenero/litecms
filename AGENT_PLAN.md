# Page Builder Agent — Plan

> Status: **Draft, awaiting sign-off.** A chatbot agent inside lite-cms that can create and edit landing pages from a description of the company.

---

## 1. Goal

Inside the page editor, a chat panel where the user can:

- "Build a home page for Acme — we're a SaaS that helps SDR teams research accounts faster." → the agent produces a complete, opinionated home page using our Markdown directives, streaming each section into the canvas as it generates.
- "Make the hero punchier" → the agent rewrites the hero block in place.
- "Add a pricing teaser before the FAQ." → the agent inserts a section.
- "Use this image for the hero" (drag from media library) → the agent updates the right column.
- "Now build the /pricing page" → the agent creates a new page with a B2B SaaS pricing structure.

The agent must produce **elegant pages that look like Linear / Vercel / Stripe / Attio — not generic 2018 Bootstrap templates** — and must round-trip cleanly through the existing markdown / AST / public-renderer pipeline.

The stack is **Vercel AI SDK 6 + `@ai-sdk/react` v3.x + Groq**, as the user has provided the API key.

---

## 2. Markdown system — what the agent has to work with

This is what we already have. The agent's tools are designed around this vocabulary.

**Storage:** every page is a markdown string in `Page.content` (Postgres via Prisma). Frontmatter (title, description, slug-related metadata, menu placement) is parsed via `gray-matter`; the body is parsed via `unified` + `remark-parse` + `remark-directive`.

**Live AST utilities** (already shipped in `src/lib/wysiwyg-ast.ts`):
- `parseMarkdown(source) → { tree, frontmatter }`
- `serializeMarkdown(tree, frontmatter) → string`
- Mutations: `insertAt`, `removeAt`, `moveAt`, `moveUp`, `moveDown`, `duplicateAt`, `updateAttrs`, `setNodeProperty`, `replaceChildren`
- Inline helpers: `parseInline(text)`, `inlineToString(children)`
- `BlockFactories` library for every block type

**Block vocabulary** (from `remark-sections.ts` + `Badge.tsx`):

| Block | Directive |
|---|---|
| Section (12-col grid) | `::::section{layout="50-50" bg="primary" id="hero" align="center"}` |
| Column | `:::column{align="right"}` |
| Card | `:::card` |
| Heading | `# H1` / `## H2` / `### H3` |
| Paragraph | regular markdown |
| List | `-` / `1.` |
| Button | `::button[Get started]{href="/sign-up" variant="primary"}` |
| Badge (pill) | `::badge[New]{icon="Sparkles" iconColor="#f59e0b" link="/x" linkLabel="Read more"}` |
| Icon | `::icon{name="Rocket"}` |
| Form | `::form{id="<formId>"}` |
| Blog posts | `::blog-posts{count="3"}` |
| Spacer | `::breakline{height="2rem"}` or `::br` |
| Avatar | `::avatar[JD]` |
| Colored text | `:text[highlight]{color="primary"}` |

**Rendered through:** `src/components/markdown-renderer.tsx` for the public site, `src/components/editor/wysiwyg/` for the editor surface. Theme tokens (colors, font, custom-colors, scripts) come from `Site.settings.theme`.

The agent's job is to **emit valid Markdown using this vocabulary** that round-trips through this pipeline unchanged.

---

## 3. Research findings, distilled

### 3.1 The 12-section B2B SaaS home page recipe

This is the agent's **default structural template** for a home page (codified from a 2025–2026 study of Linear, Vercel, Stripe, Supabase, Attio, Ramp, PostHog, Cal.com, Framer, Webflow):

| # | Section | Purpose | Layout (our directive) | Content shape |
|---|---|---|---|---|
| 1 | Announcement bar | Momentum signal | `::badge[…]{icon link linkLabel}` at top of page | "New: <feature> →" 6–10 words |
| 2 | **Hero** | Hook + primary CTA | `::::section{layout="60-40" align="left"}` | eyebrow badge, **H1 4–8 words / ≤44 chars**, subhead 15–25 words, primary `::button` + secondary `::button{variant="secondary"}`, product UI on right |
| 3 | Logo bar | Borrowed credibility | `::::section{layout="100" align="center"}` | "Trusted by" + horizontal logo strip (5–8) |
| 4 | Problem framing | Anchor JTBD | `::::section{layout="100" align="center"}` | eyebrow heading + 30–60 word category sentence |
| 5 | Primary feature showcase | *The* core capability | `::::section{layout="50-50"}` | H2 + paragraph + dominant visual |
| 6 | Bento feature grid | Cover 4–8 secondary capabilities | `::::section{layout="33-33-33"}` of `:::card` blocks (or `25-25-25-25`) | each card: 3–6-word H3 + 15–35-word body + ::icon |
| 7 | Use cases / personas | Show fit per buyer | `::::section{layout="33-33-33"}` of `:::card` | per persona card: H3 + paragraph |
| 8 | Integration / ecosystem | Reduce switching cost | `::::section{layout="100" align="center"}` | heading + ::icon strip + CTA |
| 9 | Social proof | De-risk decision | `::::section{layout="100"}` of `:::card` | 1–3 testimonials (quote, name, role, company) |
| 10 | Pricing teaser | Set expectation | `::::section{layout="33-33-33"}` of `:::card`, middle highlighted | per card: tier name, price, 5–7 bullets, single CTA |
| 11 | FAQ | Defang last objections | `::::section{layout="33-67"}` (heading left, accordions right) | 6–10 Q+A, each A 30–60 words |
| 12 | Final CTA panel | Last push | `::::section{layout="100" align="center" bg="primary"}` | H2 4–7 words + primary + secondary `::button` |

**Hero copy rules** (codified):
- H1: outcome-focused, **not** feature-focused; 4–8 words; under 44 chars.
- Subhead: 15–25 words; describes who it's for and how it works.
- Primary CTA: imperative verb, 2–3 words ("Start building", "Get started"). Never "Learn more" or "Submit".
- Secondary CTA: ghost variant ("Book a demo", "View docs").

**Visual conventions** to encode in the system prompt:
- One brand accent + monochrome neutrals; no rainbow palettes.
- Inter / Geist / single sans-serif family; bold weight for H1/H2.
- Lucide stroked icons only; no emoji.
- Pill badges, subtle ambient gradients, hairline borders. No glassmorphism. No stock photos. No 3D blobs.
- Dark by default for dev tools, light/cream for ops/fintech, bright for creative.

**Anti-patterns** the agent must refuse to produce:
- "All-in-one solution" / "next-generation platform" / "10x" headlines.
- Generic 3-icon "Why us" without screenshots.
- "Submit" / "Learn More" CTAs.
- Stock photo of diverse smiling people with laptops.
- 25+ checkmarks per pricing tier.
- Carousel testimonials.

**Internal page templates** (`/pricing`, `/features/<slug>`, `/customers`, `/about`) follow a similar codification. Stored as a **style guide** that one tool serves on demand (see §6.4).

### 3.2 Vercel AI SDK 6 + Groq stack — the chosen primitives

Versions (verified May 2026):

| Package | Version | Purpose |
|---|---|---|
| `ai` | 6.x | `streamText`, `generateObject`, `tool`, `stepCountIs`, `convertToModelMessages` |
| `@ai-sdk/react` | 3.x | `useChat`, `DefaultChatTransport`, `InferUITool` |
| `@ai-sdk/groq` | latest | Groq provider |
| `zod` | latest | Tool input schemas |

Default model: **`llama-3.3-70b-versatile`** (131k ctx, ~280 tok/s, reliable tool use, $0.59/M in / $0.79/M out). Upgrade path if planning quality is insufficient: **`openai/gpt-oss-120b`** (131k ctx, stronger reasoning).

**Routing tier** (cheap path for simple rewrites): we'll evaluate `gpt-oss-20b` or `kimi-k2-instruct` for one-shot text rewrites. Skip routing in v1 — premature.

**The five gotchas** (codified into the implementation):
1. Messages have `parts: UIMessagePart[]`, not `content: string`. Iterate `parts` and switch on `part.type`.
2. **Always set `stopWhen` explicitly** — without it, the loop ends after the first tool call and the user sees nothing. Use `stopWhen: stepCountIs(10)` minimum.
3. Persist `UIMessage[]`, not `ModelMessage[]`. Run `validateUIMessages()` on load. Generate IDs server-side via `createIdGenerator()`.
4. Pin non-dated Groq model IDs. Watch `console.groq.com/docs/deprecations`.
5. Use `convertToModelMessages()` on the way in and `toUIMessageStreamResponse()` on the way out. Never hand-roll the wire format.

### 3.3 Agent architecture consensus

**Single agent with great tools, not multi-agent.** Cognition's "Don't Build Multi-Agents" still holds for our use case (a single user editing a single document sequentially). Anthropic's multi-agent research system wins only for breadth-first tasks where sub-agents return small summaries — that's not us.

**ReAct loop** is the default. Plan-then-execute is blind to tool results. Reflexion as a default add-on is now considered diminishing returns — replace it with deterministic validators (schema check, AST round-trip, render check).

**Tool design principles** (Anthropic, "Writing tools for agents"):
- **Fewer purposeful tools, not many narrow ones.** One rich `editBlocks` beats 12 micro-mutations.
- **Naming with consistent prefix** (`page_*`, `media_*`, `style_*`).
- **Descriptions are onboarding docs.** Spell out the schema, edge cases, an example.
- **Return semantically meaningful values** (human-readable IDs, not UUIDs).
- **Errors are prompts** — return *steerable* errors, not HTTP codes.
- **Read tools open / write tools gated** via `needsApproval`.

**Context engineering** (replaces "prompt engineering"):
- **Just-in-time retrieval.** Don't dump the whole page or style guide into the system prompt. Pass IDs; let tools fetch on demand.
- **Compaction** when the session grows. Devin / Claude Code both summarize older turns.
- **External state file** — keep the edit log on the server, pass only recent N turns + current page state.
- **Anthropic Skills pattern** — load tool *names* + descriptions at startup; load detailed reference (style guide, anti-patterns) only when a tool is called.

**Generative UI** is worth it here: as the agent edits, the canvas re-renders block-by-block. Use the typed `tool-${toolName}` parts on the client to render diff cards, media pickers, and the live preview.

**Approval gates**: AI SDK 6's `needsApproval` (function on input). Auto-approve trivial edits (single block text change). Require explicit approval for: deleting > 1 block, replacing > 50% of the page, publishing.

**Cost bounds:**
- `stopWhen: stepCountIs(10)` for edit sessions.
- Wall-clock budget 60–120s.
- Prompt caching mandatory: stable system prompt + tool defs at the head of the conversation, mark cache breakpoints.
- Two-tier routing **deferred** to v2 (premature optimization for v1).

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Page editor (existing /app/site/[id]/pages/[pageId])           │
│                                                                  │
│  ┌──────────────────────┬──────────────────────┬──────────────┐ │
│  │                      │                      │              │ │
│  │     Editor canvas    │   Right rail:        │   Chat panel │ │
│  │  (Source / WYSIWYG)  │   block attributes   │  (NEW)       │ │
│  │                      │   OR chat (toggle)   │              │ │
│  │  Live updates as     │                      │  useChat()   │ │
│  │  agent edits ◀───────┤                      │              │ │
│  │                      │                      │              │ │
│  └──────────────────────┴──────────────────────┴──────────────┘ │
│                                ▲                       │         │
│                                │ tool result parts     │ POST    │
│                                │ stream                ▼         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /api/agent/page POST (NEW)                              │    │
│  │                                                           │    │
│  │  streamText({                                             │    │
│  │    model: groq('llama-3.3-70b-versatile'),               │    │
│  │    system: <core prompt + recipe summary>,                │    │
│  │    messages: convertToModelMessages(messages),            │    │
│  │    tools: { getPageContext, readPage, expandBlock,        │    │
│  │             editBlocks, searchMedia, insertMedia,         │    │
│  │             searchForms, getStyleGuide, commitChanges },  │    │
│  │    stopWhen: stepCountIs(10),                             │    │
│  │    onFinish: persistMessages                              │    │
│  │  }).toUIMessageStreamResponse()                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                │                                  │
│                                ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Tool implementations (server-side)                       │    │
│  │  - read existing wysiwyg-ast.ts utilities                 │    │
│  │  - read/write Page.content via prisma                     │    │
│  │  - read media via prisma                                  │    │
│  │  - read forms via prisma                                  │    │
│  │  - emit edit log for the client to apply via SSE          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Why this shape:**
- Single agent (not multi).
- Server-authoritative AST mutations — the same `wysiwyg-ast.ts` utilities the WYSIWYG editor uses; the agent gets the same correctness guarantees.
- Tool results stream back as typed `tool-${name}` parts; the client renders them as diff cards in chat AND applies them to the canvas.
- The chat panel and the canvas share state via the existing `content` state in `EditorClient.tsx` — when a tool result lands, we update `content`, both editors re-render.

---

## 5. Tool catalog

Six tools, all prefixed for the model's namespacing benefit. Each has a Zod input schema and a structured output. Read tools open, write tools gated behind `needsApproval` (auto-approve trivial edits).

### 5.1 `page_getContext`
**Description:** Get the current site context — name, theme, fonts, the user's other pages, and the current page metadata. Call this before generating new content so the page matches the brand.
**Input:** `{}` (the route already knows `siteId` and `pageId`).
**Output:**
```ts
{
  site: { name, subdomain, customDomain, themeColors, font },
  currentPage: { id, title, slug, description, isHome, blockCount },
  otherPages: [{ id, title, slug }],
  recentBlogPosts: [{ title, slug, publishedAt }]
}
```

### 5.2 `page_read`
**Description:** Read a structural summary of the current page (block IDs, types, brief content snippets) — not the full markdown. Use this to understand what's already there before editing. For full content of a specific block, call `page_expandBlock`.
**Input:** `{}`
**Output:**
```ts
{
  frontmatter: { title, description, ... },
  blocks: [
    { id: "blk_001", path: [0], kind: "section", layout: "60-40", childCount: 2, summary: "Hero" },
    { id: "blk_002", path: [0, 0], kind: "column", summary: "headline + button" },
    ...
  ]
}
```
Block IDs are deterministic — derived from `path.join(".")` so the model can refer to them by ID across tool calls.

### 5.3 `page_expandBlock`
**Description:** Get the full markdown for a single block. Use sparingly — prefer `page_read` for orientation.
**Input:** `{ blockId: string }`
**Output:** `{ markdown: string }`

### 5.4 `page_editBlocks`
**Description:** Apply a typed list of operations to the page. This is the workhorse write tool. Operations are applied in order. The page is re-rendered after each operation. Returns the new block list.
**Input (Zod):**
```ts
z.object({
  ops: z.array(z.discriminatedUnion("type", [
    z.object({ type: z.literal("insert"), parentId: z.string(), index: z.number(), markdown: z.string() }),
    z.object({ type: z.literal("replace"), blockId: z.string(), markdown: z.string() }),
    z.object({ type: z.literal("updateAttrs"), blockId: z.string(), attrs: z.record(z.string(), z.any()) }),
    z.object({ type: z.literal("delete"), blockId: z.string() }),
    z.object({ type: z.literal("move"), blockId: z.string(), parentId: z.string(), index: z.number() }),
  ])).max(20),
  reason: z.string().describe("One-sentence explanation of what this batch does"),
})
```
**Output:** `{ applied: true, newBlocks: [...as in page_read] }` or `{ applied: false, error: "<steerable message>" }`.
**Approval:** auto-approve when `ops.length === 1 && (op.type === "replace" || op.type === "updateAttrs")` and the affected block's text-length delta < 200 chars. Otherwise require user approval.
**Implementation:** parse each op's markdown via `parseMarkdown`, dispatch to `insertAt` / `replaceChildren` / `updateAttrs` / `removeAt` / `moveAt` from `wysiwyg-ast.ts`, serialize, persist.

### 5.5 `page_replaceWhole`
**Description:** Replace the entire page body with new markdown. Use for "build me a home page from scratch". Always requires user approval.
**Input:** `{ markdown: string, frontmatter: object, reason: string }`
**Output:** `{ applied: boolean, error?: string }`
**Approval:** always required.

### 5.6 `media_search`
**Description:** Search the user's media library by filename or alt text. Returns up to 10 results.
**Input:** `{ query?: string, mimeType?: "image" | "pdf" }`
**Output:** `{ results: [{ id, filename, url, mimeType, size, alt? }] }`
**Implementation:** Prisma query against `Asset` for the current site.

### 5.7 `forms_list`
**Description:** List the user's forms on this site. Use the form ID in `::form{id="..."}` directives.
**Input:** `{}`
**Output:** `{ forms: [{ id, name, type, fieldCount }] }`

### 5.8 `style_getRecipe`
**Description:** Get the canonical structural recipe for a page type (home, pricing, features, customers, about). Returns the section sequence, layout choices, copy-length targets, and anti-patterns to avoid. Call this BEFORE generating a page from scratch.
**Input:** `{ pageType: "home" | "pricing" | "features" | "customers" | "about" | "blog-index" | "contact" }`
**Output:** the codified recipe (section list + per-section spec + brand voice rules + anti-patterns). Lives as a TS constant in `src/lib/agent/recipes.ts`.
**Why a tool, not the system prompt:** Anthropic Skills pattern. Loading the full recipe on every chat eats 2–3k tokens of context whether the user is asking for a home page or "fix this typo." Behind a tool, it's loaded only when relevant.

### 5.9 `style_getBrandVoice`
**Description:** Get the brand voice guide for the current site (tone, vocabulary, what to avoid). v1 returns a generic SaaS voice; v2 will allow per-site overrides stored in `Site.settings`.
**Input:** `{}`
**Output:** `{ tone, voice, doSay: [], dontSay: [] }`

---

## 6. Sub-agents — yes, exactly one

Per the research, sub-agents are justified only when the sub-task is parallel and returns a *summary*. We have **one legitimate sub-agent**:

### 6.1 `research_competitors` (sub-agent, optional v2)
**Use case:** "Build a home page for an SDR tool" → main agent calls `research_competitors({ niche: "sales engagement / SDR" })` → sub-agent searches the web, reads 3 representative B2B SaaS landing pages in that niche, returns a 200-token brief: dominant copy patterns, hero treatment, common visual conventions for that vertical.
**Why a sub-agent:** breadth-first; isolated context; small summary output.
**Defer to v2.** Hardcode the 12-section recipe + vertical variations (dev tools / ops / creative / horizontal / vertical SaaS) in `style_getRecipe` for v1. Add live web research only if v1 lacks fidelity.

Everything else is a tool, not a sub-agent. No "copywriter sub-agent." No "designer sub-agent." The main agent does both, guided by the recipe.

---

## 7. System prompt strategy

Three layers, ordered to maximize prompt cache reuse (head of message → most stable):

**Layer 1 — Agent core (cached)**
~400 tokens. Identity, capabilities, constraints, the directive vocabulary cheat sheet, the "never do" list (no hand-rolled HTML, no inline CSS, always use directives, never invent attributes).

**Layer 2 — Tool definitions (cached)**
~1k tokens. Standard AI SDK behavior — Zod schemas + descriptions become the tool block.

**Layer 3 — Conversation context (varies)**
Recent N turns of the chat, plus a small "current state" tail: site name, current page title/slug, block count. Page content itself is NOT in the system prompt — it's behind `page_read`.

**System prompt skeleton:**

```
You are the page builder for lite-cms, a CMS where landing pages are
authored as structured Markdown using a directive vocabulary.

YOUR JOB
- Generate or edit pages that match elite SaaS standards (think Linear,
  Vercel, Stripe, Attio).
- Use only the directive vocabulary: ::::section, :::column, :::card,
  ::button, ::badge, ::icon, ::form, ::blog-posts, ::breakline, ::avatar,
  :text. Headings via #/##/###. Lists via -/1.
- Before generating from scratch, call style_getRecipe for the page type,
  then page_getContext to learn the brand.
- Prefer page_editBlocks over page_replaceWhole. Wholesale replacement is
  only for "build me X from scratch" or explicit user request.

NEVER
- Write raw <html> or inline CSS.
- Invent directive attributes that aren't in the vocabulary.
- Use stock-photo language, "all-in-one platform", "10x", "next-generation".
- Output incomplete markdown (every ::::section needs matching ::::, every
  :::column needs matching :::).

ALWAYS
- 4–8 word H1s under 44 chars.
- Imperative CTAs: "Start building", not "Submit".
- One brand accent color, monochrome neutrals.
- Include an answer in chat after every edit ("Done. I tightened the hero
  and added a logo bar — anything to refine?").
```

---

## 8. Context engineering details

- **Just-in-time retrieval** for everything: page content, recipe, brand voice, media. The system prompt mentions tools exist; tools are called only when needed.
- **Compaction trigger:** when conversation exceeds 30k tokens, a server-side step summarizes the oldest 10 turns into a single "edit log so far" message and replaces them. Implemented as a `prepareStep` callback that runs before each model call.
- **Server-side edit log:** every successful `page_editBlocks` / `page_replaceWhole` writes a row to a new `PageEdit` table — `{ pageId, ts, ops, beforeSnapshot, afterSnapshot, reason }`. Used for: undo, audit, eval traces.
- **State validation on chat reload:** `validateUIMessages(saved, { tools })` to catch stale tool schemas.

---

## 9. UX flow

### 9.1 Where the chat lives

A new **third panel** in the page editor: canvas (left), right-rail attributes (center-right, when a block is selected), chat (right). Toggle the chat panel with a button in the editor toolbar (`✨ Ask the agent`). Persists across page navigation.

On screens < 1280px, the chat opens as a Sheet over the canvas.

### 9.2 First-run experience

When the chat opens on a fresh empty page:

```
✨ Hey — describe the page you want and I'll build it.
   Try:
   • "A home page for Acme, a SaaS that helps SDRs research accounts
     faster. We have 50 customers, $2M ARR."
   • "A pricing page with three tiers — free, $20/seat, enterprise."
   • "Make this page feel more like Linear."
```

User types → agent calls `style_getRecipe` → `page_getContext` → `media_search` (for hero image) → `page_replaceWhole` with the full new page → user reviews diff in chat + watches canvas update → approves.

### 9.3 Streaming tool calls visibly

Per the research: showing tool calls dramatically increases user tolerance for latency. Each tool call renders as a chip in the chat:

```
🔍 Reading current page (3 blocks)
✏️  Inserting hero section
✏️  Inserting feature grid (3 cards)
✏️  Inserting FAQ
✓  Done — 7 sections added
```

The chips are clickable to expand and see the inputs/outputs.

### 9.4 Approval gates

For ops that need approval (large or destructive edits), the chat surfaces a card:

```
The agent wants to replace the entire page body.
Reason: "Building from scratch — home page for Acme."
[Preview diff] [Approve] [Reject]
```

Trivial edits auto-apply with a toast: "Updated headline."

### 9.5 Inline preview as it generates

When `page_editBlocks` results land, the canvas re-renders that block immediately (the chat panel and the editor canvas share the `content` state). The user sees the page take shape in real time. No "regenerate" buttons, no copy-paste.

---

## 10. Phased delivery

| Phase | Scope | Estimate |
|---|---|---|
| **P1** | Backend: `/api/agent/page` route with `streamText`, message persistence, the 6 read+edit tools (skip media/forms/recipe). Hardcoded SaaS B2B recipe in the system prompt. Single-agent, no sub-agents. | 3 days |
| **P2** | Frontend: chat panel in `EditorClient.tsx` with `useChat`, streaming tool-call chips, approval gates, live canvas sync. | 2 days |
| **P3** | Tool: `style_getRecipe` (move recipe out of prompt, into a tool); `style_getBrandVoice`. Add `media_search`, `forms_list`. | 1 day |
| **P4** | Polish: undo, edit log, eval set (20 prompts × structural assertions), telemetry on tool-call success rate. | 2 days |
| **P5** | Optional: `research_competitors` sub-agent (live web research for vertical-specific patterns). Two-tier model routing. Per-site brand voice override. | 3 days |

Total to v1 (phases 1–4): **~8 days**. Optional v2 work: **+3 days**.

---

## 11. Files to create / modify

| File | Action |
|---|---|
| `src/app/api/agent/page/route.ts` | **NEW** — POST route with `streamText` + tools + persistence |
| `src/lib/agent/tools.ts` | **NEW** — Zod-typed tool definitions |
| `src/lib/agent/system-prompt.ts` | **NEW** — system prompt builder |
| `src/lib/agent/recipes.ts` | **NEW** — codified 12-section home recipe + variants per page type + per-vertical voice |
| `src/lib/agent/edit-log.ts` | **NEW** — server-side edit log writer; compaction helper |
| `prisma/schema.prisma` | Add `PageEdit` model, `AgentChat` model |
| `prisma/migrations/<n>_agent_chat/migration.sql` | **NEW** — migration |
| `src/components/agent/AgentPanel.tsx` | **NEW** — chat side panel component using `useChat` |
| `src/components/agent/ToolCallChip.tsx` | **NEW** — render `tool-${name}` parts |
| `src/components/agent/ApprovalCard.tsx` | **NEW** — approval gate UI |
| `src/components/agent/EditDiff.tsx` | **NEW** — render edit-diff inside chat |
| `src/app/app/site/[id]/pages/[pageId]/EditorClient.tsx` | Add chat panel toggle + state lift |
| `package.json` | Add `ai@6`, `@ai-sdk/react@3`, `@ai-sdk/groq` |
| `.env` | `GROQ_API_KEY=…` |

We **reuse** rather than rewrite:
- `src/lib/wysiwyg-ast.ts` — all mutation utilities (the agent's `editBlocks` calls these directly).
- `src/components/markdown-renderer.tsx` — for the public site rendering.
- `Page` schema in Prisma.

---

## 12. Open questions

1. **Cost ceiling.** What's the hard monthly limit per site? I'd default to **$5/site/month** of Groq spend (≈700 chat turns). Beyond that, gate further calls behind a "need more credits" prompt. OK?
2. **Per-site brand voice.** v1 hardcodes a generic B2B SaaS voice. v2 reads `Site.settings.brandVoice` (a JSON field with tone + do/don't lists), settable in the Theme page. Should this be in v1 instead?
3. **Web research sub-agent.** The competitor-research sub-agent (P5) needs internet access — adds risk (prompt injection from scraped pages) and cost. **Defer to v2 unless you specifically want vertical-aware generation in v1.**
4. **Image generation.** Agent today only *picks* from the existing media library. Adding image generation (e.g., for hero visuals) is a separate initiative — needs an image model + storage flow. **Out of scope for this plan.**
5. **Chat panel default state.** Open by default, or closed-with-button until first use?
6. **Where the chat lives across pages.** Per-page chat (each page has its own conversation) or per-site? Recommendation: **per-page** — most edit sessions are scoped to one page. Persists across reloads via DB.

---

## 13. Verification

After P1+P2:
1. Open a fresh page → chat reads "describe the page you want" → type "Home page for Acme, a SaaS that helps SDRs research accounts. We have 50 customers and $2M ARR." → watch tool-call chips stream → page renders 12 sections → diff approval card appears → approve → autosave fires.
2. Type "Tighten the hero — make the headline 5 words." → agent calls `page_editBlocks` with one `replace` op → trivial-edit auto-approved → canvas updates → toast.
3. Type "Add a pricing teaser before the FAQ." → agent calls `page_read` → `page_editBlocks` with one `insert` op → approval gate (structural change) → approve → canvas updates.
4. Reload the editor → chat history reloads from DB → `validateUIMessages` passes → previous messages render correctly.

After P3:
5. Switch to a different vertical: "Build a /pricing page" → agent calls `style_getRecipe({ pageType: "pricing" })` → emits the 5-section pricing template (header, 3-tier cards, comparison table, FAQ, footer CTA).
6. Type "Use this image for the hero" with a media library entry referenced → agent calls `media_search` → `page_editBlocks` updates the hero column.

After P4:
7. Run the 20-prompt eval set; structural assertions pass on ≥18/20.
8. Telemetry shows tool-call success rate ≥95% and median agent turns ≤4 per request.

---

## 14. What's explicitly out of scope

- Image generation (only library pickers).
- Multi-page generation in one turn ("build my whole site"). v3, requires separate planner agent.
- Real-time collaborative editing of the chat (multiple users on the same page conversation).
- Bring-your-own-model (Anthropic / OpenAI). Groq only for v1; AI SDK makes swapping trivial later.
- Voice input.
