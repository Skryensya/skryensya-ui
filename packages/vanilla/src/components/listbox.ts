import Listbox from "./Listbox.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Listbox roots; it never scans or imports another enhancer. */
export const mountListbox = createSvelteMount({
  key: "listbox",
  rootSelector: "[data-sk-listbox]",
  Component: Listbox,
});
