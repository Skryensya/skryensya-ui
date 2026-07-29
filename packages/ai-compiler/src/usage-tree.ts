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
 * child node — the fields of one entry are scattered across the markup and joined by the key.
 */
export type ItemInput = {
  readonly options?: Readonly<Record<string, OptionInput>>;
  readonly slots: Readonly<Record<string, string | UsageTree | readonly (string | UsageTree)[]>>;
};

export type SlotContent =
  | string
  | UsageTree
  | readonly (string | UsageTree)[]
  | readonly ItemInput[];

export type UsageTree = {
  readonly contract: string;
  readonly signature: string;
  /** Values for the options this signature declares. Anything else is a problem, not a passthrough. */
  readonly options?: Readonly<Record<string, OptionInput>>;
  /**
   * What the author passes straight to the host: `aria-label`, `id`, `rel`, `target`. Deliberately
   * separate from options — an option is something the contract maps, and these are not.
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
