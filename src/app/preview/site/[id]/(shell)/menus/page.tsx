import { Plus, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";

export default function MenusPage() {
  return (
    <>
      <PageHeader
        title="Menus"
        description="Header and footer navigation. Drag to reorder."
        action={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New menu
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <MenuPanel name="Main" badge="Header" items={["Home", "About", "Pricing", "Contact"]} ctas={["Get started"]} />
        <MenuPanel name="Footer" badge="Footer" items={["Privacy", "Terms", "Support"]} socials={["Twitter", "LinkedIn", "GitHub"]} />
      </div>
    </>
  );
}

function MenuPanel({
  name,
  badge,
  items,
  ctas,
  socials,
}: {
  name: string;
  badge: string;
  items: string[];
  ctas?: string[];
  socials?: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{name}</h3>
          <StatPill tone="info">{badge}</StatPill>
        </div>
        <Button variant="ghost" size="sm">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add item
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-3 px-5 py-2.5 group hover:bg-muted/30">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 cursor-grab" />
            <span className="text-sm flex-1">{item}</span>
            <span className="text-xs text-muted-foreground font-mono">/{item.toLowerCase()}</span>
          </li>
        ))}
      </ul>
      {ctas && ctas.length > 0 ? (
        <>
          <div className="border-t border-border px-5 py-2 text-xs uppercase tracking-wide text-muted-foreground">
            CTAs
          </div>
          <ul className="divide-y divide-border">
            {ctas.map((cta) => (
              <li key={cta} className="flex items-center gap-3 px-5 py-2.5">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="text-sm flex-1">{cta}</span>
                <StatPill tone="neutral">primary</StatPill>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {socials && socials.length > 0 ? (
        <>
          <div className="border-t border-border px-5 py-2 text-xs uppercase tracking-wide text-muted-foreground">
            Social
          </div>
          <ul className="divide-y divide-border">
            {socials.map((s) => (
              <li key={s} className="flex items-center gap-3 px-5 py-2.5">
                <span className="text-sm flex-1">{s}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
