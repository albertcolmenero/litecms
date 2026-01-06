
import { visit } from 'unist-util-visit';

export function remarkSections() {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};
                const bg = attributes.bg;
                const color = attributes.color || attributes.c; // Support 'color' or 'c'

                // Helper to add styles
                const addStyle = (styleString: string) => {
                    const existingStyle = data.hProperties?.style || '';
                    data.hProperties = {
                        ...data.hProperties,
                        style: (existingStyle + (existingStyle ? '; ' : '') + styleString).trim()
                    };
                };

                if (node.name === 'section') {
                    const layout = attributes.layout || '100';

                    let gridClass = 'grid gap-4';
                    // Define layouts
                    if (layout === '50-50') gridClass += ' grid-cols-1 sm:grid-cols-2';
                    else if (layout === '60-40') gridClass += ' grid-cols-1 sm:grid-cols-[60%_40%]';
                    else if (layout === '40-60') gridClass += ' grid-cols-1 sm:grid-cols-[40%_60%]';
                    else if (layout === '33-33-33') gridClass += ' grid-cols-1 sm:grid-cols-3';
                    else gridClass += ' grid-cols-1';

                    data.hName = 'div';
                    data.hProperties = {
                        className: `w-full my-4 ${gridClass}`,
                        ...attributes
                    };

                    // Full Width Logic for Top-Level Sections with Background
                    const isTopLevel = parent.type === 'root';

                    if (bg) {
                        addStyle(`background-color: var(--color-${bg}); padding: 2rem 0;`); // Add vertical padding to bg sections

                        if (isTopLevel) {
                            // Breakout strategy
                            addStyle(`
                                width: 100vw;
                                margin-left: calc(50% - 50vw);
                                margin-right: calc(50% - 50vw);
                                padding-left: calc(50vw - 50%);  /* Basic safe area, might need adjustment for container */
                                padding-right: calc(50vw - 50%);
                             `);
                            // Note: content inside still follows grid, but background spans full
                            // To make content constrained, we actually need the grid to be the inner container.
                            // Current implementation puts grid on the wrapper. 
                            // To fix validity of breakout with centered content, we'd ideally wrapping children.
                            // But for now, we'll apply breakout to the grid itself. The grid will span 100vw.
                            // If we want content centered max-width, we might need a `max-width` on children or `padding-inline`.
                            // Let's rely on standard padding for now.
                            data.hProperties.className = data.hProperties.className.replace('w-full', ''); // Removing w-full conflict
                        }
                    }
                }

                if (node.name === 'column') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: 'w-full',
                        ...attributes
                    };
                    if (bg) addStyle(`background-color: var(--color-${bg}); padding: 1rem; border-radius: 0.5rem;`);
                }

                if (node.name === 'card') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: 'border rounded-xl p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800',
                        ...attributes
                    };
                    if (bg) {
                        // Override default bg
                        data.hProperties.className = data.hProperties.className.replace('bg-white', '').replace('dark:bg-neutral-900', '');
                        addStyle(`background-color: var(--color-${bg})`);
                    }
                }

                if (node.name === 'button') {
                    data.hName = 'a';
                    data.hProperties = {
                        className: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline',
                        href: attributes.href || '#',
                        ...attributes
                    };
                    if (bg) {
                        data.hProperties.className = data.hProperties.className.replace('bg-black', '');
                        addStyle(`background-color: var(--color-${bg})`);
                    }
                }

                // Text Color Directive
                if (node.name === 'text' || node.name === 't' || node.name === 'color') {
                    data.hName = 'span';
                    data.hProperties = { ...attributes };
                    if (color) {
                        addStyle(`color: var(--color-${color})`);
                    }
                }
            }
        });
    };
}
