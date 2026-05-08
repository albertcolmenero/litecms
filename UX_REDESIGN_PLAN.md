# lite-cms — UX/UI Redesign Plan

> Status: **Draft, awaiting sign-off.** A clickable prototype lives at `/preview` so we can validate navigation before touching `/app`.

---

## 1. Why we're doing this

The product is functional but the dashboard reads as a stack of utility pages rather than a single, opinionated tool. Specifically:

- **No spine.** Each feature lives behind a horizontal row of inline buttons on the site overview page. Switching features feels like navigating a directory listing, not using an app.
- **Inconsistent visual vocabulary.** The shadcn-style `Button` component exists and is unused; pages reach for ad-hoc `bg-black text-white px-4 py-2` instead. Modals, page headers, empty states, and tables each have their own conventions.
- **Saving and publishing are conflated.** The page editor autosaves silently; the form builder has an explicit Save; blog posts have a "published" flag with no obvious toggle in the editor. Users don't know what's live.
- **Empty states don't lead.** "No forms yet." with no CTA forces a hunt for the create button.
- **No way to switch sites without going home.** Multi-site users feel it.

Top 5 problems from the audit, ranked by impact:

1. Inconsistent create/save patterns → **mental model is broken**
2. Feature discovery on the site hub is six unstyled buttons in a row → **doesn't scale**
3. No design system in practice — `Button` is unused → **every page invents itself**
4. Empty states without CTAs → **first-run experience is dead**
5. Editor lacks a clear publish affordance and isn't mobile-friendly

---

## 2. Jobs to be done — prioritized

A solopreneur's week with lite-cms, in order of frequency:

| # | JTBD | Today | Target |
|---|---|---|---|
| 1 | **"Edit a sentence on my homepage and see it live."** | 5+ clicks, no visible publish, autosave is silent | 2 clicks. Always-visible publish state. View live button always reachable. |
| 2 | **"Did my change actually ship?"** | Hunt for the public URL | "View live ↗" pinned in the topbar from anywhere inside a site |
| 3 | **"Write a blog post and publish it."** | Editor → no publish in header → back to list to flip status | Publish toggle in editor header. Status pill always visible. |
| 4 | **"Drop an image into a page."** | Switch to Media → upload → copy markdown → switch back to editor | Media picker invoked from the editor itself (slash command or toolbar) |
| 5 | **"Capture leads — did anyone sign up today?"** | Click into Leads, scan list | Unread badge on the sidebar item. Inbox-style list with email + form name + time. |
| 6 | **"Tweak my brand color across the site."** | Settings form, hope it took | Theme panel with live preview of public site |
| 7 | **"Switch to my other site."** | Back to dashboard, click the other site | Site switcher popover at top of sidebar (⌘K to jump) |
| 8 | **"Spin up a new site."** | Modal | Modal stays — it's fine. Make the empty state on the dashboard guide first-timers. |
| 9 | **"Embed a form on a page."** | Copy `::form{id}` directive manually from a code hint | Insert form via editor command palette |

We optimize for jobs **1–4** first; everything else benefits from the same shell upgrade.

---

## 3. Design principles

1. **One spine, always visible.** Persistent left sidebar inside a site. The dashboard root has no sidebar — it's the launcher.
2. **Status before chrome.** Save status, publish status, and "view live" are part of the topbar of every authoring surface. Never hidden.
3. **Use the system.** `Button`, theme tokens, lucide icons, `cn()`. Stop hand-rolling Tailwind for primitives.
4. **Empty states are landing pages.** Icon, headline, one sentence, one button. Always.
5. **Quiet by default.** Generous whitespace, hairline borders (`border-border`), neutral OKLCH grays. Color is reserved for action and status, not decoration.
6. **Keyboard-first where it matters.** ⌘K command palette, ⌘S confirms save, ⌘Enter publishes (later phase).
7. **Mobile-respectful.** Editor stacks panes < `md`. Sidebar collapses to a Sheet under `md`.

---

## 4. New information architecture

```
/                              public marketing site
/sign-in, /sign-up             auth
/sites/[site]/[[...slug]]      public tenant rendering   (unchanged)

/app                           DASHBOARD HOME
                                 ├ topbar: brand · ⌘K search · user menu
                                 └ body: "Your sites" grid + "+ New site"

/app/site/[id]                 SITE SHELL  (sidebar + topbar)
  Topbar:  site name · subdomain (mono) · view live ↗ · publish state
  Sidebar: site switcher (popover at top)
           ── Overview          activity, quick actions
           ── Pages             primary entry
           ── Blog              list + composer
           ── Forms             builder
           ── Leads  [3]        unread badge
           ── Media              grid
           ── Menus              header/footer config
           ── Theme              colors, fonts, live preview
           ── Settings          domain, scripts, danger zone
           ── (footer) Admin    SUPER_ADMIN only
```

