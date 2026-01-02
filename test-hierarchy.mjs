
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';

const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(() => (tree) => {
        // Print the tree structure with indentation to see hierarchy
        function printNode(node, indent = 0) {
            const spaces = '  '.repeat(indent);
            if (node.type === 'containerDirective' || node.type === 'leafDirective') {
                process.stdout.write(`${spaces}Directive: ${node.name} (${node.type})\n`);
            } else if (node.type === 'text' && node.value.includes(':::')) {
                process.stdout.write(`${spaces}TEXT: ${node.value.trim()}\n`);
            } else {
                // process.stdout.write(`${spaces}${node.type}\n`);
            }

            if (node.children) {
                node.children.forEach(c => printNode(c, indent + 1));
            }
        }
        printNode(tree);
    });

const inputBroken = `
::::section
:::column
:::card
Content
:::
:::
::::
`;

const inputFixed = `
:::::section
::::column
:::card
Content
:::
::::
:::::
`;

console.log('--- Broken (4, 3, 3) ---');
processor.runSync(processor.parse(inputBroken));

console.log('\n--- Fixed (5, 4, 3) ---');
processor.runSync(processor.parse(inputFixed));
