import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSite } from '@/app/actions';
import { getForm } from '@/app/actions-forms';
import FormBuilderEditor from '@/components/forms/FormBuilderEditor';

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
    <div className="flex min-h-screen flex-col bg-gray-50/30">
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        <header className="space-y-2">
          <Link href={`/app/site/${id}/forms`} className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Forms
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Form</h1>
          <p className="text-gray-500">Configure fields, CTA text, and additional submit URL.</p>
        </header>

        <FormBuilderEditor siteId={id} form={form} />
      </div>
    </div>
  );
}
