import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { validateUsageTree } from "./validate.js";
import type { UsageTree } from "./usage-tree.js";

/*
 * Recipes, checked against the catalogue that has to keep them true.
 *
 * A recipe is a whole screen an agent is invited to copy, which makes a stale one worse than no
 * recipe at all: it teaches a composition the contracts no longer accept, with the authority of
 * having been published. So every state of every recipe goes through the same validator a tree from
 * `validate_ui` does, and a failure stops the build rather than printing a warning nobody reads.
 */

type LoadedRecipe = {
  readonly id: string;
  readonly states: Readonly<Record<string, UsageTree>>;
};

/**
 * Every problem across every recipe, as lines ready to print. Empty means all of them still compose.
 *
 * Returns `[]` when there is no recipe directory: recipes are a phase of the plan, not a
 * precondition for emitting a catalogue.
 */
export async function checkRecipes(root: string): Promise<readonly string[]> {
  const entry = join(root, "contracts", "recipes", "index.ts");
  if (!existsSync(entry)) return [];

  const loaded = await loadRecipes(entry);
  if (typeof loaded === "string") return [loaded];

  const problems: string[] = [];

  for (const recipe of loaded) {
    for (const [state, tree] of Object.entries(recipe.states)) {
      const result = validateUsageTree(tree);
      for (const problem of result.problems) {
        // Advisories are the contract's own accessibility hints; a recipe is published, so they are
        // reported too — but only an error stops the build, exactly as for any other tree.
        const mark = problem.severity === "error" ? "" : " (advisory)";
        problems.push(`${recipe.id} · ${state} · ${problem.path}: ${problem.message}${mark}`);
      }
      if (!result.valid) continue;
    }
  }

  return problems.filter((line) => !line.endsWith("(advisory)"));
}

/*
 * A dynamic import, so the compiler takes no build-time dependency on the recipe directory: the
 * catalogue has to compile in a checkout that has none, and `checkRecipes` already returns early
 * when it is missing.
 */
async function loadRecipes(entry: string): Promise<readonly LoadedRecipe[] | string> {
  try {
    const module = (await import(pathToFileURL(entry).href)) as { recipes?: readonly LoadedRecipe[] };
    if (!module.recipes) return `${entry} exports no "recipes".`;
    return module.recipes;
  } catch (error) {
    return `${entry} could not be loaded: ${(error as Error).message}`;
  }
}
