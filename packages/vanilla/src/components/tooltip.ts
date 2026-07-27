import Tooltip from "./Tooltip.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Tooltip roots; it never scans or imports another enhancer. */
export const mountTooltip = createSvelteMount({
  key: "tooltip",
  rootSelector: "[data-sk-anchor]",
  Component: Tooltip,
});
