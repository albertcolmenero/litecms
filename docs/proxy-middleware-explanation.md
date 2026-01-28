# Explanation of `src/proxy.ts`

The file `src/proxy.ts` implements **Middleware** for the Next.js application. Although usually named `middleware.ts` in Next.js projects, this file contains the logic for handling request routing, authentication, and URL rewriting before a request reaches page components.

It serves as the traffic controller for the multi-tenant application, handling three main scenarios: the **App Dashboard** (`app.domain`), **Public Sites** (`subdomain.domain`), and the **Main Marketing Site**.

## Key Functions

### 1. Authentication & Setup
*   It wraps the entire logic in `clerkMiddleware`, enabling Clerk authentication security.
*   It extracts the `hostname` from headers to determine which domain the user is visiting (e.g., `app.localhost` vs `myshop.localhost`).

### 2. App / Dashboard Routing
**Scenario:** User visits `app.localhost` (or the production app domain).
*   **Goal:** Route them to the internal dashboard logic located in `src/app/app/...`.
*   **Logic:**
    *   It checks if the hostname is `app.localhost`.
    *   It **skips rewriting** if the path is `/sign-in` or `/sign-up` (allowing public access to auth pages) or if it's already `/app`.
    *   Otherwise, it **rewrites** the URL to prepend `/app`.
    *   *Example:* Request to `app.localhost/dashboard` -> rewritten to handle `src/app/app/dashboard`.

### 3. Tenant / Site Routing
**Scenario:** User visits a custom subdomain like `my-blog.localhost`.
*   **Goal:** Show the specific public site for that tenant.
*   **Logic:**
    *   It filters out system domains (`localhost`, `app.localhost`, `process.env.NEXT_PUBLIC_ROOT_DOMAIN`, etc.).
    *   If it matches a custom subdomain, it **rewrites** the request to `/sites/[hostname]`.
    *   *Example:* Request to `cool-agency.localhost/about` -> rewritten to `src/app/sites/cool-agency/about`.
    *   *Note:* API routes (`/api`) generally bypass this rewrite.

### 4. Convenience & Internal Rewrites
*   **Shortcuts:** `domain.com/dashboard` or `domain.com/admin` are rewritten to `/app`, serving as quick aliases for the main application.
*   **Site Preview:** Requests to `/site/...` are rewritten to `/app/site/...`. This is likely used so logged-in users can manage or preview sites from within the app context.

### 5. Configuration
*   The `matcher` config tells Next.js **when** to run this middleware.
*   It is configured to run on almost all routes except static files (images, fonts, etc.) and Next.js internals (`_next`).

## Critical Note on Filename
For this file to actually function as the active middleware in Next.js, it **must be named `middleware.ts`** (or `middleware.js`) and placed in the root or `src/` directory. If `src/proxy.ts` is not imported by an actual `middleware.ts` file, it will not be executed by Next.js.
