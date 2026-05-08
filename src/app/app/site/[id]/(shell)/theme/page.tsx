import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSite } from "@/app/actions";
import ThemeForm from "./ThemeForm";

export default async function ThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  return (
    <>
      <PageHeader
        title="Theme"
        description="Brand colors and typography for your public site."
      />
      <ThemeForm site={site} />
    </>
  );
}
