import { Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSite } from "@/components/preview/mock";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = getSite(id);

  const swatches = [
    { label: "Primary", value: site.accent },
    { label: "Background", value: "oklch(1 0 0)" },
    { label: "Text", value: "oklch(0.145 0 0)" },
    { label: "Accent", value: "oklch(0.75 0.15 200)" },
    { label: "Muted", value: "oklch(0.97 0 0)" },
  ];

  return (
    <>
      <PageHeader
        title="Theme"
        description="Brand colors and typography. Changes reflect on the live site immediately."
        action={
          <>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm">
              <Save className="mr-1.5 h-3.5 w-3.5" />
              Save changes
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Colors</h2>
            <p className="mt-1 text-xs text-muted-foreground">Click any swatch to edit.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {swatches.map((s) => (
                <button
                  key={s.label}
                  className="group flex flex-col items-start gap-2 rounded-lg border border-border p-2.5 hover:border-foreground/20 transition-colors text-left"
                >
                  <span
                    className="h-12 w-full rounded-md border border-border"
                    style={{ backgroundColor: s.value }}
                  />
                  <span className="text-xs font-medium">{s.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate w-full">
                    {s.value}
                  </span>
                </button>
              ))}
              <button className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-2.5 text-xs text-muted-foreground hover:border-foreground/20 hover:text-foreground transition-colors min-h-[120px]">
                + Add custom color
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Typography</h2>
            <p className="mt-1 text-xs text-muted-foreground">Google Font for body and headings.</p>
            <div className="mt-4 flex items-center gap-3 rounded-md border border-border p-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Font</p>
                <p className="mt-0.5 text-sm font-medium">Inter</p>
              </div>
              <Button variant="ghost" size="sm">
                Change
              </Button>
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card overflow-hidden sticky top-20 self-start">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Live preview</h2>
            <span className="text-xs text-muted-foreground font-mono">
              {site.customDomain ?? `${site.subdomain}.lite`}
            </span>
          </div>
          <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center p-6">
            <div className="w-full rounded-lg border border-border bg-background p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold tracking-tight">{site.name}</span>
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <div className="h-6 w-2/3 rounded bg-foreground/10" />
                <div className="h-3 w-full rounded bg-foreground/5" />
                <div className="h-3 w-3/4 rounded bg-foreground/5" />
              </div>
              <button
                className="mt-6 rounded-md px-3 py-1.5 text-xs font-medium text-white"
                style={{ backgroundColor: site.accent }}
              >
                Get started
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
