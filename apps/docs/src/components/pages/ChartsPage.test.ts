import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/*
 * The two claims this page makes about itself, checked against its own source.
 *
 * `astro check` is happy either way if someone adds a `<ChartCard>` export or leaks TanStack's
 * grammar back onto the documented path. The page would keep rendering, and the paragraph explaining
 * that Chart is a contract (a list of points) would quietly become false.
 */
const page = readFileSync(fileURLToPath(new URL("./ChartsPage.astro", import.meta.url)), "utf8");
const cards = readFileSync(
  fileURLToPath(new URL("../react-demos/chart-card.tsx", import.meta.url)),
  "utf8",
);
const kinds = readFileSync(
  fileURLToPath(new URL("../react-demos/charts.tsx", import.meta.url)),
  "utf8",
);

describe("ChartsPage.astro", () => {
  it("composes the dashboard cards from Box, Stat, Chart and Button", () => {
    expect(cards).toContain('<Box as="article"');
    expect(cards).toContain("<Stat");
    expect(cards).toContain("<Button");
    expect(cards).toContain("<Chart");
    expect(cards).not.toContain("<ChartCard>");
    expect(cards).not.toContain("sk-card");
    expect(cards).not.toContain("BarChart");
  });

  it("does not expose TanStack's grammar on the documented path", () => {
    expect(cards).not.toContain("@tanstack/charts");
    expect(kinds).not.toContain("@tanstack/charts");
    expect(kinds).not.toContain("defineChart");
    expect(page).not.toContain("defineChart");
    expect(page).not.toContain("lineY(");
    expect(page).toContain("@skryensya/charts/react/tanstack");
  });

  it("keeps only the React-only chart previews as viewport-triggered islands", () => {
    const cardsHeading = page.indexOf('id="cards"');
    const pieceHeading = page.indexOf('id="chart"');
    expect(cardsHeading).toBeGreaterThan(-1);
    expect(pieceHeading).toBeGreaterThan(cardsHeading);
    expect(page.match(/Demo client:visible/g)).toHaveLength(6);
  });
});
