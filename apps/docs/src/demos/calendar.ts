import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * The three calendar demos, from the contract published for it.
 *
 * The authored HTML on both pages drew `<div class="sk-calendar" data-sk-calendar>` with NO label
 * while the React half passed `label="Disponibilidad"`, one demo documenting two components, which
 * is the whole reason these moved here.
 *
 * `demo.calendar.locale` is a BCP-47 tag rather than a word, and it is still a translated key: it is
 * the one option on this component that genuinely differs per language, and a Spanish page showing
 * an English month header would be the demo contradicting the page around it.
 */

/** Anchored to TODAY rather than a fixed date, so the range demo never reads as expired. */
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/*
 * After the enhancer mounts, the header and day grid exist to be named. The specimen is inert so
 * nothing here is a control; the live demos below are.
 *
 * Day view: every part that exists once the machine has painted a month. `heading` is published in
 * `calendarParts` but never applied in the DOM (the month name is the view-trigger's own text).
 * Month and year views are separate frozen diagrams below: the contract has no `defaultView`, so a
 * live Calendar always opens on day and cannot be held on the climbed grids inside an inert frame.
 *
 * SIDES: the header's three controls share one row, so previous and the header itself read from
 * inline-start while view-trigger and next read from inline-end. The table stack (table → header →
 * body → cell → cell-trigger) alternates gutters the same way Table's anatomy does, so leaders do
 * not all land on one edge.
 *
 * CELL / TRIGGER aim at TODAY (`[data-today]`), not the first cell in the grid: the part is the same
 * on every day, and the day that already carries the today outline is the one worth ringing.
 */
export const calendarAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("calendar.anatomyLabel"), inert: true },
  slots: {
    subject: calendarTree(t),
    items: [
      namePart(".sk-calendar", "block-start", { ringPlacement: "offset", ringDistance: 6 }),
      namePart(".sk-calendar__label", "block-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-calendar__header", "inline-start"),
      namePart(".sk-calendar__previous", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-calendar__view-trigger", "inline-end"),
      namePart(".sk-calendar__next", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-calendar__table", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-calendar__table-header", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-calendar__table-body", "inline-start"),
      {
        options: {
          for: ".sk-calendar__cell:has([data-today])",
          side: "block-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-calendar__cell" },
      },
      {
        options: {
          for: ".sk-calendar__cell-trigger[data-today]",
          side: "inline-end",
          ringPlacement: "offset",
          ringDistance: 2,
        },
        slots: { children: "sk-calendar__cell-trigger" },
      },
    ],
  },
});

/*
 * MONTH / YEAR ANATOMY: frozen open markup, same reason Menu and Popover freeze theirs.
 *
 * A live Calendar always mounts on day view (no `defaultView` on the contract), and an inert
 * specimen cannot click the view-trigger to climb. So the month and year grids are authored as the
 * emitter would paint them (header + `sk-calendar__table` carrying the modifier class), with no
 * `data-sk-calendar` so `initComponents` never replaces the body. Part classes and button attrs match
 * `CalendarView.svelte`; labels are locale-aware via `Intl`.
 *
 * `sk-calendar__month-grid` / `sk-calendar__year-grid` sit on the SAME node as `sk-calendar__table`
 * (modifier hooks, see the contract notes). The diagram names the modifier: that is the part that
 * appears only in that view. Naming both would put two rings on one box.
 */

const ghostAttrs =
  'type="button" tabindex="-1" data-variant="ghost" data-tone="neutral" data-size="sm"';
const iconBtn = (part: string): string =>
  `<button class="${part} sk-button sk-interactive" ${ghostAttrs} data-icon-only>`;
const textBtn = (part: string): string =>
  `<button class="${part} sk-button sk-interactive" ${ghostAttrs}>`;

const calendarHeader = (heading: string): string => `<div class="sk-calendar__header">
  ${iconBtn("sk-calendar__previous")}
    <span aria-hidden="true"><span data-sk-icon="chevron-left" data-sk-icon-size="sm"></span></span>
  </button>
  ${textBtn("sk-calendar__view-trigger")}
    ${heading}
    <span aria-hidden="true"><span data-sk-icon="chevron-down" data-sk-icon-size="sm"></span></span>
  </button>
  ${iconBtn("sk-calendar__next")}
    <span aria-hidden="true"><span data-sk-icon="chevron-right" data-sk-icon-size="sm"></span></span>
  </button>
</div>`;

const gridCell = (label: string): string => `<td class="sk-calendar__cell">
  ${textBtn("sk-calendar__cell-trigger")}${label}</button>
</td>`;

const gridRows = (labels: readonly string[], columns: number): string => {
  const rows: string[] = [];
  for (let i = 0; i < labels.length; i += columns) {
    rows.push(`<tr>${labels.slice(i, i + columns).map(gridCell).join("")}</tr>`);
  }
  return rows.join("");
};

/** Twelve short month names in the demo's BCP-47 locale (same source the live grid uses). */
const shortMonths = (locale: string): string[] =>
  Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, month, 1)),
    ),
  );

/** A decade padded to a 4×3 grid, matching Zag's `getYearsGrid({ columns: 4 })` shape. */
const decadeYears = (start = 2020): string[] =>
  Array.from({ length: 12 }, (_, i) => String(start - 1 + i));

