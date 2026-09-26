import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type SlotContent,
  type UsageTree,
} from "@skryensya/core/usage-tree";

/*
 * ONE descent through a usage tree, visiting every real node once: the root, every node in every
 * slot (the `children` sugar included), and every node nested in a collection entry's own slots (a
 * tab's label and panel). A collection entry is data, not a node, so it is walked through and never
 * visited.
 *
 * `sheetsForTree` and the MCP server each used to write this by hand. The two copies were close
 * enough to look identical and different enough that only one of them reached a collection entry's
 * slots correctly, which is the drift one shared walk exists to make impossible.
 */
export function walkUsageTree(tree: UsageTree, visit: (node: UsageTree) => void): void {
  visit(tree);
  for (const content of Object.values(slotsOf(tree))) walkSlot(content, visit);
}

function walkSlot(content: SlotContent | undefined, visit: (node: UsageTree) => void): void {
  for (const item of slotItems(content)) {
    if (isUsageTree(item)) walkUsageTree(item, visit);
  }
  for (const entry of collectionItems(content)) {
    for (const nested of Object.values(entry.slots)) walkSlot(nested, visit);
  }
}

/** Every family id a tree touches, anywhere in it, sorted. */
export function contractsIn(tree: UsageTree): readonly string[] {
  const into = new Set<string>();
  walkUsageTree(tree, (node) => into.add(node.contract));
  return [...into].sort();
}

/** Every signature id a tree touches, anywhere in it, sorted. */
export function signaturesIn(tree: UsageTree): readonly string[] {
  const into = new Set<string>();
  walkUsageTree(tree, (node) => into.add(node.signature));
  return [...into].sort();
}
