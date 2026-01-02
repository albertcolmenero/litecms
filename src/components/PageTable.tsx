"use client";

import Link from "next/link";
import { ExternalLink, FileText, Edit } from "lucide-react";

interface Page {
    id: string;
    title: string;
    slug: string;
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
    siteId: string;
    menuItems: {
        menu: {
            name: string;
        };
    }[];
}

export default function PageTable({ siteId, pages }: { siteId: string, pages: Page[] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-900 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Title</th>
                        <th className="px-6 py-4 font-semibold">Slug</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Menus</th>
                        <th className="px-6 py-4 font-semibold text-right">Last Updated</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {pages.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                No pages found. Create one to get started.
                            </td>
                        </tr>
                    ) : (
                        pages.map((page) => (
                            <tr
                                key={page.id}
                                className="group hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 align-middle">
                                    <Link href={`/site/${siteId}/editor/${page.id}`} className="block">
                                        <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                            <FileText size={16} className="text-gray-400 group-hover:text-blue-500" />
                                            {page.title}
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4 align-middle text-gray-500 font-mono text-xs">
                                    /{page.slug}
                                </td>
                                <td className="px-6 py-4 align-middle text-gray-500">
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${page.published
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                            }`}
                                    >
                                        {page.published ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 align-middle text-gray-500">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {page.menuItems.map((item, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 border border-gray-200"
                                            >
                                                {item.menu.name}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 align-middle text-right text-gray-500 tabular-nums">
                                    {new Date(page.updatedAt).toLocaleDateString(undefined, {
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
