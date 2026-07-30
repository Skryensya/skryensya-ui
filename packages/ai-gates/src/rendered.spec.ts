import { expect, test } from "@playwright/test";
import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import type { UsageTree } from "@skryensya/ai-compiler/usage-tree";
import { canonicalTrees } from "./trees.js";

/*
 * G5, and the claim the whole architecture rests on: a clean static result is not a rendered page.
 *
 * The empty frame is this repo's own bug. A tree with neither `src` nor children passed every
 * presence and enum check the old system had, and shipped a box with nothing in it. Two levels now
 * catch it, and that they are two is the point:
 *
 *   - the CONTRACT catches it, because `exactlyOneOf` can finally say "one source, not zero";
 *   - the RENDER catches it too, because a box with no content has no painted content — which is
 *     what would still be true of any constraint nobody thought to write.
 *
 * If only the first ever fired, the system would be trusting that every future bug is one somebody
 * predicted.
 */

/*
 * Before anything is rendered: does the tree even compose?
 *
 * This check was missing, and the recipes are what exposed it — the first recipe written put a
 * SidebarTrigger inside a SidebarHeader and the validator rejected it, while a canonical tree doing
 * exactly the same thing had been passing every gate for days. The gates were measuring symmetry,
 * accessibility and paint on trees nobody had asked the contract about.
 *
 * The contract was wrong there, not the tree — but that is the point: nothing was asking.
 */
test("every canonical tree is valid against its contract", () => {
  const problems = canonicalTrees.flatMap(({ name, tree }) =>
    validateUsageTree(tree)
      .problems.filter((problem) => problem.severity === "error")
      .map((problem) => `${name} · ${problem.path}: ${problem.message}`),
  );

  expect(problems, "a fixture the contract rejects proves nothing about the contract").toEqual([]);
});

/** Cases whose whole purpose is to render no box. Exempt from the paint check, never from G2/G4. */
const DRAWS_NOTHING = new Set(["loader/status-only"]);

test("every canonical tree paints something", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('body[data-ready="true"]');

  for (const { name } of canonicalTrees) {
    // A visually-hidden status has no box by design; measuring one would be measuring the wrong
    // component. G2 and G4 still hold it to the claim that matters — same name, same live region.
    if (DRAWS_NOTHING.has(name)) continue;

    for (const binding of ["vanilla", "react"] as const) {
      const box = await page
        .locator(`[data-case="${name}"] [data-binding="${binding}"] > *`)
        .first()
        .boundingBox();

      expect(box, `${name}/${binding} rendered nothing at all`).not.toBeNull();
      expect(box!.width, `${name}/${binding} has no width`).toBeGreaterThan(0);
      expect(box!.height, `${name}/${binding} has no height`).toBeGreaterThan(0);
    }
  }
});

test("the empty frame is caught by the contract, and would also be caught by the render", async ({
  page,
}) => {
  const empty: UsageTree = { contract: "image-frame", signature: "ImageFrame" };

  // Level one: the contract. This is the check that did not exist before.
  const result = validateUsageTree(empty);
  expect(result.valid).toBe(false);
  expect(result.problems.map((p) => p.rule)).toContain("missing-exactly-one");

  // Level two: the render. Emitted anyway, past the gate, to show what shipping it looked like —
  // a frame element with no content inside it.
  await page.goto("/");
  await page.waitForSelector('body[data-ready="true"]');

  const painted = await page.evaluate((markup: string) => {
    const host = document.createElement("div");
    host.innerHTML = markup;
    document.body.append(host);

    const frame = host.firstElementChild as HTMLElement;
    return { children: frame.childElementCount, text: (frame.textContent ?? "").trim() };
  }, emitMarkup(empty));

  expect(painted.children, "the empty frame really is empty").toBe(0);
  expect(painted.text).toBe("");
});

test("canonical states hold their visual baseline", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector('body[data-ready="true"]');

  // One baseline for the whole stage: every canonical state in one image, so a token or CSS change
  // that moves any of them shows up as one reviewable diff.
  await expect(page.locator("#stage")).toHaveScreenshot("canonical-states.png", {
    maxDiffPixelRatio: 0.01,
  });
});
