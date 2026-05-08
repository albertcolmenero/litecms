import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import MediaLibrary from "@/components/MediaLibrary";
import { getSite } from "@/app/actions";
import { getAssets } from "@/actions/assets";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const assets = await getAssets(id);

  return (
    <>
      <PageHeader
        title="Media"
        description={`Images and PDFs uploaded to ${site.name}. 10 MB max per file.`}
      />
      <MediaLibrary siteId={id} initialAssets={assets} />
    </>
  );
}
