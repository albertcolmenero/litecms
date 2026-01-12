import { getLeads } from "@/app/actions-forms";
import { ArrowLeft, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSite } from "@/app/actions";

export default async function LeadsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const site = await getSite(id);

    if (!site) notFound();

    const leads = await getLeads(id);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50/30">
            <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href={`/app/site/${id}`} className="inline-flex items-center text-sm text-gray-500 hover:text-black mb-2 transition-colors">
                            <ArrowLeft size={16} className="mr-1" /> Back to Site
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads</h1>
                        <p className="text-gray-500">View all form submissions from your site.</p>
                    </div>
                </header>

                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {leads.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No leads yet</h3>
                                <p className="mt-1">Leads will appear here once visitors submit your forms.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 font-medium text-gray-500">Email</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Form</th>
                                            <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leads.map((lead: any) => (
                                            <tr key={lead.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{lead.email}</td>
                                                <td className="px-6 py-4 text-gray-500">{lead.form.name}</td>
                                                <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {new Date(lead.createdAt).toLocaleString()}
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
