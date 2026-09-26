import type { ComponentContract } from "./contract.js";

/*
 * FADE EDGE is paint-only composition. It wraps another module without changing its semantics,
 * focus order, overflow, or behavior. Marquee is one consumer, not a special case: the same wrapper
 * belongs around a scroll region, image, or any other edge whose hard clip needs a visual release.
 */

export const fadeEdgeParts = {
  root: "sk-fade-edge",
} as const;

export type FadeEdgeMode = "transparent" | "color";
export type FadeEdgeDirection = "to-bottom" | "to-top" | "to-right" | "to-left";

/*
 * SCROLL-AWARE: the fade says "there is more this way", so once the scroll reaches the edge it
 * points at, it is saying something false. Opting in lets the bindings write `data-at-edge` at that
 * moment and the stylesheet retire the fade.
 *
 * WHY NOT CSS ALONE. `container-type: scroll-state` answers exactly this question, but a container
 * query styles the container's DESCENDANTS, and the fade is painted on the scroller itself (its
 * `mask-image`, its `::after`). So the reading is a few lines of script both bindings share
 * (`fade-edge-dom.ts`), not a Zag scroll-area: the platform still draws and drives the scrollbar.
 */
export const fadeEdgeAttrs = {
  mount: "data-sk-fade-edge",
  scrollAware: "data-scroll-aware",
  direction: "data-direction",
  atEdge: "data-at-edge",
} as const;

/** The scroll geometry `fadeEdgeHasMore` reads, so a test can pass a plain object. */
export type FadeEdgeScrollMetrics = {
  readonly scrollTop: number;
  readonly scrollLeft: number;
  readonly scrollWidth: number;
  readonly scrollHeight: number;
  readonly clientWidth: number;
  readonly clientHeight: number;
  /** Right-to-left scrolls with a NEGATIVE `scrollLeft`, from 0 at the right edge (CSSOM View). */
  readonly rtl: boolean;
};

/*
 * A pixel of slack: zoom and fractional layouts leave `scrollTop + clientHeight` a fraction short of
 * `scrollHeight` at the very end, and a fade that never retires over half a pixel is the bug.
 */
const EDGE_SLACK = 1;

/**
 * Whether there is still content past the edge a fade in `direction` covers. The directions are
 * PHYSICAL, like the gradient they turn, so `to-right` means the right edge in either writing mode.
 */
export function fadeEdgeHasMore(metrics: FadeEdgeScrollMetrics, direction: FadeEdgeDirection): boolean {
  const maxY = metrics.scrollHeight - metrics.clientHeight;
  const maxX = metrics.scrollWidth - metrics.clientWidth;
  /* Distance from the physical LEFT edge, whichever way the axis runs. */
  const fromLeft = metrics.rtl ? maxX + metrics.scrollLeft : metrics.scrollLeft;
  switch (direction) {
    case "to-bottom":
      return metrics.scrollTop < maxY - EDGE_SLACK;
    case "to-top":
      return metrics.scrollTop > EDGE_SLACK;
    case "to-right":
      return fromLeft < maxX - EDGE_SLACK;
    case "to-left":
      return fromLeft > EDGE_SLACK;
  }
}

export const fadeEdgeContract = {
  id: "fade-edge",
  category: "layout",
  css: "@skryensya/core/components/fade-edge.css",
  parts: fadeEdgeParts,
  hooks: [
    "--sk-fade-edge-color",
    "--sk-fade-edge-mask-ramp",
    "--sk-fade-edge-ramp",
    "--sk-fade-edge-size",
  ],
  options: {
    mode: {
      type: "enum",
      values: ["transparent", "color"],
      default: "transparent",
      attr: "data-fade",
    },
    direction: {
      type: "enum",
      values: ["to-bottom", "to-top", "to-right", "to-left"],
      default: "to-bottom",
      attr: "data-direction",
    },
    /*
     * Retire the fade once the scroll reaches its edge, and while the content fits without
     * scrolling at all. Only meaningful when the FadeEdge IS the scroll container.
     */
    scrollAware: { type: "boolean", default: false, attr: "data-scroll-aware", trueValue: "" },
    size: { type: "string", styleProperty: "--sk-fade-edge-size" },
    color: { type: "string", styleProperty: "--sk-fade-edge-color" },
  },
  signatures: {
    FadeEdge: {
      intent: ["soften-a-clipped-edge", "overflow-fade", "paint-only-wrapper"],
      host: { element: "div" },
      options: ["mode", "direction", "scrollAware", "size", "color"],
      /* The colour only paints in `color` mode; with the default transparent fade it is set and unused. */
      excludes: { "mode=transparent": ["color"] },
      mount: "data-sk-fade-edge",
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/fade-edge", name: "FadeEdge" },
    },
  },
} as const satisfies ComponentContract;
