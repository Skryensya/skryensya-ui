import { lightboxAttrs } from "@skryensya/core/lightbox";
import {
  connectLightbox,
  getLightboxController,
  type LightboxConfig,
  type LightboxController,
} from "@skryensya/core/lightbox-controller";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

export type { LightboxImage } from "@skryensya/core/lightbox";
export type {
  LightboxController,
  LightboxOpenOptions,
  LightboxState,
} from "@skryensya/core/lightbox-controller";
export { lightboxEvents } from "@skryensya/core/lightbox-controller";

const rootSelector = `dialog[${lightboxAttrs.root}]`;

/*
 * LIGHTBOX, the DOM shell around `@skryensya/core/lightbox-controller`.
 *
 * As thin as Canvas's, for Canvas's reason: every behaviour is `connectLightbox`'s, which the React
 * binding runs too, so all this file does is read the authored settings off the `<dialog>`. Anything
 * more would be a second implementation of something the other binding does not do.
 *
 * The triggers need no enhancer of their own: the controller listens on the document for a click on
 * any `[data-sk-lightbox-open]` naming its id, so thumbnails added to the page later belong to the
 * gallery without being mounted.
 */
export function readLightboxConfig(root: HTMLElement): LightboxConfig {
  const max = Number.parseFloat(root.getAttribute(lightboxAttrs.maxZoom) ?? "");
  return {
    loop: root.hasAttribute(lightboxAttrs.loop) && root.getAttribute(lightboxAttrs.loop) !== "false",
    zoom: root.getAttribute(lightboxAttrs.zoom) !== "false",
    maxZoom: Number.isFinite(max) ? max : undefined,
    showCounter: root.getAttribute(lightboxAttrs.counter) !== "false",
    showCaption: root.getAttribute(lightboxAttrs.caption) !== "false",
    closeOnBackdropClick: root.getAttribute(lightboxAttrs.closeOnBackdrop) !== "false",
    counterLabel: root.getAttribute(lightboxAttrs.counterLabel) ?? undefined,
  };
}

export function connectLightboxRoot(root: HTMLElement): () => void {
  if (root.tagName !== "DIALOG") return () => {};
  const controller = connectLightbox(root as HTMLDialogElement, readLightboxConfig(root));
  return () => controller.destroy();
}

/**
 * The controller of a mounted lightbox, by its id or its element, for opening it from script:
 * `getLightbox("photos")?.open({ images, index: 2 })`. `null` until the enhancer has run.
 */
export function getLightbox(target: string | HTMLElement, doc: Document = document): LightboxController | null {
  const element = typeof target === "string" ? doc.getElementById(target) : target;
  return element ? getLightboxController(element) : null;
}

export const mountLightbox = createConnectMount({
  key: "lightbox",
  rootSelector,
  connect: connectLightboxRoot,
});
