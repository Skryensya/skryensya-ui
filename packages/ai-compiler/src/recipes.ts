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

      /*
       * And one rule that is a RECIPE's alone: a failing state has to offer a way forward.
       *
       * Nothing in a contract can ask for this — an Alert is perfectly valid with no actions, and
       * should be, because most alerts are not dead ends. It only becomes a defect at the scale of a
       * screen: an error state with no action is a page whose only exit is the Back button, and that
       * is the shape a generated UI falls into by default.
       */
      if (state === "error" && !offersAWayForward(tree)) {
        problems.push(
          `${recipe.id} · error · no ofrece ninguna acción: un estado de error sin salida es una pantalla ` +
            `de la que sólo se sale con el botón atrás.`,
        );
      }
    }
  }

  return problems;
}

/** Whether anything in this tree can be acted on: a button, a link, or a control. */
function offersAWayForward(node: unknown): boolean {
  if (!node || typeof node !== "object") return false;
  if (Array.isArray(node)) return node.some(offersAWayForward);

  const tree = node as Record<string, unknown>;
  if (typeof tree.signature === "string" && ACTIONABLE.has(tree.signature)) return true;
  return Object.values(tree).some(offersAWayForward);
}

/*
 * The SIGNATURES that give someone something to do — not the families.
 *
 * The first version keyed on the family and silently passed everything: `typography` holds both
 * `Link` and `Heading`, so every recipe with a title counted as offering a way out. A check that
 * cannot fail is not a check, which is why this list exists only after watching the first one not fire.
 */
const ACTIONABLE = new Set([
  "Button.action",
  "Button.navigation",
  "Link",
  "ListItemLink",
  "NavListLink",
  "FileUpload",
  "Pagination",
  "Tabs",
]);
