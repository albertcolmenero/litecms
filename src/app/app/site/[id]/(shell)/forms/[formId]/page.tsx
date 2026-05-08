import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import FormBuilderEditor from "@/components/forms/FormBuilderEditor";
import { getSite } from "@/app/actions";
import { getForm } from "@/app/actions-forms";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const { id, formId } = await params;
  const site = await getSite(id);
  if (!site) notFound();

  const form = await getForm(formId, id);
  if (!form) notFound();

  return (
    <>
      <PageHeader
        title={form.name}
        description="Configure fields, CTA text, and webhook."
      />
      <FormBuilderEditor siteId={id} form={form} />
    </>
  );
}
