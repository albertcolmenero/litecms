import { visit } from "unist-util-visit";

const TARGET_NODE_TYPES = new Set(["heading", "paragraph", "listItem"]);

/**
 * Stamps `data-md-from` and `data-md-to` (character offsets into the source string)
 * onto heading/paragraph/listItem nodes so that a WYSIWYG layer can splice text
 * edits back into the markdown source at the correct range.
 *
 * Offsets cover the *inner text content* of the node — so for `## Hello world`,
 * the range starts after `## ` and ends at the end of `world`. For paragraphs,
 * the range covers the entire paragraph text.
 */
export function remarkSourcePositions() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (!TARGET_NODE_TYPES.has(node.type)) return;

      const children = node.children || [];
      // Find the first and last children that have a position with offsets.
      const firstWithPos = children.find((c: any) => c?.position?.start?.offset != null);
      const lastWithPos = [...children]
        .reverse()
        .find((c: any) => c?.position?.end?.offset != null);

      if (!firstWithPos || !lastWithPos) return;

      const from = firstWithPos.position.start.offset;
      const to = lastWithPos.position.end.offset;
      if (typeof from !== "number" || typeof to !== "number" || to <= from) return;

      const data = node.data || (node.data = {});
      data.hProperties = {
        ...(data.hProperties || {}),
        "data-md-from": String(from),
        "data-md-to": String(to),
      };
    });
  };
}
