import type { ContractSlot } from "./contract.js";

/*
 * A composition written as data (decision 29), and the shape of the data every consumer passes
 * around: the compiler emits from it, the gates render it, the recipes ARE it.
 *
 * It lives in Core, beside the contract it is written against, for a reason turbo said out loud: the
 * recipes are data the compiler CONSUMES, so having them import the compiler for this type made the
 * two packages depend on each other. Data does not depend on its consumer.
 *
 * THE FUNCTIONS THAT READ A TREE NOW LIVE HERE TOO. They used to sit in the compiler, on the
 * grounds that reading is "machinery, not vocabulary". What falsified that: `@skryensya/react`
 * reads a tree as well, so the walkers were never compiler machinery, and the binding had to take
 * a RUNTIME dependency on `@skryensya/ai-compiler` to reach them. A published binding shipping the
 * build-time compiler is a worse outcome than Core owning five pure functions over its own type.
 */

/*
 * A composition written as data (decision 29). Authored once, rendered by both bindings, and the
 * same shape an agent proposes to `validate_ui`.
 *
 * Written in SIGNATURES, never in parts: choosing meaning is the author's job, expanding it into
 * structure is the part template's. Which is why one node here becomes one React element and, in
 * the same breath, five nested elements of authored markup.
 */

export type OptionInput = string | boolean | number;

/**
 * One entry of a collection slot: its own options, and its own content by slot name. Data, not a
 * child node; the fields of one entry are scattered across the markup and joined by the key.
 */
export type ItemInput = {
  readonly options?: Readonly<Record<string, OptionInput>>;
  readonly slots: Readonly<Record<string, SlotContent>>;
};

export type SlotContent =
  string | UsageTree | readonly (string | UsageTree)[] | readonly ItemInput[];

export type UsageTree = {
  readonly contract: string;
  readonly signature: string;
  /** Values for the options this signature declares. Anything else is a problem, not a passthrough. */
  readonly options?: Readonly<Record<string, OptionInput>>;
  /**
   * What the author passes straight to the host: `aria-label`, `id`, `rel`, `target`. Deliberately
   * separate from options; an option is something the contract maps, and these are not.
   */
  readonly attrs?: Readonly<Record<string, string>>;
  readonly slots?: Readonly<Record<string, SlotContent>>;
  /** Sugar for `slots.children`, since almost every node fills it. */
  readonly children?: SlotContent;
};

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
