export interface BlogPost {
    title: string;
    excerpt: string;
    date: string;
    author: string;
    category: string;
    image: string;
    slug: string;
    readTime: string;
    content?: string;
}

export const BLOG_POSTS: BlogPost[] = [
    {
        title: "10 Reasons Why Markdown is the Future of CMS",
        excerpt: "Discover why developers and content creators are switching to Markdown-based content management systems for speed and flexibility.",
        date: "Mar 16, 2024",
        author: "Alex Rivers",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1499750310159-5b5f8c673c15?q=80&w=2670&auto=format&fit=crop",
        slug: "markdown-future-cms",
        readTime: "5 min read",
        content: `
<h2>The Shift to Markdown</h2>
<p>In the early days of the web, content management systems (CMS) like WordPress dominated the landscape. They offered a way for non-technical users to build websites without touching code. However, as the web has evolved, so have the needs of developers and content creators.</p>
<p>Markdown has emerged as a powerful alternative. It's lightweight, portable, and version-control friendly. By storing content in Markdown files, you gain complete control over your data. There's no database to maintain, no complex backups to worry about, and migration is as simple as copying files.</p>
<h2>Speed and Performance</h2>
<p>Static sites generated from Markdown are incredibly fast. Because the HTML is pre-built at deploy time, there's no server-side processing required when a user visits your page. This leads to near-instant load times and better SEO rankings.</p>
<h2>The Developer Experience</h2>
<p>For developers, Markdown-based CMSs offer a superior workflow. You can use your favorite text editor, commit changes to Git, and trigger automated builds. It bridges the gap between content creation and code, creating a unified development ecosystem.</p>
        `
    },
    {
        title: "Building High-Performance Landing Pages",
        excerpt: "Learn the secrets of creating landing pages that convert. From hero sections to CTAs, we cover everything you need to know.",
        date: "Mar 12, 2024",
        author: "Sarah Chen",
        category: "Design",
        image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=2669&auto=format&fit=crop",
        slug: "high-performance-landing-pages",
        readTime: "7 min read",
        content: `
<h2>The Anatomy of a High-Converting Page</h2>
<p>Creating a landing page that converts isn't just about good design—it's about psychology and structure. A high-performance landing page needs to guide the user on a journey from curiosity to action.</p>
<h2>1. The Hero Section</h2>
<p>Your hero section is your first impression. It needs a clear value proposition, a compelling headline, and a strong call-to-action (CTA). Don't clutter this space; focus on the one thing you want the user to understand.</p>
<h2>2. Social Proof</h2>
<p>Trust is the currency of the web. specific testimonials, client logos, and case studies help build credibility. When users see that others have succeeded with your product, they're more likely to take the leap.</p>
<h2>3. Clear CTAs</h2>
<p>Don't make users guess what to do next. Use contrasting colors for your buttons and use action-oriented copy. Instead of "Submit", try "Get Started Free" or "Download the Guide".</p>
        `
    },
    {
        title: "The Solopreneur's Tech Stack for 2024",
        excerpt: "A curated list of essential tools and platforms that every solopreneur needs to build and scale their business efficiently.",
        date: "Mar 08, 2024",
        author: "Mike Ross",
        category: "Business",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2670&auto=format&fit=crop",
        slug: "solopreneur-tech-stack-2024",
        readTime: "6 min read"
    },
    {
        title: "SEO Best Practices for Static Sites",
        excerpt: "Static sites have a natural advantage in SEO. Here's how to maximize your visibility with proper metadata and structure.",
        date: "Mar 05, 2024",
        author: "Alex Rivers",
        category: "SEO",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2674&auto=format&fit=crop",
        slug: "seo-best-practices-static-sites",
        readTime: "8 min read"
    },
    {
        title: "Mastering Tailwind CSS Grids",
        excerpt: "Stop struggling with layout. This comprehensive guide to Tailwind CSS grids will have you building complex layouts in minutes.",
        date: "Mar 01, 2024",
        author: "Sarah Chen",
        category: "Development",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
        slug: "mastering-tailwind-grids",
        readTime: "10 min read"
    }
];
