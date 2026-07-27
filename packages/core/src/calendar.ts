export type { DateValue, DateView } from "@zag-js/date-picker";

const weekdayLetterPattern = /\p{L}\p{M}*/gu;

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
