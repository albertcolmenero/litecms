"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Code, ExternalLink, FileCode, Globe, Image as ImageIcon, Info, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/dashboard/StatPill";
import { updateSite } from "@/app/actions";
import MediaLibrary from "@/components/MediaLibrary";

type Script = { id: string; name: string; type: "url" | "code"; value: string };

export default function SettingsForm({ site, assets = [] }: { site: any; assets?: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState<string>(site.name ?? "");
  const [description, setDescription] = useState<string>(site.description ?? "");
  const [homePageId, setHomePageId] = useState<string>(site.homePageId ?? "__default__");
  const [customDomain, setCustomDomain] = useState<string>(site.customDomain ?? "");
  const [scripts, setScripts] = useState<Script[]>(
    (site.settings?.scripts as Script[]) ?? [],
  );
  const [faviconUrl, setFaviconUrl] = useState<string>(site.settings?.faviconUrl ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSave = () => {
    const data: any = {
      name,
      description,
      homePageId: homePageId === "__default__" ? null : homePageId,
      customDomain: customDomain.trim() || null,
      settings: {
        ...(site.settings ?? {}),
        scripts,
        faviconUrl: faviconUrl || undefined,
      },
    };

    startTransition(async () => {
      const res = await updateSite(site.id, data);
      if (res.success) {
        toast.success("Settings saved");
        router.refresh();
      } else {
        toast.error("Failed to save settings");
      }
    });
  };

  const addScript = () => {
    setScripts([...scripts, { id: `script-${Date.now()}`, name: "New script", type: "code", value: "" }]);
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-end">
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-medium mb-1">Site identity</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Display name, description, and which page lives at the root URL.
          </p>
          <div className="space-y-4">
            <Field label="Site name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field
              label="Home page"
              hint="Which page should be displayed at the root URL (/)."
            >
              <select
                value={homePageId}
                onChange={(e) => setHomePageId(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="__default__">Default welcome page</option>
                {site.pages?.map((page: any) => (
                  <option key={page.id} value={page.id}>
                    {page.title} (/{page.slug})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Domain</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Your site is reachable at the subdomain by default. Add a custom domain when you're
            ready.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subdomain" hint="Always available at this URL.">
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-mono">
                  {site.subdomain}.localhost:3000
                </div>
                <a
                  href={`http://${site.subdomain}.localhost:3000`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Field>
            <Field
              label="Custom domain"
              hint="Without https:// or www."
              meta={
                site.customDomain ? <StatPill tone="success">Active</StatPill> : null
              }
            >
              <input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="yourdomain.com"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono"
              />
            </Field>
          </div>
          {customDomain ? (
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/30">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                <div className="text-sm">
                  <p className="font-medium text-sky-900 dark:text-sky-200">DNS configuration</p>
                  <p className="mt-1 text-sky-800 dark:text-sky-300">
                    Add a CNAME record pointing to{" "}
                    <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">
                      cname.vercel-dns.com
                    </code>
                    . DNS changes take up to 48 hours.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium">Favicon</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            PNG, ICO, or SVG, ideally square. Shown in browser tabs and bookmarks.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-border bg-muted/30 overflow-hidden">
              {faviconUrl ? (
                <img
                  src={faviconUrl}
                  alt="Favicon preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                {faviconUrl ? "Replace" : "Choose from media"}
              </Button>
              {faviconUrl ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFaviconUrl("")}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium">Custom scripts</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={addScript}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add script
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Inject analytics, chat widgets, or any third-party JS. Scripts run on the public site.
          </p>
          {scripts.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">No scripts added yet.</p>
          ) : (
            <ul className="space-y-3">
              {scripts.map((script, index) => (
                <li
                  key={script.id || index}
                  className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="text"
                      value={script.name}
                      onChange={(e) => {
                        const next = [...scripts];
                        next[index] = { ...script, name: e.target.value };
                        setScripts(next);
                      }}
                      placeholder="e.g. Plausible"
                      className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
                    />
                    <div className="flex items-center gap-0.5 rounded-md border border-border bg-background p-0.5">
                      {(["url", "code"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => {
                            const next = [...scripts];
                            next[index] = { ...script, type: t };
                            setScripts(next);
                          }}
                          className={`flex h-7 items-center gap-1 rounded px-2 text-xs font-medium ${
                            script.type === t
                              ? "bg-foreground text-background"
                              : "text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {t === "url" ? (
                            <ExternalLink className="h-3 w-3" />
                          ) : (
                            <FileCode className="h-3 w-3" />
                          )}
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setScripts(scripts.filter((_, i) => i !== index))}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {script.type === "url" ? (
                    <input
                      type="url"
                      value={script.value}
                      onChange={(e) => {
                        const next = [...scripts];
                        next[index] = { ...script, value: e.target.value };
                        setScripts(next);
                      }}
                      placeholder="https://example.com/script.js"
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-mono"
                    />
                  ) : (
                    <textarea
                      value={script.value}
                      onChange={(e) => {
                        const next = [...scripts];
                        next[index] = { ...script, value: e.target.value };
                        setScripts(next);
                      }}
                      placeholder="<script>console.log('hi')</script>"
                      rows={4}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-mono"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="text-sm font-medium text-destructive flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Danger zone
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Permanently delete this site, all its pages, posts, forms, and leads. This cannot be
            undone.
          </p>
          <div className="mt-4">
            <Button
              variant="destructive"
              size="sm"
              disabled
              title="Site deletion isn't wired up yet"
            >
              Delete site
            </Button>
          </div>
        </section>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">Choose favicon</h2>
              <button
                onClick={() => setPickerOpen(false)}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <MediaLibrary
                siteId={site.id}
                initialAssets={assets as any}
                selectable
                onSelect={(asset) => {
                  setFaviconUrl(asset.url);
                  setPickerOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  hint,
  meta,
  children,
}: {
  label: string;
  hint?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {meta}
      </div>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
