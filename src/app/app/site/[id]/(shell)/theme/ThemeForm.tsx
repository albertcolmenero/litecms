"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateSite } from "@/app/actions";

const FONT_OPTIONS = [
  "Geist",
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Oswald",
  "Source Sans Pro",
  "Slabo 27px",
  "Raleway",
  "PT Sans",
  "Merriweather",
  "Nunito",
  "Playfair Display",
  "Ubuntu",
  "Rubik",
  "Lora",
  "Work Sans",
  "Nunito Sans",
  "Fira Sans",
];

type ThemeColors = {
  primary: string;
  background: string;
  text: string;
  iconBackground: string;
  iconColor: string;
};

type ThemeButtons = {
  background: string;
  text: string;
  secondaryBackground: string;
  secondaryText: string;
};

type CustomColor = { id: string; value: string };

export default function ThemeForm({ site }: { site: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialTheme = site.settings?.theme ?? {};

  const [font, setFont] = useState<string>(initialTheme.font ?? "Geist");
  const [colors, setColors] = useState<ThemeColors>({
    primary: initialTheme.colors?.primary ?? "#000000",
    background: initialTheme.colors?.background ?? "#ffffff",
    text: initialTheme.colors?.text ?? "#000000",
    iconBackground:
      initialTheme.colors?.iconBackground ?? initialTheme.colors?.primary ?? "#000000",
    iconColor: initialTheme.colors?.iconColor ?? "#ffffff",
  });
  const [buttons, setButtons] = useState<ThemeButtons>({
    background: initialTheme.buttons?.background ?? "#000000",
    text: initialTheme.buttons?.text ?? "#ffffff",
    secondaryBackground: initialTheme.buttons?.secondaryBackground ?? "#ffffff",
    secondaryText: initialTheme.buttons?.secondaryText ?? "#000000",
  });
  const [customColors, setCustomColors] = useState<CustomColor[]>(
    (initialTheme.customColors as CustomColor[]) ?? [],
  );

  const handleSave = () => {
    const newSettings = {
      ...(site.settings ?? {}),
      theme: {
        font,
        colors,
        buttons,
        customColors,
      },
    };

    startTransition(async () => {
      const res = await updateSite(site.id, { settings: newSettings });
      if (res.success) {
        toast.success("Theme saved");
        router.refresh();
      } else {
        toast.error("Failed to save theme");
      }
    });
  };

  const liveUrl = site.customDomain
    ? `https://${site.customDomain}`
    : `http://${site.subdomain}.localhost:3000`;

  return (
    <>
      <div className="mb-6 flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.refresh()}
          disabled={isPending}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          <Save className="mr-1.5 h-3.5 w-3.5" />
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Brand colors</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Used across the public site for backgrounds, text, and accents.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Swatch
                label="Primary"
                value={colors.primary}
                onChange={(v) => setColors({ ...colors, primary: v })}
              />
              <Swatch
                label="Background"
                value={colors.background}
                onChange={(v) => setColors({ ...colors, background: v })}
              />
              <Swatch
                label="Text"
                value={colors.text}
                onChange={(v) => setColors({ ...colors, text: v })}
              />
              <Swatch
                label="Icon bg"
                value={colors.iconBackground}
                onChange={(v) => setColors({ ...colors, iconBackground: v })}
              />
              <Swatch
                label="Icon fg"
                value={colors.iconColor}
                onChange={(v) => setColors({ ...colors, iconColor: v })}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Buttons</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Primary and secondary CTA styles.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Swatch
                label="Primary bg"
                value={buttons.background}
                onChange={(v) => setButtons({ ...buttons, background: v })}
              />
              <Swatch
                label="Primary text"
                value={buttons.text}
                onChange={(v) => setButtons({ ...buttons, text: v })}
              />
              <Swatch
                label="Secondary bg"
                value={buttons.secondaryBackground}
                onChange={(v) => setButtons({ ...buttons, secondaryBackground: v })}
              />
              <Swatch
                label="Secondary text"
                value={buttons.secondaryText}
                onChange={(v) => setButtons({ ...buttons, secondaryText: v })}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-medium">Typography</h2>
            <p className="mt-1 text-xs text-muted-foreground">Google Font for body and headings.</p>
            <div className="mt-4 flex items-center gap-2">
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
              >
                <option value="">System default</option>
                {FONT_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Custom colors</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCustomColors([
                    ...customColors,
                    { id: `color-${Date.now()}`, value: "#000000" },
                  ])
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Extra named tokens you can reference from your markdown.
            </p>
            <ul className="mt-3 space-y-2">
              {customColors.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">No custom colors yet.</p>
              ) : null}
              {customColors.map((c, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md border border-border p-2">
                  <input
                    type="text"
                    value={c.id}
                    onChange={(e) => {
                      const next = [...customColors];
                      next[i] = { ...c, id: e.target.value };
                      setCustomColors(next);
                    }}
                    placeholder="token-name"
                    className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-mono"
                  />
                  <input
                    type="color"
                    value={c.value}
                    onChange={(e) => {
                      const next = [...customColors];
                      next[i] = { ...c, value: e.target.value };
                      setCustomColors(next);
                    }}
                    className="h-7 w-10 cursor-pointer rounded border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomColors(customColors.filter((_, j) => j !== i))}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card overflow-hidden lg:sticky lg:top-20 self-start">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-medium">Live preview</h2>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground font-mono hover:text-foreground"
            >
              {site.customDomain ?? `${site.subdomain}.localhost:3000`}
            </a>
          </div>
          <div
            className="aspect-[4/3] flex items-center justify-center p-6"
            style={{ backgroundColor: colors.background }}
          >
            <div
              className="w-full rounded-lg border p-6 shadow-sm"
              style={{ backgroundColor: colors.background, color: colors.text, borderColor: "#e5e7eb" }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-semibold tracking-tight"
                  style={{ fontFamily: font || undefined }}
                >
                  {site.name}
                </span>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full opacity-30"
                      style={{ backgroundColor: colors.text }}
                    />
                  ))}
                </div>
              </div>
              <h3
                className="mt-6 text-2xl font-semibold tracking-tight"
                style={{ color: colors.primary, fontFamily: font || undefined }}
              >
                Headline goes here.
              </h3>
              <p className="mt-2 text-sm opacity-70" style={{ fontFamily: font || undefined }}>
                Body copy uses your text color, with the primary color reserved for emphasis.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{ backgroundColor: buttons.background, color: buttons.text }}
                >
                  Primary CTA
                </button>
                <button
                  className="rounded-md px-3 py-1.5 text-xs font-medium border"
                  style={{
                    backgroundColor: buttons.secondaryBackground,
                    color: buttons.secondaryText,
                    borderColor: "#e5e7eb",
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

function Swatch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="group flex flex-col items-start gap-2 rounded-lg border border-border p-2.5 hover:border-foreground/20 transition-colors cursor-pointer">
      <span
        className="h-12 w-full rounded-md border border-border"
        style={{ backgroundColor: value }}
      />
      <span className="text-xs font-medium">{label}</span>
      <div className="flex w-full items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-8 shrink-0 cursor-pointer rounded border border-border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono"
        />
      </div>
    </label>
  );
}
