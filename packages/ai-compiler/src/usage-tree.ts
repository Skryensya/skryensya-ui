import type { ContractSlot } from "@skryensya/core/contract";
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

/**
 * One collection entry, flattened into the plain object every emitter eventually takes: options
 * spread as-is, each slot renamed to the binding's own field (`shape?.slots[field]?.prop`, a tile
 * option's content is `label` in the contract and `children` in React), and a slot holding MORE
 * ENTRIES flattened the same way one level down, because a folder's children are folders.
 *
 * `resolveLeaf` is the one thing every caller of this genuinely does differently, and the reason
 * this stayed three separate walks for as long as it did: a slot that holds TEXT or TREES has no
 * one right answer. Source-text emission (markup, JSX text) keeps only the text and leaves any
 * tree content to its own separate emission, one level up; a live render turns every value, tree
 * or text, into whatever the binding actually takes as a prop. Both are `resolveLeaf`, not two
 * copies of the walk around it. Return `undefined` to leave the field unset entirely.
 */
export function flattenCollectionEntry(
  entry: ItemInput,
  shape: ContractSlot["item"] | undefined,
  resolveLeaf: (values: readonly (string | UsageTree)[]) => unknown,
): Record<string, unknown> {
  const flat: Record<string, unknown> = { ...entry.options };

  for (const [field, content] of Object.entries(entry.slots)) {
    const name = shape?.slots[field]?.prop ?? field;

    const nested = collectionItems(content);
    if (nested.length > 0) {
      flat[name] = nested.map((child) => flattenCollectionEntry(child, shape, resolveLeaf));
      continue;
    }

    const resolved = resolveLeaf(slotItems(content));
    if (resolved !== undefined) flat[name] = resolved;
  }

  return flat;
}
