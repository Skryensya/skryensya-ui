import { canonicalTrees } from "./trees.js";
import { expect, test } from "./fixtures.js";

/*
 * G4: accessibility, on both bindings.
 *
 * G2 proves the two agree. It cannot prove they are RIGHT: two bindings can agree on the same broken
 * output. This runs axe over each rendered case so that "symmetric" and "correct" stay two claims,
 * not one.
 *
 * The contract's own a11y rules are checked statically by the validator, and it says out loud when a
 * rule is not decidable from a tree ("a page with a second nav needs each landmark named"). This is
 * where that kind of rule is actually settled: in a rendered page, by a tool that can see it.
 */

type AxeViolation = { id: string; impact?: string; nodes: { html: string }[] };

/*
 * Rules that fire from the STAGE, not from the case: `harness/index.html` wraps every canonical
 * tree in `<main id="stage">`, so that element is already the page's one top-level main landmark
 * before any case renders. `layout/main` is the one case whose OWN root is `<main>` (`layout.Main`'s
 * signature: `{ element: "main", host: true }`). Nested inside the stage's own main, and doubled
 * again by sharing the page with the OTHER binding's copy of the same case. Both violations describe
 * that nesting, not a defect in `Main`: a real app never renders it inside another `<main>`, and this
 * shared stage is the one page that does. Scoped to exactly this case, the same way
 * `SHAPE_NOT_COMPARABLE` in `rendered.spec.ts` scopes its own harness-only exemption.
 */
const AXE_STAGE_ARTIFACT: Readonly<Record<string, readonly string[]>> = {
  "layout/main": ["landmark-main-is-top-level", "landmark-no-duplicate-main"],
};

for (const { name } of canonicalTrees) {
  for (const binding of ["vanilla", "react"] as const) {
    test(`${name}: the ${binding} binding has no accessibility violations`, async ({ axePage: page }) => {
      const violations = await page.evaluate(
        async ([caseName, bindingName, disabledRuleIds]) => {
          const target = document.querySelector(
            `[data-case="${caseName}"] [data-binding="${bindingName}"]`,
          );
          const axe = (window as unknown as { axe: { run: (el: Element, o: unknown) => Promise<{ violations: AxeViolation[] }> } }).axe;

          const result = await axe.run(target!, {
            rules: {
              // Colour contrast belongs to the visual gate and to the brand, not to a structural
              // one: failing it here would report a token decision as a markup defect.
              "color-contrast": { enabled: false },
              ...Object.fromEntries(disabledRuleIds.map((id) => [id, { enabled: false }])),
            },
          });

          return result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            html: violation.nodes.map((node) => node.html),
          }));
        },
        [name, binding, AXE_STAGE_ARTIFACT[name] ?? []] as const,
      );

      expect(violations).toEqual([]);
    });
  }
}
