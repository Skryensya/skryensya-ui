import TimeField from "./TimeField.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored TimeField roots; a plain `<input type="time">` needs no enhancer at all. */
export const mountTimeField = createSvelteMount({
  key: "time-field",
  rootSelector: "[data-sk-time-field]",
  Component: TimeField,
});
