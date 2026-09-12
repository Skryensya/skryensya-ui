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

/*
 * Before anything is rendered: does the tree even compose?
 *
 * This check was missing, and the recipes are what exposed it: the first recipe written put a
 * SidebarTrigger inside a SidebarHeader and the validator rejected it, while a canonical tree doing
 * exactly the same thing had been passing every gate for days. The gates were measuring symmetry,
 * accessibility and paint on trees nobody had asked the contract about.
 *
 * The contract was wrong there, not the tree, but that is the point: nothing was asking.
 */
test("every canonical tree is valid against its contract", () => {
  const problems = canonicalTrees.flatMap(({ name, tree }) =>
    validateUsageTree(tree)
      .problems.filter((problem) => problem.severity === "error")
      .map((problem) => `${name} · ${problem.path}: ${problem.message}`),
  );

  expect(problems, "a fixture the contract rejects proves nothing about the contract").toEqual([]);
});

/**
 * Every `contract.signature` a tree touches, root or nested. A `Menu` whose "Exportar" item opens
 * a submenu references `menu.Menu` twice, once for itself and once for the nested one, and both
 * count. Walks the same `slotItems`/`collectionItems` shape every emitter already walks, so a
 * signature only reachable through a collection entry (a select item, a tree-view node) is not
 * missed just because it never gets its own top-level `Canonical`.
 */
function walkSignatures(content: SlotContent | undefined, into: Set<string>): void {
  for (const item of slotItems(content)) {
    if (!isUsageTree(item)) continue;
    into.add(`${item.contract}.${item.signature}`);
    for (const nested of Object.values(slotsOf(item))) walkSignatures(nested, into);
  }
  for (const entry of collectionItems(content)) {
    for (const nested of Object.values(entry.slots)) walkSignatures(nested, into);
  }
}

/**
 * The list this list and the published catalogue are supposed to grow together (this file's own
 * header, above `signatureTrees`). That was a comment, never a check: select, menu, table-pager and
 * tooltip were each published and went uncompared by G2 for a while, and nothing failed until
 * someone opened the page and looked. This is the check. Every signature the registry publishes
 * has to be reachable from at least one canonical tree, root or nested, or the build fails naming
 * it, instead of a family quietly shipping with nobody watching.
 */
test("every published signature is reachable from a canonical tree", () => {
  const touched = new Set<string>();
  for (const { tree } of canonicalTrees) walkSignatures(tree, touched);

  const missing = Object.entries(contracts).flatMap(([contractId, contract]) =>
    Object.keys(contract.signatures)
      .map((signatureId) => `${contractId}.${signatureId}`)
      .filter((key) => !touched.has(key)),
  );

  expect(missing, "a signature no canonical tree reaches is one G2 has never compared").toEqual([]);
});

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
