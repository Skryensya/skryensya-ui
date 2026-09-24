import {
  CANVAS_MAX_ZOOM,
  CANVAS_MIN_ZOOM,
  canvasAttrs,
  connectCanvasView,
} from "@skryensya/core/canvas";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${canvasAttrs.root}]`;

/*
 * CANVAS, the DOM shell around `@skryensya/core/canvas`.
 *
 * Thinner than any other enhancer, on purpose: the gestures are wired by `connectCanvasView`, which
 * the React binding calls too, so the only thing left here is reading the two limits and `fitOnly` off the
 * authored markup. Anything else this file did would be a second implementation of something the
 * other binding does not do.
 *
 * It also attaches to the canvas `Annotated` embeds around its frame: that
 * node carries the same `data-sk-canvas`, so the same enhancer finds it.
 */
export function connectCanvas(root: HTMLElement): () => void {
  return connectCanvasView(root, {
    minZoom: numberOf(root, canvasAttrs.minZoom, CANVAS_MIN_ZOOM),
    maxZoom: numberOf(root, canvasAttrs.maxZoom, CANVAS_MAX_ZOOM),
    fitOnly: root.hasAttribute(canvasAttrs.fitOnly),
  });
}

/** An unparseable or non-positive limit is the default, never a canvas that cannot zoom at all. */
const numberOf = (element: HTMLElement, attr: string, fallback: number): number => {
  const parsed = Number.parseFloat(element.getAttribute(attr) ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const mountCanvas = createConnectMount({
  key: "canvas",
  rootSelector,
  connect: connectCanvas,
});
