import Tooltip from "./Tooltip.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Tooltip roots; it never scans or imports another enhancer. */
export const mountTooltip = createSvelteMount({
  /*
   * Keyed by the ATTRIBUTE it scans for, not by the component's name, so the mount point and the
   * lifecycle markers it writes share one prefix (`data-sk-anchor`, `-ready`, `-mounting`) the way
   * every other enhancer's do. Keyed "tooltip" it wrote `data-sk-tooltip-ready` onto a
   * `[data-sk-anchor]` root: two prefixes for one mount, which is a divergence the symmetry gate
   * cannot tell from a real one, because a contract can only declare the mount it named.
   */
  key: "anchor",
  rootSelector: "[data-sk-anchor]",
  Component: Tooltip,
});
