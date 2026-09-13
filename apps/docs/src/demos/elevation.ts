import type { UsageTree } from "@skryensya/core/usage-tree";
import { elevationLevels } from "./data/elevation";

/*
 * All five rungs side by side. PLAIN CONSTANTS, per this directory's README: the only words in them
 * are the rung names and the `surface` values, which are the scale's own vocabulary and identical in
 * every language.
 *
 * `Box` only reaches three of the five itself, so every swatch here is skinned the same way instead:
 * `.ev-swatch[data-level]` (examples/elevation.css) overrides `--sk-box-shadow` AND `background`
 * directly, which is the "declare your own hook, override it" pattern the page explains in prose.
 * These are still real `box` contract nodes emitting real Box markup; only the paint is the page's.
 */
export const elevationScaleTree: UsageTree = {
  contract: "layout",
  signature: "Grid",
  options: { gap: "md", columns: "5" },
  children: elevationLevels.map((step) => ({
    contract: "box",
    signature: "Box",
    options: { border: "subtle", padding: "lg" },
    attrs: { class: "ev-swatch", "data-level": step.level },
    children: step.name,
  })),
};

/** Box's OWN three rungs, through its real `surface` option: no override at all, unlike the five
 * swatches above. The path most consumers actually want: reach for Box, not for a hook. */
export const elevationBoxSurfacesTree: UsageTree = {
  contract: "layout",
  signature: "Grid",
  options: { gap: "md", columns: "3" },
  children: (["sunken", "surface", "raised"] as const).map((surface) => ({
    contract: "box",
    signature: "Box",
    options:
      surface === "raised"
        ? { surface, padding: "lg" }
        : { surface, border: "subtle", padding: "lg" },
    children: `surface: ${surface}`,
  })),
};
