import { notFound } from "next/navigation";
import { Filter, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getSite } from "@/app/actions";
import { getLeads } from "@/app/actions-forms";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const leads = await getLeads(id);
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = leads.filter((l) => new Date(l.createdAt).getTime() >= sevenDaysAgo).length;

  return (
    <>
      <PageHeader
        title="Leads"
        description="Submissions across all forms on this site."
        meta={
          <div className="flex items-center gap-2">
            {recent > 0 ? <StatPill tone="success">{recent} this week</StatPill> : null}
            <span className="text-xs text-muted-foreground">{leads.length} total</span>
          </div>
        }
        action={
          leads.length > 0 ? (
            <Button variant="outline" size="sm" disabled>
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filter
            </Button>
          ) : null
        }
      />

      {leads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No leads yet"
          description="Leads will appear here once visitors submit your forms."
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <ul className="divide-y divide-border">
            {leads.map((lead) => {
              const isRecent = new Date(lead.createdAt).getTime() >= sevenDaysAgo;
              return (
                <li
                  key={lead.id}
                  className="flex items-start gap-4 px-5 py-3 hover:bg-muted/30 transition-colors"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      isRecent ? "bg-emerald-500" : "bg-transparent"
                    }`}
                    aria-label={isRecent ? "new" : "older"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm ${
                          isRecent
                            ? "font-medium text-foreground"
                            : "text-foreground/80"
                        }`}
                      >
                        {lead.email || "—"}
                      </span>
                      <StatPill tone="neutral">{lead.form.name}</StatPill>
                    </div>
                    {lead.data ? (
                      <pre className="mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap break-all rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground font-mono">
                        {JSON.stringify(lead.data, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(lead.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
