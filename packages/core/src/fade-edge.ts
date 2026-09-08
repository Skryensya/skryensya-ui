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

export const fadeEdgeContract = {
  id: "fade-edge",
  css: "@skryensya/core/components/fade-edge.css",
  parts: fadeEdgeParts,
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
    size: { type: "string", styleProperty: "--sk-fade-edge-size" },
    color: { type: "string", styleProperty: "--sk-fade-edge-color" },
  },
  signatures: {
    FadeEdge: {
      intent: ["soften-a-clipped-edge", "overflow-fade", "paint-only-wrapper"],
      host: { element: "div" },
      options: ["mode", "direction", "size", "color"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/fade-edge", name: "FadeEdge" },
    },
  },
} as const satisfies ComponentContract;
