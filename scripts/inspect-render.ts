import { prisma } from "@/lib/prisma";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { remarkSections } from "@/lib/remark-sections";

async function main() {
  const page = await prisma.page.findFirst({
    where: { site: { subdomain: "flowkan-agent-test" } },
    select: { content: true },
  });
  const md = page?.content ?? "";
  const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
  const html = String(
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkDirective)
      .use(remarkSections)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(body),
  );

  const aTags = (html.match(/<a [^>]*class="inline-flex[^"]*"/g) || []).length;
  const escapedBtnSources = (md.match(/\\::button/g) || []).length;
  const totalBtnSources = (md.match(/::button\[/g) || []).length;
  const sectionsHtml = (html.match(/<section/g) || []).length;
  const literalDirectiveLeak = (html.match(/::button|::badge|::icon/g) || []).length;

  console.log("button source mentions (escaped \\::button):", escapedBtnSources);
  console.log("button source mentions (total ::button[):", totalBtnSources);
  console.log("rendered anchor buttons in HTML:", aTags);
  console.log("rendered <section> tags in HTML:", sectionsHtml);
  console.log("literal directive text in HTML (should be 0):", literalDirectiveLeak);
  if (literalDirectiveLeak > 0) {
    console.log(
      "  leaks (first 200 chars):",
      html.match(/::button|::badge|::icon/g)?.[0] ? html.slice(html.indexOf("::"), html.indexOf("::") + 200) : "",
    );
  }

  await prisma.$disconnect();
}

main();
