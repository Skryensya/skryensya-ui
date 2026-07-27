import DatePicker from "./DatePicker.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored DatePicker roots; the native `type="date"` layer needs no enhancer. */
export const mountDatePicker = createSvelteMount({
  key: "date-picker",
  rootSelector: "[data-sk-date-picker]",
  Component: DatePicker,
});
