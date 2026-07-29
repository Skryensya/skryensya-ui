/*
 * A composition written as data (decision 29), and the shape of the data every consumer passes
 * around: the compiler emits from it, the gates render it, the recipes ARE it.
 *
 * It lives in Core, beside the contract it is written against, for a reason turbo said out loud: the
 * recipes are data the compiler CONSUMES, so having them import the compiler for this type made the
 * two packages depend on each other. Data does not depend on its consumer. The functions that READ
 * a tree stay in the compiler — those are machinery, not vocabulary.
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