const annotationLabel = (target: string, side: string, text: string, extra = ""): string =>
  `<span class="sk-annotation" data-for="${target}" data-side="${side}" data-match="first"${extra} tabindex="0">${text}</span>`;

const wrapAnnotated = (opts: {
  label: string;
  specimen: string;
  parts: readonly { for: string; side: string; text: string; extra?: string }[];
}): string => `<div
  class="sk-annotated"
  data-sk-annotated
  aria-label="${opts.label}"
  data-ring-placement="inset"
  data-ring-distance="2"
  role="group"
>
  <div class="sk-annotated__subject" inert>
    ${opts.specimen}
  </div>
  ${opts.parts.map((part) => annotationLabel(part.for, part.side, part.text, part.extra ?? "")).join("\n  ")}
  <svg class="sk-annotated__leaders" aria-hidden="true" focusable="false"></svg>
</div>`;

/** Month view: the climbed grid where `sk-calendar__month-grid` is the part that only exists here. */
export const calendarMonthAnatomyHtml = (t: Translate): string => {
  const locale = t("demo.calendar.locale");
  const months = shortMonths(locale);
  const specimen = `<div class="sk-calendar">
  <p class="sk-calendar__label">${t("demo.calendar.availability")}</p>
  ${calendarHeader("2026")}
  <table class="sk-calendar__table sk-calendar__month-grid" role="grid">
    <tbody class="sk-calendar__table-body">
      ${gridRows(months, 4)}
    </tbody>
  </table>
</div>`;

  return wrapAnnotated({
    label: t("calendar.anatomyMonthLabel"),
    specimen,
    parts: [
      { for: ".sk-calendar", side: "block-start", text: "sk-calendar", extra: ' data-ring-placement="offset" data-ring-distance="6"' },
      { for: ".sk-calendar__header", side: "inline-start", text: "sk-calendar__header" },
      { for: ".sk-calendar__view-trigger", side: "inline-end", text: "sk-calendar__view-trigger" },
      {
        for: ".sk-calendar__month-grid",
        side: "inline-start",
        text: "sk-calendar__month-grid",
        extra: ' data-ring-placement="offset" data-ring-distance="4"',
      },
      { for: ".sk-calendar__table-body", side: "inline-end", text: "sk-calendar__table-body" },
      {
        for: ".sk-calendar__cell",
        side: "block-end",
        text: "sk-calendar__cell",
        extra: ' data-ring-placement="offset" data-ring-distance="2"',
      },
      {
        for: ".sk-calendar__cell-trigger",
        side: "inline-end",
        text: "sk-calendar__cell-trigger",
        extra: ' data-ring-placement="offset" data-ring-distance="2"',
      },
    ],
  });
};

/** Year / decade view: same shape, `sk-calendar__year-grid` is the view-only modifier. */
export const calendarYearAnatomyHtml = (t: Translate): string => {
  const years = decadeYears(2020);
  const specimen = `<div class="sk-calendar">
  <p class="sk-calendar__label">${t("demo.calendar.availability")}</p>
  ${calendarHeader("2020–2029")}
  <table class="sk-calendar__table sk-calendar__year-grid" role="grid">
    <tbody class="sk-calendar__table-body">
      ${gridRows(years, 4)}
    </tbody>
  </table>
</div>`;

  return wrapAnnotated({
    label: t("calendar.anatomyYearLabel"),
    specimen,
    parts: [
      { for: ".sk-calendar", side: "block-start", text: "sk-calendar", extra: ' data-ring-placement="offset" data-ring-distance="6"' },
      { for: ".sk-calendar__header", side: "inline-start", text: "sk-calendar__header" },
      { for: ".sk-calendar__view-trigger", side: "inline-end", text: "sk-calendar__view-trigger" },
      {
        for: ".sk-calendar__year-grid",
        side: "inline-start",
        text: "sk-calendar__year-grid",
        extra: ' data-ring-placement="offset" data-ring-distance="4"',
      },
      { for: ".sk-calendar__table-body", side: "inline-end", text: "sk-calendar__table-body" },
      {
        for: ".sk-calendar__cell",
        side: "block-end",
        text: "sk-calendar__cell",
        extra: ' data-ring-placement="offset" data-ring-distance="2"',
      },
      {
        for: ".sk-calendar__cell-trigger",
        side: "inline-end",
        text: "sk-calendar__cell-trigger",
        extra: ' data-ring-placement="offset" data-ring-distance="2"',
      },
    ],
  });
};

export const calendarTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale") },
  slots: { label: t("demo.calendar.availability") },
});

export const calendarRangeTree = (t: Translate): UsageTree => ({
  contract: "calendar",
  signature: "Calendar",
  options: { locale: t("demo.calendar.locale"), selectionMode: "range" },
  slots: { label: t("demo.calendar.stay") },
});

export const calendarMinMaxTree = (t: Translate): UsageTree => {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 14);

  return {
    contract: "calendar",
    signature: "Calendar",
    options: {
      locale: t("demo.calendar.locale"),
      min: isoDate(today),
      max: isoDate(max),
    },
    slots: { label: t("demo.calendar.availability") },
  };
};
