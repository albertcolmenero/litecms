
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const markdown = `
:::section{layout="50-50"}
  :::column
    Left
  :::
  :::column
    Right
  :::
:::
`;

async function main() {
    const file = await unified()
        .use(remarkParse)
        .use(remarkDirective)
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(markdown);

    console.log(String(file));
}

main();
