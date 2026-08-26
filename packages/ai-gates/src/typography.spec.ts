import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

const typographyCss = readFileSync(
  fileURLToPath(new URL("../../core/css/components/typography.css", import.meta.url)),
  "utf8",
);

/*
 * A Link is an inline text affordance. When a consumer drops it as a direct child of a column Stack
 * or grid cell, browser stretch can otherwise turn the anchor into a full-row box; then the shared
 * state layer and focus ring paint empty space that is not part of the link's content.
 */
test("sk-link keeps a content-sized box when layout stretch would fill the row", async ({ page }) => {
  await page.setContent(`
    <style>
      ${typographyCss}
      .fixture {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        inline-size: 360px;
        font: 16px system-ui;
      }
    </style>
    <div class="fixture">
      <a class="sk-link sk-interactive" href="#">Leer más</a>
    </div>
  `);

  const widths = await page.locator(".fixture").evaluate((fixture) => {
    const link = fixture.querySelector<HTMLAnchorElement>(".sk-link")!;
    const range = document.createRange();
    range.selectNodeContents(link);
    const textWidth = range.getBoundingClientRect().width;
    range.detach();

    return {
      fixture: fixture.getBoundingClientRect().width,
      link: link.getBoundingClientRect().width,
      text: textWidth,
    };
  });

  expect(widths.link).toBeLessThan(widths.fixture / 2);
  expect(widths.link).toBeGreaterThanOrEqual(widths.text);
});
