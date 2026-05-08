import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { ChromeProps } from "./types";

export function Shell({
  site,
  sites,
  unreadLeads,
  showAdmin,
  basePath = "/app",
  bleed = false,
  children,
}: ChromeProps & { bleed?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        site={site}
        sites={sites}
        unreadLeads={unreadLeads}
        showAdmin={showAdmin}
        basePath={basePath}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar site={site} basePath={basePath} />
        <main className={bleed ? "flex-1" : "flex-1 px-8 py-8"}>
          {bleed ? children : <div className="mx-auto w-full max-w-5xl">{children}</div>}
        </main>
      </div>
    </div>
  );
}
