import { describe, expect, it } from "vitest";
import {
  defaultFolderGeometry,
  folderGeometryFrom,
  folderGroundFrom,
  folderPath,
  folderTabEndFrom,
  folderTabEnd,
  folderTabSweep,
  folderTailFrom,
  type FolderShape,
} from "./folder.js";

/*
 * The silhouette's geometry, which is the half of Folder that decides anything: both bindings feed
 * the same measurement into `folderPath` and write the string it returns, so a difference here is a
 * difference the symmetry gate would see as two different components. The painting itself is CSS
 * and the measuring is a ResizeObserver; what is worth pinning is the shape those two produce.
 */

const shape = (overrides: Partial<FolderShape> = {}): FolderShape => ({
  ...defaultFolderGeometry,
  width: 672,
  height: 400,
  tabEnd: 218,
  ...overrides,
});

/**
 * Every coordinate in a `d`, split by axis. A naive "pair up the numbers" pass gets this wrong the
 * moment the path uses `H`/`V`, which contribute one number each and desynchronise everything after
 * them - the exact mistake that would make a bounds check pass on a path that leaves the box.
 */
const coords = (d: string): { xs: number[]; ys: number[] } => {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [, command, rest] of d.matchAll(/([MLHVQCZ])([^MLHVQCZ]*)/g)) {
    const numbers = (rest!.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    if (command === "H") xs.push(...numbers);
    else if (command === "V") ys.push(...numbers);
    else
      numbers.forEach((value, index) => {
        (index % 2 === 0 ? xs : ys).push(value);
      });
  }
  return { xs, ys };
};

/** Where the body's top edge lands for a given tab height: the fold, lifted off the tab's bottom. */
const foldOf = (tabHeight: number, lift = defaultFolderGeometry.foldLift) => tabHeight - lift;

describe("folderPath", () => {
  /* The leading corner is a CORNER: a quarter circle of `tabRadius` on both axes, like the other
   * three. It used to span the tab's whole height, which made it the one angle in the folder that
   * was not one, and it read as a different radius from everything else. */
  it("turns the leading corner on the same radius both ways, like every other corner", () => {
    const { tabRadius } = defaultFolderGeometry;
    const d = folderPath(shape());
    expect(d.startsWith(`M0 ${tabRadius} Q0 0 ${tabRadius} 0`)).toBe(true);
    // and the leading edge comes back up to exactly where that corner began
    expect(d).toContain(`V${tabRadius} Z`);
    expect(d.endsWith("Z")).toBe(true);
  });

  it("runs the tab's top edge to where the tab ends, then folds down over the shoulder", () => {
    const d = folderPath(shape({ tabEnd: 218 }));
    // The flat top of the tab ends where the tab does...
    expect(d).toContain("H218");
    // ...and the second cubic lands on the body's top line exactly one shoulder later, at the
    // lifted fold rather than at the tab's own bottom.
    expect(d).toContain(
      `${218 + defaultFolderGeometry.shoulder} ${foldOf(defaultFolderGeometry.tabHeight)}`,
    );
  });

  /* The fold sits at whatever height the binding MEASURED off the tab, which is the label plus its
   * padding - not `--sk-folder-tab-height`, which is only the tab's minimum. A title one size larger
   * than the hook expected would otherwise hang over its own crease. */
  it("puts the fold at the measured tab height, whatever the default says", () => {
    const measured = folderPath(shape({ tabHeight: 62 }));
    expect(measured).toContain(`314 ${foldOf(62)}`);
    expect(measured).not.toContain(` ${foldOf(defaultFolderGeometry.tabHeight)} H`);
  });

  /* The one end that moves. The label's box is untouched, so no type shifts; what opens is the gap
   * between the body's top line and the standfirst under it, two horizontals that were competing. */
  it("lifts the body's top edge off the tab's bottom, leaving the tab's own corner where it was", () => {
    const flush = folderPath(shape({ foldLift: 0 }));
    const lifted = folderPath(shape({ foldLift: 12 }));
    const { tabHeight, shoulder, tabRadius } = defaultFolderGeometry;

    expect(flush).toContain(`${218 + shoulder} ${tabHeight}`);
    expect(lifted).toContain(`${218 + shoulder} ${tabHeight - 12}`);
    // the leading corner, and the flat top the label sits on, are the same in both
    expect(lifted.startsWith(`M0 ${tabRadius} Q0 0 ${tabRadius} 0 H218`)).toBe(true);
    expect(flush.startsWith(`M0 ${tabRadius} Q0 0 ${tabRadius} 0 H218`)).toBe(true);
  });

  /* A tab shorter than the lift would otherwise fold the silhouette inside out. */
  it("never lifts the body's edge above the tab's own top", () => {
    const d = folderPath(shape({ tabHeight: 4, foldLift: 40 }));
    expect(d).toContain(`${218 + defaultFolderGeometry.shoulder} 0`);
  });

  it("keeps the S-curve's proportions when the tab is taller", () => {
    const short = folderPath(shape({ tabEnd: 200 }));
    const tall = folderPath(shape({ tabEnd: 200, tabHeight: 120 }));
    const foldAt = 200 + defaultFolderGeometry.shoulder;
    // Same horizontal run either way: the shoulder is a length, not a ratio of the tab's height.
    expect(short).toContain(`${foldAt} ${foldOf(defaultFolderGeometry.tabHeight)}`);
    expect(tall).toContain(`${foldAt} ${foldOf(120)}`);
  });

  it("never draws outside the box it was measured from", () => {
    const box = shape({ tabEnd: 218 });
    const { xs, ys } = coords(folderPath(box));
    expect(xs.length).toBeGreaterThan(0);
    for (const x of xs) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(box.width);
    }
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(box.height);
    }
  });

  /*
   * The failure this prevents is not cosmetic: a tab wider than the box leaves the shoulder no room,
   * the curve's end lands past the trailing edge, and the path folds back over itself into a shape
   * with a visible crossing.
   */
  it("clamps a tab too wide for its shoulder instead of folding the path back on itself", () => {
    const box = shape({ tabEnd: 10_000 });
    expect(folderTabEnd(box)).toBe(672 - defaultFolderGeometry.shoulder - defaultFolderGeometry.topRadius);
    for (const x of coords(folderPath(box)).xs) expect(x).toBeLessThanOrEqual(box.width);
  });

  /*
   * The tab is as wide as its LABEL, and the sweep bends to that - never the other way round. A
   * one-word label ("Radio") makes a tab narrower than the sweep was drawn for, and an unclamped
   * sweep then starts its curve before the corner has finished: the tab renders as a lopsided
   * triangle with no flat top at all. That is what shipped in the first pass, and what this pins.
   */
  it("clamps the leading sweep to a tab too narrow to hold it, instead of widening the tab", () => {
    const narrow = shape({ tabEnd: 12 });
    expect(folderTabEnd(narrow)).toBe(12);
    expect(folderTabSweep(narrow)).toBe(12);
    // The flat top has collapsed to nothing, and the curve still lands exactly on the tab's end.
    expect(folderPath(narrow)).toContain("Q0 0 12 0 H12");

    // A tab with room to spare keeps the full sweep the stylesheet asked for.
    expect(folderTabSweep(shape({ tabEnd: 200 }))).toBe(defaultFolderGeometry.tabRadius);
  });

  /* RTL is the case that is silently wrong rather than visibly broken: the folder still draws, with
   * its tab at the wrong edge, under a label the stylesheet has already moved to the other side. */
  it("mirrors the whole silhouette for an RTL folder", () => {
    const box = shape({ tabEnd: 218, mirror: true });
    const d = folderPath(box);
    expect(d.startsWith(`M672 ${defaultFolderGeometry.tabRadius}`)).toBe(true);
    // The tab's flat top now runs leftward from the trailing edge to 672 - 218.
    expect(d).toContain("H454");
    for (const x of coords(d).xs) expect(x).toBeGreaterThanOrEqual(0);
  });

  it("draws nothing at all for a box with no area", () => {
    expect(folderPath(shape({ width: 0, height: 0 }))).toBe("");
    // A folder inside a `display: none` ancestor measures zero on one axis only, just as often.
    expect(folderPath(shape({ height: 0 }))).toBe("");
  });
});

