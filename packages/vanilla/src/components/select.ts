import Select from "./Select.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Select roots; it never scans or imports another enhancer. */
export const mountSelect = createSvelteMount({
  key: "select",
  rootSelector: "[data-sk-select]",
  Component: Select,
});
