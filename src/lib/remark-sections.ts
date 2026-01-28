
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

                    let gridClass = 'grid gap-12 w-full';
                    // Define layouts

                    const parts = layout.split('-');
                    const isAllNumbers = parts.every((p: string) => !isNaN(Number(p)));
                    const isValidCount = parts.length > 0 && parts.length <= 4;

                    if (isValidCount && isAllNumbers) {
                        // Check if all parts are equal numbers (e.g., 50-50, 33-33-33)
                        const isEqual = parts.every((p: string) => p === parts[0]);

                        if (isEqual) {
                            gridClass += ` md:grid-cols-${parts.length}`;
                        } else {
                            gridClass += ' md:grid-cols-[' + parts.map((p: string) => `${p}%`).join('_') + ']';
                            // Desktop variable for potential JS usage or custom CSS
                            const template = parts.map((p: string) => `${p}%`).join(' ');
                            addStyle(`--desktop-layout: ${template}`);
                        }
                    } else {
                        // Fallback
                        gridClass += ' md:grid-cols-1';
                    }

                    // Extract logic-only attributes to avoid passing them to the DOM
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
                    node.children = [{
                        type: 'containerDirective',
                        data: {
                            hName: 'div',
                            hProperties: {
                                className: isTopLevel ? `max-w-6xl mx-auto ${gridClass} ${alignClass}`.trim() : `${gridClass} ${alignClass}`.trim()
                            }
                        },
                        children: originalChildren
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