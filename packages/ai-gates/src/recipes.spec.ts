import { recipes } from "@skryensya/recipes";
import { expect, test } from "./fixtures.js";

/*
 * The one thing a recipe claims that no single tree can: that its four states are FOUR STATES.
 *
 * Every other gate asks whether a composition is right. This one asks whether the set is coherent —
 * because the whole reason a recipe carries `loading`, `empty`, `error` and `success` is that they
 * are different screens, and the failure mode is not that one of them is malformed. It is that two
 * of them are the same screen with a different string in it, which every static check calls fine and
 * which tells a reader nothing.
 *
 * Compared as ACCESSIBILITY TREES rather than pixels, deliberately. Two states that differ only in
 * colour are not two states: a spinner and an empty page are indistinguishable to anyone who cannot
 * see the spinner, and that is exactly the reader this catches.
 */

for (const recipe of recipes) {
  test(`${recipe.id} — its four states are four different screens`, async ({ stagePage: page }) => {
    const snapshots = new Map<string, string>();

    for (const state of Object.keys(recipe.states)) {
      snapshots.set(
        state,
        await page.locator(`[data-case="recipe/${recipe.id}/${state}"] [data-binding="vanilla"]`).ariaSnapshot(),
      );
    }

    // Every pair, not just neighbours: `loading` reading like `success` is as wrong as it reading
    // like `empty`, and there are only six pairs.
    const identical: string[] = [];
    const states = [...snapshots.keys()];
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        if (snapshots.get(states[i]!) === snapshots.get(states[j]!)) {
          identical.push(`${states[i]} y ${states[j]}`);
        }
      }
    }

    expect(
      identical,
      `${recipe.id}: dos estados se anuncian igual, así que uno de los dos no existe`,
    ).toEqual([]);
  });
}
