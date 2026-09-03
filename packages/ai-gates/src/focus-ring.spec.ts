import { expect, test } from "@playwright/test";
import { readComponentCss, waitForStage } from "./fixtures.js";

/*
 * G5: the KEYBOARD's position is visible, and the mouse's is not mistaken for it.
 *
 * Every other gate here reads a static stage. This one cannot: the thing under test only exists
 * while a menu is open and something is highlighted, and getting there means clicking, hovering and
 * pressing keys. So it drives Playwright's own per-test `page` rather than the shared worker
 * fixture, the same exception `rendered.spec.ts` already takes for its two mutating checks.
 *
 * WHY A GATE AND NOT A UNIT TEST. The claim is "an outline is painted", and both binding test suites
 * run in jsdom, which has no cascade and no computed `outline-style` to read: the rule this covers
 * was shipped broken (`:focus-visible` on an element that never receives focus, so it matched
 * nothing, ever) and no jsdom test could have caught it. It needs a real engine, which is what this
 * package is.
 *
 * WHAT IT PINS, four cases, because the interesting ones are the pair that must DISAGREE:
 *
 *   keyboard highlight            → ring        the reader's only position signal; focus is virtual
 *                                               (`aria-activedescendant`), so nothing else says it
 *   pointer highlight             → no ring     a focus ring under the cursor reads as broken focus
 *   pointer walked into a submenu → no ring     the parent trigger KEEPS its highlight here (Zag's
 *                                               `ITEM_POINTERLEAVE` is guarded `not(isTriggerItem)`),
 *                                               so it stops being `:hover` while still highlighted -
 *                                               the shape that most looks like keyboard and is not
 *   keyboard into a submenu       → ring, inner  on the row the arrows reached, not on the trigger
 *
 * THE FIRST THREE run against the real shared canonical stage, both bindings, real clicks/hovers/keys
 *. The same interaction a reader has. The FOURTH (pointer walked into a submenu) runs against a
 * bare fixture with `menu.css` alone instead: the shared stage renders ninety canonical trees on one
 * very tall page, and this specific case's on-screen box was found, by `elementFromPoint`, to
 * coincide with an unrelated `nav-list` case's link. A pre-existing layout defect in the stage
 * (`harness/stage.css`'s per-binding `position: relative` gives an open `<dialog>` a containing
 * block, but does nothing for `Menu`'s own `position: fixed` panel), not anything the CSS fix here
 * touches. A real OS pointer aimed at that box hits the wrong element (confirmed: Zag's machine
 * never left `closed`), so no genuine `:hover` can be produced there at all. Testing it means
 * testing the CSS RULE directly, which is the actual claim, and is one file for both bindings anyway
 * (confirmed identical class/attribute output by G2's own symmetry gate). Fixing the stage's own
 * layout is out of scope for a focus-ring fix; flagged here rather than worked around silently.
 */

const CASE = "menu/with-submenu";
const BINDINGS = ["vanilla", "react"] as const;

/** Every highlighted row, with the two facts this gate is about. */
const readHighlighted = (binding: string) => `
  [...document.querySelectorAll('[data-case="${CASE}"] [data-binding="${binding}"] .sk-menu__item[data-highlighted]')]
    .map((el) => ({
      label: el.textContent.trim().replace(/\\s+/g, " "),
      ring: getComputedStyle(el).outlineStyle,
    }))
`;

for (const binding of BINDINGS) {
  const scopeSelector = `[data-case="${CASE}"] [data-binding="${binding}"]`;
  const highlighted = () => `(${readHighlighted(binding)})`;

  test.describe(`${CASE}: the ${binding} binding's focus ring`, () => {
    test.beforeEach(async ({ page }) => {
      await waitForStage(page);
    });

    /*
     * The trigger, by its accessible NAME rather than `[data-sk-menu-trigger]`: that attribute is
     * Vanilla's own mount hook (`menu.ts`'s `mount: menuAttrs.trigger`), which the contract never
     * asks React to carry, and React's own binding does not (checked. Zero occurrences in
     * `menu.tsx`). "Acciones" is the tree's own `slots.trigger` text, so the same locator finds the
     * trigger in both DOMs, the way a reader would: by what it says, not by an implementation hook.
     */
    const trigger = (page: import("@playwright/test").Page) =>
      page.locator(scopeSelector).getByRole("button", { name: "Acciones" });
    const scope = (page: import("@playwright/test").Page) => page.locator(scopeSelector);

    test("a keyboard highlight is ringed", async ({ page }) => {
      await trigger(page).focus();
      await page.keyboard.press("Enter");
      await expect
        .poll(() => page.evaluate(highlighted()))
        .toEqual([{ label: "Renombrar", ring: "solid" }]);

      await page.keyboard.press("ArrowDown");
      await expect
        .poll(() => page.evaluate(highlighted()))
        .toEqual([{ label: "Favorito", ring: "solid" }]);
    });

    test("a pointer highlight is not", async ({ page }) => {
      await trigger(page).click();
      await scope(page).locator(".sk-menu__item").first().hover();
      await expect
        .poll(() => page.evaluate(highlighted()))
        .toEqual([{ label: "Renombrar", ring: "none" }]);
    });

    /* And the mirror: arrowing in rings the row the arrows reached, never the trigger behind it -
     * the ring MOVED, it was not duplicated down the path. */
    test("arrowing into a submenu rings the row the arrows reached", async ({ page }) => {
      await trigger(page).focus();
      await page.keyboard.press("Enter");
      for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowDown");
      await page.keyboard.press("ArrowRight");

      await expect
        .poll(() => page.evaluate(highlighted()))
        .toEqual([
          { label: "Exportar", ring: "none" },
          { label: "PDF", ring: "solid" },
        ]);
    });
  });
}

/*
 * The fourth case, isolated from the stage's own layout defect (see the file comment). Real
 * `menu.css`, a bare page, two rows shaped exactly like Zag leaves them mid-hover: the parent trigger
 *. Highlighted, expanded, no longer `:hover` (the pointer left it for the panel), and the child row
 * the pointer is actually over. Highlighted AND `:hover`. Neither may show a ring: the whole
 * interaction was a mouse, at both rows.
 */
test.describe(`${CASE}: the focus-ring RULE itself, pointer walked into a submenu`, () => {
  const menuCss = readComponentCss("menu", import.meta.url);

  test("rings neither the parent trigger nor the hovered child", async ({ page }) => {
    await page.setContent(`
      <style>
        :root { --focus-ring-width: 2px; --focus-ring-color: #1a5fff; }
      </style>
      <style>${menuCss}</style>
      <div class="sk-menu">
        <button
          class="sk-menu__item"
          type="button"
          data-highlighted
          aria-expanded="true"
          style="display:block; inline-size:8rem; block-size:2rem;"
        >Exportar</button>
        <div
          class="sk-menu__item"
          data-highlighted
          style="display:block; inline-size:8rem; block-size:2rem;"
        >PDF</div>
      </div>
    `);

    const parentTrigger = page.getByRole("button", { name: "Exportar" });
    const child = page.getByText("PDF");
    await child.hover();

    await expect(parentTrigger).toHaveCSS("outline-style", "none");
    await expect(child).toHaveCSS("outline-style", "none");
  });
});
