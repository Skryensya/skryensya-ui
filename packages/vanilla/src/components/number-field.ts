import NumberField from "./NumberField.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored NumberField roots; it never scans or imports another enhancer. */
export const mountNumberField = createSvelteMount({
  key: "number-field",
  rootSelector: "[data-sk-number-field]",
  Component: NumberField,
});
