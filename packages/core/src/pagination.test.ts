import { describe, expect, it } from "vitest";
import { paginationRange } from "./pagination.js";

/*
 * The visible page window, and the reason it is a function rather than something an author types:
 * a hand-typed window can skip a page, and holding that invariant is what the contract is for. The
 * emitter calls this to build the markup, so what it returns IS what both bindings render.
 */
describe("paginationRange", () => {
  it("has nothing to draw for a single page", () => {
    // Not a one-item nav: a pager over one page is chrome with no job.
    expect(paginationRange(1, 1)).toEqual([]);
    expect(paginationRange(1, 0)).toEqual([]);
    expect(paginationRange(1, Number.NaN)).toEqual([]);
  });

  it("lists every page while they all fit", () => {
    expect(paginationRange(1, 3)).toEqual([1, 2, 3]);
    expect(paginationRange(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("keeps first, last and a sibling on each side of the current page", () => {
    expect(paginationRange(5, 12)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 12]);
  });

  it("collapses only runs longer than one hidden page", () => {
    // Page 3 of 12 hides just page 2 on the left, and a "…" standing for one page is a lie
    // that costs the reader a click.
    expect(paginationRange(3, 12)).toEqual([1, 2, 3, 4, "ellipsis", 12]);
    expect(paginationRange(10, 12)).toEqual([1, "ellipsis", 9, 10, 11, 12]);
  });

  it("does not run past either end", () => {
    expect(paginationRange(1, 12)).toEqual([1, 2, "ellipsis", 12]);
    expect(paginationRange(12, 12)).toEqual([1, "ellipsis", 11, 12]);
  });

  it("widens the window with more siblings", () => {
    expect(paginationRange(6, 12, 2)).toEqual([1, "ellipsis", 4, 5, 6, 7, 8, "ellipsis", 12]);
    // Zero siblings is still a valid window: first, current, last.
    expect(paginationRange(6, 12, 0)).toEqual([1, "ellipsis", 6, "ellipsis", 12]);
  });

  it("clamps a page that is out of range instead of drawing a gap to nowhere", () => {
    expect(paginationRange(0, 5)).toEqual(paginationRange(1, 5));
    expect(paginationRange(99, 5)).toEqual(paginationRange(5, 5));
    expect(paginationRange(2.7, 5)).toEqual(paginationRange(2, 5));
  });

  it("never repeats a page or leaves one out of order", () => {
    for (const total of [2, 7, 13, 40]) {
      for (let page = 1; page <= total; page++) {
        const numbers = paginationRange(page, total).filter(
          (slot): slot is number => slot !== "ellipsis",
        );
        expect(new Set(numbers).size).toBe(numbers.length);
        expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
        // The two ends are always reachable, whatever the window did in between.
        expect(numbers[0]).toBe(1);
        expect(numbers.at(-1)).toBe(total);
        expect(numbers).toContain(page);
      }
    }
  });
});
