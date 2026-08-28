import { snippets } from "@skryensya/snippets";
import { validateUsageTree } from "./validate.js";

/*
 * Snippets, checked against the catalogue that has to keep them true  -  same reasoning as
 * `recipes.ts`'s own `checkRecipes`, one scope down: a snippet is a tree an agent is invited to
 * copy, so a stale one is worse than none at all. No loading/error-specific rules here, unlike
 * recipes: those exist because a RECIPE claims to be a whole screen's states, and a snippet claims
 * no such thing  -  it is one correct instance of a component or a small molecule, not a life cycle.
 */

/** Every problem across every snippet, as lines ready to print. Empty means all of them compose. */
export function checkSnippets(): readonly string[] {
  const problems: string[] = [];

  for (const snippet of snippets) {
    for (const problem of validateUsageTree(snippet.tree).problems) {
      // Only errors stop the build  -  an advisory is the contract's own accessibility hint, and a
      // snippet is held to the same bar as any other tree, not a stricter one.
      if (problem.severity !== "error") continue;
      problems.push(`${snippet.id} · ${problem.path}: ${problem.message}`);
    }
  }

  return problems;
}
