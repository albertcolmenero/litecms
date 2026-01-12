import { getForms, deleteForm } from "@/app/actions-forms";
import CreateFormModal from "@/components/forms/CreateFormModal";
import { ArrowLeft, Copy, Trash2, FileText, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite } from "@/app/actions";
import CopyButton from "@/components/ui/CopyButton";

export default async function FormsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) notFound();

    const forms = await getForms(id);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50/30">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href={`/app/site/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Back to Site
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Forms</h1>
                        <p className="text-gray-500">Manage your site's forms and waitlists.</p>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900">All Forms</h2>
                        <CreateFormModal siteId={id} />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {forms.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
                                <p className="mt-1">Create your first form to start collecting leads.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-medium text-gray-500">Name</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Type</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Embed Code</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Leads</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {forms.map((form: any) => (
                                            <tr key={form.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{form.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {form.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs select-all">
                                                            {`::form{id="${form.id}"}`}
                                                        </span>
                                                        <CopyButton text={`::form{id="${form.id}"}`} />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Users size={14} />
                                                        {form._count.leads}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {new Date(form.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
