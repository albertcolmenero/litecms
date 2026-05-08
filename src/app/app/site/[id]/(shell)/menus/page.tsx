import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import MenuManager from "@/components/MenuManager";
import { getMenus, getSite } from "@/app/actions";

export default async function MenusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const menus = await getMenus(id);

  return (
    <>
      <PageHeader
        title="Menus"
        description="Header and footer navigation. Drag items to reorder."
      />
      <MenuManager siteId={site.id} initialMenus={menus} pages={site.pages} />
    </>
  );
}
