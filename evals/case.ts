import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * AN EVAL CASE: one product intent, in both languages the catalogue is written for, paired with a
 * tree an agent given only that intent and the three MCP tools would be expected to arrive at.
 *
 * This is not a Recipe (contracts/recipes/recipe.ts). A recipe is a whole screen across four
 * states, published for an agent to copy. A case is smaller and points the other way: it exists to
 * be RE-VALIDATED, not copied, so `run.ts` can catch a contract change that quietly breaks a
 * composition this corpus already proved correct once.
 */
export type EvalCase = {
  /** Stable id. What a failing run names. */
  readonly id: string;
  /** The intent as a person would actually type it, not a description of the tree below. */
  readonly prompt: { readonly es: string; readonly en: string };
  /**
   * What this case guards and why, in the same voice as a recipe's notes. A case with no story is
   * indistinguishable from a case nobody would miss.
   */
  readonly notes: readonly string[];
  /** Hand-composed and confirmed valid via `validate_ui` before landing here. */
  readonly tree: UsageTree;
};
