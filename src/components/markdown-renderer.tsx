
"use client";

import ReactMarkdown from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { remarkSections } from "@/lib/remark-sections";
import matter from "gray-matter";
import * as LucideIcons from "lucide-react";
import Form from "@/components/mdx/Form";
import BlogPosts from "@/components/mdx/BlogPosts";

interface MarkdownRendererProps {
    content: string;
    className?: string;
    site?: any; // We'll type this loosely for now as per codebase convention
}

// Helper to convert kebab-case to PascalCase (e.g. "arrow-right" -> "ArrowRight")
const toPascalCase = (str: string) => {
    return str.replace(/(^\w|-\w)/g, (clear) => clear.replace(/-/, "").toUpperCase());
};

const IconComponent = ({ node, name, className, ...props }: any) => {
    if (!name) return null;

    // Try direct lookup first
    let Icon = (LucideIcons as any)[name];

    // If not found, try converting to PascalCase (e.g. "rocket" -> "Rocket", "arrow-right" -> "ArrowRight")
    if (!Icon) {
        const pascalName = toPascalCase(name);
        Icon = (LucideIcons as any)[pascalName];
    }

    // Fallback: try adding "Icon" suffix if missing (some lucide versions do this)
    if (!Icon) {
        Icon = (LucideIcons as any)[`${toPascalCase(name)}Icon`];
    }

    if (!Icon) {
        // console.warn(`Icon not found: ${name}`);
        return null;
    }

    return (
        <div
            className=" flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600"
            style={{
                backgroundColor: 'var(--color-icon-bg, var(--color-primary))',
                color: 'var(--color-icon-fg, #ffffff)'
            }}
        >
            <Icon className={className || "w-6 h-6"} {...props} />
        </div>
    );
};

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
        // Map new icon colors if available, otherwise fallback is handled in CSS/Component
        "--color-icon-bg": colors.iconBackground,
        "--color-icon-fg": colors.iconColor,
    } as React.CSSProperties;

    customColors.forEach((c: { id: string; value: string }) => {
        (styleVariables as any)[`--color-${c.id}`] = c.value;
    });

    return (
        <div className={className} style={styleVariables}>
            <style jsx global>{`
                .markdown-content {
                    font-family: ${fontFamily === "Geist"
                    ? "var(--font-geist-sans), sans-serif"
                    : (fontFamily === "inherit" || !fontFamily
                        ? "inherit"
                        : `"${fontFamily}", sans-serif`)
                };
                }
            `}</style>
            <div className={`markdown-content ${fontFamily !== 'inherit' && 'font-wrapper'}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkDirective, remarkSections]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        // Styles for directives are handled by remarkSections transforming directly to div with classes
                        h1: ({ node, ...props }: any) => <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6" {...props} />,
                        h2: ({ node, ...props }: any) => <h2 className="mb-2 text-base font-semibold leading-7 text-blue-600 dark:text-blue-500" {...props} />,
                        h3: ({ node, ...props }: any) => <h3 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl" {...props} />,
                        p: ({ node, ...props }: any) => <p className="text-base leading-8 text-gray-600 dark:text-gray-300 " {...props} />,
                        a: ({ node, ...props }: any) => <a className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500" {...props} />,
                        "icon-component": IconComponent,
                        "form-component": Form,
                        "blog-posts-component": (props: any) => <BlogPosts {...props} siteId={site?.id} />,
                    } as any}
                >
                    {markdownBody}
                </ReactMarkdown>
            </div>
        </div>
    );
}
