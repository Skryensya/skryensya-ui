import { tourAttrs } from "@skryensya/core/tour";
import {
  connectTour,
  getTourController,
  type TourConfig,
  type TourController,
} from "@skryensya/core/tour-controller";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export type { TourPlacement, TourStatus, TourStep } from "@skryensya/core/tour";
export type { TourController, TourStartOptions, TourState } from "@skryensya/core/tour-controller";
export { tourEvents } from "@skryensya/core/tour-controller";

const rootSelector = `[${tourAttrs.root}]`;

/*
 * TOUR, the DOM shell around `@skryensya/core/tour-controller`.
 *
 * As thin as Lightbox's, for Lightbox's reason: every behaviour is `connectTour`'s, which the React
 * binding runs too, so all this file does is read the authored settings off the root. The triggers
 * need no enhancer of their own: the controller listens on the document for a click on any
 * `[data-sk-tour-open]` naming its id.
 */
export function readTourConfig(root: HTMLElement): TourConfig {
  return {
    progressLabel: root.getAttribute(tourAttrs.progressLabel) ?? undefined,
    remember: root.getAttribute(tourAttrs.remember) !== "false",
  };
}

export function connectTourRoot(root: HTMLElement): () => void {
  const controller = connectTour(root, readTourConfig(root));
  return () => controller.destroy();
}

/**
 * The controller of a mounted tour, by its id or its element, for driving it from script:
 * `getTour("onboarding")?.start()`. `null` until the enhancer has run.
 */
export function getTour(target: string | HTMLElement, doc: Document = document): TourController | null {
  const element = typeof target === "string" ? doc.getElementById(target) : target;
  return element ? getTourController(element) : null;
}

export const mountTour = createConnectMount({
  key: "tour",
  rootSelector,
  connect: connectTourRoot,
});
