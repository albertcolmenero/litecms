import { getPage } from "@/app/actions";
import { notFound, redirect } from "next/navigation";
import EditorClient from "./client";

interface EditorPageProps {
    params: Promise<{
        id: string;
        pageId: string;
    }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const { id: siteId, pageId } = await params;

    // Fetch page (includes security check in getPage)
    const page = await getPage(pageId);

    if (!page) {
        notFound();
    }

    if (page.siteId !== siteId) {
        // Mismatch between URL siteId and page's actual siteId?
        // getPage checks ownership, but doesn't strictly check if page belongs to *this* siteId from URL.
        // But page has unique ID, so it's fine. We can redirect to correct URL or just 404.
        notFound();
    }

    return <EditorClient siteId={siteId} page={page} />;
}
