import { expect, test, type Page } from "@playwright/test";
import { readComponentCss } from "./fixtures.js";

/*
 * WHO IS IN FRONT IN A STACK OF FOLDERS, and the one rule that is allowed to change it.
 *
 * Paint order in a `.sk-folder-stack` is source order, deliberately: in a drawer the folder you are
 * touching still sits behind the ones in front of it, and lifting it out of the pile breaks the one
 * illusion the component is built on. Exactly one rule overrides that, for WCAG 2.2 SC 2.4.11
 * (Focus Not Obscured): a folder reached by KEYBOARD is raised, because `overlap` is author-settable
 * and at a large enough value the focused folder would otherwise be entirely covered.
 *
 * That rule was written with `:focus-within`, which does not draw the distinction it needs. A folder
 * in this stack is focusable (`Folder.link` is an anchor), so pressing one with the mouse focused it
 * and the folder being held jumped in front of the folders stacked over it until the button came
 * back up. This gate is the difference between the two, and it is here rather than in a unit test
 * because only a browser decides what `:focus-visible` matches.
 *
 * SELF-CONTAINED, in the shape `slider-fill.spec.ts` uses: the component's real stylesheet over a
 * hand-written page. Nothing here needs the shared stage, and the anatomy under test is three
 * siblings and their computed `z-index`.
 */

const folderCss = readComponentCss("folder", import.meta.url);

const fixtureHtml = `<!doctype html><html><head><style>
  ${folderCss}
  html, body { margin: 0; background: #ffffff; }
  /* The stack's own overlap, stated rather than measured: the binding writes \`--sk-folder-tail\`
     from a real layout, and what this gate reads is stacking, not geometry. */
  .sk-folder { --sk-folder-tail: 120px; min-block-size: 240px; }
  a.sk-folder { display: block; color: inherit; text-decoration: none; }
</style></head><body>
  <div class="sk-folder-stack">
    <a class="sk-folder" href="#one" data-sk-folder><div class="sk-folder__tab">One</div></a>
    <a class="sk-folder" href="#two" data-sk-folder><div class="sk-folder__tab">Two</div></a>
    <a class="sk-folder" href="#three" data-sk-folder><div class="sk-folder__tab">Three</div></a>
  </div>
</body></html>`;

const stacking = (page: Page) =>
  page.$$eval(".sk-folder-stack > .sk-folder", (folders) =>
    folders.map((folder) => getComputedStyle(folder).zIndex),
  );

test("a folder held under the pointer stays where it is in the pile", async ({ page }) => {
  await page.setContent(fixtureHtml);

  const first = page.locator(".sk-folder-stack > .sk-folder").first();
  const box = (await first.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 20);
  await page.mouse.down();

  /* The press DOES focus it - that is what made the old rule fire - so this asserts the state the
     folder is actually in, not that the press was somehow ignored. */
  expect(await first.evaluate((folder) => folder.matches(":focus-within"))).toBe(true);
  expect(await stacking(page), "a held folder must not climb over the ones in front of it").toEqual([
    "auto",
    "auto",
    "auto",
  ]);

  await page.mouse.up();
  expect(await stacking(page)).toEqual(["auto", "auto", "auto"]);
});

test("a folder reached by keyboard is raised, so focus is never entirely covered", async ({ page }) => {
  await page.setContent(fixtureHtml);

  // Two tabs in: the SECOND folder, which is the one a stack can bury - the last is on top anyway.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");

  expect(await page.evaluate(() => document.activeElement?.getAttribute("href"))).toBe("#two");
  expect(await stacking(page), "WCAG 2.2 SC 2.4.11: the focused folder comes forward").toEqual([
    "auto",
    "1",
    "auto",
  ]);
});
