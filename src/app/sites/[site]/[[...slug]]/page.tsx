import { getSiteByDomain, getPageBySiteAndSlug } from "@/app/actions";
import { notFound } from "next/navigation";
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
            url: item.url || (item.page ? `/${item.page.slug}` : "#")
        }))
        : [];

    const footerLinks = footerMenu
        ? footerMenu.items.map((item: any) => ({
            id: item.id,
            label: item.label,
            url: item.url || (item.page ? `/${item.page.slug}` : "#")
        }))
        : [];

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
                    </div>
                </div>
            </header>



            <main className="max-w-screen-xl mx-auto  max-w-none mt-16 ">

                <MarkdownRenderer content={pageData.content} site={siteData} />
            </main>

            <footer className="mt-24 border-t border-[var(--theme-text)]/10 py-12 text-center text-sm opacity-60">
                <div className="mb-4 space-x-4">
                    {footerLinks.map((link: any) => (
                        <a key={link.id} href={link.url} className="hover:opacity-100 hover:underline">
                            {link.label}
                        </a>
                    ))}
                </div>
                <p>&copy; {new Date().getFullYear()} {siteData.name}. Powered by LiteMark.</p>
            </footer>
        </div>
    );
}
