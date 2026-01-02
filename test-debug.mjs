
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

const inputDebug = `
::::section
:::column
TEXT_BEFORE_CARD
:::card
CARD_CONTENT
:::
TEXT_AFTER_CARD_CLOSE
:::
TEXT_AFTER_COLUMN_CLOSE
::::
`;

console.log('--- Debugging 4-3-3 ---');
processor.runSync(processor.parse(inputDebug));
