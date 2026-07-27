import { carouselAttrs } from "@skryensya/core/carousel";
import Carousel from "./Carousel.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/**
 * Mounts only authored Carousel roots; it never scans or imports another enhancer.
 *
 * The implementation is `@zag-js/carousel` behind a private Svelte component (see `Carousel.svelte`).
 * The consumer contract is unchanged: `[data-sk-carousel]` markup in, `sk-carousel-change` out,
 * `sk-carousel-goto` in.
 */
export const mountCarousel = createSvelteMount({
  key: "carousel",
  rootSelector: `[${carouselAttrs.root}]`,
  Component: Carousel,
});
