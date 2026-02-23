# LiteCMS — Project Architecture & Onboarding Guide

> **Last updated:** February 2026
> A comprehensive reference for engineers joining the project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Getting Started (Local Development)](#4-getting-started-local-development)
5. [Architecture Overview](#5-architecture-overview)
6. [Multi-Tenant Routing & Middleware](#6-multi-tenant-routing--middleware)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Database Schema](#8-database-schema)
9. [Server Actions (Business Logic)](#9-server-actions-business-logic)
10. [Content System & Markdown Directives](#10-content-system--markdown-directives)
11. [Page & Blog Editor](#11-page--blog-editor)
12. [Public Site Rendering](#12-public-site-rendering)
13. [UI Components & Styling](#13-ui-components--styling)
14. [Routing Reference](#14-routing-reference)
15. [Data Flow Diagrams](#15-data-flow-diagrams)
16. [Environment Variables](#16-environment-variables)
17. [Known Gaps & TODOs](#17-known-gaps--todos)
18. [Key Files Quick Reference](#18-key-files-quick-reference)

---

## 1. Project Overview

LiteCMS is a **multi-tenant, Markdown-powered CMS** designed for solopreneurs and small teams. Each user can create multiple websites, each served on its own subdomain (e.g., `mysite.litecms.com`) or custom domain. Content is authored using Markdown with a custom directive syntax that enables rich layouts (sections, columns, cards, buttons, icons, forms) without requiring any frontend code from the end user.

**Core value proposition:** A lightweight CMS where you write Markdown and get a fully themed, production-ready website with navigation, blog, lead capture forms, and custom styling — all managed from a single dashboard.

**Current stage:** Early MVP (`v0.1.0`). No tests, no CI/CD pipeline, single database migration.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 16.1.1 | React Server Components, Server Actions |
| **Language** | TypeScript | ^5 | Strict mode enabled |
| **React** | React | 19.2.3 | Latest with RSC support |
| **Database** | PostgreSQL (Neon Serverless) | — | Serverless driver via `@neondatabase/serverless` |
| **ORM** | Prisma | ^5.22.0 | With `driverAdapters` preview feature for Neon |
| **Auth** | Clerk | ^6.36.5 | Handles sign-up, sign-in, sessions, user management |
| **Styling** | Tailwind CSS | v4 | With `@tailwindcss/typography` plugin |
| **UI Primitives** | shadcn/ui (new-york style) | — | Only `Button` component installed |
| **Icons** | Lucide React | ^0.562.0 | Used across the app + dynamic rendering in content |
| **Rich Text** | TipTap | ^3.14.0 | Installed but not actively used (current editor is raw textarea) |
| **Markdown** | react-markdown + remark-gfm + remark-directive + rehype-raw | — | Core content rendering pipeline |
| **Frontmatter** | gray-matter | ^4.0.3 | YAML frontmatter parsing for pages and blog posts |
| **Toasts** | Sonner | ^2.0.7 | Notification system |
| **Deployment** | Vercel | — | No Docker/CI config; Vercel-optimized |

---

## 3. Repository Structure

```
lite-cms/
├── prisma/
│   ├── schema.prisma                         # Database schema (11 models, 1 enum)
│   └── migrations/                           # Single initial migration
├── public/                                   # Static assets (SVGs, favicon)
├── src/
│   ├── proxy.ts                              # Middleware: multi-tenant subdomain routing
│   ├── actions/
│   │   └── blog.ts                           # Server actions: Blog CRUD
│   ├── app/
│   │   ├── layout.tsx                        # Root layout (ClerkProvider, Toaster, fonts)
│   │   ├── page.tsx                          # Marketing homepage
│   │   ├── globals.css                       # Tailwind config + theme CSS variables
│   │   ├── actions.ts                        # Server actions: Sites, Pages, Menus, Users
│   │   ├── actions-forms.ts                  # Server actions: Forms, Leads
│   │   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in page
│   │   ├── sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up page
│   │   ├── blog/                             # Marketing blog (static data)
│   │   │   ├── page.tsx                      # Blog listing
│   │   │   └── [slug]/page.tsx               # Blog post detail
│   │   ├── api/
│   │   │   └── leads/create/route.ts         # REST API: public lead creation
│   │   ├── app/                              # Dashboard area (app.localhost)
│   │   │   ├── (dashboard)/page.tsx          # Dashboard home: list user's sites
│   │   │   ├── admin/                        # Super admin panel
│   │   │   │   ├── layout.tsx                # Role gate (SUPER_ADMIN only)
│   │   │   │   ├── page.tsx                  # Redirect to /admin/sites
│   │   │   │   ├── sites/page.tsx            # All sites listing
│   │   │   │   └── users/page.tsx            # All users listing
│   │   │   └── site/[id]/                    # Per-site management
│   │   │       ├── page.tsx                  # Site overview with page list
│   │   │       ├── editor/[pageId]/          # Page editor
│   │   │       │   ├── page.tsx              # Server wrapper
│   │   │       │   └── client.tsx            # Client editor with auto-save
│   │   │       ├── blog/                     # Blog management
│   │   │       │   ├── page.tsx              # Blog post listing + create/delete
│   │   │       │   └── [postId]/             # Blog post editor
│   │   │       │       ├── page.tsx          # Server wrapper
│   │   │       │       └── client.tsx        # Client editor with auto-save
│   │   │       ├── forms/page.tsx            # Form management + embed codes
│   │   │       ├── leads/page.tsx            # Lead submissions viewer
│   │   │       ├── menus/page.tsx            # Menu management (nav items, CTAs, social)
│   │   │       └── settings/                 # Site settings
│   │   │           ├── page.tsx              # Server wrapper
│   │   │           └── SiteSettingsForm.tsx   # Client form (theme, domain, scripts)
│   │   └── sites/[site]/[[...slug]]/         # Public site rendering
│   │       ├── page.tsx                      # Multi-purpose renderer (pages, blog, etc.)
│   │       └── page-metadata.ts              # Dynamic SEO metadata generation
│   ├── components/
│   │   ├── CreateSiteModal.tsx               # Modal for creating new sites
│   │   ├── CreatePageModal.tsx               # Modal for creating new pages
│   │   ├── MenuManager.tsx                   # Full menu CRUD component
│   │   ├── PageTable.tsx                     # Sortable pages table
│   │   ├── SiteTable.tsx                     # Sites listing table
│   │   ├── markdown-renderer.tsx             # Core: Markdown -> React with custom directives
│   │   ├── editor/
│   │   │   ├── editor.tsx                    # Split-pane Markdown editor (preview + textarea)
│   │   │   ├── toolbar.tsx                   # TipTap toolbar (currently unused)
│   │   │   └── markdown-guide.tsx            # Collapsible Markdown syntax reference
│   │   ├── forms/
│   │   │   └── CreateFormModal.tsx            # Modal for creating forms
│   │   ├── home/                             # Marketing homepage components
│   │   │   ├── Header.tsx, Hero.tsx, Features.tsx
│   │   │   ├── Pricing.tsx, Testimonials.tsx
│   │   │   ├── RecentPosts.tsx, CTA.tsx, Footer.tsx
│   │   ├── mdx/                              # Embeddable content components
│   │   │   ├── Form.tsx                      # Waitlist/email capture form
│   │   │   └── BlogPosts.tsx                 # Blog post listing widget
│   │   └── ui/
│   │       ├── button.tsx                    # shadcn/ui Button (only shadcn component)
│   │       └── CopyButton.tsx                # Clipboard copy utility
│   └── lib/
│       ├── prisma.ts                         # Prisma client singleton
│       ├── utils.ts                          # cn() utility (clsx + tailwind-merge)
│       ├── remark-sections.ts                # Custom remark plugin for directives
│       └── marketing-blog.ts                 # Static marketing blog data
├── docs/                                     # Documentation
├── next.config.ts                            # Next.js config (image remote patterns)
├── components.json                           # shadcn/ui configuration
├── tsconfig.json                             # TypeScript config (strict, bundler resolution)
├── package.json                              # Dependencies and scripts
└── eslint.config.mjs                         # ESLint flat config
```

---

## 4. Getting Started (Local Development)

### Prerequisites

- Node.js (LTS recommended)
- A Neon PostgreSQL database (free tier works)
- A Clerk application (free tier works)

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd lite-cms
npm install

# 2. Configure environment
cp .env.example .env   # or create .env manually (see Section 16)

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy

# 4. Start dev server
npm run dev
```

### Local Domain Setup

The app uses **subdomain-based routing**. For local development:

- **Main site:** `http://localhost:3000` — marketing homepage
- **Dashboard:** `http://app.localhost:3000` — admin panel
- **Tenant sites:** `http://<subdomain>.localhost:3000` — public sites

Modern browsers resolve `*.localhost` automatically. Set `NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000` in `.env`.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `next dev` | Start development server with hot reload |
| `npm run build` | `npx prisma generate && next build` | Generate Prisma client + production build |
| `npm start` | `next start` | Start production server |
| `npm run lint` | `eslint` | Run ESLint |

---

## 5. Architecture Overview

LiteCMS follows a **server-first architecture** using Next.js App Router patterns:

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Marketing │  │  Dashboard   │  │  Public Tenant   │  │
│  │   Site    │  │   (app.*)    │  │   Sites (*.)     │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              MIDDLEWARE (proxy.ts)                        │
│  Clerk Auth  +  Subdomain Routing  +  URL Rewrites       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              NEXT.JS APP ROUTER                          │
│  ┌────────────────┐  ┌───────────────┐  ┌────────────┐ │
│  │ Server         │  │ Server        │  │ API Route  │ │
│  │ Components     │  │ Actions       │  │ (leads)    │ │
│  │ (data fetch)   │  │ (mutations)   │  │            │ │
│  └───────┬────────┘  └──────┬────────┘  └─────┬──────┘ │
└──────────┼──────────────────┼──────────────────┼────────┘
           │                  │                  │
┌──────────▼──────────────────▼──────────────────▼────────┐
│                    PRISMA ORM                            │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│              NEON POSTGRESQL (Serverless)                 │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Server Actions over API routes:** Nearly all mutations use Next.js `"use server"` functions. The only REST endpoint is the public lead creation route.
2. **Server Components by default:** Pages fetch data directly in async server components. Client components (`"use client"`) are used only for interactive UI (modals, editors, forms, tables with state).
3. **Markdown as the content format:** Pages and blog posts store raw Markdown with YAML frontmatter. A custom remark plugin transforms directives into rich layouts.
4. **Multi-tenant by subdomain:** The middleware layer handles routing to tenant sites based on the hostname.
5. **Lazy user sync:** Database user records are created on first action (not via Clerk webhooks).
6. **No global state management:** Server components pass data as props; client components use local `useState`.

---

## 6. Multi-Tenant Routing & Middleware

The middleware (`src/proxy.ts`) wraps Clerk's `clerkMiddleware` and implements subdomain-based multi-tenant routing.

### Routing Logic

| Incoming Request | Behavior |
|---|---|
| `app.localhost:3000/...` | Rewrite to `/app/...` (dashboard routes) |
| `<subdomain>.localhost:3000/...` | Rewrite to `/sites/<subdomain>/...` (public site) |
| Custom domain (e.g., `example.com`) | Rewrite to `/sites/<hostname>/...` (public site) |
| `localhost:3000/...` | Pass through (marketing site) |
| API routes on any subdomain | Pass through without rewrite |

### Convenience Rewrites on Main Domain

- `/dashboard` → `/app`
- `/admin` → `/app/admin`
- `/site/...` → `/app/site/...`

### Domain Resolution

The `getSiteByDomain()` server action resolves a hostname to a site using multiple strategies:
1. Direct subdomain match
2. Custom domain match
3. `www.` prefix stripping
4. Full hostname as subdomain fallback

---

## 7. Authentication & Authorization

### Authentication (Clerk)

- **Provider:** Clerk handles all auth flows (sign-up, sign-in, OAuth, session management)
- **Root layout** wraps the app in `<ClerkProvider>`
- **Middleware** uses `clerkMiddleware()` to protect routes
- **Server actions** call `currentUser()` from `@clerk/nextjs/server` to get the authenticated user

### Authorization (Role-Based)

Two roles defined in the database:

| Role | Permissions |
|---|---|
| `ADMIN` | Default role. Can create/manage their own sites and content. |
| `SUPER_ADMIN` | Can access `/app/admin/*`. Can view all sites and all users across the platform. |

### Ownership Model

- Every site belongs to a `User` (via `userId` foreign key)
- Server actions verify `site.user.clerkId === currentUser.id` before allowing mutations
- The admin layout (`src/app/app/admin/layout.tsx`) checks the DB role and redirects non-super-admins

### Lazy User Sync

User records are created in the database **on first action** (e.g., creating a site), not via Clerk webhooks:

```typescript
let dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
if (!dbUser) {
    dbUser = await prisma.user.create({
        data: { clerkId: user.id, email: user.emailAddresses[0].emailAddress },
    });
}
```

This is acknowledged in the codebase as an MVP pattern.

---

## 8. Database Schema

**Database:** PostgreSQL on Neon (serverless, `us-east-1`)
**Schema file:** `prisma/schema.prisma`

### Entity Relationship Diagram

```
User 1───* Site 1───* Page
                 1───* BlogPost
                 1───* Asset (unused in UI)
                 1───* Menu 1───* MenuItem ───? Page
                            1───* MenuCta
                            1───* SocialLink
                 1───* Form 1───* Lead
                 ?───1 Page (homePage)
```

All child relations use `onDelete: Cascade`.

### Models

| Model | Purpose | Notable Fields |
|---|---|---|
| **User** | Platform users (synced from Clerk) | `clerkId` (unique), `email`, `role` (ADMIN/SUPER_ADMIN) |
| **Site** | A tenant website | `subdomain` (unique), `customDomain` (unique, nullable), `settings` (JSON — theme, scripts, fonts), `homePageId` (optional FK to Page) |
| **Page** | Content page within a site | `title`, `slug`, `content` (Markdown text), `published`, unique on `[siteId, slug]` |
| **BlogPost** | Blog entry within a site | `title`, `slug`, `content`, `image`, `author`, `published`, `publishedAt`, unique on `[siteId, slug]` |
| **Asset** | File assets per site | `key`, `url`, `alt` — **no UI implementation yet** |
| **Menu** | Navigation menu per site | `name` (e.g., "Main", "Footer") |
| **MenuItem** | Navigation link in a menu | `label`, `url`, `anchor`, `order`, optional FK to `Page` |
| **MenuCta** | CTA button in a menu | `label`, `url`, `style` ("primary" or "secondary") |
| **SocialLink** | Social media link in a menu | `platform`, `url` |
| **Form** | Lead capture form per site | `name`, `type` (default "waitlist") |
| **Lead** | Form submission | `email`, `data` (JSON, nullable) |

### The `settings` JSON Shape (Site)

The `Site.settings` field stores a JSON object with this shape:

```typescript
{
  colors: {
    primary: string,        // e.g., "#6366f1"
    background: string,     // e.g., "#ffffff"
    text: string,           // e.g., "#1a1a1a"
    iconBackground: string,
    iconColor: string
  },
  buttonColors: {
    background: string,
    text: string,
    secondaryBackground: string,
    secondaryText: string
  },
  customColors: Array<{ id: string, value: string }>,
  font: string,             // Google Font name, e.g., "Inter"
  customScripts: Array<{ id: string, type: "url" | "inline", value: string }>
}
```

---

## 9. Server Actions (Business Logic)

All business logic lives in three server action files. There is no traditional REST API layer beyond the single leads endpoint.

### `src/app/actions.ts` — Core CRUD

| Action | Purpose |
|---|---|
| `createSite(formData)` | Creates a site; lazy-syncs user; handles duplicate subdomain (P2002) |
| `getSites()` | Lists sites — SUPER_ADMIN sees all, ADMIN sees own |
| `getSite(siteId)` | Returns site with pages, menus, user |
| `updateSite(siteId, data)` | Updates name, description, settings, customDomain (with domain validation) |
| `createPage(siteId, formData)` | Creates a page; auto-adds it to Main/Footer menus based on frontmatter |
| `getPage(pageId)` | Returns page with site and menuItems (ownership-checked) |
| `updatePage(siteId, pageId, data)` | Parses frontmatter, syncs menu assignments, updates page |
| `getPageBySiteAndSlug(siteId, slug)` | Public page lookup by compound key |
| `getSiteByDomain(domain)` | Multi-strategy domain resolution for public sites |
| `getMenus(siteId)` | Returns all menus with items, CTAs, social links |
| `createMenu / deleteMenu` | Menu CRUD |
| `upsertMenuItem / deleteMenuItem / updateMenuItemOrder` | Menu item CRUD + batch reordering via `$transaction` |
| `createMenuCta / deleteMenuCta` | CTA button CRUD |
| `createSocialLink / deleteSocialLink` | Social link CRUD |
| `getUsers()` | SUPER_ADMIN: list all users with site counts |

### `src/actions/blog.ts` — Blog CRUD

| Action | Purpose |
|---|---|
| `getBlogPosts(siteId)` | Lists all posts for a site (authenticated) |
| `getBlogPost(postId)` | Single post with ownership check |
| `createBlogPost(siteId, title)` | Creates post with default Markdown frontmatter template |
| `updateBlogPost(siteId, postId, content)` | Parses frontmatter, updates all fields |
| `deleteBlogPost(siteId, postId)` | Deletes a post |
| `getPublicBlogPosts(siteId, count)` | Published posts for public display (no auth) |
| `getPublicBlogPost(siteId, slug)` | Single published post by slug (no auth) |

### `src/app/actions-forms.ts` — Forms & Leads

| Action | Purpose |
|---|---|
| `createForm(siteId, name)` | Creates a form |
| `getForms(siteId)` | Lists forms with lead counts |
| `deleteForm(formId, siteId)` | Deletes a form |
| `getLeads(siteId)` | Lists all leads across all forms for a site |

### `src/app/api/leads/create/route.ts` — REST Endpoint

The only REST API route. **Public, unauthenticated.** Accepts `POST` with `{ formId, email }`, validates the email format with a regex, and creates a Lead record.

---

## 10. Content System & Markdown Directives

The content system is the core differentiator of LiteCMS. Pages and blog posts are authored in Markdown with YAML frontmatter and custom directives.

### Frontmatter

Parsed by `gray-matter`. Example page frontmatter:

```yaml
---
title: About Us
description: Learn more about our team
menu:
  main: true
  footer: false
published: true
---
```

Blog post frontmatter:

```yaml
---
title: My First Post
slug: my-first-post
date: 2026-01-15
published: true
author: John Doe
image: https://images.unsplash.com/photo-xxx
description: A brief introduction
---
```

### Custom Markdown Directives

Powered by `remark-directive` and a custom plugin at `src/lib/remark-sections.ts`.

| Directive | Syntax | Rendered Output |
|---|---|---|
| **Section** | `::::section{layout="50-50" bg="primary" id="hero"}` | Responsive grid container (CSS grid, 12-column system) |
| **Column** | `:::column{align="center"}` | Flex column within a section |
| **Card** | `:::card` | Styled card component |
| **Button** | `::button[Click Me]{href="/page" variant="primary"}` | Themed CTA button |
| **Icon** | `::icon{name="Rocket"}` | Renders any Lucide icon by name |
| **Text** | `:text[highlighted]{color="primary"}` or `:t[text]{color="primary"}` | Colored text span using theme colors |
| **Break** | `::breakline{height="4rem"}` or `::br{h="2rem"}` | Vertical spacer |
| **Avatar** | `::avatar[JD]` | Circle avatar with initials |
| **Form** | `::form{id="abc123"}` | Embedded lead capture form (renders React component) |
| **Blog Posts** | `::blog-posts{count="3"}` | Embedded blog post listing (renders React component) |

### Layout System

The `layout` attribute on sections maps to a 12-column CSS grid:

| Layout Value | Grid Template |
|---|---|
| `50-50` | `6fr 6fr` |
| `33-67` | `4fr 8fr` |
| `67-33` | `8fr 4fr` |
| `33-33-33` | `4fr 4fr 4fr` |
| `25-25-25-25` | `3fr 3fr 3fr 3fr` |
| `100` | `12fr` |

Sections also support `bg` (background color from theme), `textColor`, `py` (vertical padding), and `id` (anchor links).

### Rendering Pipeline

```
Markdown Content (stored in DB)
    │
    ▼
gray-matter          → Extracts frontmatter (title, description, etc.)
    │
    ▼
react-markdown       → Transforms Markdown to React
    ├── remark-gfm           → Tables, strikethrough, task lists
    ├── remark-directive      → Parses ::directive{} syntax
    ├── remarkSections        → Custom plugin: converts directives to HTML
    └── rehype-raw            → Allows raw HTML passthrough
    │
    ▼
MarkdownRenderer     → Maps custom HTML elements to React components
    ├── IconComponent         → Dynamic Lucide icon by name
    ├── Form (mdx)            → Email capture form
    └── BlogPosts (mdx)       → Blog post listing
    │
    ▼
Themed HTML Output   → CSS variables from site.settings applied
```

---

## 11. Page & Blog Editor

### Editor Component (`src/components/editor/editor.tsx`)

A **split-pane editor** with:

- **Left pane:** Live Markdown preview via `MarkdownRenderer` (applies site theme)
- **Right pane:** Raw textarea for Markdown source editing
- **Sidebar:** Toggleable Markdown syntax guide (`src/components/editor/markdown-guide.tsx`)

### Auto-Save Mechanism

Both the page editor (`src/app/app/site/[id]/editor/[pageId]/client.tsx`) and blog editor (`src/app/app/site/[id]/blog/[postId]/client.tsx`) implement:

1. User types → `onChange` fires
2. Status set to "Unsaved" immediately
3. Debounce timer starts (1000ms)
4. After debounce → server action called (`updatePage` or `updateBlogPost`)
5. On success → status set to "Saved"
6. On error → toast notification

Visual status indicator shows: **Saved** (green) / **Saving...** (yellow) / **Unsaved** (gray).

### TipTap (Installed but Unused)

TipTap packages (`@tiptap/react`, `@tiptap/starter-kit`, extensions for link/image, `tiptap-markdown`) and a toolbar component (`src/components/editor/toolbar.tsx`) exist in the codebase but are not wired into the current editor. The active editor uses a plain `<textarea>`.

---

## 12. Public Site Rendering

The public site renderer at `src/app/sites/[site]/[[...slug]]/page.tsx` handles all public-facing tenant pages.

### What It Renders

| URL Path | Behavior |
|---|---|
| `/` (no slug) | Renders the site's designated home page |
| `/blog` | Renders the blog index (list of published posts) |
| `/blog/<post-slug>` | Renders a single blog post |
| `/<page-slug>` | Renders the matching published page |

### Page Structure

Every public page renders:

1. **Header** — Site name/logo, navigation links from "Main" menu, CTA buttons
2. **Content** — Page Markdown via `MarkdownRenderer`, or blog-specific layout
3. **Footer** — Links from "Footer" menu, social media icons, copyright notice

### Theme Application

Site theme colors from `settings` JSON are injected as CSS custom properties on the root container:

```css
--theme-primary: #6366f1;
--theme-background: #ffffff;
--theme-text: #1a1a1a;
--theme-button-background: #000000;
--theme-button-text: #ffffff;
/* ... etc */
```

### Custom Scripts

Site owners can add custom scripts (Google Analytics, chat widgets, etc.) via the settings page. These are injected using Next.js `<Script>` tags — supports both external URLs and inline code.

### SEO

Dynamic metadata is generated via `generateMetadata()` using page title, description, and site name.

---

## 13. UI Components & Styling

### Component Architecture

The app follows the **server-first with client islands** pattern:

- **Server Components:** All page-level components that fetch data
- **Client Components:** Interactive elements (modals, editors, forms, the menu manager)

### Styling Approach

- **Tailwind CSS v4** utility classes everywhere — no CSS modules or styled-components
- **shadcn/ui new-york style** configured but only `Button` installed
- **CSS variables** for theming (OKLCH color space in `globals.css`)
- **Fonts:** Geist Sans + Geist Mono via `next/font/google`
- **Consistent patterns:** Tables use rounded borders + gray headers; modals use fixed positioning with backdrop blur

### Key UI Components

| Component | Type | Purpose |
|---|---|---|
| `Button` (shadcn) | Client | Primary UI button with variants (default, destructive, outline, secondary, ghost, link) and sizes |
| `CreateSiteModal` | Client | Modal form for creating new sites (name + subdomain) |
| `CreatePageModal` | Client | Modal form for creating pages (title + slug + menu selection) |
| `SiteTable` | Client | Sortable table listing sites with links to management pages |
| `PageTable` | Client | Sortable table listing pages with edit/publish/delete actions |
| `MenuManager` | Client | Complex component: menu CRUD, item management, CTA buttons, social links, drag reordering |
| `SiteSettingsForm` | Client | Multi-section settings form (general, theme colors, button colors, custom colors, font, custom scripts) |
| `Editor` | Client | Split-pane Markdown editor with live preview |
| `MarkdownRenderer` | Server | Transforms Markdown + directives into themed React output |
| `CopyButton` | Client | Clipboard copy utility with success feedback |

### Form Handling Patterns

1. **FormData + Server Actions:** `CreateSiteModal`, `CreatePageModal` — `<form action={handleSubmit}>`
2. **Controlled + onSubmit:** `MenuManager` sub-forms, `CreateFormModal` — `e.preventDefault()` pattern
3. **Inline Server Actions:** Blog post list page — `"use server"` functions defined inside the component
4. **Auto-Save (debounced):** Page and blog editors — `setTimeout`-based debounce

**No form validation library** (no Zod, React Hook Form, etc.). Validation is inline.

---

## 14. Routing Reference

### Marketing / Public (main domain)

| Route | Description |
|---|---|
| `/` | Marketing homepage |
| `/blog` | Marketing blog listing (static data) |
| `/blog/[slug]` | Marketing blog post (static data) |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk sign-up |

### Dashboard (app.localhost)

| Route | Description |
|---|---|
| `/app` | Dashboard home — list user's sites |
| `/app/admin` | Redirects to `/app/admin/sites` |
| `/app/admin/sites` | SUPER_ADMIN: all sites listing |
| `/app/admin/users` | SUPER_ADMIN: all users listing |
| `/app/site/[id]` | Site detail — page list + management links |
| `/app/site/[id]/editor/[pageId]` | Page content editor |
| `/app/site/[id]/blog` | Blog post listing + create/delete |
| `/app/site/[id]/blog/[postId]` | Blog post content editor |
| `/app/site/[id]/forms` | Form management + embed codes |
| `/app/site/[id]/leads` | Lead submissions viewer |
| `/app/site/[id]/menus` | Navigation menu manager |
| `/app/site/[id]/settings` | Site settings (theme, domain, scripts) |

### Public Tenant Sites (subdomain or custom domain)

| Route | Description |
|---|---|
| `/sites/[site]/` | Home page of the tenant site |
| `/sites/[site]/blog` | Blog index |
| `/sites/[site]/blog/[slug]` | Blog post |
| `/sites/[site]/[slug]` | Page by slug |

### API

| Route | Method | Auth | Description |
|---|---|---|---|
| `/api/leads/create` | POST | None (public) | Create a lead submission |

---

## 15. Data Flow Diagrams

### Dashboard: Creating a Page

```
User fills CreatePageModal → form submits
    │
    ▼
createPage(siteId, formData)      [Server Action]
    │
    ├── Auth check (currentUser())
    ├── Verify site ownership
    ├── Create Page record in DB
    ├── Auto-create MenuItem in "Main" and/or "Footer" menu
    ├── revalidatePath()
    │
    ▼
router.refresh() → Server Component re-renders with new data
```

### Public: Viewing a Tenant Page

```
Browser → https://mysite.localhost:3000/about
    │
    ▼
Middleware (proxy.ts)
    ├── Detects subdomain: "mysite"
    ├── Rewrites to: /sites/mysite/about
    │
    ▼
/sites/[site]/[[...slug]]/page.tsx
    ├── getSiteByDomain("mysite") → resolves Site
    ├── getPageBySiteAndSlug(siteId, "about") → resolves Page
    ├── Renders Header (from "Main" menu)
    ├── Renders MarkdownRenderer(page.content, site.settings)
    │     ├── gray-matter → extracts frontmatter
    │     ├── remark pipeline → processes directives
    │     └── React components → themed HTML output
    ├── Renders Footer (from "Footer" menu + social links)
    └── Injects custom scripts
```

### Lead Capture Flow

```
Visitor sees ::form{id="abc123"} on a public page
    │
    ▼
Form component renders (client-side)
    ├── User enters email
    ├── Submits form
    │
    ▼
POST /api/leads/create  { formId: "abc123", email: "user@example.com" }
    │
    ├── Validates email format
    ├── prisma.lead.create()
    │
    ▼
Lead appears in /app/site/[id]/leads
```

---

## 16. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string (with `?sslmode=require`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk frontend publishable key (starts with `pk_test_` or `pk_live_`) |
| `CLERK_SECRET_KEY` | Yes | Clerk server-side secret key (starts with `sk_test_` or `sk_live_`) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Yes | Root domain for subdomain parsing (`localhost:3000` in dev, `yourdomain.com` in prod) |

---

## 17. Known Gaps & TODOs

These are areas to be aware of — features that are incomplete, patterns that need improvement, or technical debt.

### Missing Features
- **No file upload / media management** — The `Asset` model exists but no UI or upload logic is implemented. Images are external URLs only.
- **No tests** — Zero unit, integration, or e2e tests
- **No CI/CD pipeline** — No GitHub Actions, no automated deployments
- **No Docker configuration** — No containerization support

### Technical Debt
- **Inconsistent auth checks in server actions** — Some actions (menu CRUD, form CRUD, some page ops) lack explicit Clerk auth verification; they rely on the calling pages being behind authenticated routes
- **`any` types** — Several components use `any` for site/page objects (e.g., `site?: any` in editor props) instead of proper TypeScript interfaces
- **No shared type definitions** — Types are defined inline in each component or imported directly from Prisma
- **No form validation library** — All validation is inline/ad-hoc (no Zod, Yup, etc.)
- **Inconsistent error handling** — `actions.ts` returns `{ error: "..." }` objects while `actions-forms.ts` throws errors
- **TipTap installed but unused** — The rich text editor packages and toolbar component exist but aren't wired up
- **`.env` committed despite `.gitignore`** — Real credentials may have been committed to git history
- **Single migration** — The entire schema is in one migration, making it harder to track schema evolution
- **`settings` as untyped JSON** — The site settings field is cast with `as any` throughout; no TypeScript interface or Zod schema validates its shape

### Architecture Considerations
- **Lazy user sync** instead of Clerk webhooks — could cause edge cases if user data changes in Clerk
- **No rate limiting** on the public lead creation API
- **No image optimization** beyond Next.js defaults — only `images.unsplash.com` is whitelisted
- **Custom scripts injection** — could pose XSS risks if not properly sandboxed

---

## 18. Key Files Quick Reference

For any task, these are the files you'll most likely need:

| Task | File(s) |
|---|---|
| Understanding the data model | `prisma/schema.prisma` |
| Modifying business logic | `src/app/actions.ts`, `src/actions/blog.ts`, `src/app/actions-forms.ts` |
| Changing how content renders | `src/components/markdown-renderer.tsx`, `src/lib/remark-sections.ts` |
| Modifying the editor | `src/components/editor/editor.tsx`, `src/app/app/site/[id]/editor/[pageId]/client.tsx` |
| Changing tenant site look | `src/app/sites/[site]/[[...slug]]/page.tsx` |
| Modifying routing/middleware | `src/proxy.ts` |
| Changing auth behavior | `src/proxy.ts` (middleware), server actions (ownership checks) |
| Adding a new dashboard page | `src/app/app/site/[id]/` (follow existing patterns) |
| Adding a new server action | `src/app/actions.ts` or create a new file under `src/actions/` |
| Changing the marketing site | `src/app/page.tsx`, `src/components/home/*` |
| Modifying theme/styling | `src/app/globals.css`, `src/app/app/site/[id]/settings/SiteSettingsForm.tsx` |
| Adding a shadcn component | Run `npx shadcn@latest add <component>` (configured in `components.json`) |
| Database changes | Edit `prisma/schema.prisma`, run `npx prisma migrate dev` |
