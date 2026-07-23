import TileRadioGroup from "./TileRadioGroup.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TileRadioGroup roots; it never scans or imports another enhancer. */
export const mountTileRadioGroup = createSvelteMount({
  key: "tile-radio-group",
  rootSelector: "[data-ds-tile-radio-group]",
  Component: TileRadioGroup,
});
