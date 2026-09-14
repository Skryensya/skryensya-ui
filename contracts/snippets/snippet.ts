import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * A SNIPPET: an established tree below screen scale. This is what an agent is actually asked for
 * most of the time  -  "a card in a grid", "an icon-only button that explains itself", "a settings
 * row"  -  and it is published so composing does not start from a blank tree every time.
 *
 * TWO LEVELS, not one, because they solve different problems:
 *   - "component": ONE family, well-composed  -  every slot worth using is used, every option that
 *     matters is set. What "the idiomatic way to use Callout" looks like, not just "a Callout".
 *   - "molecule": a FEW families working together for one small piece of UI that is not a screen  - 
 *     a card in a grid, a toolbar of icon buttons, a table with its pager. The compositions that sit
 *     between "one component" and a whole screen.
 *
 * This is DATA: the compiler validates every snippet's tree against the contracts, so one naming a
 * signature that changed fails the build instead of teaching the wrong thing forever.
 */
export type SnippetLevel = "component" | "molecule";

export type Snippet = {
  /** Stable id. What an agent asks `get_examples` for and what the docs page would route on. */
  readonly id: string;
  readonly level: SnippetLevel;
  /** One line, in the user's language: what this is for. */
  readonly intent: string;
  /**
   * Why this shape and not another, in the same voice as an overlay's `useWhen`. The tree says what
   * it is; this says why it is worth copying.
   */
  readonly notes: readonly string[];
  readonly tree: UsageTree;
};
