import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);

export default clerkMiddleware(async (auth, req) => {
  const start = Date.now();
  const url = req.nextUrl;
  let hostname = req.headers.get("host")!;

  // Handle localhost port
  hostname = hostname.replace(":%3A", ":"); // potential encoding fix
  hostname = hostname.split(":")[0]; // remove port

  console.log(`[Proxy] Request: ${req.method} ${url.pathname} Host: ${hostname}`);

  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

  // 1. App / Dashboard Routing (app.localhost or app.domain.com)
  if (hostname === "app.localhost") {
    // Avoid double-rewriting if path already starts with /app
    if (url.pathname.startsWith('/app')) {
      console.log(`[Proxy] Skipping rewrite for /app path: ${url.pathname} (${Date.now() - start}ms)`);
      return NextResponse.next();
    }

    // Exclude API routes from rewrite so /api/* works on app subdomain
    if (url.pathname.startsWith("/api")) {
      console.log(`[Proxy] API request on app subdomain: ${url.pathname} - Passing through`);
      return NextResponse.next();
    }

    // Exclude public auth routes from rewrite
    if (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/sign-up")) {
      console.log(`[Proxy] Skipping rewrite for auth path: ${url.pathname}`);
      return NextResponse.next();
    }

    console.log(`[Proxy] Rewriting to /app${path === "/" ? "" : path} (${Date.now() - start}ms)`);
    return NextResponse.rewrite(new URL(`/app${path === "/" ? "" : path}`, req.url));
  }

  // 2. Subdomain Routing (e.g. foo.localhost) -> Public Sites
  // This also handles CUSTOM DOMAINS (e.g., customdomain.com).
  // Any hostname not matching system domains gets rewritten to /sites/[hostname].
  // The page at /sites/[hostname] calls getSiteByDomain() which queries:
  //   - customDomain field (for external domains like albertcolmenero.com)
  //   - subdomain field (for subdomain.lite-cms.com)
  if (
    hostname !== "localhost" &&
    hostname !== "app.localhost" &&
    hostname !== process.env.NEXT_PUBLIC_ROOT_DOMAIN &&
    hostname !== "litecms-six.vercel.app" &&
    hostname !== "lite-cms.com" &&
    hostname !== "www.lite-cms.com" &&
    hostname !== process.env.VERCEL_URL
  ) {
    // Determine if it's an API route (which should bypass subdomain rewrite)
    if (url.pathname.startsWith('/api')) {
      console.log(`[Proxy] API request on subdomain: ${url.pathname} - Passing through`);
      return NextResponse.next();
    }

    console.log(`[Proxy] Rewriting to /sites/${hostname}${path} (${Date.now() - start}ms)`);
    return NextResponse.rewrite(
      new URL(`/sites/${hostname}${path}`, req.url)
    );
  }

  // 3. Main Domain
  console.log(`[Proxy] Pass through (${Date.now() - start}ms)`);

  // [NEW] Convenience rewrites for Vercel/Root domain usage
  if (url.pathname === "/dashboard" || url.pathname === "/admin") {
    return NextResponse.rewrite(new URL("/app", req.url));
  }

  // [NEW] Rewrite /site/... to /app/site/... for dashboard site links
  if (url.pathname.startsWith("/site/")) {
    return NextResponse.rewrite(new URL(url.pathname.replace("/site", "/app/site"), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
