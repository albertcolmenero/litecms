
"use client";

import ReactMarkdown from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { remarkSections } from "@/lib/remark-sections";
import matter from "gray-matter";

interface MarkdownRendererProps {
    content: string;
    className?: string;
    site?: any; // We'll type this loosely for now as per codebase convention
}

export function MarkdownRenderer({ content, className, site }: MarkdownRendererProps) {
    // Parse frontmatter and get content
    const { content: markdownBody } = matter(content || "");

    // Generate CSS variables from site settings
    const theme = site?.settings?.theme || {};
    const colors = theme.colors || {};
    const customColors = theme.customColors || [];
    const fontFamily = theme.font || "inherit";

    const styleVariables: React.CSSProperties = {
        "--font-body": fontFamily,
        "--color-primary": colors.primary || "#000000",
        "--color-background": colors.background || "#ffffff",
        "--color-text": colors.text || "#000000",
    } as React.CSSProperties;

    customColors.forEach((c: { id: string; value: string }) => {
        (styleVariables as any)[`--color-${c.id}`] = c.value;
    });

    return (
        <div className={className} style={styleVariables}>
            <style jsx global>{`
                .markdown-content {
                    font-family: ${fontFamily === "inherit" ? "inherit" : `"${fontFamily}", sans-serif`};
                }
            `}</style>
            <div className={`markdown-content ${fontFamily !== 'inherit' && 'font-wrapper'}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkDirective, remarkSections]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        // Styles for directives are handled by remarkSections transforming directly to div with classes
                    }}
                >
                    {markdownBody}
                </ReactMarkdown>
            </div>
        </div>
    );
}
