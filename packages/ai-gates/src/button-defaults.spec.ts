import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * A DEFAULT IS THE VALUE AUTHORED MARKUP LEAVES OFF, and the stylesheet has to paint it anyway.
 *
 * The docs emit previews with `fillDefaults: false` so a reader copies only what they would really
 * write, and a hand-written button says `data-tone="danger"` with no `data-variant` at all. A rule
 * keyed on `[data-variant="solid"]` therefore matched nothing, and every toned solid button on the
 * page painted neutral grey while React (which always serializes both axes) painted it correctly.
 * The two bindings agreed on the DOM the whole time, so G2 could not see it: this is the gate that
 * can, because it asks what the pixel actually is when the attribute is absent.
 */
const OMITTED = [
  { tone: "accent", label: "accent with no data-variant" },
  { tone: "danger", label: "danger with no data-variant" },
] as const;

test("a toned button paints its fill even when the default variant is omitted", async ({ page }) => {
  await waitForStage(page);

  const measured = await page.evaluate((tones) => {
    const host = document.createElement("div");
    host.id = "btn-defaults";
    host.style.cssText = "position:fixed;inset:0 auto auto 0";
    host.innerHTML = [
      ...tones.map((t) => `<button class="sk-button sk-interactive" type="button" data-tone="${t.tone}">A</button>`),
      // The same cells written out in full, which is what React emits.
      ...tones.map((t) => `<button class="sk-button sk-interactive" type="button" data-variant="solid" data-tone="${t.tone}">A</button>`),
      // A neutral button with nothing at all: the base look, and the thing the toned ones must NOT match.
      '<button class="sk-button sk-interactive" type="button">A</button>',
    ].join("");
    document.body.append(host);
    const read = (n: Element) => getComputedStyle(n).backgroundColor;
    const nodes = [...host.querySelectorAll("button")];
    const out = {
      omitted: nodes.slice(0, tones.length).map(read),
      explicit: nodes.slice(tones.length, tones.length * 2).map(read),
      bare: read(nodes[nodes.length - 1]!),
    };
    host.remove();
    return out;
  }, OMITTED);

  // Omitting the default must paint identically to spelling it out: that IS what a default means.
  expect(measured.omitted).toEqual(measured.explicit);
  // And a toned fill must not be the untoned one, which is exactly how the bug looked.
  for (const [i, color] of measured.omitted.entries()) {
    expect(color, `${OMITTED[i]!.label} fell back to the neutral fill`).not.toBe(measured.bare);
  }
});
