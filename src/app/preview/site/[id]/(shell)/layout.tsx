import { ReactNode } from "react";
import { Shell } from "@/components/dashboard/Shell";
import { getSite, SITES, LEADS } from "@/components/preview/mock";

export default async function ShellLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: ReactNode;
}) {
  const { id } = await params;
  const site = getSite(id);
  const unreadLeads = LEADS.filter((l) => l.unread).length;
  return (
    <Shell
      site={site}
      sites={SITES}
      unreadLeads={unreadLeads}
      showAdmin
      basePath="/preview"
    >
      {children}
    </Shell>
  );
}
