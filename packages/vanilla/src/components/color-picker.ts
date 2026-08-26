import ColorPicker from "./ColorPicker.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored ColorPicker roots; the native `type="color"` layer needs no enhancer. */
export const mountColorPicker = createSvelteMount({
  key: "color-picker",
  rootSelector: "[data-sk-color-picker]",
  Component: ColorPicker,
});
