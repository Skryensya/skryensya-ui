import Slider from "./Slider.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { sliderAttrs } from "@skryensya/core/slider";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

export const mountSlider = createSvelteMount({
  key: "slider",
  rootSelector: rootSelectorFor(sliderAttrs),
  Component: Slider,
});
