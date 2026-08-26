import SliderRange from "./SliderRange.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

export const mountSliderRange = createSvelteMount({
  key: "slider-range",
  rootSelector: "[data-sk-slider-range]",
  Component: SliderRange,
});
