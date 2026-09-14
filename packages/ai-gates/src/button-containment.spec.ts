import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * A BUTTON STAYS INSIDE THE BOX IT WAS PUT IN, AND KEEPS ITS TOUCH TARGET WHILE DOING IT.
 *
 * Both halves are browser facts and neither is visible in the DOM: the markup of a button that
 * escapes its container is identical to one that does not, and the hit area is a pseudo-element
 * nothing can query. Same reason `button-pressed.spec.ts` and `button-disabled.spec.ts` live here.
 *
 * What it locks down, measured on the break harness: a translated sentence in a 320px column
 * rendered an 815px button with 495px of it outside the column, because `white-space: nowrap` had
 * no wrap opportunity in the string and nothing capped the control's width.
 *
 * The SECOND test is the one that matters most, and it is why the fix is `overflow: clip` with a
 * margin rather than the obvious `overflow: hidden`. `hidden` clips the `::after` that expands the
 * hit area out to `--size-touch-target`, so an `xs` button would still LOOK like it cleared WCAG
 * 2.2 SC 2.5.8 and silently stop doing it. Measured before the fix went in: a point 8px outside an
 * `xs` face stopped hitting the button under `hidden` and kept hitting it under `clip`. Anyone who
 * later "simplifies" the pair back to one property fails here instead of shipping it.
 */
const NARROW = 320;

/** No wrap opportunity anywhere in it, which is the case a nowrap label cannot survive on its own. */
const UNBREAKABLE = "Donaudampfschiffahrtselektrizitaetenhauptbetriebswerkbauamt";
const SENTENCES =
  "Save your changes now. This overwrites the previous draft, and the draft cannot be recovered afterwards.";

test("a long label never carries the button outside its container", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ narrow, labels }) => {
      const host = document.createElement("div");
      host.id = "containment-probe";
      host.style.cssText = `position:fixed;inset-block-start:0;inset-inline-start:0;inline-size:${narrow}px`;
      host.innerHTML = labels
        .map(
          (label, i) =>
            `<div data-i="${i}"><button class="sk-button sk-interactive" type="button">${label}</button></div>`,
        )
        .join("");
      document.body.append(host);

      const out = labels.map((label, i) => {
        const box = host.querySelector(`[data-i="${i}"]`)!.getBoundingClientRect();
        const button = host.querySelector(`[data-i="${i}"] button`)!.getBoundingClientRect();
        return {
          label: label.slice(0, 24),
          escapesEndBy: Math.round(button.right - box.right),
          escapesStartBy: Math.round(box.left - button.left),
          width: Math.round(button.width),
        };
      });
      host.remove();
      return out;
    },
    { narrow: NARROW, labels: [UNBREAKABLE, SENTENCES] },
  );

  for (const row of rows) {
    expect(row.escapesEndBy, `"${row.label}…" ran past the end of its container`).toBeLessThanOrEqual(0);
    expect(row.escapesStartBy, `"${row.label}…" ran past the start of its container`).toBeLessThanOrEqual(0);
    expect(row.width, `"${row.label}…" is wider than its container`).toBeLessThanOrEqual(NARROW);
  }
});

test("containing the paint does not clip the hit area off the smallest faces", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "hit-area-probe";
    // Room on every side, so nothing but the button's own clipping can decide the answer.
    host.style.cssText = "position:fixed;inset-block-start:200px;inset-inline-start:200px;padding:60px";
    host.innerHTML = (["xs", "sm"] as const)
      .map(
        (size) =>
          `<div data-size-cell="${size}" style="padding:30px"><button class="sk-button sk-interactive" type="button" data-size="${size}" data-icon-only aria-label="Settings"><svg class="sk-icon" data-icon="settings" aria-hidden="true"></svg></button></div>`,
      )
      .join("");
    document.body.append(host);

    const touchTarget = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--size-touch-target"));

    const out = (["xs", "sm"] as const).map((size) => {
      const button = host.querySelector(`[data-size-cell="${size}"] button`) as HTMLElement;
      const r = button.getBoundingClientRect();
      // The furthest out the ::after is supposed to reach on this face, minus a pixel of slack.
      const reach = Math.max(0, (touchTarget - r.width) / 2) - 1;
      const probe = (dx: number, dy: number) => document.elementFromPoint(r.left + r.width / 2 + dx, r.top + r.height / 2 + dy) === button;
      return {
        size,
        faceWidth: Math.round(r.width),
        reach: Math.round(reach),
        start: probe(-(r.width / 2 + reach), 0),
        end: probe(r.width / 2 + reach, 0),
        top: probe(0, -(r.height / 2 + reach)),
        bottom: probe(0, r.height / 2 + reach),
      };
    });
    host.remove();
    return { touchTarget, out };
  });

  expect(rows.touchTarget, "--size-touch-target did not resolve to a number").toBeGreaterThan(0);

  for (const row of rows.out) {
    expect(row.reach, `${row.size}: face is already at the touch minimum, nothing to expand`).toBeGreaterThan(0);
    for (const edge of ["start", "end", "top", "bottom"] as const) {
      expect(row[edge], `${row.size}: the hit area no longer reaches ${row.reach}px past the ${edge} edge`).toBe(true);
    }
  }
});
