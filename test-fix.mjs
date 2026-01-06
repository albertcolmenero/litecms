
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';

const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(() => (tree) => {
        function printNode(node, indent = 0) {
            const spaces = '  '.repeat(indent);
            if (node.type === 'containerDirective') {
                process.stdout.write(`${spaces}DIR_START: ${node.name}\n`);
            } else if (node.type === 'text') {
                process.stdout.write(`${spaces}TEXT: "${node.value.replace(/\n/g, '\\n')}"\n`);
            }
            if (node.children) {
                node.children.forEach(c => printNode(c, indent + 1));
            }
        }
        printNode(tree);
    });

const inputNewline = `
:::section{layout="100"}
  :::column
    Inner
  :::
  :::column
    Right Sidebar
  :::

:::
`;

const inputFence = `
::::section{layout="100"}
  :::column
    Inner
  :::
  :::column
    Right Sidebar
  :::
::::
`;

console.log('--- Test 1: Extra Newline ---');
processor.runSync(processor.parse(inputNewline));

console.log('\n--- Test 2: Different Fence Length ---');
processor.runSync(processor.parse(inputFence));
