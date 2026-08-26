import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * A SNIPPET: an established tree below screen scale — sibling to `@skryensya/recipes`
 * (`recipe.ts`'s own header), which is whole screens, one per state. A recipe answers "what does a
 * form look like when it's saving"; most of what an agent is actually asked for is smaller than
 * that — "a card in a grid", "an icon-only button that explains itself", "a settings row" — and
 * forcing those through a recipe's four-state shape would be inventing states nothing asked for.
 *
 * TWO LEVELS, not one, because they solve different problems:
 *   - "component": ONE family, well-composed — every slot worth using is used, every option that
 *     matters is set. What "the idiomatic way to use Callout" looks like, not just "a Callout".
 *   - "molecule": a FEW families working together for one small piece of UI that is not a screen —
 *     a card in a grid, a toolbar of icon buttons, a table with its pager. The compositions that sit
 *     between "one component" and "a whole recipe".
 *
 * Like a recipe, this is DATA: the compiler validates every snippet's tree against the contracts, so
 * one naming a signature that changed fails the build instead of teaching the wrong thing forever.
 */
export type SnippetLevel = "component" | "molecule";

export type Snippet = {
  /** Stable id. What an agent asks `get_examples` for and what the docs page would route on. */
  readonly id: string;
  readonly level: SnippetLevel;
  /** One line, in the user's language: what this is for. */
  readonly intent: string;
  /**
   * Why this shape and not another, in the same voice as an overlay's `useWhen` or a recipe's own
   * notes. The tree says what it is; this says why it is worth copying.
   */
  readonly notes: readonly string[];
  readonly tree: UsageTree;
};
