"use client";

import { useState, useRef } from "react";
import { HelpCircle, ImageIcon } from "lucide-react";
import { MarkdownGuide } from "./markdown-guide";
import { MediaPicker } from "./media-picker";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface EditorProps {
    initialValue?: string;
    onChange?: (markdown: string) => void;
    editable?: boolean;
    site?: any;
    siteId?: string;
}

export function Editor({ initialValue = "", onChange, site, siteId }: EditorProps) {
    const [markdownContent, setMarkdownContent] = useState(initialValue);
    const [showGuide, setShowGuide] = useState(false);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setMarkdownContent(newVal);
        onChange?.(newVal);
    };

    const insertAtCursor = (text: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            const newVal = markdownContent + "\n" + text;
            setMarkdownContent(newVal);
            onChange?.(newVal);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = markdownContent.slice(0, start);
        const after = markdownContent.slice(end);

        const needsNewline = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
        const newVal = before + needsNewline + text + "\n" + after;

        setMarkdownContent(newVal);
        onChange?.(newVal);

        requestAnimationFrame(() => {
            const cursorPos = start + needsNewline.length + text.length + 1;
            textarea.selectionStart = cursorPos;
            textarea.selectionEnd = cursorPos;
            textarea.focus();
        });
    };

    const handleMediaSelect = (markdown: string) => {
        insertAtCursor(markdown);
    };

    const resolvedSiteId = siteId || site?.id;

    return (
        <div className="flex h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Left Column: Preview */}
            <div className="w-1/2 flex flex-col border-r h-full overflow-hidden bg-white">
                <div className="p-3 border-b bg-gray-50 font-medium text-sm text-gray-700 flex justify-between items-center">
                    <span>Preview</span>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className=" max-w-none" style={{
                        "--breakout-width": "100%",
                        "--breakout-offset": "50%"
                    } as React.CSSProperties}>
                        <MarkdownRenderer content={markdownContent} site={site} />
                    </div>
                </div>
            </div>

            {/* Right Column: Raw Editor + Guide UI */}
            <div className="w-1/2 flex flex-col h-full relative">
                <div className="p-3 border-b bg-gray-50 font-medium text-sm text-gray-700 flex justify-between items-center">
                    <span>Markdown Source</span>
                    <div className="flex items-center gap-1">
                        {resolvedSiteId && (
                            <button
                                onClick={() => setShowMediaPicker(true)}
                                className="flex items-center gap-2 px-3 py-1 rounded text-xs font-medium text-gray-500 hover:text-black transition-colors"
                                title="Insert image from media library"
                            >
                                <ImageIcon size={14} /> Image
                            </button>
                        )}
                        <button
                            onClick={() => setShowGuide(!showGuide)}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors ${showGuide ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-black'
                                }`}
                        >
                            <HelpCircle size={14} /> Guide
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <textarea
                        ref={textareaRef}
                        value={markdownContent}
                        onChange={handleChange}
                        className="flex-1 h-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50/50"
                        placeholder="Type markdown here..."
                        spellCheck={false}
                    />

                    {showGuide && (
                        <div className="w-80 h-full border-l bg-white overflow-hidden shrink-0">
                            <MarkdownGuide />
                        </div>
                    )}
                </div>
            </div>

            {/* Media Picker Modal */}
            {showMediaPicker && resolvedSiteId && (
                <MediaPicker
                    siteId={resolvedSiteId}
                    onSelect={handleMediaSelect}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}
        </div>
    );
}
