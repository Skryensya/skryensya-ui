import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * Counterexamples are best written as "the reference tree with ONE decision made wrong": the rest
 * of the tree stays valid and right, so the only thing an invariant can be catching is that one
 * decision. This rewrites a tree node by node, bottom-up, through every slot and collection entry;
 * `edit` returns a replacement node, or `null` to drop the node from wherever it sits.
 */
export function editTree(tree: UsageTree, edit: (node: UsageTree) => UsageTree | null): UsageTree | null {
  const rebuilt: UsageTree = {
    ...tree,
    ...(tree.children !== undefined ? { children: editContent(tree.children, edit) as UsageTree["children"] } : {}),
    ...(tree.slots
      ? {
          slots: Object.fromEntries(
            Object.entries(tree.slots).map(([name, content]) => [name, editContent(content, edit)]),
          ) as UsageTree["slots"],
        }
      : {}),
  };
  return edit(rebuilt);
}

const isNode = (value: unknown): value is UsageTree =>
  typeof value === "object" && value !== null && "contract" in value && "signature" in value;

function editContent(content: unknown, edit: (node: UsageTree) => UsageTree | null): unknown {
  if (isNode(content)) return editTree(content, edit) ?? [];
  if (!Array.isArray(content)) return content;
  return content.flatMap((item: unknown) => {
    if (isNode(item)) {
      const edited = editTree(item, edit);
      return edited ? [edited] : [];
    }
    if (typeof item === "object" && item !== null && "slots" in item) {
      const entry = item as { slots: Record<string, unknown> };
      return [{ ...entry, slots: Object.fromEntries(Object.entries(entry.slots).map(([name, nested]) => [name, editContent(nested, edit)])) }];
    }
    return [item];
  });
}

/** The same tree with every node of `signature` changed by `change`. */
export function replaceEach(tree: UsageTree, signature: string, change: (node: UsageTree) => UsageTree | null): UsageTree {
  return editTree(tree, (node) => (node.signature === signature ? change(node) : node))!;
}
