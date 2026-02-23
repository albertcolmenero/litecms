
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

                const alignClass = getAlignmentClass(align);

                if (node.name === 'section') {
                    const layout = attributes.layout || '100';

                    // Always base grid on 12 columns
                    const gridClass = 'grid gap-6 w-full grid-cols-1 md:grid-cols-12 ';

                    const parts = layout.split('-');

                    // Calculate spans based on percentage parts
                    // e.g. "33" -> 4 (approx 33% of 12)
                    // "50" -> 6
                    // "100" -> 12
                    const spans = parts.map((p: string) => {
                        const n = parseInt(p);
                        if (isNaN(n)) return 12;
                        return Math.round((n / 100) * 12);
                    });

                    // Desktop variable for potential JS usage (preserving existing logic)
                    const template = parts.map((p: string) => `${p}%`).join(' ');
                    addStyle(`--desktop-layout: ${template}`);

                    // Extract logic-only attributes
                    const { layout: _l, align: _a, bg: _b, ...domAttributes } = attributes;

                    const isTopLevel = parent && parent.type === 'root';

                    data.hName = isTopLevel ? 'section' : 'div';
                    data.hProperties = {
                        className: isTopLevel ? 'py-20 md:py-32 px-6' : 'py-4 md:py-8',
                        ...domAttributes
                    };


                    if (bg) {
                        addStyle(`background-color: var(--color-${bg})`);
                    }

                    const originalChildren = node.children || [];

                    // Define responsive column spans map to ensure Tailwind generates these classes
                    const colSpans: Record<number, string> = {
                        1: 'md:col-span-1',
                        2: 'md:col-span-2',
                        3: 'md:col-span-3',
                        4: 'md:col-span-4',
                        5: 'md:col-span-5',
                        6: 'md:col-span-6',
                        7: 'md:col-span-7',
                        8: 'md:col-span-8',
                        9: 'md:col-span-9',
                        10: 'md:col-span-10',
                        11: 'md:col-span-11',
                        12: 'md:col-span-12',
                    };

                    // Wrap children in col-span containers
                    let elementIndex = 0;
                    const processedChildren = originalChildren.map((child: any) => {
                        // Skip wrapping text nodes (presumed whitespace) to avoid creating anonymous grid items for newlines
                        if (child.type === 'text') return child;

                        const span = spans[elementIndex % spans.length];
                        const colSpanClass = colSpans[span] || 'md:col-span-12';
                        elementIndex++;

                        return {
                            type: 'containerDirective',
                            name: 'wrapper',
                            data: {
                                hName: 'div',
                                hProperties: {
                                    className: `${colSpanClass} ${alignClass}`.trim()
                                }
                            },
                            children: [child]
                        };
                    });

                    node.children = [{
                        type: 'containerDirective',
                        data: {
                            hName: 'div',
                            hProperties: {
                                className: isTopLevel ? `max-w-6xl mx-auto ${gridClass} ${alignClass}`.trim() : `${gridClass} ${alignClass}`.trim()
                            }
                        },
                        children: processedChildren
                    }];
                }

                if (node.name === 'column') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: `${alignClass}`.trim(),
                        ...attributes
                    };
                    if (bg) addStyle(`background-color: var(--color-${bg}); padding: 1rem; border-radius: 0.5rem;`);
                }

                if (node.name === 'card') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: `flex flex-col justify-between bg-white dark:bg-black p-6 mb-6 shadow-lg ring-1 ring-gray-900/5 dark:ring-white/10 rounded-2xl ${alignClass}`.trim(),
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
                        className: 'inline-flex items-center justify-center h-12 px-8 rounded-lg text-base font-medium hover:opacity-90 transition-opacity no-underline',
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

                // Breakline Directive
                if (node.name === 'breakline' || node.name === 'br') {
                    const height = attributes.height || attributes.h;

                    if (height) {
                        // If height is specified, render a spacer div
                        data.hName = 'div';
                        data.hProperties = {
                            className: 'w-full',
                            ...attributes
                        };

                        // Check if height is a clear CSS value or needs units
                        const heightValue = isNaN(Number(height)) ? height : `${height}rem`;
                        addStyle(`height: ${heightValue}`);
                    } else {
                        // Default to simple line break
                        data.hName = 'br';
                        data.hProperties = { ...attributes };
                    }
                }

                // Avatar Directive
                if (node.name === 'avatar') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: 'h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg font-bold',
                        ...attributes
                    };
                }
                // Form Directive
                if (node.name === 'form') {
                    const id = attributes.id;
                    if (id) {
                        data.hName = 'form-component';
                        data.hProperties = {
                            id: id,
                            className: 'my-8',
                            ...attributes
                        };
                    }
                }

                // Blog Posts Directive
                if (node.name === 'blog-posts') {
                    data.hName = 'blog-posts-component';
                    data.hProperties = {
                        className: 'my-12',
                        ...attributes,
                        count: attributes.count ? parseInt(attributes.count) : 3,
                    };
                }
            }
        });
    };
}

/*
works:
max-w-5xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12

not working:
max-w-6xl mx-auto grid gap-12 md:grid-cols-[60%_40%] text-left
*/