import { expect, test } from "./fixtures.js";

/*
 * `Loader.status` is the one signature whose correctness is that it draws NOTHING while still being
 * announced. G5 cannot judge it — there is no box — and G2 only proves the two bindings agree, which
 * they would even if the class did nothing. So the claim gets its own check.
 *
 * It is not a test of CSS for its own sake: a visually-hidden recipe that stops hiding is invisible
 * in review (the text just appears, and it reads like a label someone meant to add) and invisible in
 * every other gate. This is the only place that would notice.
 */
for (const binding of ["vanilla", "react"] as const) {
  test(`the ${binding} visually-hidden status is announced and not drawn`, async ({ stagePage: page }) => {
    const status = page.locator(
      `[data-case="loader/status-only"] [data-binding="${binding}"] .sk-visually-hidden`,
    );

    const box = await status.boundingBox();
    expect(box, "the status must exist in layout, clipped rather than removed").not.toBeNull();
    expect(box!.width, "a visually-hidden status must take no visible width").toBeLessThanOrEqual(1);
    expect(box!.height, "a visually-hidden status must take no visible height").toBeLessThanOrEqual(1);

    // And still be a live region with a name — `display: none` would pass the box check and fail here.
    await expect(status).toHaveAttribute("role", "status");
    await expect(status).toHaveAttribute("aria-label", "Cargando el catálogo");
  });
}
