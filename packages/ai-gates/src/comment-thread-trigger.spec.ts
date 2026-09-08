import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * THE COMPOSER TRIGGER IS ALWAYS IN THE MARKUP, and CSS decides whether it shows.
 *
 * React used to render it only when a JS measurement said "sheet", which made the two bindings
 * produce a different DOM at the same width; authored markup has always emitted it unconditionally.
 * The objection to always rendering it was that a control with nothing to do is one a keyboard has
 * to tab through, and that is not true of the mechanism in use: `display: none` removes an element
 * from the tab order AND from the accessibility tree. This measures it rather than asserting it,
 * because jsdom applies no stylesheet and the React unit test cannot answer the question at all.
 */
test("above the breakpoint the composer trigger is present, hidden, and unreachable", async ({ page }) => {
  await waitForStage(page);
  // The stage is desktop-width, which is the side of the 52rem breakpoint where it must not show.
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const binding of ["vanilla", "react"] as const) {
    const trigger = page
      .locator(`[data-case="comment-thread/thread"] [data-binding="${binding}"] .sk-comment-thread__composer-trigger`)
      .first();

    await expect(trigger, `${binding}: the trigger should exist in the DOM`).toHaveCount(1);
    expect(
      await trigger.evaluate((n) => getComputedStyle(n).display),
      `${binding}: the trigger should be hidden above the breakpoint`,
    ).toBe("none");
    // `display: none` is what makes it unreachable; this is the claim the unit test used to deny.
    expect(await trigger.isVisible(), `${binding}: a hidden trigger must not be visible`).toBe(false);
  }
});
