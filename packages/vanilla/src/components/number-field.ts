import NumberField from "./NumberField.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { numberFieldAttrs } from "@skryensya/core/number-field";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored NumberField roots; it never scans or imports another enhancer. */
export const mountNumberField = createSvelteMount({
  key: "number-field",
  rootSelector: rootSelectorFor(numberFieldAttrs),
  Component: NumberField,
});
