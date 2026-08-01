import { canonicalTrees } from "./trees.js";
import { expect, test } from "./fixtures.js";

/*
 * G4 — accessibility, on both bindings.
 *
 * G2 proves the two agree. It cannot prove they are RIGHT: two bindings can agree on the same broken
 * output. This runs axe over each rendered case so that "symmetric" and "correct" stay two claims,
 * not one.
 *
 * The contract's own a11y rules are checked statically by the validator, and it says out loud when a
 * rule is not decidable from a tree ("a page with a second nav needs each landmark named"). This is
 * where that kind of rule is actually settled — in a rendered page, by a tool that can see it.
 */

type AxeViolation = { id: string; impact?: string; nodes: { html: string }[] };

for (const { name } of canonicalTrees) {
  for (const binding of ["vanilla", "react"] as const) {
    test(`${name} — the ${binding} binding has no accessibility violations`, async ({ axePage: page }) => {
      const violations = await page.evaluate(
        async ([caseName, bindingName]) => {
          const target = document.querySelector(
            `[data-case="${caseName}"] [data-binding="${bindingName}"]`,
          );
          const axe = (window as unknown as { axe: { run: (el: Element, o: unknown) => Promise<{ violations: AxeViolation[] }> } }).axe;

          const result = await axe.run(target!, {
            // Colour contrast belongs to the visual gate and to the brand, not to a structural one:
            // failing it here would report a token decision as a markup defect.
            rules: { "color-contrast": { enabled: false } },
          });

          return result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            html: violation.nodes.map((node) => node.html),
          }));
        },
        [name, binding] as const,
      );

      expect(violations).toEqual([]);
    });
  }
}
