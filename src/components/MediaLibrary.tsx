"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Upload,
    Trash2,
    Copy,
    Image as ImageIcon,
    FileText,
    Loader2,
    X,
    Check,
} from "lucide-react";

interface Asset {
    id: string;
    key: string;
    url: string;
    filename: string;
    mimeType: string | null;
    size: number | null;
    alt: string | null;
    createdAt: Date | string;
}

interface MediaLibraryProps {
    siteId: string;
    initialAssets: Asset[];
    onSelect?: (asset: Asset) => void;
    selectable?: boolean;
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageType(mimeType: string | null): boolean {
    return !!mimeType && mimeType.startsWith("image/");
}

export default function MediaLibrary({
    siteId,
    initialAssets,
    onSelect,
    selectable = false,
}: MediaLibraryProps) {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>(initialAssets);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFiles = useCallback(
        async (files: FileList | File[]) => {
            setUploading(true);
            const fileArray = Array.from(files);

            try {
                for (const file of fileArray) {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("siteId", siteId);

                    const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        const data = await res.json();
                        toast.error(data.error || "Upload failed");
                        continue;
                    }

                    const { asset } = await res.json();
                    setAssets((prev) => [asset, ...prev]);
                }

                toast.success(
                    fileArray.length === 1
                        ? "File uploaded"
                        : `${fileArray.length} files uploaded`
                );
                router.refresh();
            } catch {
                toast.error("Upload failed");
            } finally {
                setUploading(false);
            }
        },
        [siteId, router]
    );

    const handleDelete = async (asset: Asset) => {
        setDeletingId(asset.id);
        try {
            const res = await fetch("/api/upload", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ assetId: asset.id, siteId }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error || "Delete failed");
                return;
            }

            setAssets((prev) => prev.filter((a) => a.id !== asset.id));
            toast.success("File deleted");
            router.refresh();
        } catch {
            toast.error("Delete failed");
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied`);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) {
                uploadFiles(e.dataTransfer.files);
            }
        },
        [uploadFiles]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                    ${dragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }
                    ${uploading ? "pointer-events-none opacity-60" : ""}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            uploadFiles(e.target.files);
                            e.target.value = "";
                        }
                    }}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 size={32} className="animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload size={32} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-700">
                            Drop files here or click to upload
                        </p>
                        <p className="text-xs text-gray-400">
                            JPEG, PNG, GIF, WebP, SVG, PDF — Max 10 MB
                        </p>
                    </div>
                )}
            </div>

            {/* Asset Grid */}
            {assets.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No media uploaded yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {assets.map((asset) => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            deleting={deletingId === asset.id}
                            selectable={selectable}
                            onSelect={onSelect}
                            onDelete={handleDelete}
                            onCopyUrl={() =>
                                copyToClipboard(asset.url, "URL")
                            }
                            onCopyMarkdown={() =>
                                copyToClipboard(
                                    `![${asset.alt || asset.filename}](${asset.url})`,
                                    "Markdown"
                                )
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function AssetCard({
    asset,
    deleting,
    selectable,
    onSelect,
    onDelete,
    onCopyUrl,
    onCopyMarkdown,
}: {
    asset: Asset;
    deleting: boolean;
    selectable: boolean;
    onSelect?: (asset: Asset) => void;
    onDelete: (asset: Asset) => void;
    onCopyUrl: () => void;
    onCopyMarkdown: () => void;
}) {
    const [showActions, setShowActions] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            className={`
                group relative bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all
                ${selectable ? "cursor-pointer hover:ring-2 hover:ring-blue-500" : ""}
                ${deleting ? "opacity-50 pointer-events-none" : ""}
            `}
            onClick={() => selectable && onSelect?.(asset)}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => {
                setShowActions(false);
                setConfirmDelete(false);
            }}
        >
            {/* Thumbnail */}
            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                {isImageType(asset.mimeType) ? (
                    <img
                        src={asset.url}
                        alt={asset.alt || asset.filename}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FileText size={32} className="text-gray-300" />
                )}
            </div>

            {/* Info */}
            <div className="p-2.5">
                <p className="text-xs font-medium text-gray-800 truncate" title={asset.filename}>
                    {asset.filename}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                    {formatFileSize(asset.size)}
                </p>
            </div>

            {/* Hover Actions */}
            {showActions && !selectable && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyUrl();
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy URL"
                    >
                        <Copy size={16} className="text-gray-700" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCopyMarkdown();
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Copy as Markdown"
                    >
                        <ImageIcon size={16} className="text-gray-700" />
                    </button>
                    {confirmDelete ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(asset);
                            }}
                            className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                            title="Confirm delete"
                        >
                            <Check size={16} className="text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(true);
                            }}
                            className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={16} className="text-red-500" />
                        </button>
                    )}
                </div>
            )}

            {deleting && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                </div>
            )}
        </div>
    );
}
