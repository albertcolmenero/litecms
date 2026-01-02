"use client";

import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";

interface Site {
    id: string;
    name: string;
    subdomain: string;
    customDomain: string | null;
    description: string | null;
    createdAt: Date;
    _count: {
        pages: number;
    };
    user?: {
        email: string;
    };
}

export default function SiteTable({ sites, showOwner = false }: { sites: Site[], showOwner?: boolean }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Domain</th>
                        {showOwner && <th className="px-6 py-4 font-semibold">Owner</th>}
                        <th className="px-6 py-4 font-semibold text-center w-32">Pages</th>
                        <th className="px-6 py-4 font-semibold text-right">Created</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {sites.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No sites found. Create one to get started.
                            </td>
                        </tr>
                    ) : (
                        sites.map((site) => (
                            <tr
                                key={site.id}
                                className="group hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 align-middle">
                                    <Link href={`/site/${site.id}`} className="block">
                                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {site.name}
                                        </div>
                                        {site.description && (
                                            <div className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">
                                                {site.description}
                                            </div>
                                        )}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 align-middle text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                            {site.subdomain}.localhost:3000
                                        </span>
                                        {site.customDomain && (
                                            <span className="font-mono text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                                                {site.customDomain}
                                            </span>
                                        )}
                                        <a
                                            href={`http://${site.subdomain}.localhost:3000`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </td>
                                {showOwner && (
                                    <td className="px-6 py-4 align-middle text-gray-500">
                                        {site.user?.email}
                                    </td>
                                )}
                                <td className="px-6 py-4 align-middle text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                        <FileText size={12} />
                                        {site._count.pages}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle text-right text-gray-500 tabular-nums">
                                    {new Date(site.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