/*
 * The measurement both bindings make, and the one that was wrong the first time round: `offsetWidth`
 * alone is the tab's WIDTH, while the silhouette needs where the tab ENDS. They differ by the
 * folder's leading inset, and the difference is visible - the label overhangs the flat top of its
 * own tab by exactly that much.
 */
describe("folderTabEndFrom", () => {
  it("measures to the tab's far edge, not merely its width", () => {
    expect(folderTabEndFrom({ offsetWidth: 600 }, { offsetLeft: 24, offsetWidth: 61 }, false)).toBe(85);
  });

  it("measures from the inline-start edge in RTL, which is the right-hand one", () => {
    // The same tab, laid out from the right: 24px of inset on its own side, 61px wide.
    expect(folderTabEndFrom({ offsetWidth: 600 }, { offsetLeft: 600 - 24 - 61, offsetWidth: 61 }, true)).toBe(85);
  });
});

/*
 * A folder at rest is invisible by being its GROUND's paint, and no CSS rule can ask what is behind
 * an element. Two things were wrong on the way here and both are pinned below: `transparent` paints
 * nothing (so a revealed folder showed straight through the ones in front), and reading
 * `backgroundColor` alone missed the elevation wash this system layers over its surfaces.
 */
describe("folderGroundFrom", () => {
  const chain = (paints: { color?: string; image?: string }[]) => {
    const nodes = paints.map(() => ({ parentElement: null }) as unknown as Element);
    const folder = { parentElement: nodes[0] ?? null } as unknown as Element;
    nodes.forEach((node, index) => {
      (node as { parentElement: Element | null }).parentElement = nodes[index + 1] ?? null;
    });
    const painted = new Map(nodes.map((node, index) => [node, paints[index]!] as const));
    return {
      folder,
      paintOf: (el: Element) => {
        const paint = painted.get(el);
        return { color: paint?.color ?? "rgba(0, 0, 0, 0)", image: paint?.image ?? "none" };
      },
    };
  };

  it("takes the first ancestor that actually paints something", () => {
    const { folder, paintOf } = chain([{}, { color: "rgb(240, 240, 238)" }, { color: "rgb(255, 255, 255)" }]);
    expect(folderGroundFrom(folder, paintOf)).toBe("rgb(240, 240, 238)");
  });

  /* The bug this pins: a `raised` Box paints a colour AND a 2% gradient over it, and a folder that
   * copied only the colour was a shade off - the wash on top of it gave the silhouette away. */
  it("copies the image layers over the colour, in the order CSS paints them", () => {
    const { folder, paintOf } = chain([
      { color: "oklch(1 0 0)", image: "linear-gradient(oklch(0.2 0 0 / 0.02), oklch(0.2 0 0 / 0))" },
    ]);
    expect(folderGroundFrom(folder, paintOf)).toBe(
      "linear-gradient(oklch(0.2 0 0 / 0.02), oklch(0.2 0 0 / 0)) oklch(1 0 0)",
    );
  });

  /* An ancestor can paint an image over nothing at all; the folder still has something to copy. */
  it("takes an image with no colour under it", () => {
    const { folder, paintOf } = chain([{ color: "transparent", image: "url(paper.png)" }]);
    expect(folderGroundFrom(folder, paintOf)).toBe("url(paper.png) transparent");
  });

  it("skips every spelling of a fully transparent background", () => {
    const { folder, paintOf } = chain([
      { color: "transparent" },
      { color: "rgba(0, 0, 0, 0)" },
      { color: "oklch(0.5 0.1 200 / 0)" },
      { color: "color(srgb 1 1 1 / 0%)" },
      { color: "rgb(20, 20, 20)" },
    ]);
    expect(folderGroundFrom(folder, paintOf)).toBe("rgb(20, 20, 20)");
  });

  /* The docs preview is exactly this: nothing up the tree paints, and the white a reader sees is the
   * browser's own canvas. Writing a colour here would be a confident guess; the stylesheet's own
   * fallback is the honest answer. */
  it("answers null when nothing up the tree paints at all", () => {
    const { folder, paintOf } = chain([{ color: "transparent" }, { color: "rgba(0, 0, 0, 0)" }]);
    expect(folderGroundFrom(folder, paintOf)).toBeNull();
  });

  it("answers null for a folder with no parent", () => {
    expect(
      folderGroundFrom({ parentElement: null } as unknown as Element, () => ({
        color: "rgb(0,0,0)",
        image: "none",
      })),
    ).toBeNull();
  });
});

