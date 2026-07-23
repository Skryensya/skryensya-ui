import ExpandableTile from "./ExpandableTile.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored ExpandableTile roots; it never scans or imports another enhancer. */
export const mountExpandableTile = createSvelteMount({
  key: "expandable-tile",
  rootSelector: "[data-ds-expandable-tile]",
  Component: ExpandableTile,
});
