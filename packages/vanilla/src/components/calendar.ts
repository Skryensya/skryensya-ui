import Calendar from "./Calendar.svelte";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts a standalone `data-sk-calendar` root: no field, no popover, just the grid. */
export const mountCalendar = createSvelteMount({
  key: "calendar",
  rootSelector: "[data-sk-calendar]",
  Component: Calendar,
});
