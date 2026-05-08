# Full WYSIWYG — Plan

> Status: **Draft, awaiting sign-off.** A clickable preview lives at `/preview/site/acme/wysiwyg`.

---

## 1. Why we're doing this

Today's WYSIWYG only edits **text inside** headings, paragraphs, and list items. You still can't:

- Add a new section, column, or card
- Reorder or move blocks
- Change a section's layout, a button's variant, or a badge's icon without touching markdown
- Insert any of: button, badge, form, blog-posts, icon, breakline, avatar, colored-text

The markdown side is currently the only way to do structural work. We want to flip that: the markdown side becomes optional power-user surface; everything is editable end-to-end through direct manipulation.

---

## 2. Approach — AST-first editor

The naive instinct (mutate the markdown source string for everything) is fragile for structural operations. Moving a section means rewriting a multi-line block with the right 4-colon vs 3-colon nesting. Indent matters. Frontmatter offsets bite you. We've already lived this.

Instead: keep the **mdast** (markdown AST, what `remark-parse` + `remark-directive` produce) as the live working tree. Render it to React. Mutate the tree on every edit. Serialize back to markdown only at save time.

```
source markdown
   ↓ remark-parse + remark-directive
mdast (live, mutated on every edit)
   ↓ BlockRenderer
editable React tree
   ↓ remark-stringify + remark-directive (on save)
source markdown
```

This buys us:

- **Trivial structural mutations.** Insert/move/delete is `tree.children.splice(...)`. Indent and colon counts are the serializer's problem, not ours.
- **Round-trip safety.** We can always go back to markdown from the AST. No "lossy edit" failure mode.
- **Source view stays available.** Show the current AST stringified, read-only, in a side panel for power users.
- **Existing site rendering stays unchanged.** The public site keeps reading markdown from the DB.

### Why not TipTap

TipTap is in our deps and has a `tiptap-markdown` extension. But every directive (`::::section`, `:::card`, `::button`, `::badge`, `::form`, etc.) would need its own custom Node class with a parser and serializer. We already own the parser/serializer through `remark-directive`. TipTap also imposes its own document model that doesn't map cleanly to our 4-colon section grammar.

Net: equal complexity, less leverage from what we already have.

### Why not source-string splicing (what we do today)

It works for **in-place text edits** because positions are stable within a single line. It breaks for multi-line structural ops, especially when the user's existing markdown has inconsistent indenting. We saw the symptom already with the frontmatter-offset bug.

---

## 3. Architecture

### 3.1 Working AST

- `unified` + `remark-parse` + `remark-directive` + frontmatter parsing.
- Stored as top-level state in the editor client component, with a `revision` counter that increments on every mutation so React re-renders.
- Frontmatter (title, description, slug, etc.) lives in a separate slice of state.

### 3.2 `BlockRenderer`

Walks the mdast and emits one React component per node. Each component receives:

```ts
type BlockProps = {
  node: MdastNode;
  path: number[];                            // root.children[0].children[1] = [0, 1]
  selectedPath: number[] | null;
  onSelect(path: number[]): void;
  onUpdateAttrs(path: number[], attrs: any): void;
  onReplaceChildren(path: number[], children: MdastNode[]): void;
};
```

Mapping table:

| mdast | Block component | Notes |
|---|---|---|
| `containerDirective name=section` | `SectionBlock` | Wraps children in 12-col grid per layout |
| `containerDirective name=column` | `ColumnBlock` | |
| `containerDirective name=card` | `CardBlock` | |
| `heading` (depth 1/2/3) | `HeadingBlock` | inline contentEditable |
| `paragraph` | `ParagraphBlock` | inline contentEditable |
| `list` / `listItem` | `ListBlock` / `ListItemBlock` | |
| `leafDirective name=button` | `ButtonBlock` | |
| `leafDirective name=badge` | `BadgeBlock` | |
| `leafDirective name=icon` | `IconBlock` | |
| `leafDirective name=form` | `FormBlock` | renders the form picker, embeds the form |
| `leafDirective name=blog-posts` | `BlogPostsBlock` | |
| `leafDirective name=breakline` | `BreaklineBlock` | |
| `leafDirective name=avatar` | `AvatarBlock` | |
| `textDirective name=text` | `ColoredTextBlock` | |

### 3.3 Selection model

