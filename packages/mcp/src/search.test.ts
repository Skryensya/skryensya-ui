import { describe, expect, it } from "vitest";
import { rankByIntent } from "./search.js";
import type { SurfaceEntry } from "./catalog.js";

const surfaces: SurfaceEntry[] = [
  { id: "button", surface: "Button", use: "action", element: "button" },
  { id: "button", surface: "ButtonLink", use: "navigation", element: "a" },
  { id: "link", surface: "Link", use: "inline navigation", element: "a" },
  { id: "tile", surface: "TileRadioGroup", use: "exclusive surface selection", element: "div" },
  { id: "nav-list", surface: "NavList", use: "list of destinations", element: "nav" },
  { id: "list", surface: "ListItemLink", use: "row navigation", element: "a" },
  { id: "tag", surface: "Tag", use: "removable classification or filter facet", element: "span" },
];

describe("rankByIntent", () => {
  it("does not let short words match by accident", () => {
    // "to" must not match inside "button" and inflate its score.
    const matches = rankByIntent("navigate to docs page", surfaces);
    expect(matches.find((m) => m.surface === "Button")).toBeUndefined();
  });

  it("matches morphological variants via prefix, not just exact words", () => {
    const matches = rankByIntent("navigate to docs page", surfaces);
    expect(matches[0]?.use).toContain("navigation");
  });

  it("ranks exact word matches above fuzzy ones", () => {
    const matches = rankByIntent("exclusive selection", surfaces);
    expect(matches[0]?.surface).toBe("TileRadioGroup");
  });

  it("returns nothing for an intent with no relation to the catalog", () => {
    expect(rankByIntent("quantum entanglement simulator", surfaces)).toEqual([]);
  });

  it("finds a hyphenated id via its short segment (regression: 'nav' from 'nav-list')", () => {
    // "nav" is only 3 letters, so a query naming "navigation" used to fail the old single
    // length-4 floor and NavList never surfaced at all for the exact query describing it — it
    // isn't required to win #1 against ListItemLink (a real, legitimately-scoring competitor
    // here), only to stop being invisible to the search.
    const matches = rankByIntent("list of navigation links at top of page", surfaces);
    expect(matches.find((m) => m.surface === "NavList")).toBeDefined();
  });

  it("keeps the prose floor at 4 so a short id word does not fuzzy-match unrelated prose", () => {
    // "tag" (3 letters) must not pick up credit from an unrelated query word like "top" just
    // because ID_FLOOR dropped to 3 — the floor only applies to the id/surface side, and "top"
    // shares no sufficient prefix with "tag" either way.
    const matches = rankByIntent("give me a checkbox tile", surfaces);
    expect(matches.find((m) => m.surface === "Tag")).toBeUndefined();
  });
});
