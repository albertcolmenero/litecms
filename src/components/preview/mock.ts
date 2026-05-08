export type MockSite = {
  id: string;
  name: string;
  subdomain: string;
  customDomain?: string;
  pages: number;
  posts: number;
  lastEditedAt: string;
  accent: string;
};

export type MockPage = {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  updatedAt: string;
  isHome?: boolean;
};

export type MockPost = {
  id: string;
  title: string;
  slug: string;
  author: string;
  published: boolean;
  publishedAt?: string;
  excerpt: string;
};

export type MockForm = {
  id: string;
  name: string;
  type: "waitlist" | "custom";
  layout: "stacked" | "inlineDesktop";
  fields: number;
  submissions: number;
};

export type MockLead = {
  id: string;
  email: string;
  formName: string;
  receivedAt: string;
  unread: boolean;
};

export type MockAsset = {
  id: string;
  filename: string;
  mimeType: string;
  size: string;
  url: string;
};

export const SITES: MockSite[] = [
  {
    id: "acme",
    name: "Acme Studio",
    subdomain: "acme",
    customDomain: "acmestudio.com",
    pages: 7,
    posts: 12,
    lastEditedAt: "2 hours ago",
    accent: "oklch(0.205 0 0)",
  },
  {
    id: "north",
    name: "North & Pine",
    subdomain: "northpine",
    pages: 4,
    posts: 3,
    lastEditedAt: "yesterday",
    accent: "oklch(0.45 0.13 240)",
  },
  {
    id: "ember",
    name: "Ember",
    subdomain: "ember",
    pages: 11,
    posts: 28,
    lastEditedAt: "4 days ago",
    accent: "oklch(0.55 0.2 30)",
  },
];

export const PAGES: MockPage[] = [
  {
    id: "home",
    title: "Home",
    slug: "/",
    description: "Hero, features, pricing, footer",
    published: true,
    updatedAt: "2 hours ago",
    isHome: true,
  },
  {
    id: "about",
    title: "About",
    slug: "/about",
    description: "Team, mission, values",
    published: true,
    updatedAt: "yesterday",
  },
  {
    id: "pricing",
    title: "Pricing",
    slug: "/pricing",
    description: "Three tiers + FAQ",
    published: true,
    updatedAt: "3 days ago",
  },
  {
    id: "contact",
    title: "Contact",
    slug: "/contact",
    description: "Lead form + map",
    published: false,
    updatedAt: "12 minutes ago",
  },
];

export const POSTS: MockPost[] = [
  {
    id: "intro",
    title: "Why we built lite",
    slug: "why-we-built-lite",
    author: "Albert",
    published: true,
    publishedAt: "May 1",
    excerpt: "Most CMS tools are either too small or too much. We aimed for the middle.",
  },
  {
    id: "v2",
    title: "Forms 2.0 is here",
    slug: "forms-2",
    author: "Albert",
    published: true,
    publishedAt: "Apr 22",
    excerpt: "Inline layouts, dynamic fields, and a friendlier builder.",
  },
  {
    id: "draft",
    title: "Theming, properly",
    slug: "theming-properly",
    author: "Albert",
    published: false,
    excerpt: "OKLCH, live preview, and what we learned shipping it.",
  },
];

export const FORMS: MockForm[] = [
  { id: "waitlist", name: "Waitlist", type: "waitlist", layout: "stacked", fields: 1, submissions: 124 },
  { id: "contact", name: "Contact form", type: "custom", layout: "inlineDesktop", fields: 4, submissions: 36 },
];

export const LEADS: MockLead[] = [
  { id: "1", email: "amelia@nova.io", formName: "Waitlist", receivedAt: "12 min ago", unread: true },
  { id: "2", email: "rey@studio.dev", formName: "Contact form", receivedAt: "1 hour ago", unread: true },
  { id: "3", email: "kenji@workshop.co", formName: "Waitlist", receivedAt: "3 hours ago", unread: true },
  { id: "4", email: "linnea@boreal.se", formName: "Waitlist", receivedAt: "yesterday", unread: false },
  { id: "5", email: "sami@ground.fi", formName: "Contact form", receivedAt: "yesterday", unread: false },
  { id: "6", email: "june@aria.tw", formName: "Waitlist", receivedAt: "2 days ago", unread: false },
];

export const ASSETS: MockAsset[] = [
  { id: "a1", filename: "hero-mountains.jpg", mimeType: "image/jpeg", size: "1.2 MB", url: "" },
  { id: "a2", filename: "logo-dark.svg", mimeType: "image/svg+xml", size: "8 KB", url: "" },
  { id: "a3", filename: "team-photo.jpg", mimeType: "image/jpeg", size: "2.4 MB", url: "" },
  { id: "a4", filename: "press-kit.pdf", mimeType: "application/pdf", size: "5.1 MB", url: "" },
  { id: "a5", filename: "background.webp", mimeType: "image/webp", size: "640 KB", url: "" },
  { id: "a6", filename: "favicon.png", mimeType: "image/png", size: "12 KB", url: "" },
];

export function getSite(id: string): MockSite {
  return SITES.find((s) => s.id === id) ?? SITES[0];
}
