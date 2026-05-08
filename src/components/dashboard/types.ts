export type SiteForChrome = {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string | null;
  accent?: string;
};

export type ChromeProps = {
  site: SiteForChrome;
  sites: SiteForChrome[];
  unreadLeads?: number;
  showAdmin?: boolean;
  basePath?: string;
};
