
import { type Metadata } from 'next';
import { getSiteByDomain, getPageBySiteAndSlug } from "@/app/actions";

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