/*
 * The overlap, derived rather than tuned. A single hand-picked number broke the moment the copy grew
 * - a four-line standfirst was cut off mid-sentence by the folder in front - so the height of the
 * text decides the spacing, and the binding measures it.
 */
describe("folderTailFrom", () => {
  it("hides the empty card below the last line, and nothing above it", () => {
    // a 240 folder whose copy ends at 128, with 24 of air under it and a 5px tilt to pay for
    expect(folderTailFrom(240, 128, 24, 5)).toBe(83);
  });

  it("gives a folder whose copy fills it no tail at all, rather than a negative one", () => {
    expect(folderTailFrom(252, 228, 24, 6)).toBe(0);
    // and overflowing content is the same answer: stack below, never cut
    expect(folderTailFrom(200, 260, 24, 6)).toBe(0);
  });

  /* The 5px the tilt cost, measured on a phone: the fold turns about the bottom edge, so every
   * folder's top sits higher than its layout box and the next one arrives that much sooner. */
  it("pays for the forward lean, which a layout-space measurement cannot see", () => {
    expect(folderTailFrom(320, 228, 24, 0) - folderTailFrom(320, 228, 24, 10)).toBe(10);
  });
});

describe("folderGeometryFrom", () => {
  it("reads every knob off custom properties", () => {
    const styles = {
      getPropertyValue: (property: string) =>
        ({
          "--sk-folder-tab-height": "40px",
          "--sk-folder-fold-lift": "6px",
          "--sk-folder-tab-radius": "20px",
          "--sk-folder-shoulder": "90px",
          "--sk-folder-top-radius": "24px",
          "--sk-folder-radius": "4px",
        })[property] ?? "",
    };
    expect(folderGeometryFrom(styles)).toEqual({
      tabHeight: 40,
      foldLift: 6,
      tabRadius: 20,
      shoulder: 90,
      topRadius: 24,
      radius: 4,
    });
  });

  /* Per-property rather than all-or-nothing: this is what a brand that retunes ONE hook gets, and
   * also what jsdom gives every folder in the two bindings' own test suites. */
  it("falls back per property, so one redeclared hook keeps the rest of the silhouette", () => {
    const styles = {
      getPropertyValue: (property: string) => (property === "--sk-folder-tab-height" ? "88px" : ""),
    };
    expect(folderGeometryFrom(styles)).toEqual({ ...defaultFolderGeometry, tabHeight: 88 });
  });
});
