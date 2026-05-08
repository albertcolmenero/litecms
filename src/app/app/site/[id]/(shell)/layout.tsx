import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Shell } from "@/components/dashboard/Shell";
import { getDashboardChrome } from "@/lib/dashboard-chrome";

export default async function SiteShellLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: ReactNode;
}) {
  const { id } = await params;
  const chrome = await getDashboardChrome(id);
  if (!chrome) notFound();

  return (
    <Shell
      site={chrome.site}
      sites={chrome.sites}
      unreadLeads={chrome.unreadLeads}
      showAdmin={chrome.showAdmin}
    >
      {children}
    </Shell>
  );
}
