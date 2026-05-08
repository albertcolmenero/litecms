import { Plus, FormInput, ArrowUpRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { FORMS } from "@/components/preview/mock";

export default function FormsList() {
  return (
    <>
      <PageHeader
        title="Forms"
        description="Capture leads with embeddable forms. Use ::form{id} in any page."
        action={
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New form
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {FORMS.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <FormInput className="h-4 w-4 text-muted-foreground" />
              </div>
              <StatPill tone={f.type === "waitlist" ? "info" : "neutral"}>{f.type}</StatPill>
            </div>
            <h3 className="mt-4 font-medium text-foreground">{f.name}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{f.fields} fields</span>
              <span>·</span>
              <span>{f.layout}</span>
              <span>·</span>
              <span>
                <span className="font-medium text-foreground">{f.submissions}</span> submissions
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy embed
              </Button>
              <Button variant="ghost" size="sm">
                Edit fields
                <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
