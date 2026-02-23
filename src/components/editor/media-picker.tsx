"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import {
    Upload,
    X,
    Loader2,
    Image as ImageIcon,
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
}

interface MediaPickerProps {
    siteId: string;
    onSelect: (markdown: string) => void;
    onClose: () => void;
}

function isImageType(mimeType: string | null): boolean {
    return !!mimeType && mimeType.startsWith("image/");
}

function formatFileSize(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPicker({ siteId, onSelect, onClose }: MediaPickerProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { getAssets } = await import("@/actions/assets");
                const data = await getAssets(siteId);
                if (!cancelled) setAssets(data as Asset[]);
            } catch {
                if (!cancelled) toast.error("Failed to load media");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [siteId]);

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
                toast.success("Uploaded");
            } catch {
                toast.error("Upload failed");
            } finally {
                setUploading(false);
            }
        },
        [siteId]
    );

    const handleSelect = (asset: Asset) => {
        const alt = asset.alt || asset.filename;
        onSelect(`![${alt}](${asset.url})`);
        onClose();
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Insert Image</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Upload Zone */}
                <div className="px-5 pt-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragOver(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all
                            ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                            ${uploading ? "pointer-events-none opacity-60" : ""}
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    uploadFiles(e.target.files);
                                    e.target.value = "";
                                }
                            }}
                        />
                        {uploading ? (
                            <div className="flex items-center justify-center gap-2 py-1">
                                <Loader2 size={18} className="animate-spin text-gray-400" />
                                <span className="text-sm text-gray-500">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-1">
                                <Upload size={18} className="text-gray-400" />
                                <span className="text-sm text-gray-600">Drop images or click to upload</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Asset Grid */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={24} className="animate-spin text-gray-400" />
                        </div>
                    ) : assets.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <ImageIcon size={36} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No images yet. Upload one above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {assets.filter((a) => isImageType(a.mimeType)).map((asset) => (
                                <button
                                    key={asset.id}
                                    onClick={() => handleSelect(asset)}
                                    className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <img
                                        src={asset.url}
                                        alt={asset.alt || asset.filename}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-[11px] text-white truncate">{asset.filename}</p>
                                        <p className="text-[10px] text-white/70">{formatFileSize(asset.size)}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-blue-500 text-white rounded-full p-1.5">
                                            <Check size={14} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
