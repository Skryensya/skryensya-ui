import ColorPicker from "./ColorPicker.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { colorPickerAttrs } from "@skryensya/core/color-picker";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored ColorPicker roots; the native `type="color"` layer needs no enhancer. */
export const mountColorPicker = createSvelteMount({
  key: "color-picker",
  rootSelector: rootSelectorFor(colorPickerAttrs),
  Component: ColorPicker,
});
