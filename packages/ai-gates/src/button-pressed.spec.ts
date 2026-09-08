import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * A TOGGLE THAT IS ON HAS TO LOOK ON, INCLUDING WHILE YOU POINT AT IT.
 *
 * The obvious way to paint `aria-pressed` is the shared state layer's selected rung, and it is
 * wrong: hover reassigns the same `--state-layer-opacity`, so the pressed tint is REPLACED exactly
 * while the pointer sits on the control. Button paints its own hooks instead and lets the layer
 * ride on top. This gate is the difference between those two implementations, which no DOM or
 * accessibility-tree comparison can see: both produce identical markup.
 *
 * Two consumers had hand-rolled this before the contract could say it (editor's toolbar,
 * comment-thread's votes), which is what made it a gap rather than a preference.
 */
const CELLS = [
  { variant: "ghost", tone: "neutral" },
  { variant: "ghost", tone: "accent" },
  { variant: "ghost", tone: "danger" },
  { variant: "soft", tone: "neutral" },
  { variant: "solid", tone: "accent" },
  { variant: "solid", tone: "danger" },
  { variant: "translucent", tone: "neutral" },
] as const;

test("a pressed button differs from an unpressed one, in every emphasis and tone", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate((cells) => {
    const host = document.createElement("div");
    host.id = "pressed-probe";
    host.style.cssText = "position:fixed;inset:0 auto auto 0";
    host.innerHTML = cells
      .map(
        (c) =>
          `<span data-cell="${c.variant}-${c.tone}">
             <button class="sk-button sk-interactive" type="button" data-variant="${c.variant}" data-tone="${c.tone}">B</button>
             <button class="sk-button sk-interactive" type="button" data-variant="${c.variant}" data-tone="${c.tone}" aria-pressed="true">B</button>
           </span>`,
      )
      .join("");
    document.body.append(host);
    const out = cells.map((c) => {
      const [off, on] = [...host.querySelectorAll(`[data-cell="${c.variant}-${c.tone}"] button`)];
      return {
        cell: `${c.variant}/${c.tone}`,
        off: getComputedStyle(off!).backgroundColor,
        on: getComputedStyle(on!).backgroundColor,
      };
    });
    host.remove();
    return out;
  }, CELLS);

  for (const row of rows) {
    expect(row.on, `${row.cell}: pressed paints the same as unpressed`).not.toBe(row.off);
  }
});

test("the pressed cue survives hover instead of being replaced by it", async ({ page }) => {
  await waitForStage(page);

  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "hover-probe";
    host.style.cssText = "position:fixed;inset-block-start:0;inset-inline-start:0;padding:40px";
    host.innerHTML =
      '<button class="sk-button sk-interactive" type="button" data-variant="ghost" aria-pressed="true">B</button>' +
      '<button class="sk-button sk-interactive" type="button" data-variant="ghost">B</button>';
    document.body.append(host);
  });

  const pressed = page.locator("#hover-probe button[aria-pressed='true']");
  const plain = page.locator("#hover-probe button:not([aria-pressed])");
  const resting = await pressed.evaluate((n) => getComputedStyle(n).backgroundColor);
  await pressed.hover();
  await page.waitForTimeout(400);
  const hovered = await pressed.evaluate((n) => getComputedStyle(n).backgroundColor);
  const plainBg = await plain.evaluate((n) => getComputedStyle(n).backgroundColor);

  // The fill is the cue, and hover must not take it away: this is what the state-layer rung did.
  expect(hovered, "hovering a pressed toggle erased its pressed fill").toBe(resting);
  expect(hovered, "a hovered pressed toggle became indistinguishable from an unpressed one").not.toBe(plainBg);

  await page.evaluate(() => document.querySelector("#hover-probe")?.remove());
});
