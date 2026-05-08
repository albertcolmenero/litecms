import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { SiteForChrome } from "./types";

export function Topbar({
  site,
  basePath = "/app",
}: {
  site?: SiteForChrome;
  basePath?: string;
}) {
  const liveUrl = site
    ? site.customDomain
      ? `https://${site.customDomain}`
      : `http://${site.subdomain}.localhost:3000`
    : null;

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur">
      {site ? (
        <>
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-sm font-medium text-foreground truncate">{site.name}</span>
            <span className="text-xs text-muted-foreground font-mono truncate hidden sm:inline">
              {site.customDomain ?? `${site.subdomain}.localhost:3000`}
            </span>
          </div>
          {liveUrl ? (
            <div className="ml-2 hidden md:block">
              <Button variant="outline" size="sm" asChild>
                <a href={liveUrl} target="_blank" rel="noreferrer">
                  View live
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <Link href={basePath} className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-md bg-foreground" />
          <span className="font-semibold tracking-tight">lite</span>
        </Link>
      )}

      <div className="ml-auto flex items-center gap-2">
        <button className="hidden md:flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-xs text-muted-foreground hover:bg-accent">
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
        </button>
        <UserButton
          appearance={{
            elements: { avatarBox: "h-8 w-8" },
          }}
        />
      </div>
    </header>
  );
}
