import { appShellRecipe } from "./app-shell.js";
import { browseRecipe } from "./browse.js";
import { checkoutRecipe } from "./checkout.js";
import { dataTableRecipe } from "./data-table.js";
import { destructiveConfirmRecipe } from "./destructive-confirm.js";
import { detailRecipe } from "./detail.js";
import { formRecipe } from "./form.js";
import { settingsRecipe } from "./settings.js";
import { uploadRecipe } from "./upload.js";
import type { Recipe } from "./recipe.js";

/*
 * Every recipe, in the order a reader meets them: the frame first, then what goes inside it.
 *
 * The compiler validates all four states of each against the contracts, so this list is not a
 * catalogue of good intentions: a recipe naming a signature that changed fails the build.
 */
/*
 * Reading order, not alphabetical: the frame first, then the screens that sit inside it, roughly in
 * the order a person meets them: find something, look at it, act on it, deal with the consequences.
 */
export const recipes: readonly Recipe[] = [
  appShellRecipe,
  browseRecipe,
  detailRecipe,
  formRecipe,
  checkoutRecipe,
  uploadRecipe,
  dataTableRecipe,
  settingsRecipe,
  destructiveConfirmRecipe,
];

export type { Recipe, RecipeState } from "./recipe.js";
