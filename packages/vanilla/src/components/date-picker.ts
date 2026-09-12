import DatePicker from "./DatePicker.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { datePickerAttrs } from "@skryensya/core/date-picker";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts only authored DatePicker roots; the native `type="date"` layer needs no enhancer. */
export const mountDatePicker = createSvelteMount({
  key: "date-picker",
  rootSelector: rootSelectorFor(datePickerAttrs),
  Component: DatePicker,
});
