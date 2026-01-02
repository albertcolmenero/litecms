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
  if (hostname === "app.localhost" || hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    // Avoid double-rewriting if path already starts with /app
    if (url.pathname.startsWith('/app')) {
      console.log(`[Proxy] Skipping rewrite for /app path: ${url.pathname} (${Date.now() - start}ms)`);
      return NextResponse.next();
    }

    console.log(`[Proxy] Rewriting to /app${path === "/" ? "" : path} (${Date.now() - start}ms)`);
    return NextResponse.rewrite(new URL(`/app${path === "/" ? "" : path}`, req.url));
  }

  // 2. Subdomain Routing (e.g. foo.localhost) -> Public Sites
  if (
    hostname !== "localhost" &&
    hostname !== "app.localhost" &&
    hostname !== process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    console.log(`[Proxy] Rewriting to /sites/${hostname}${path} (${Date.now() - start}ms)`);
    return NextResponse.rewrite(
      new URL(`/sites/${hostname}${path}`, req.url)
    );
  }

  // 3. Main Domain
  console.log(`[Proxy] Pass through (${Date.now() - start}ms)`);
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
