# Custom Domain Implementation Analysis & Plan

## Goal Description
Allow users to publish their websites to a custom domain (e.g., `www.example.com` instead of `subdomain.platform.com`). This requires updates to the database (already supported), backend actions, and the UI.

## Infrastructure Analysis (Critical)
To fully support custom domains with SSL/HTTPS:
1.  **DNS**: The user must point their domain (A record or CNAME) to our infrastructure.
2.  **Routing**: Our application middleware (`src/proxy.ts`) already handles `Host` header rewriting to `/sites/[domain]`.
3.  **SSL/Termination**: 
    -   If hosting on **Vercel**, we must use the Vercel API to add the domain to the project programmatically, or the user must add it manually to Vercel project settings. Simply pointing DNS is not enough for Vercel to serve HTTPS.
    -   If hosting on a **VPS** (e.g. with Coolify/Dokku) and using a proxy like **Caddy**, Caddy can handle On-Demand TLS for custom domains automatically.
    -   **Current Assumption**: We will implement the **Application Layer** support (DB + Routing). The infrastructure layer is assumed to handle the SSL termination (e.g. wildcard or on-demand).

## User Review Required
> [!IMPORTANT]
> **SSL Provisioning**: This plan implements the **code** changes to allow the app to recognize custom domains. However, you must ensure your hosting provider (Vercel, Railway, VPS+Caddy) is configured to accept traffic for these unknown domains and provision SSL certificates. Without this, users will get SSL errors.

## Proposed Changes

### Database & Actions
The `Site` model already has `customDomain`. We need to expose it in the update action.

#### [MODIFY] [actions.ts](file:///Users/albertcolmenero/Code/lite-cms/src/app/actions.ts)
- Update `updateSite` function signature to accept `customDomain`.
- Ensure unique constraint violation errors (if domain is taken) are handled gracefully.

### UI Components

#### [MODIFY] [settings/page.tsx](file:///Users/albertcolmenero/Code/lite-cms/src/app/app/site/%5Bid%5D/settings/page.tsx)
- Add a "Custom Domain" section.
- Input field for `customDomain`.
- "Save" button to trigger `updateSite`.
- Instructions for the user:
    - "Create a CNAME record for `www` pointing to `cname.yourplatform.com`" (or A record instructions).
    - Display the configured domain and a status (implicit).

## Verification Plan

### Manual Verification
1.  **Database Update**:
    -   Go to Site Settings.
    -   Enter a custom domain (e.g. `test.example.com`).
    -   Save.
    -   Verify in `SiteTable` (Dashboard) that the custom domain is shown.
    -   Verify in Database (via Prisma Studio or `actions.ts` logs) that it persists.

2.  **Routing Simulation**:
    -   (Localhost) Modifying `/etc/hosts` to point `test.example.com` to `127.0.0.1`.
    -   Visit `http://test.example.com:3000`.
    -   Middleware should log `[Proxy] Request: ... Host: test.example.com`.
    -   Middleware should rewrite to `/sites/test.example.com`.
    -   The correct site content should load.

### Automated Tests
-   None planned for this iteration (MVP feature).
