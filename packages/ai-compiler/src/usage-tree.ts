import type { ItemInput, SlotContent, UsageTree } from "@skryensya/core/usage-tree";

/*
 * Reading a usage tree. The SHAPE lives in Core (`@skryensya/core/usage-tree`) because the recipes
 * are data the compiler consumes and data must not depend on its consumer; these are the functions
 * that walk it, which is machinery and belongs here.
 *
 * Re-exported so every consumer keeps one import for both.
 */
export type { OptionInput, ItemInput, SlotContent, UsageTree } from "@skryensya/core/usage-tree";

/** The content of one slot, normalized to a list. Entries of a collection are not children. */
export function slotItems(content: SlotContent | undefined): readonly (string | UsageTree)[] {
  if (content === undefined) return [];
  if (!Array.isArray(content)) return [content as string | UsageTree];
  return (content as readonly unknown[]).filter(
    (entry): entry is string | UsageTree => !isItemInput(entry),
  );
}

/** The entries of a collection slot. Empty for any other kind of slot. */
export function collectionItems(content: SlotContent | undefined): readonly ItemInput[] {
  if (!Array.isArray(content)) return [];
  return (content as readonly unknown[]).filter(isItemInput);
}

function isItemInput(entry: unknown): entry is ItemInput {
  return typeof entry === "object" && entry !== null && "slots" in entry && !("signature" in entry);
}

/** Every slot of a node, with the `children` sugar folded in. */
export function slotsOf(tree: UsageTree): Readonly<Record<string, SlotContent>> {
  if (tree.children === undefined) return tree.slots ?? {};
  return { ...(tree.slots ?? {}), children: tree.children };
}

export function isUsageTree(value: string | UsageTree): value is UsageTree {
  return typeof value !== "string";
}
