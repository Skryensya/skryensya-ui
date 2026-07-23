import Tabs from "./Tabs.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Tabs roots; it never scans or imports another enhancer. */
export const mountTabs = createSvelteMount({
  key: "tabs",
  rootSelector: "[data-ds-tabs]",
  Component: Tabs,
});
