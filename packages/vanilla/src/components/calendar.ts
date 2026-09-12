import Calendar from "./Calendar.svelte";
import { rootSelectorFor } from "@skryensya/core/selectors";
import { calendarAttrs } from "@skryensya/core/calendar";
import { createSvelteMount } from "../runtime/svelte-hydrate.js";

/** Mounts a standalone `data-sk-calendar` root: no field, no popover, just the grid. */
export const mountCalendar = createSvelteMount({
  key: "calendar",
  rootSelector: rootSelectorFor(calendarAttrs),
  Component: Calendar,
});
