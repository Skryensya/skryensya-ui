import { parseDate } from "@internationalized/date";
import type { ComponentContract } from "./contract.js";

export type { DateValue, DateView } from "@zag-js/date-picker";

const weekdayLetterPattern = /\p{L}\p{M}*/gu;

/*
 * `min`/`max` on the Zag machine are `DateValue` objects, but the vanilla enhancers only have an
 * authored HTML attribute (`data-min="2026-07-01"`) to read. One parse, shared by every enhancer
 * that needs it, rather than each reimplementing the "attribute absent → undefined" branch.
 * Malformed input throws `parseDate`'s own descriptive error — the same "loud, not swallowed"
 * contract the icon-only Button check uses for a missing accessible name.
 */
export function parseCalendarDate(value: string | null | undefined) {
  return value ? parseDate(value) : undefined;
}

export function getTwoLetterWeekdayLabel(
  day: Readonly<{ long: string; short: string }>,
  locale: string,
) {
  const shortLetters = day.short.match(weekdayLetterPattern) ?? [];
  const longLetters = day.long.match(weekdayLetterPattern) ?? [];
  const letters = shortLetters.length >= 2 ? shortLetters : longLetters;

  const first = letters[0];
  if (first === undefined) {
    return Array.from(day.short).slice(0, 2).join("");
  }

  const second = letters[1] ?? "";
  return first.toLocaleUpperCase(locale) + second.toLocaleLowerCase(locale);
}

/*
 * CALENDAR, el chrome derivado que vive detrás de un DatePicker Y de pie solo. La máquina que lo
 * respalda sigue siendo `@zag-js/date-picker` (no hay un `@zag-js/calendar` separado en este stack),
 * pero el CONTROL (label, input, trigger, clear, positioner) es asunto del campo, no del calendario:
 * un Calendar inline nunca los monta. Estas parts cubren sólo lo que ambos dibujan: encabezado,
 * navegación, el botón que cambia de vista (día → mes → década) y las tres grillas (día/mes/año).
 */
export const calendarParts = {
  root: "sk-calendar",
  label: "sk-calendar__label",
  header: "sk-calendar__header",
  heading: "sk-calendar__heading",
  viewTrigger: "sk-calendar__view-trigger",
  previous: "sk-calendar__previous",
  next: "sk-calendar__next",
  table: "sk-calendar__table",
  tableHeader: "sk-calendar__table-header",
  tableBody: "sk-calendar__table-body",
  cell: "sk-calendar__cell",
  cellTrigger: "sk-calendar__cell-trigger",
  monthGrid: "sk-calendar__month-grid",
  yearGrid: "sk-calendar__year-grid",
} as const;

/*
 * CALENDAR, the contract — and the shortest template in the repo, for a reason worth stating.
 *
 * Everything a calendar draws is DERIVED: which weeks are in the visible month, which cell is today,
 * which is out of range. None of it is authorable, and none of it is stable — the grid changes by
 * itself as the month turns. So both bindings generate the whole body from the machine (the Svelte
 * enhancer mounts `CalendarView` into the authored root, React renders `CalendarBody`), and what a
 * composition can actually say is the host and its configuration. The template says exactly that,
 * plus the one thing that IS authored content: the label naming the grid.
 *
 * `value` is new to the enhancer. It read `min`, `max` and `selectionMode` and no initial date at
 * all, so authored markup could not express a preselected day — a calendar could only ever open on
 * today, while the React binding accepted a value the other half quietly dropped.
 */
export const calendarContract = {
  id: "calendar",
  css: "@skryensya/core/components/calendar.css",
  parts: calendarParts,

  options: {
    /**
     * The selected date, ISO. Space-separated names both ends of a range. React spells it
     * `defaultValue` — `value` there is the CONTROLLED prop, and emitting it freezes the grid.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    /** Earliest selectable date, ISO. Everything before it renders unavailable. */
    min: { type: "string", attr: "data-min", machineInput: true },
    /** Latest selectable date, ISO. */
    max: { type: "string", attr: "data-max", machineInput: true },
    /** One day, or a start and an end. */
    selectionMode: {
      type: "enum",
      values: ["single", "range"],
      default: "single",
      attr: "data-selection-mode",
      machineInput: true,
    },
    /** Which language names the months and weekdays. */
    locale: { type: "string", default: "es", attr: "data-locale", machineInput: true },
    timeZone: { type: "string", default: "UTC", attr: "data-time-zone", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
  },

  signatures: {
    Calendar: {
      intent: ["pick-a-date-inline", "show-a-month", "no-popover"],
      host: { element: "div" },
      mount: "data-sk-calendar",
      options: ["value", "min", "max", "selectionMode", "locale", "timeZone", "disabled", "readOnly"],
      slots: {
        /** Names the grid. Without it the calendar is a table of numbers with nothing saying what for. */
        label: { accepts: "text" },
      },
      template: {
        element: "div",
        part: "root",
        host: true,
        labelledBySlot: "label",
        children: [
          /* The only authored content. Everything below it is appended by the binding. */
          { element: "p", part: "label", slot: "label", whenGiven: "label" },
        ],
      },
      react: { from: "@skryensya/react/calendar", name: "Calendar" },
    },
  },
} as const satisfies ComponentContract;

export const calendarAttrs = {
  root: "data-sk-calendar",
  label: "data-sk-calendar-label",
  header: "data-sk-calendar-header",
  heading: "data-sk-calendar-heading",
  viewTrigger: "data-sk-calendar-view-trigger",
  previous: "data-sk-calendar-previous",
  next: "data-sk-calendar-next",
  table: "data-sk-calendar-table",
  tableHeader: "data-sk-calendar-table-header",
  tableBody: "data-sk-calendar-table-body",
  cell: "data-sk-calendar-cell",
  cellTrigger: "data-sk-calendar-cell-trigger",
} as const;
