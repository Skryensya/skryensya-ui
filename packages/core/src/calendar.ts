import { parseDate } from "@internationalized/date";
import type { ComponentContract } from "./contract.js";
import type { DateView, DayTableCellState, IntlTranslations } from "@zag-js/date-picker";

export type { DateValue, DateView, DayTableCellState } from "@zag-js/date-picker";

/*
 * Zag's OWN `defaultTranslations` (`@zag-js/date-picker`) is English-only, unconditionally. Every
 * accessible name it emits (a day cell's state, "switch to previous month", the view-switch button)
 * comes from that object with no locale check at all. Neither binding overrode it, so a Spanish-
 * locale calendar announced "Choose 15 de agosto de 2026" in English while the DATE inside the
 * string was correctly localized: `locale` already drove `DateFormatter`, just nothing else.
 *
 * These fill the same keys with locale-aware text and are the DEFAULT `translations` both bindings
 * pass into the machine; a consumer who wants different wording still overrides the matching prop
 * (`dayLabel`, `viewTriggerLabel`, ...), same as `clearLabel` already works on DatePicker.
 */
const isEnglishLocale = (locale: string) => locale.toLocaleLowerCase().startsWith("en");

export function defaultDayLabel(locale: string) {
  const en = isEnglishLocale(locale);
  return (state: DayTableCellState) => {
    if (state.unavailable)
      return en ? `Not available. ${state.valueText}` : `No disponible. ${state.valueText}`;
    if (state.firstInRange)
      return en
        ? `Starting range from ${state.valueText}`
        : `Inicio del rango desde ${state.valueText}`;
    if (state.lastInRange)
      return en ? `Range ending at ${state.valueText}` : `Fin del rango en ${state.valueText}`;
    if (state.selected)
      return en ? `Selected date. ${state.valueText}` : `Fecha seleccionada. ${state.valueText}`;
    return en ? `Choose ${state.valueText}` : `Elegir ${state.valueText}`;
  };
}

export function defaultViewTriggerLabel(locale: string) {
  const en = isEnglishLocale(locale);
  return (view: DateView) =>
    view === "year"
      ? en
        ? "Switch to month view"
        : "Cambiar a vista de mes"
      : view === "month"
        ? en
          ? "Switch to day view"
          : "Cambiar a vista de día"
        : en
          ? "Switch to year view"
          : "Cambiar a vista de año";
}

export function defaultPrevTriggerLabel(locale: string) {
  const en = isEnglishLocale(locale);
  return (view: DateView) =>
    view === "year"
      ? en
        ? "Switch to previous decade"
        : "Década anterior"
      : view === "month"
        ? en
          ? "Switch to previous year"
          : "Año anterior"
        : en
          ? "Switch to previous month"
          : "Mes anterior";
}

export function defaultNextTriggerLabel(locale: string) {
  const en = isEnglishLocale(locale);
  return (view: DateView) =>
    view === "year"
      ? en
        ? "Switch to next decade"
        : "Década siguiente"
      : view === "month"
        ? en
          ? "Switch to next year"
          : "Año siguiente"
        : en
          ? "Switch to next month"
          : "Mes siguiente";
}

/*
 * `IntlTranslations` requires these five even though neither binding renders what they name: there
 * is no native month/year `<select>` (the heading button steps the view instead, see `CalendarBody`),
 * no date presets, and `clearTrigger`/`placeholder` are always overridden downstream (`clearLabel`,
 * the input's own `placeholder` prop) before anything reaches the DOM. Filling them keeps `translations`
 * a real, fully-typed object instead of a cast, in case a future Zag version starts reading one.
 */
export function unusedIntlTranslations(): Pick<
  IntlTranslations,
  "monthSelect" | "yearSelect" | "presetTrigger" | "clearTrigger" | "placeholder"
> {
  return {
    monthSelect: "Select month",
    yearSelect: "Select year",
    presetTrigger: (value) => `select ${value[0] ?? ""} to ${value[1] ?? ""}`,
    clearTrigger: "Clear selected dates",
    placeholder: () => ({ day: "dd", month: "mm", year: "yyyy" }),
  };
}

const weekdayLetterPattern = /\p{L}\p{M}*/gu;

/*
 * `min`/`max` on the Zag machine are `DateValue` objects, but the vanilla enhancers only have an
 * authored HTML attribute (`data-min="2026-07-01"`) to read. One parse, shared by every enhancer
 * that needs it, rather than each reimplementing the "attribute absent → undefined" branch.
 * Malformed input throws `parseDate`'s own descriptive error, the same "loud, not swallowed"
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
 * CALENDAR, the contract, and the shortest template in the repo, for a reason worth stating.
 *
 * Everything a calendar draws is DERIVED: which weeks are in the visible month, which cell is today,
 * which is out of range. None of it is authorable, and none of it is stable: the grid changes by
 * itself as the month turns. So both bindings generate the whole body from the machine (the Svelte
 * enhancer mounts `CalendarView` into the authored root, React renders `CalendarBody`), and what a
 * composition can actually say is the host and its configuration. The template says exactly that,
 * plus the one thing that IS authored content: the label naming the grid.
 *
 * `value` is new to the enhancer. It read `min`, `max` and `selectionMode` and no initial date at
 * all, so authored markup could not express a preselected day: a calendar could only ever open on
 * today, while the React binding accepted a value the other half quietly dropped.
 */
export const calendarContract = {
  id: "calendar",
  css: "@skryensya/core/components/calendar.css",
  parts: calendarParts,

  options: {
    /**
     * The selected date, ISO. Space-separated names both ends of a range. React spells it
     * `defaultValue`: `value` there is the CONTROLLED prop, and emitting it freezes the grid.
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
