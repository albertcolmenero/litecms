import { getSiteByDomain, getPageBySiteAndSlug } from "@/app/actions";
import { getPublicBlogPost } from "@/actions/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, X, Linkedin, Facebook, Instagram, Youtube, Github, Link as LinkIcon } from "lucide-react";

function SiteSocialIcon({ platform }: { platform: string }) {
    switch (platform.toLowerCase()) {
        case 'twitter':
        case 'x': return <X size={20} />;
        case 'linkedin': return <Linkedin size={20} />;
        case 'facebook': return <Facebook size={20} />;
        case 'instagram': return <Instagram size={20} />;
        case 'youtube': return <Youtube size={20} />;
        case 'github': return <Github size={20} />;
        default: return <LinkIcon size={20} />;
    }
}
import { MarkdownRenderer } from "@/components/markdown-renderer";
import matter from "gray-matter";
import { Metadata } from "next";

async function fetchPageData(domain: string, slug?: string[]) {
    // 1. Fetch Site
    const siteData: any = await getSiteByDomain(domain);
    if (!siteData) return null;

    // 2. Determine Page Data
    let pageData;
    if (!slug || slug.length === 0) {
        if (siteData.homePage) {
            pageData = siteData.homePage;
        } else {
            pageData = await getPageBySiteAndSlug(siteData.id, "");
        }
    } else if (slug[0] === 'blog') {
        if (slug.length === 1) {
            // Handle Blog Index: /blog
            pageData = {
                title: "Blog",
                description: "Recent posts",
                content: `::::section{layout="100" align="center"}
  :::column

### Our Blog
::blog-posts{count="10"}

  :::
::::`,
                published: true,
                slug: "blog"
            }
        } else {
            // Handle Blog Post: /blog/[slug]
            const postSlug = slug.slice(1).join('/');
            const blogPost = await getPublicBlogPost(siteData.id, postSlug);

            if (blogPost) {
                // Adapt BlogPost to Page structure for the renderer
                pageData = {
                    ...blogPost,
                    type: 'blog-post',
                    content: blogPost.content || "", // Ensure string
                };
            }
        }
    } else {
        const pageSlug = slug.join("/");
        pageData = await getPageBySiteAndSlug(siteData.id, pageSlug);
    }
    return { siteData, pageData };
}

export async function generateMetadata({ params }: { params: Promise<{ site: string; slug?: string[] }> }): Promise<Metadata> {
    const { site: domain, slug } = await params;
    const data = await fetchPageData(domain, slug);

    if (!data || !data.pageData) {
        return {
            title: 'Page Not Found',
        };
    }

    return {
        title: data.pageData.title,
        description: data.pageData.description || `${data.siteData.name} - ${data.pageData.title}`,
    };
}

