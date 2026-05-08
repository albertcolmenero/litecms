import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSite } from "@/app/actions";
import { getAssets } from "@/actions/assets";
import SettingsForm from "./SettingsForm";

export default async function SiteSettingsPage({
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
        title="Settings"
        description="Site name, domain, scripts, and the danger zone."
      />
      <SettingsForm site={site} assets={assets} />
    </>
  );
}
