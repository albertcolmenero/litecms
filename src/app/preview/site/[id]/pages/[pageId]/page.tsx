import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Eye,
  Heart,
  Rocket,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
  Columns,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { Topbar } from "@/components/dashboard/Topbar";
import { getSite, PAGES } from "@/components/preview/mock";

const SAMPLE_MARKDOWN = `---
title: Home
description: Hero, features, pricing, footer
---

::::section{layout="50-50" bg="primary" id="hero"}
  :::column
  ## Welcome to Acme Studio

  Build elegant sites without writing code.

  ::button[Get started]{href="/sign-up" variant="primary"}
  :::
  :::column
  ::icon{name="Rocket"}
  :::
::::

::::section{layout="33-33-33"}
  :::column
    :::card
    ::icon{name="Sparkles"}
    ### Fast
    Ship in minutes, not weeks.
    :::
  :::
  :::column
    :::card
    ::icon{name="Heart"}
    ### Beautiful
    Designed by humans, for humans.
    :::
  :::
  :::column
    :::card
    ::icon{name="Zap"}
    ### Powerful
    All the tools you need.
    :::
  :::
::::
`;

export default async function EditorMockup({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id, pageId } = await params;
  const site = getSite(id);
  const page = PAGES.find((p) => p.id === pageId) ?? PAGES[0];
  const base = `/preview/site/${id}`;

  return (
    <div className="flex h-svh flex-col bg-background">
      <Topbar site={site} />

      {/* Editor toolbar */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`${base}/pages`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Pages
          </Link>
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-foreground truncate">{page.title}</span>
          <span className="font-mono text-xs text-muted-foreground">{page.slug}</span>
        </div>

        <div className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          Saved a moment ago
        </div>

        <div className="ml-auto flex items-center gap-2">
          {page.published ? (
            <StatPill tone="success">Published</StatPill>
          ) : (
            <StatPill tone="warning">Draft</StatPill>
          )}

          <div className="hidden md:flex items-center gap-0.5 rounded-md border border-border p-0.5">
            <button
              className="flex h-7 items-center gap-1 rounded px-2 text-xs font-medium bg-foreground text-background"
              title="Split view"
            >
              <Columns className="h-3.5 w-3.5" />
              Split
            </button>
            <button
              className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-accent"
              title="Preview only"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground hover:bg-accent"
              title="Editor only"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Editor
            </button>
          </div>

          <Button variant="outline" size="sm" asChild className="bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 hover:text-amber-900">
            <Link href={`/preview/site/${id}/wysiwyg`}>
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Try full WYSIWYG
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link
              href={`https://${site.customDomain ?? `${site.subdomain}.lite`}${page.slug}`}
              target="_blank"
            >
              View live
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>

          <Button size="sm">{page.published ? "Update" : "Publish"}</Button>

          <button className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent" title="Page settings">
            <SettingsIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Split editor body */}
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        {/* Left: rendered preview */}
        <section className="flex flex-1 min-h-0 min-w-0 flex-col border-b border-border md:border-b-0 md:border-r">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 text-xs">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
            <span className="ml-auto text-muted-foreground font-mono">
              {site.customDomain ?? `${site.subdomain}.lite`}{page.slug}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto bg-muted/20">
            <div className="mx-auto max-w-2xl p-8">
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                {/* Hero section */}
                <div className="grid grid-cols-2 gap-6 bg-foreground p-8 text-background">
                  <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      Welcome to {site.name}
                    </h1>
                    <p className="mt-2 text-sm text-background/70">
                      Build elegant sites without writing code.
                    </p>
                    <div>
                      <span className="mt-4 inline-flex rounded-md bg-background px-3 py-1.5 text-xs font-medium text-foreground">
                        Get started
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background/10">
                      <Rocket className="h-8 w-8" />
                    </div>
                  </div>
                </div>

                {/* Features section */}
                <div className="grid grid-cols-3 gap-3 p-6">
                  {[
                    { icon: Sparkles, title: "Fast", body: "Ship in minutes, not weeks." },
                    { icon: Heart, title: "Beautiful", body: "Designed by humans, for humans." },
                    { icon: Zap, title: "Powerful", body: "All the tools you need." },
                  ].map((f) => {
                    const Icon = f.icon;
                    return (
                      <div
                        key={f.title}
                        className="rounded-lg border border-border p-3"
                      >
                        <Icon className="h-4 w-4 text-foreground" />
                        <h3 className="mt-2 text-xs font-semibold">{f.title}</h3>
                        <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
                          {f.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-center text-[11px] text-muted-foreground">
                Live preview · updates as you type
              </p>
            </div>
          </div>
        </section>

        {/* Right: markdown source */}
        <section className="flex flex-1 min-h-0 min-w-0 flex-col">
          <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-4 text-xs">
            <span className="font-mono text-muted-foreground">md</span>
            <span className="font-medium text-muted-foreground uppercase tracking-wide">Markdown</span>
            <span className="ml-auto flex items-center gap-3 text-muted-foreground">
              <span className="font-mono">42 lines</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘S</kbd>
            </span>
          </div>
          <div className="relative flex-1 min-h-0 overflow-hidden">
            <textarea
              defaultValue={SAMPLE_MARKDOWN}
              spellCheck={false}
              className="h-full w-full resize-none bg-background p-5 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex h-7 shrink-0 items-center gap-3 border-t border-border bg-muted/30 px-4 text-[11px] text-muted-foreground">
            <span>Markdown</span>
            <span>·</span>
            <span>UTF-8</span>
            <span className="ml-auto flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Press <kbd className="rounded bg-background border border-border px-1 py-0.5 font-mono text-[10px]">/</kbd> for blocks
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