Notes:
- "Settings" splits into **Theme** (creative) and **Settings** (technical). They do different jobs and shouldn't share a screen.
- "Custom Scripts" lives under Settings → Advanced.
- Admin is an item at the **bottom** of the sidebar, gated by role, not a top-level dashboard route.
- `/app/site/[id]/editor/[pageId]` keeps its URL but inherits the new shell minus the sidebar (full-width editor) with a "← Pages" link in the topbar.

---

## 5. Visual system (tokens already in `globals.css`)

| Token | Use |
|---|---|
| `bg-background` / `text-foreground` | every page surface |
| `bg-card` / `border-border` | every card, table, panel |
| `bg-sidebar` / `text-sidebar-foreground` | sidebar |
| `text-muted-foreground` | descriptions, metadata |
| `bg-primary` / `text-primary-foreground` | primary CTAs (already wired in `Button` default) |
| `--radius: 0.625rem` | base; `rounded-lg` for cards, `rounded-md` for controls, `rounded-full` for status pills |

Spacing scale: `4 / 6 / 8 / 12 / 16` only. Type scale: `text-sm` body, `text-base` form labels, `text-xl` section headings, `text-2xl tracking-tight` page titles, `text-3xl tracking-tight font-semibold` dashboard hero. Monospace (Geist Mono, already loaded) for subdomains, slugs, IDs.

Net of decisions: dark mode tokens are already complete; we'll wire a toggle in phase 2.

---

## 6. The prototype (`/preview`)

Clickable, no-DB, placeholder-data prototype to validate the shell and IA before we change real routes.

Routes to ship in this PR:

- `/preview` — new dashboard home (sites grid, empty state, topbar)
- `/preview/site/acme` — site overview with sidebar, activity, quick actions
- `/preview/site/acme/pages` — pages list (table, status pills, primary CTA)
- `/preview/site/acme/pages/home` — editor mockup (header with save state + publish toggle + view live)
- `/preview/site/acme/blog` — blog list (same pattern as pages)
- `/preview/site/acme/forms` — forms list with empty state
- `/preview/site/acme/leads` — leads inbox layout
- `/preview/site/acme/media` — media grid + upload zone
- `/preview/site/acme/menus` — menus split layout
- `/preview/site/acme/theme` — theme + live preview frame
- `/preview/site/acme/settings` — settings (domain, scripts, danger zone)

Shared components in `src/components/preview/`:

- `Shell.tsx` — sidebar + topbar wrapper
- `SiteSwitcher.tsx` — popover with sites + new
- `Sidebar.tsx` — items + badges
- `Topbar.tsx` — brand + actions
- `PageHeader.tsx` — title + description + primary action
- `EmptyState.tsx` — icon + heading + description + CTA
- `StatPill.tsx` — status / count badge
- `mock.ts` — fake site, pages, posts, leads

The prototype reuses the existing `Button` component everywhere on purpose — to prove the design system survives contact with reality.

---

## 7. Phased rollout (after sign-off on the prototype)

| Phase | Scope |
|---|---|
| **0. Prototype** (this PR) | `/preview/**` clickable shell |
| **1. Shell + tokens** | Replace `/app/site/[id]/layout.tsx` with the new sidebar shell. Migrate all dashboard pages to use `Button`, `PageHeader`, `EmptyState`. No DB or feature changes. |
| **2. Editor topbar** | Save state pill + publish toggle + view live in editor header. Wire publish to `Page.published` and `BlogPost.published`. |
| **3. Theme split + live preview** | Split Settings into Theme and Settings. Theme page gets a live preview iframe of the public site. |
| **4. Leads inbox + sidebar badges** | Restructure `/leads` as an inbox; sidebar shows unread count. |
| **5. Command palette (⌘K)** | Global jump: switch site, open page, create new. |
| **6. Editor inline media + form insertion** | Slash commands inside the markdown editor. |
| **7. Dark mode toggle, empty-state polish, keyboard shortcuts** | Cleanup. |

We do **not** redesign the public site rendering or the marketing landing in this initiative. Scope creep risk.

---

## 8. Open questions for the user

1. **Sidebar default state on desktop:** expanded with labels, or icon-only with hover-expand? (Linear-style vs. Notion-style.)
2. **Theme page:** OK to require a saved Theme before "Publish" is enabled on any page? Or keep them independent?
3. **Editor full-bleed vs. centered max-width:** centered (max-w-3xl, like Notion) feels classier and reads better; split-pane preview becomes a toggle. Yes/no?
4. **Brand:** keep the "lite" wordmark only, or do we want a small mark/logo? (The marketing landing has a treatment we can lift.)
5. **Dark mode:** ship now or phase 7? If now, default to system preference.

---

## 9. Verification

After the prototype is up:
- Run `npm run dev` and visit `http://localhost:3000/preview`.
- Click through every sidebar item; confirm IA reads cleanly.
- Open the editor mockup; confirm save / publish / view-live read as a unit.
- Resize to mobile; confirm sidebar collapses cleanly.

Once approved, phase 1 begins by porting the shell to `/app/site/[id]/layout.tsx`.
