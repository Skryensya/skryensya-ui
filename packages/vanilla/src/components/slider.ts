import Slider from "./Slider.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

export const mountSlider = createSvelteMount({
  key: "slider",
  rootSelector: "[data-sk-slider]",
  Component: Slider,
});
