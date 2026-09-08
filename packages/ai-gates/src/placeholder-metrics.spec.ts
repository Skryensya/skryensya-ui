import { expect, test } from "@playwright/test";
import { waitForStage } from "./fixtures.js";

/*
 * THE ONE CLAIM PLACEHOLDER MAKES, measured in a real browser.
 *
 * `text="h3"` is not "roughly as tall as an h3". It resolves to the same font-size/line-height token
 * pair Heading reads, so the block a skeleton reserves is the block the content takes and nothing
 * moves on arrival. That is the whole reason the contract names roles instead of taking lengths,
 * and it is not checkable in jsdom: it needs real layout.
 *
 * This gate earned its place immediately. The first run said every skeleton was 1.28x too tall,
 * which was `padding-block` counting outward on an element with no `box-sizing: border-box` - a
 * skeleton that shifts the page it exists to hold still, in every binding, invisible to every unit
 * test in the repo.
 */
const TEXT_ROLES = ["caption", "sm", "body", "lg"] as const;
const HEADING_ROLES = ["h4", "h3", "h2", "h1"] as const;

test("a text skeleton is exactly as tall as the role it stands in for", async ({ page }) => {
  await waitForStage(page);

  const rows = await page.evaluate(
    ({ textRoles, headingRoles }) => {
      const host = document.createElement("div");
      host.style.cssText = "position:fixed;inset:0 auto auto 0;inline-size:600px;padding:16px";
      host.innerHTML = [...textRoles, ...headingRoles]
        .map((role) => {
          const real = (headingRoles as readonly string[]).includes(role)
            ? `<p class="sk-heading" data-size="${role}" style="margin:0">Texto real</p>`
            : `<p class="sk-text" data-size="${role}" style="margin:0">Texto real</p>`;
          return `<div data-row="${role}" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <span class="sk-placeholder" data-shape="text" data-text="${role}" aria-hidden="true"></span>
              ${real}
            </div>`;
        })
        .join("");
      document.body.append(host);

      const round = (value: number) => Math.round(value * 100) / 100;
      const measured = [...textRoles, ...headingRoles].map((role) => {
        const row = host.querySelector(`[data-row="${role}"]`)!;
        return {
          role,
          skeleton: round(row.querySelector(".sk-placeholder")!.getBoundingClientRect().height),
          text: round(row.querySelector("p")!.getBoundingClientRect().height),
        };
      });
      host.remove();
      return measured;
    },
    { textRoles: TEXT_ROLES, headingRoles: HEADING_ROLES },
  );

  for (const { role, skeleton, text } of rows) {
    expect(skeleton, `${role}: skeleton ${skeleton}px vs real text ${text}px`).toBeCloseTo(text, 1);
  }
  // A role that silently collapsed to zero would satisfy the equality above if the text did too.
  expect(rows.every((row) => row.skeleton > 0)).toBe(true);
});

test("a paragraph ends ragged, and one line keeps the full measure", async ({ page }) => {
  await waitForStage(page);

  const widths = await page.evaluate(() => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0 auto auto 0;inline-size:600px";
    const paragraph = (lines: number) =>
      `<span class="sk-placeholder" data-shape="paragraph" data-text="body" aria-hidden="true">${
        '<span class="sk-placeholder__line"></span>'.repeat(lines)
      }</span>`;
    host.innerHTML = `<div data-n="4">${paragraph(4)}</div><div data-n="1">${paragraph(1)}</div>`;
    document.body.append(host);

    const read = (n: number) =>
      [...host.querySelectorAll(`[data-n="${n}"] .sk-placeholder__line`)].map((line) =>
        Math.round(line.getBoundingClientRect().width),
      );
    const out = { four: read(4), one: read(1) };
    host.remove();
    return out;
  });

  // The cycle, then the short last line: what makes the block read as prose rather than a table.
  expect(widths.four).toEqual([600, 582, 600, 372]);
  // One line is a line, not a paragraph with a stub.
  expect(widths.one).toEqual([600]);
});
