import TileSwitch from "./TileSwitch.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TileSwitch roots; it never scans or imports another enhancer. */
export const mountTileSwitch = createSvelteMount({
  key: "tile-switch",
  rootSelector: "[data-sk-tile-switch]",
  Component: TileSwitch,
});
