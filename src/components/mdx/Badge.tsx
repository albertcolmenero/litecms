"use client";

import * as LucideIcons from "lucide-react";
import { ArrowRight } from "lucide-react";

const toPascalCase = (str: string) =>
  str.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, "").toUpperCase());

function resolveIcon(name?: string) {
  if (!name) return null;
  const all = LucideIcons as any;
  return all[name] ?? all[toPascalCase(name)] ?? all[`${toPascalCase(name)}Icon`] ?? null;
}

function resolveIconColor(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("#") || value.startsWith("oklch") || value.startsWith("rgb")) return value;
  // Theme token (custom color id or named)
  return `var(--color-${value})`;
}

type BadgeProps = {
  children?: React.ReactNode;
  icon?: string;
  iconColor?: string;
  link?: string;
  linkLabel?: string;
  variant?: "default" | "subtle";
  className?: string;
};

export default function Badge({
  children,
  icon,
  iconColor,
  link,
  linkLabel = "Read more",
  variant = "default",
  className,
}: BadgeProps) {
  const Icon = resolveIcon(icon);
  const iconBg = resolveIconColor(iconColor);

  const base =
    variant === "subtle"
      ? "bg-muted/40 border border-transparent"
      : "bg-card border border-border shadow-sm";

  return (
    <span
      className={[
        "my-2 inline-flex items-center gap-3 rounded-full px-4 py-1.5 text-sm",
        base,
        className ?? "",
      ].join(" ")}
    >
      {Icon ? (
        <span
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
          style={{
            backgroundColor: iconBg ?? "var(--color-amber, #fef3c7)",
            color: iconBg ? "white" : "var(--color-amber-foreground, #b45309)",
          }}
        >
          <Icon className="h-3 w-3" />
        </span>
      ) : null}

      <span className="text-foreground">{children}</span>

      {link ? (
        <a
          href={link}
          className="ml-1 inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
          style={{ color: "var(--color-primary)" }}
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </span>
  );
}
