import Accordion from "./Accordion.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored Accordion roots; it never scans or imports another enhancer. */
export const mountAccordion = createSvelteMount({
  key: "accordion",
  rootSelector: "[data-ds-accordion]",
  Component: Accordion,
});
