"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { MarkdownGuide } from "./markdown-guide";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface EditorProps {
    initialValue?: string;
    onChange?: (markdown: string) => void;
    editable?: boolean;
}

export function Editor({ initialValue = "", onChange }: EditorProps) {
    const [markdownContent, setMarkdownContent] = useState(initialValue);
    const [showGuide, setShowGuide] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newVal = e.target.value;
        setMarkdownContent(newVal);
        onChange?.(newVal);
    };

    return (
        <div className="flex h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Left Column: Preview */}
            <div className="w-1/2 flex flex-col border-r h-full overflow-hidden bg-white">
                <div className="p-3 border-b bg-gray-50 font-medium text-sm text-gray-700 flex justify-between items-center">
                    <span>Preview</span>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        <MarkdownRenderer content={markdownContent} />
                    </div>
                </div>
            </div>

            {/* Right Column: Raw Editor + Guide UI */}
            <div className="w-1/2 flex flex-col h-full relative">
                <div className="p-3 border-b bg-gray-50 font-medium text-sm text-gray-700 flex justify-between items-center">
                    <span>Markdown Source</span>
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-colors ${showGuide ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        <HelpCircle size={14} /> Guide
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <textarea
                        value={markdownContent}
                        onChange={handleChange}
                        className="flex-1 h-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50/50"
                        placeholder="Type markdown here..."
                        spellCheck={false}
                    />

                    {/* Guide Overlay/Panel on the right side of the editor only? 
                        The user said "on the right column we will have the raw editor with the guide as it works right now".
                        Previously guide was a sidebar. Let's make it a sidebar within this right column.
                    */}
                    {showGuide && (
                        <div className="w-80 h-full border-l bg-white overflow-hidden flex-shrink-0">
                            <MarkdownGuide />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
