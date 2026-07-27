import TileCheckbox from "./TileCheckbox.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TileCheckbox roots; it never scans or imports another enhancer. */
export const mountTileCheckbox = createSvelteMount({
  key: "tile-checkbox",
  rootSelector: "[data-sk-tile-checkbox]",
  Component: TileCheckbox,
});
