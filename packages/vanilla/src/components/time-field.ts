import TimeField from "./TimeField.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { timeFieldAttrs } from "@skryensya/core/time-field";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TimeField roots; a plain `<input type="time">` needs no enhancer at all. */
export const mountTimeField = createSvelteMount({
  key: "time-field",
  rootSelector: rootSelectorFor(timeFieldAttrs),
  Component: TimeField,
});
