"use client";

import { type Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    List,
    Link as LinkIcon,
    Image as ImageIcon,
    Quote
} from "lucide-react";
import { clsx } from "clsx";

interface ToolbarProps {
    editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL", previousUrl);

        if (url === null) {
            return;
        }

        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt("Image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const ToggleButton = ({
        isActive,
        onClick,
        children,
        title
    }: {
        isActive: boolean;
        onClick: () => void;
        children: React.ReactNode;
        title?: string;
    }) => (
        <button
            onClick={onClick}
            title={title}
            className={clsx(
                "p-2 rounded hover:bg-gray-200 transition",
                isActive ? "bg-gray-200 text-black" : "text-gray-500"
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="flex items-center gap-1 border-b border-gray-200 p-2 mb-4 sticky top-0 bg-white z-10">
            <ToggleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </ToggleButton>

            <ToggleButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </ToggleButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <ToggleButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold"
            >
                <Bold size={18} />
            </ToggleButton>

            <ToggleButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic"
            >
                <Italic size={18} />
            </ToggleButton>

            <ToggleButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title="Quote"
            >
                <Quote size={18} />
            </ToggleButton>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <ToggleButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
            >
                <List size={18} />
            </ToggleButton>

            <ToggleButton
                onClick={setLink}
                isActive={editor.isActive("link")}
                title="Link"
            >
                <LinkIcon size={18} />
            </ToggleButton>

            <ToggleButton
                onClick={addImage}
                isActive={false}
                title="Image"
            >
                <ImageIcon size={18} />
            </ToggleButton>
        </div>
    );
}
