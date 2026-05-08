import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Copy, FormInput, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatPill } from "@/components/dashboard/StatPill";
import { EmptyState } from "@/components/dashboard/EmptyState";
import CopyButton from "@/components/ui/CopyButton";
import CreateFormModal from "@/components/forms/CreateFormModal";
import { getSite } from "@/app/actions";
import { getForms } from "@/app/actions-forms";

export default async function FormsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const forms = await getForms(id);
  const base = `/app/site/${id}`;

  return (
    <>
      <PageHeader
        title="Forms"
        description="Capture leads with embeddable forms. Use ::form{id} in any page."
        action={<CreateFormModal siteId={id} />}
      />

      {forms.length === 0 ? (
        <EmptyState
          icon={FormInput}
          title="No forms yet"
          description="Create your first form to start collecting leads from any page."
          action={<CreateFormModal siteId={id} />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {forms.map((form) => (
            <div
              key={form.id}
              className="rounded-xl border border-border bg-card p-5 hover:border-foreground/20 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                  <FormInput className="h-4 w-4 text-muted-foreground" />
                </div>
                <StatPill tone={form.type === "waitlist" ? "info" : "neutral"}>
                  {form.type}
                </StatPill>
              </div>
              <h3 className="mt-4 font-medium text-foreground">{form.name}</h3>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {form._count.leads} submission{form._count.leads === 1 ? "" : "s"}
                </span>
                <span>·</span>
                <span className="font-mono">
                  {`::form{id="${form.id}"}`}
                </span>
                <CopyButton text={`::form{id="${form.id}"}`} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`${base}/forms/${form.id}`}>
                    Edit fields
                    <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
