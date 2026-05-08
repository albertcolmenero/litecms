import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { LEADS } from "@/components/preview/mock";

export default function LeadsInbox() {
  const unread = LEADS.filter((l) => l.unread).length;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Submissions across all forms on this site."
        meta={
          <div className="flex items-center gap-2">
            <StatPill tone="success">{unread} new</StatPill>
            <span className="text-xs text-muted-foreground">{LEADS.length} total</span>
          </div>
        }
        action={
          <>
            <Button variant="outline" size="sm">
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export CSV
            </Button>
          </>
        }
      />

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <ul className="divide-y divide-border">
          {LEADS.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  l.unread ? "bg-emerald-500" : "bg-transparent"
                }`}
                aria-label={l.unread ? "unread" : "read"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${l.unread ? "font-medium text-foreground" : "text-foreground/80"}`}>
                    {l.email}
                  </span>
                  <StatPill tone="neutral">{l.formName}</StatPill>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{l.receivedAt}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
