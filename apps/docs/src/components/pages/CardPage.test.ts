import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * Box, Stack, ImageFrame and typography ride in globally through Base.astro. Tile and Checkbox do
 * not, and Card composes both (TileLink, TileButton, TileCheckbox). Reading the page's own source
 * text is enough to prove the import survives: no Astro render, no browser needed for a rule this
 * mechanical, and this is exactly the class of bug that would otherwise ship silently, since
 * `astro check` has no way to know a `.sk-tile` class needs `tile.css` loaded somewhere.
 */
const source = readFileSync(fileURLToPath(new URL("./CardPage.astro", import.meta.url)), "utf8");
const chartDemoSource = readFileSync(
  fileURLToPath(new URL("../react-demos/chart-card.tsx", import.meta.url)),
  "utf8",
);

describe("CardPage.astro", () => {
  it("imports tile.css, which Base.astro never loads globally", () => {
    expect(source).toContain('import "@skryensya/core/components/tile.css"');
  });

  it("imports checkbox.css, without which every indicator paints both the check and the dash glyph at once", () => {
    expect(source).toContain('import "@skryensya/core/components/checkbox.css"');
  });

  it("keeps the optional chart card a Box composition instead of inventing sk-card", () => {
    expect(chartDemoSource).toContain('<Box as="article"');
    expect(chartDemoSource).toContain("<Chart");
    expect(chartDemoSource).not.toContain("sk-card");
    expect(chartDemoSource).not.toContain("BarChart");
  });
});
