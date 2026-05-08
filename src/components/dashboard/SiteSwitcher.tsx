"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteForChrome } from "./types";

const DEFAULT_ACCENT = "oklch(0.205 0 0)";

export function SiteSwitcher({
  current,
  sites,
  basePath = "/app",
}: {
  current: SiteForChrome;
  sites: SiteForChrome[];
  basePath?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-md border border-sidebar-border bg-sidebar px-2.5 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors"
      >
        <span
          className="h-7 w-7 shrink-0 rounded-md"
          style={{ backgroundColor: current.accent ?? DEFAULT_ACCENT }}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-sidebar-foreground">{current.name}</span>
          <span className="block truncate text-xs text-muted-foreground font-mono">
            {current.subdomain}
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-border bg-popover shadow-lg">
            <ul className="max-h-72 overflow-y-auto py-1">
              {sites.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`${basePath}/site/${s.id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-2.5 py-2 text-sm hover:bg-accent"
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded"
                      style={{ backgroundColor: s.accent ?? DEFAULT_ACCENT }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{s.name}</span>
                      <span className="block truncate text-xs text-muted-foreground font-mono">
                        {s.subdomain}
                      </span>
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 text-foreground",
                        current.id === s.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={basePath}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 border-t border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              New site
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
