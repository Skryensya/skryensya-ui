import Combobox from "./Combobox.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Combobox roots; it never scans or imports another enhancer. */
export const mountCombobox = createSvelteMount({
  key: "combobox",
  rootSelector: "[data-sk-combobox]",
  Component: Combobox,
});
