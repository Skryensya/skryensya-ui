import { recipes } from "@skryensya/recipes";
import { validateUsageTree } from "./validate.js";

/*
 * Recipes, checked against the catalogue that has to keep them true.
 *
 * A recipe is a whole screen an agent is invited to copy, which makes a stale one worse than no
 * recipe at all: it teaches a composition the contracts no longer accept, with the authority of
 * having been published. So every state of every recipe goes through the same validator a tree from
 * `validate_ui` does, and a failure stops the build rather than printing a warning nobody reads.
 */

/** Every problem across every recipe, as lines ready to print. Empty means all of them compose. */
export function checkRecipes(): readonly string[] {
  const problems: string[] = [];

  for (const recipe of recipes) {
    for (const [state, tree] of Object.entries(recipe.states)) {
      for (const problem of validateUsageTree(tree).problems) {
        // Only errors stop the build. Advisories are the contract's own accessibility hints, and a
        // recipe is held to the same bar as any other tree, not a stricter one.
        if (problem.severity !== "error") continue;
        problems.push(`${recipe.id} · ${state} · ${problem.path}: ${problem.message}`);
      }
    }
  }

  return problems;
}
