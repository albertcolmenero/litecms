"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  FormInput,
  Inbox,
  Image as ImageIcon,
  Menu as MenuIcon,
  Palette,
  Settings,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteSwitcher } from "./SiteSwitcher";
import type { ChromeProps } from "./types";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
};

export function Sidebar({
  site,
  sites,
  unreadLeads = 0,
  showAdmin = false,
  basePath = "/app",
}: ChromeProps) {
  const pathname = usePathname();
  const base = `${basePath}/site/${site.id}`;

  const items: NavItem[] = [
    { href: base, label: "Overview", icon: LayoutDashboard },
    { href: `${base}/pages`, label: "Pages", icon: FileText },
    { href: `${base}/blog`, label: "Blog", icon: Newspaper },
    { href: `${base}/forms`, label: "Forms", icon: FormInput },
    { href: `${base}/leads`, label: "Leads", icon: Inbox, badge: unreadLeads || undefined },
    { href: `${base}/media`, label: "Media", icon: ImageIcon },
    { href: `${base}/menus`, label: "Menus", icon: MenuIcon },
    { href: `${base}/theme`, label: "Theme", icon: Palette },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex h-svh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0">
      <div className="px-3 pt-4 pb-3">
        <SiteSwitcher current={site} sites={sites} basePath={basePath} />
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              item.href === base ? pathname === base : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-sidebar-foreground" : "text-muted-foreground group-hover:text-sidebar-foreground",
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[10px] font-medium text-background">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {showAdmin ? (
        <div className="border-t border-sidebar-border px-2 py-2">
          <Link
            href={`${basePath}/admin`}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              pathname.startsWith(`${basePath}/admin`)
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            Admin
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
