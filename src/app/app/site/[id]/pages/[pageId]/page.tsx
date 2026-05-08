import { notFound } from "next/navigation";
import { getPage, getSite } from "@/app/actions";
import EditorClient from "./EditorClient";

export default async function PageEditorRoute({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id: siteId, pageId } = await params;
  const page = await getPage(pageId);
  const site = await getSite(siteId);

  if (!page || !site) notFound();
  if (page.siteId !== siteId) notFound();

  return <EditorClient siteId={siteId} site={site} page={page} />;
}