- Selection is a `path: number[]` (e.g. `[0, 1, 2]` = root.children[0].children[1].children[2]).
- Click a block → `setSelectedPath(path)`.
- `Esc` → clear.
- `↑` / `↓` → previous / next sibling.
- `Tab` → first child. `Shift+Tab` → parent.

### 3.4 Mutation engine

A small set of pure functions on the mdast, all returning a new tree:

```ts
insertAt(tree, parentPath, index, newNode): Tree
removeAt(tree, path): Tree
moveAt(tree, fromPath, toPath): Tree
updateAttrs(tree, path, attrs): Tree
replaceChildren(tree, path, children): Tree
duplicateAt(tree, path): Tree
```

Each mutation:
1. Returns a new tree (`structuredClone` then mutate).
2. Pushes the previous tree onto an undo stack.
3. Bumps `revision`.
4. Schedules a save via the existing 1s-debounce autosave.

### 3.5 Inline text editing — re-anchored to the AST

For `heading`, `paragraph`, `listItem`:
- Render the inline children (plain text + emphasis + strong + link) via React.
- The container is `contentEditable="plaintext-only"` (for now — phase 5 adds inline marks).
- On blur: take `innerText`, parse it as inline markdown via `unified().use(remarkParse).parse(...)` of just an inline phrase, extract the resulting children array, call `replaceChildren(path, children)`.
- This restores the bold/italic round-trip we lost in the source-splice version.

### 3.6 Slash menu / "+" affordance

- Between every pair of block-level children, render a thin transparent bar (~6px tall) that lights up on hover.
- Hover → "+" button appears in the middle. Click → slash menu opens at that position.
- Slash menu is keyboard-driven: type to filter, arrow keys to navigate, `Enter` to insert.

**Library, grouped:**

| Group | Items |
|---|---|
| Layout | Section (100, 50/50, 33/33/33, 60/40, 40/60, custom), Column, Card |
| Text | Heading 1/2/3, Paragraph, Bulleted list, Numbered list, Quote |
| Media | Image, Icon (Lucide picker), Avatar |
| Components | Button, Badge, Form, Blog posts, Breakline, Colored text |

Each item inserts a sensible default node and selects it. E.g., "Section 50/50" inserts a section with `layout="50-50"` containing two empty columns.

### 3.7 Drag and drop

- Adopt `@dnd-kit/core` + `@dnd-kit/sortable` (~10kb gz, new dep).
- Each block has a small drag handle on the left, visible on hover (Notion-style).
- Drop targets: the same insertion bars between blocks (and into empty columns/cards).
- **Constraints** validated before drop:
  - `column` can only land inside a `section`.
  - `section` can only land at the root, or inside another `section`'s column.
  - `listItem` can only land inside a `list` of the same type.
- Invalid drops show a red indicator and snap back.

### 3.8 Right-rail attributes panel

The right rail switches its content based on the selected block's type:

