
import { visit } from 'unist-util-visit';

export function remarkSections() {
    return (tree: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

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
                }

                if (node.name === 'column') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: 'w-full',
                        ...attributes
                    };
                }

                if (node.name === 'card') {
                    data.hName = 'div';
                    data.hProperties = {
                        className: 'border rounded-xl p-6 shadow-sm bg-white dark:bg-neutral-900 dark:border-neutral-800',
                        ...attributes
                    };
                }

                if (node.name === 'button') {
                    data.hName = 'a';
                    data.hProperties = {
                        className: 'inline-flex items-center justify-center px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity no-underline',
                        href: attributes.href || '#',
                        ...attributes
                    };
                }
            }
        });
    };
}
