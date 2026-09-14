import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * UNAVAILABLE OUTRANKS EVERY APPEARANCE AXIS, and only a browser can say whether it does.
 *
 * `disabled` and the tone rules both write `--sk-button-bg`, so which one a button actually paints
 * is decided by the cascade, not by the markup: every cell below produces identical DOM whether the
 * rule ordering is right or wrong, so no snapshot, unit test or accessibility-tree comparison can
 * see this. It is the same reason `button-pressed.spec.ts` exists.
 *
 * The bug this locks down was real and shipped: `:not()` and `:is()` take the specificity of their
 * most specific argument, so `.sk-button:not([data-variant=…]):is([data-tone=…])` resolves at
 * (0,3,0) while `.sk-button:disabled` is a plain (0,2,0). A disabled `solid`/`danger` button painted
 * the full danger red on white ink - pixel-identical to the enabled "Delete project" beside it - and
 * the only thing distinguishing them was the cursor. `soft` and `translucent` were wrong in the same
 * direction; `ghost` was the one cell that happened to come out right, which is what kept it hidden.
 *
 * The assertion is deliberately "every cell paints what NEUTRAL disabled paints" rather than "the
 * disabled one differs from the enabled one". Differing is too weak: a cell that greys its fill but
 * keeps danger-red ink (translucent did exactly that) differs from enabled and is still wrong.
 */
const VARIANTS = ["solid", "soft", "ghost", "translucent"] as const;
const TONES = ["neutral", "accent", "danger"] as const;

type Paint = { bg: string; fg: string; border: string };

/** Both spellings, because Button publishes both and only the native one stops the click. */
const DISABLED_ATTRS = [`disabled`, `aria-disabled="true"`] as const;

test("a disabled button paints unavailable in every emphasis and tone", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ variants, tones, disabledAttrs }) => {
      const host = document.createElement("div");
      host.id = "disabled-probe";
      host.style.cssText = "position:fixed;inset:0 auto auto 0";

      const cells: { cell: string; html: string }[] = [];
      for (const attr of disabledAttrs) {
        for (const variant of variants) {
          for (const tone of tones) {
            cells.push({
              cell: `${variant}/${tone} [${attr}]`,
              html: `<button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="${tone}" ${attr}>B</button>`,
            });
          }
        }
      }
      // The reference: neutral, no tone rule in play, so nothing can out-specify `:disabled`.
      cells.push({
        cell: "reference",
        html: `<button class="sk-button sk-interactive" type="button" disabled>B</button>`,
      });

      host.innerHTML = cells.map((c, i) => `<span data-i="${i}">${c.html}</span>`).join("");
      document.body.append(host);

      const paint = (i: number) => {
        const el = host.querySelector(`[data-i="${i}"] button`)!;
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, fg: cs.color, border: cs.borderTopColor };
      };
      const out = cells.map((c, i) => ({ cell: c.cell, paint: paint(i) }));
      host.remove();
      return out;
    },
    { variants: VARIANTS, tones: TONES, disabledAttrs: DISABLED_ATTRS },
  );

  const reference = rows.find((r) => r.cell === "reference")!.paint as Paint;

  for (const row of rows) {
    if (row.cell === "reference") continue;
    const paint = row.paint as Paint;
    expect(paint.bg, `${row.cell}: fill is not the disabled fill`).toBe(reference.bg);
    expect(paint.fg, `${row.cell}: ink is not the disabled ink`).toBe(reference.fg);
    expect(paint.border, `${row.cell}: border is not the disabled border`).toBe(reference.border);
  }
});

test("a disabled toggle drops its pressed paint but keeps announcing that it is on", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ variants, tones }) => {
      const host = document.createElement("div");
      host.id = "disabled-pressed-probe";
      host.style.cssText = "position:fixed;inset:0 auto auto 0";

      const cells: string[] = [];
      for (const variant of variants) {
        for (const tone of tones) {
          cells.push(
            `<button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="${tone}" aria-pressed="true" disabled>${variant}/${tone}</button>`,
          );
        }
      }
      cells.push(`<button class="sk-button sk-interactive" type="button" disabled>reference</button>`);
      host.innerHTML = cells.map((html, i) => `<span data-i="${i}">${html}</span>`).join("");
      document.body.append(host);

      const out = [...host.querySelectorAll("button")].map((el) => {
        const cs = getComputedStyle(el);
        return {
          cell: el.textContent ?? "",
          bg: cs.backgroundColor,
          fg: cs.color,
          pressed: el.getAttribute("aria-pressed"),
        };
      });
      host.remove();
      return out;
    },
    { variants: VARIANTS, tones: TONES },
  );

  const reference = rows.find((r) => r.cell === "reference")!;

  for (const row of rows) {
    if (row.cell === "reference") continue;
    // Same rule checkbox.css and switch.css already follow: a disabled checked control is grey.
    expect(row.bg, `${row.cell}: a disabled toggle still paints its pressed fill`).toBe(reference.bg);
    expect(row.fg, `${row.cell}: a disabled toggle still paints its pressed ink`).toBe(reference.fg);
    // The state itself is NOT dropped: unavailable is about paint, not about what the control is.
    expect(row.pressed, `${row.cell}: aria-pressed was lost`).toBe("true");
  }
});

test("the enabled tone paint is untouched by the disabled guard", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ variants, tones }) => {
      const host = document.createElement("div");
      host.id = "enabled-probe";
      host.style.cssText = "position:fixed;inset:0 auto auto 0";
      const cells: { cell: string; html: string }[] = [];
      for (const variant of variants) {
        for (const tone of tones) {
          cells.push({
            cell: `${variant}/${tone}`,
            html: `<button class="sk-button sk-interactive" type="button" data-variant="${variant}" data-tone="${tone}">B</button>`,
          });
        }
      }
      cells.push({
        cell: "disabled reference",
        html: `<button class="sk-button sk-interactive" type="button" disabled>B</button>`,
      });
      host.innerHTML = cells.map((c, i) => `<span data-i="${i}">${c.html}</span>`).join("");
      document.body.append(host);
      const out = cells.map((c, i) => {
        const cs = getComputedStyle(host.querySelector(`[data-i="${i}"] button`)!);
        return { cell: c.cell, bg: cs.backgroundColor, fg: cs.color };
      });
      host.remove();
      return out;
    },
    { variants: VARIANTS, tones: TONES },
  );

  const disabled = rows.find((r) => r.cell === "disabled reference")!;

  /*
   * The guard narrows four selectors, so the failure worth catching is the opposite of the one
   * above: a typo in one of them (a stray space, the wrong pseudo-class) would make an ENABLED
   * toned button stop matching its own rule and fall back to the neutral base, which looks a lot
   * like the disabled paint. Every toned cell has to stay distinguishable from it.
   */
  for (const row of rows) {
    if (row.cell === "disabled reference" || row.cell.endsWith("/neutral")) continue;
    const same = row.bg === disabled.bg && row.fg === disabled.fg;
    expect(same, `${row.cell}: an enabled toned button paints as if it were disabled`).toBe(false);
  }
});