| Block | Editable attributes |
|---|---|
| Section | layout (visual picker showing 100, 50/50, 33/33/33, 67/33, 33/67, 25/25/25/25, custom), bg (theme token + custom), align, id (anchor target) |
| Column | bg, align |
| Card | bg, align |
| Heading | level (H1 / H2 / H3 toggle), id (anchor) |
| Paragraph | (none, info-only) |
| List | type (bulleted / numbered) |
| Button | label, href, variant (primary / secondary), bg override |
| Badge | label, icon (Lucide picker), iconColor (color picker), link, linkLabel, variant (default / subtle) |
| Icon | name (Lucide picker with search), color |
| Form | id (dropdown of `/api/forms` returning the user's forms) |
| Blog posts | count (number input) |
| Breakline | height (rem input) |
| Colored text | color (theme token picker) |
| Avatar | label (initials) |

Every attribute change calls `updateAttrs(path, newAttrs)` immediately. No "Save" button on the panel — the AST is the truth, autosave handles persistence.

### 3.9 History / undo

- Stack of AST snapshots, capped at 50.
- `Cmd+Z` → pop and apply. `Cmd+Shift+Z` → redo.
- Snapshots happen after each mutation, debounced 200ms during rapid typing so a paragraph edit doesn't blow up the stack.

### 3.10 Frontmatter

- Stays separate from block selection. Lives in a "Page settings" gear in the topbar (or a dedicated panel via the existing settings icon).
- Fields: title, description, slug, OG image (media picker), `published`.

---

## 4. Phased delivery

| Phase | Scope | Rough estimate |
|---|---|---|
| **1** | AST parse/render/serialize round-trip. Click-to-select. Block ring + floating action bar (delete, duplicate). Right-rail for sections, headings, paragraphs, buttons, badges. Save round-trip. **Inline text editing re-anchored to AST.** | 1–2 weeks |
| **2** | "+" insert affordance between blocks. Slash menu with full library. Sensible defaults per block type. | ~1 week |
| **3** | Drag-and-drop with `@dnd-kit`. Constraint validation. Cross-section moves. | ~1 week |
| **4** | Right-rail attribute panels for the remaining block types (Form, Blog posts, Icon picker, Colored text, Avatar, Breakline, List). | ~3 days |
| **5** | Multi-select (shift-click), keyboard nav (arrows / tab / enter), undo/redo, dark-mode polish, mobile touch. | ~1 week |

We'd ship phase 1 to production behind a feature flag (`?wysiwyg=1` in dev, `Site.settings.flags.wysiwyg` per-site in prod) and let it stabilize before exposing it to all users.

---

## 5. Preview page

A clickable mockup of the proposed UI lives at:

**[/preview/site/acme/wysiwyg](preview/site/acme/wysiwyg)**

What's interactive:
- **Click any block** in the center canvas → it gets selected (blue ring + action bar) and the right rail switches to that block's attribute panel.
- Mode tabs at the top toolbar (Source / WYSIWYG / Split) — visual only; WYSIWYG is the active demo.

What's visual-only (mockup) for now:
- The slash menu open between two blocks (showing the full block library).
- Drag handles on hover.
- Action bar buttons (drag, duplicate, delete).
- "+" insert affordances.

Use the preview to validate the IA (right rail layout, slash menu grouping, action bar contents) before we commit to building it.

---

## 6. Open questions for you

1. **Markdown source visibility in WYSIWYG mode.** Hide it by default and expose it under a "Source" tab in the editor toolbar (recommendation), or always-visible side-by-side?
2. **`@dnd-kit/core` + `@dnd-kit/sortable` new dep.** ~10kb gzipped together. OK to add, or should we try native HTML5 drag first? My take: dnd-kit is worth the bytes — native HTML5 drag has cross-browser inconsistencies that will eat our schedule.
3. **Block library scope for v1.** Do we need ALL the block types in the slash menu on day 1, or can we ship phase 2 with just Layout + Text + Button + Image and add Badge/Form/BlogPosts/Icon/etc. in phase 4? My take: ship phase 2 with the full library — it's cheap once we have the slash-menu infrastructure.
4. **Undo granularity.** Per-keystroke undo (Notion-style, one undo per character) or per-mutation (one undo per block change, typed text grouped)? My take: per-mutation, with typed text grouped into a single "session" until you switch blocks. Cleaner UX for non-power users.

---

## 7. Verification

After phase 1:
- Open the editor. The page renders as a tree of blocks. Click any block — it highlights, action bar appears, right rail populates.
- Edit a button's label in the right rail → autosave fires → reload → label persists.
- Delete a paragraph → markdown reflects the deletion.
- Duplicate a card → markdown has two of them.
- Type bold text into a heading via inline edit → bold persists.

After phase 2:
- Hover between two blocks → "+" appears. Click → slash menu. Pick "Heading 1" → inserted with default text "Heading", selected automatically.
- Pick "Section 50/50" → two empty columns appear; click into one and add a paragraph.

After phase 3:
- Drag a paragraph from one section into another → it lands at the drop indicator, AST updates, save fires.
- Try dragging a section into a paragraph → red indicator, snaps back.

After phase 5:
- All editing through WYSIWYG. Markdown side is read-only by default. Save produces clean markdown that renders identically on the public site.

---

## 8. Out of scope (for this initiative)

- A custom markdown grammar beyond what `remark-directive` already understands. Anything new the user wants in markdown (e.g., a callout type) goes through the existing flow: add a directive in `remark-sections.ts`, add a Block component, add it to the slash menu library.
- Rich-text marks beyond bold/italic/link/code — strikethrough, color, sub/sup, etc. Phase 6+ if we want them.
- Real-time collaboration (multiplayer cursors). Out of scope; orthogonal change.
- Image cropping / editing. Media library handles upload; cropping is a separate skill.