export default async function PublicSitePage({ params }: { params: Promise<{ site: string; slug?: string[] }> }) {
    const { site: domain, slug } = await params;

    const data = await fetchPageData(domain, slug);

    if (!data) return notFound();
    const { siteData, pageData } = data;

    // Prepare styles from settings
    const settings = siteData.settings as any;
    const themeColors = settings?.theme?.colors || {};
    // Default styles if not set
    const styleVariables = {
        '--theme-primary': themeColors.primary || '#000000',
        '--theme-background': themeColors.background || '#ffffff',
        '--theme-text': themeColors.text || '#000000',
        '--theme-button-background': settings?.theme?.buttons?.background || '#000000',
        '--theme-button-text': settings?.theme?.buttons?.text || '#ffffff',
        '--theme-button-secondary-background': settings?.theme?.buttons?.secondaryBackground || '#ffffff',
        '--theme-button-secondary-text': settings?.theme?.buttons?.secondaryText || '#000000',
    } as React.CSSProperties;

    if (!pageData) {
        // If it's the home page and not created yet, show a default welcome.
        if (!slug || slug.length === 0) {
            return (
                <div style={styleVariables} className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-text)]">
                    <div className="max-w-3xl mx-auto py-12 px-6">
                        <h1 className="text-4xl font-bold mb-4">Welcome to {siteData.name}</h1>
                        <p className="opacity-80">{siteData.description}</p>
                        <hr className="my-8 border-[var(--theme-text)] opacity-20" />
                        <p>This is the home page. The owner hasn't published any content yet.</p>
                    </div>
                </div>
            )
        }
        return notFound();
    }

    // 3. Prepare Navigation
    const mainMenu = siteData.menus.find((m: any) => m.name === "Main");
    const footerMenu = siteData.menus.find((m: any) => m.name === "Footer");

    const navLinks = mainMenu
        ? mainMenu.items.map((item: any) => ({
            id: item.id,
            label: item.label,
            url: (item.url || (item.page ? `/${item.page.slug}` : "#")) + (item.anchor ? `#${item.anchor.replace('#', '')}` : "")
        }))
        : [];

    const footerLinks = footerMenu
        ? footerMenu.items.map((item: any) => ({
            id: item.id,
            label: item.label,
            url: item.url || (item.page ? `/${item.page.slug}` : "#")
        }))
        : [];

    const footerSocial = footerMenu?.socialLinks || [];

    return (
        <div style={styleVariables} className="min-h-screen bg-[var(--theme-background)] text-[var(--theme-text)] transition-colors duration-200">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex justify-between items-center h-16">
                        <a href="/" className="font-bold text-xl hover:opacity-80">{siteData.name}</a>
                        <nav className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 space-x-8">
                            {navLinks.map((link: any) => (
                                <a key={link.id} href={link.url} className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center gap-4">
                            {mainMenu?.ctas?.map((cta: any) => (
                                <a
                                    key={cta.id}
                                    href={cta.url}
                                    className={`px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-90 ${cta.style === 'secondary'
                                        ? 'bg-[var(--theme-button-secondary-background)] text-[var(--theme-button-secondary-text)] border border-gray-200'
                                        : 'bg-[var(--theme-button-background)] text-[var(--theme-button-text)]'
                                        }`}
                                >
                                    {cta.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-screen-xl mx-auto  max-w-none mt-16 ">
                {pageData.type === 'blog-post' ? (
                    <article className="mx-auto max-w-screen-xl px-6 lg:px-8 pt-20 pb-16">

                        <div className="space-y-4 text-center mb-10">
                            <div className="flex items-center justify-center gap-x-4 text-xs font-medium">
                                <time dateTime={pageData.publishedAt ? new Date(pageData.publishedAt).toISOString() : ""} className="text-gray-500 dark:text-gray-400">
                                    {pageData.publishedAt ? new Date(pageData.publishedAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : "Draft"}
                                </time>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                                {pageData.title}
                            </h1>
                            <div className="flex items-center justify-center space-x-2 pt-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {pageData.author || "Admin"}
                                </p>
                            </div>
                        </div>

                        {pageData.image && (
                            <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-12 bg-gray-100 dark:bg-gray-800 border dark:border-gray-800 shadow-sm">
                                <img
                                    src={pageData.image}
                                    alt={pageData.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="space-y-4  mb-10">
                            <MarkdownRenderer content={pageData.content} site={siteData} />
                        </div>
                    </article>
                ) : (
                    <MarkdownRenderer content={pageData.content} site={siteData} />
                )}
            </main>

            <footer className="mt-24 border-t border-[var(--theme-text)]/10 py-12 text-sm opacity-60">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                    {/* Left: Copyright */}
                    <div className="text-center md:text-left order-3 md:order-1">
                        <p>&copy; {new Date().getFullYear()} {siteData.name}. Powered by LiteMark.</p>
                    </div>

                    {/* Center: Links */}
                    <div className="flex justify-center space-x-4 order-2 md:order-2">
                        {footerLinks.map((link: any) => (
                            <a key={link.id} href={link.url} className="hover:opacity-100 hover:underline">
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right: Social */}
                    <div className="flex justify-center md:justify-end gap-6 order-1 md:order-3">
                        {footerSocial.length > 0 && footerSocial.map((link: any) => (
                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition-opacity">
                                <span className="sr-only">{link.platform}</span>
                                <SiteSocialIcon platform={link.platform} />
                            </a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
}


