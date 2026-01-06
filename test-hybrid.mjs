
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
                process.stdout.write(`${spaces}DIR_START: ${node.name} (colon count not visible in node)\n`);
            } else if (node.type === 'text') {
                process.stdout.write(`${spaces}TEXT: "${node.value.replace(/\n/g, '\\n')}"\n`);
            } else if (node.value) {
                // catch other literals
            }
            if (node.children) {
                node.children.forEach(c => printNode(c, indent + 1));
            }
        }
        printNode(tree);
    });

const inputDifferentLevels = `
::::section{layout="100"}
  :::column
    :::card
      Card Content
    :::
  :::
::::
`;

console.log('--- Test 4: Section(4) -> Column(3) -> Card(3) ---');
processor.runSync(processor.parse(inputDifferentLevels));

const inputNestedSection = `
::::section{layout="40-60"}
  :::column
    :::card
      ### Nested Layout
      ::::section{layout="50-50"}
        :::column
          Left
        :::
        :::column
          Right
        :::
      ::::
    :::
  :::
::::
`;
// Note: In nested section, I used :::: (4) for the inner section too.
// This puts us in the :::: inside ::: inside ::: inside :::: situation.
// Let's see if :::: works inside :::.

console.log('\n--- Test 5: Complex Nesting with Uniform "Section=4, Others=3" rule ---');
processor.runSync(processor.parse(inputNestedSection));
