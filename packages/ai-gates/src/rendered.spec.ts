import { validateUsageTree } from "@skryensya/ai-compiler/validate";
import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { contracts } from "@skryensya/core/registry";
import {
  collectionItems,
  isUsageTree,
  slotItems,
  slotsOf,
  type SlotContent,
  type UsageTree,
} from "@skryensya/core/usage-tree";
import { canonicalTrees } from "./trees.js";
/*
 * `test` comes from the fixtures, not from `@playwright/test`, for the worker-scoped `stagePage`
 * the paint check reads: it is a pure reader, and the two tests below it that DO mutate the page
 * still take Playwright's own per-test `page` off the same extended `test`.
 */
import { expect, test, waitForStage } from "./fixtures.js";

/*
 * G5, and the claim the whole architecture rests on: a clean static result is not a rendered page.
 *
 * The empty frame is this repo's own bug. A tree with neither `src` nor children passed every
 * presence and enum check the old system had, and shipped a box with nothing in it. Two levels now
 * catch it, and that they are two is the point:
 *
 *   - the CONTRACT catches it, because `exactlyOneOf` can finally say "one source, not zero";
 *   - the RENDER catches it too, because a box with no content has no painted content, which is
 *     what would still be true of any constraint nobody thought to write.
 *
 * If only the first ever fired, the system would be trusting that every future bug is one somebody
 * predicted.
 */

/**
 * Cases whose whole purpose is to render no box. Exempt from the paint check, never from G2/G4.
 *
 * `content/toast-template` joins for a different reason than `loader/status-only`: a `<template>`'s
 * content is inert by the HTML spec, never part of the rendered tree at all, in EITHER binding.
 */
const DRAWS_NOTHING = new Set([
  "loader/status-only",
  "content/toast-template",
  /* Same reason as the toast template beside it: a `<template>`'s content is inert by the HTML
   * spec and never part of the rendered tree, in either binding. */
  "comment-thread/template",
]);

test("every canonical tree paints something", async ({ stagePage: page }) => {
  // A visually-hidden status has no box by design; measuring one would be measuring the wrong
  // component. G2 and G4 still hold it to the claim that matters: same name, same live region.
  const names = canonicalTrees.map(({ name }) => name).filter((name) => !DRAWS_NOTHING.has(name));

  /*
   * ONE round trip for the whole stage, not two per case.
   *
   * This used to walk the cases with a `boundingBox()` locator call each, which is a locator
   * round trip per binding per case: 344 of them on a stage that has grown to 175 cases. It spent
   * the test's whole 30s budget on that traffic and then failed as a locator timeout on whichever
   * case the clock happened to reach (`typography/strong`, which paints perfectly well), naming an
   * innocent component and hiding the fact that nothing was actually wrong with the render.
   *
   * Measuring in the page is one evaluate, and it reports EVERY case that draws nothing rather
   * than only the first, which is the shape of claim this gate makes anyway.
   */
  const problems = await page.evaluate((cases) => {
    const found: string[] = [];

    for (const name of cases) {
      for (const binding of ["vanilla", "react"]) {
        const host = document.querySelector(`[data-case="${name}"] [data-binding="${binding}"]`);
        /*
         * The first child that is not a FLOATING region. React portals its positioner into this same
         * container, so for a menu or a select it lands ahead of the component itself, and a closed
         * positioner is 0×0 by design, which made "paints something" measure the one element built
         * not to. Vanilla nests the positioner instead, so it never hit this.
         */
        const painted = host
          ? [...host.children].find((child) => !child.classList.contains("sk-anchored"))
          : undefined;

        if (!painted) {
          found.push(`${name}/${binding} rendered nothing at all`);
          continue;
        }

        const box = painted.getBoundingClientRect();
        if (box.width === 0) found.push(`${name}/${binding} has no width`);
        if (box.height === 0) found.push(`${name}/${binding} has no height`);
      }
    }

    return found;
  }, names);

  expect(problems, "a canonical tree that renders no box is a tree the static gates cannot see").toEqual([]);
});

test("the empty frame is caught by the contract, and would also be caught by the render", async ({
  page,
}) => {
  const empty: UsageTree = { contract: "image-frame", signature: "ImageFrame" };

  // Level one: the contract. This is the check that did not exist before.
  const result = validateUsageTree(empty);
  expect(result.valid).toBe(false);
  expect(result.problems.map((p) => p.rule)).toContain("missing-exactly-one");

  // Level two: the render. Emitted anyway, past the gate, to show what shipping it looked like:
  // a frame element with no content inside it.
  await waitForStage(page);

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
  await waitForStage(page);

  // One baseline for the whole stage: every canonical state in one image, so a token or CSS change
  // that moves any of them shows up as one reviewable diff.
  await expect(page.locator("#stage")).toHaveScreenshot("canonical-states.png", {
    maxDiffPixelRatio: 0.01,
    /*
     * A REAL BUDGET, because the default 5s is not one for this image. The stage is 76,000px tall
     * and Chromium captures anything past the viewport by scrolling and stitching: 1.9s measured,
     * and the assertion takes the shot at least twice (it re-shoots until two agree before it
     * compares), so the default leaves nothing over for a machine with anything else running. This
     * gate used to fail inside "attempting scroll into view action", which reads like a broken page
     * and was only ever the stopwatch.
     */
    timeout: 60_000,
  });
});
