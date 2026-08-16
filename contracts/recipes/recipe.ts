import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * A RECIPE: a whole screen as usage trees, one per state.
 *
 * A catalogue answers "which component"; it does not answer "what does a form look like when it is
 * saving, and what does it look like when it failed". Those are the compositions an agent is
 * actually asked for, and they are where the catalogue's constraints meet each other: a FormField's
 * error slot is what makes the form invalid, an EmptyState is not a Loader, a destructive action is
 * a variant AND a confirmation.
 *
 * Written as DATA, not prose, for the same reason everything else here is: the compiler validates
 * every state against the contracts, so a recipe that names a signature that changed fails the
 * build instead of teaching the wrong thing forever.
 *
 * The four states are not decoration. A screen that only exists in its happy state is the single
 * most common way a generated UI is wrong.
 */
export type RecipeState = "loading" | "empty" | "error" | "success";

export type Recipe = {
  /** Stable id. What an agent asks for and what the docs page routes on. */
  readonly id: string;
  /** One line, in the user's language: what this screen is for. */
  readonly intent: string;
  /**
   * Why this shape and not another, in the same voice as an overlay's `useWhen`. The trees say what
   * it is; this says why it is worth copying.
   */
  readonly notes: readonly string[];
  /**
   * Every state the screen has. All four are required: a recipe that ships only its success state
   * is the omission it exists to prevent.
   */
  readonly states: Readonly<Record<RecipeState, UsageTree>>;
};
