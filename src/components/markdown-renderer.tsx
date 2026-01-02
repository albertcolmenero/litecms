
import ReactMarkdown from "react-markdown";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { remarkSections } from "@/lib/remark-sections";
import matter from "gray-matter";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    // Parse frontmatter and get content
    const { content: markdownBody } = matter(content || "");

    return (
        <div className={className}>
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
    );
}
