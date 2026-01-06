
// Simulation of the logic I wrote:
const mockParent = { type: 'root' };
const mockNode = {
    type: 'containerDirective',
    name: 'section',
    attributes: { bg: 'primary' },
    data: {}
};

const bg = mockNode.attributes.bg;
const isTopLevel = mockParent.type === 'root';
let styles = "";

if (bg) {
    styles += `background-color: var(--color-${bg}); padding: 2rem 0;`;
    if (isTopLevel) {
        styles += `
        width: 100vw;
        margin-left: calc(50% - 50vw);
        margin-right: calc(50% - 50vw);
        padding-left: calc(50vw - 50%);
        padding-right: calc(50vw - 50%);
        `;
    }
}

console.log("Generated Styles:", styles);
if (styles.includes('width: 100vw')) console.log("PASSED: Full width applied");
else console.log("FAILED: Full width missing");
