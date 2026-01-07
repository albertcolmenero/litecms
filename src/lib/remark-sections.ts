
import { visit } from 'unist-util-visit';

export function remarkSections() {
    return (tree: any) => {
        visit(tree, (node, index, parent) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};
                const bg = attributes.bg;
                const color = attributes.color || attributes.c; // Support 'color' or 'c'
                const align = attributes.align;

                // Helper to add styles
                const addStyle = (styleString: string) => {
                    const existingStyle = data.hProperties?.style || '';
                    data.hProperties = {
                        ...data.hProperties,
                        style: (existingStyle + (existingStyle ? '; ' : '') + styleString).trim()
                    };
                };

                // Helper to get alignment class
                const getAlignmentClass = (alignment: string) => {
                    switch (alignment) {
                        case 'center': return 'text-center';
                        case 'right': return 'text-right';
                        case 'justify': return 'text-justify';
                        case 'left': return 'text-left';
                        default: return '';
                    }
                };

                const alignClass = align ? getAlignmentClass(align) : '';

                if (node.name === 'section') {
                    const layout = attributes.layout || '100';

                    let gridClass = 'grid gap-4';
                    // Define layouts

                    const parts = layout.split('-');
                    const isAllNumbers = parts.every((p: string) => !isNaN(Number(p)));
                    const isValidCount = parts.length > 0 && parts.length <= 4;

                    if (isValidCount && isAllNumbers) {
                        // Mobile: Stack (grid-cols-1)
                        gridClass += ' grid-cols-' + parts.length;
                        gridClass += ' sm:dynamic-grid';
                        gridClass += ' sm:grid-cols-[' + parts.map((p: string) => `${p}%`).join('_') + ']';

                        const template = parts.map((p: string) => `${p}%`).join(' ');
                        addStyle(`--desktop-layout: ${template}`);
                    } else {
                        // Fallback
                        gridClass += ' grid-cols-1';
                    }

                    /*
                    if (layout === '50-50') gridClass += ' grid-cols-2 sm:grid-cols-2';
                    else if (layout === '10-90') gridClass += ' grid-cols-2 sm:grid-cols-[10%_90%]';    
                    else if (layout === '90-10') gridClass += ' grid-cols-2 sm:grid-cols-[90%_10%]';
                    else if (layout === '20-80') gridClass += ' grid-cols-2 sm:grid-cols-[20%_80%]';
                    else if (layout === '80-20') gridClass += ' grid-cols-2 sm:grid-cols-[80%_20%]';
                    else if (layout === '30-70') gridClass += ' grid-cols-2 sm:grid-cols-[30%_70%]';
                    else if (layout === '70-30') gridClass += ' grid-cols-2 sm:grid-cols-[70%_30%]';
                    else if (layout === '60-40') gridClass += ' grid-cols-2 sm:grid-cols-[60%_40%]';
                    else if (layout === '40-60') gridClass += ' grid-cols-2 sm:grid-cols-[40%_60%]';
                    else if (layout === '33-33-33') gridClass += ' grid-cols-3 sm:grid-cols-3';
                    else if (layout === '20-60-20') gridClass += ' grid-cols-3 sm:grid-cols-[20%_60%_20%]';
                    else if (layout === '45-10-45 gridClass += ' grid-cols-3 sm:grid-cols-[45%_10%_45%]';
                    else gridClass += ' grid-cols-1';
*/

                    // Full Width Logic for Top-Level Sections
                    const isTopLevel = parent.type === 'root';

                    data.hName = 'div';
                    data.hProperties = {
                        className: `w-full ${isTopLevel ? 'py-24' : 'pt-10'}  ${gridClass} ${alignClass}`.trim(),
                        ...attributes
                    };

                    if (bg) {
                        addStyle(`background-color: var(--color-${bg}); padding: 6rem 0;`); // Add vertical padding to bg sections

                        if (isTopLevel) {
                            // Breakout strategy
                            addStyle(`
                                width: var(--breakout-width, 100vw);
                                margin-left: calc(50% - var(--breakout-offset, 50vw));
                                margin-right: calc(50% - var(--breakout-offset, 50vw));
                                padding-left: calc(var(--breakout-offset, 50vw) - 50%);
                                padding-right: calc(var(--breakout-offset, 50vw) - 50%);
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
                        className: `w-full ${alignClass}`.trim(),
                        ...attributes
                    };
                    if (bg) addStyle(`background-color: var(--color-${bg}); padding: 1rem; border-radius: 0.5rem;`);
                }

                if (node.name === 'card') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: `border rounded-xl p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800 ${alignClass}`.trim(),
                        ...attributes
                    };
                    if (bg) {
                        // Override default bg
                        data.hProperties.className = data.hProperties.className.replace('bg-white', '').replace('dark:bg-neutral-900', '');
                        addStyle(`background-color: var(--color-${bg})`);
                    }
                }

                if (node.name === 'button') {
                    const variant = attributes.variant || 'primary';
                    const isSecondary = variant === 'secondary';

                    data.hName = 'a';
                    data.hProperties = {
                        className: 'inline-flex items-center justify-center h-12 mx-4 px-8 rounded-lg text-base font-medium hover:opacity-90 transition-opacity no-underline',
                        href: attributes.href || '#',
                        ...attributes
                    };

                    // Default theme styles
                    let bgStyle = isSecondary ? 'var(--theme-button-secondary-background)' : 'var(--theme-button-background)';
                    let textStyle = isSecondary ? 'var(--theme-button-secondary-text)' : 'var(--theme-button-text)';

                    // Override with specific bg attribute if present
                    if (bg) {
                        bgStyle = `var(--color-${bg})`;
                    }

                    let styles = `background-color: ${bgStyle}; color: ${textStyle};`;

                    if (isSecondary) {
                        styles += ` border: 1px solid ${textStyle};`;
                    }

                    addStyle(styles);
                }

                if (node.name === 'icon') {
                    data.hName = 'icon-component';
                    data.hProperties = {
                        className: 'inline-block',
                        ...attributes
                    };
                    if (attributes.name) {
                        data.hProperties.name = attributes.name;
                    }
                    if (color) {
                        addStyle(`color: var(--color-${color})`);
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
