import { appShellRecipe } from "./app-shell.js";
import { dataTableRecipe } from "./data-table.js";
import { destructiveConfirmRecipe } from "./destructive-confirm.js";
import { formRecipe } from "./form.js";
import { settingsRecipe } from "./settings.js";
import type { Recipe } from "./recipe.js";

/*
 * Every recipe, in the order a reader meets them: the frame first, then what goes inside it.
 *
 * The compiler validates all four states of each against the contracts, so this list is not a
 * catalogue of good intentions — a recipe naming a signature that changed fails the build.
 */
export const recipes: readonly Recipe[] = [
  appShellRecipe,
  formRecipe,
  dataTableRecipe,
  settingsRecipe,
  destructiveConfirmRecipe,
];

export type { Recipe, RecipeState } from "./recipe.js";
