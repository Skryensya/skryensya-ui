import type { ComponentContract } from "./contract.js";

/*
 * TIME FIELD: hour, minute, and AM/PM (12-hour locales) as independently steppable and typeable
 * segments in one accessible group, the shape a native segmented time control already has — PLUS a
 * trigger that opens a plain listbox of preset times, for browsing instead of typing. Both are
 * always present; there is no segments-only variant.
 *
 * Two things this is deliberately NOT, both tried and dropped: a scroll-wheel picker behind a
 * trigger (neither simpler nor more accessible than the segments themselves — a screen reader user
 * had to learn a bespoke scroll container instead of the `spinbutton` pattern every platform time
 * input already teaches), and a SEARCHABLE list, `Combobox`-style (too much machine for a list that
 * is already short, ordered and bounded — every N minutes across one day, never more than a few
 * dozen rows at a sane step; a search box earns its place on an unordered or unbounded collection,
 * not this one). What earned a permanent spot is the plain listbox in between those two: arrow-key
 * navigable, one click to open, one click or Enter to pick, nothing to type unless typing the
 * segments directly is what's wanted.
 *
 * There is no Zag machine for the SEGMENTS (unlike date-picker/combobox) so this file owns that
 * value model and the segment/token logic instead of re-exporting one from `@zag-js/*` — the
 * listbox itself is `@zag-js/select`'s own machine, driven directly by both bindings (their own docs
 * have the reasoning for not using the full `Select` component: it carries its own visible trigger,
 * and nesting one trigger inside another is the exact inefficiency a search box already was).
 */

export const timeFieldParts = {
  root: "sk-time-field",
  label: "sk-time-field__label",
  hint: "sk-time-field__hint",
  control: "sk-time-field__control",
  segment: "sk-time-field__segment",
  literal: "sk-time-field__literal",
  clear: "sk-time-field__clear",
  /**
   * The last child of the control: the picker trigger, always present. Internal placement/query
   * hook, not a public extension point — nothing else ever fills it. `display: contents` in the
   * stylesheet, so it adds no box of its own.
   */
  trailing: "sk-time-field__trailing",
} as const;

export type TimeFieldPart = keyof typeof timeFieldParts;
export type TimeFieldPartClass = (typeof timeFieldParts)[TimeFieldPart];

export const timeFieldAttrs = {
  root: "data-sk-time-field",
  label: "data-sk-time-field-label",
  hint: "data-sk-time-field-hint",
  control: "data-sk-time-field-control",
  segment: "data-sk-time-field-segment",
  clear: "data-sk-time-field-clear",
} as const;

export type TimeFieldValueChangeDetails = { value: string };

/** 24-hour internal representation. The public value is always the native `HH:mm` string. */
export type TimeValue = { hour: number; minute: number };

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

/**
 * Parses the native `HH:mm` value format (same as `<input type="time">`'s `.value`). Returns
 * `undefined` for empty input or anything malformed; callers treat that as "no value", never throw.
 */
export function parseTimeValue(value: string | null | undefined): TimeValue | undefined {
  if (!value) return undefined;
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return undefined;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function formatTimeValue(value: TimeValue): string {
  const hour = String(clampHour(value.hour)).padStart(2, "0");
  const minute = String(clampMinute(value.minute)).padStart(2, "0");
  return `${hour}:${minute}`;
}

function clampHour(hour: number): number {
  return Math.min(Math.max(Math.trunc(hour), 0), 23);
}

function clampMinute(minute: number): number {
  return Math.min(Math.max(Math.trunc(minute), 0), 59);
}

export type HourCycle = "h12" | "h24";
export type Period = "AM" | "PM";

/**
 * Whether the locale reads the clock in 12-hour or 24-hour form, off the platform rather than a
 * hardcoded list of countries. `h11` (midnight = 0) folds into `h12` here: both need a dayPeriod
 * segment, the hour-12 arithmetic below is the only place the 0-vs-12 distinction would matter, and
 * it already normalizes midnight to 12 for display, matching what every 12-hour locale expects.
 */
export function getHourCycle(locale: string): HourCycle {
  const resolved = new Intl.DateTimeFormat(locale, { hour: "numeric" }).resolvedOptions();
  const cycle = resolved.hourCycle ?? (resolved.hour12 ? "h12" : "h24");
  return cycle === "h11" || cycle === "h12" ? "h12" : "h24";
}

/**
 * `hourCycle`'s own resolution: an explicit choice always wins over `Intl`'s locale-based guess.
 * That guess is, in practice, one of the least reliable corners of the Intl API — confirmed against
 * a real browser, not assumed: `es`/`es-AR` resolve to OPPOSITE cycles across Node's own ICU build
 * and this project's Chromium (`h23` vs `h12`), the exact same locale string, two different answers,
 * neither "wrong" by spec, just genuinely inconsistent CLDR data between engines and versions. A
 * segment's own typing behaviour (`typeDigit`'s auto-advance, both bindings) is driven entirely by
 * `segmentBounds`, which reads straight off whatever cycle this function returns — so a guess that
 * lands on `h12` where the author expected `h24` does not just mislabel the hour, it changes how
 * many digits a keystroke waits for, and a single ambiguous first digit (a "2", which could still
 * become "20"–"23") auto-advances a segment early because the wrong MAX made it look unambiguous. A
 * consumer that needs a GUARANTEED cycle (a 24-hour scheduling form, an ops dashboard) cannot depend
 * on the platform's guess landing the same way in every browser; this is the one way out.
 */
export function resolveHourCycle(locale: string, override?: HourCycle): HourCycle {
  return override ?? getHourCycle(locale);
}

export type TimeFieldOption = { readonly value: string; readonly label: string };

/**
 * Every clock time in a day, `stepMinutes` apart, as `{ value, label }` pairs — `value` the
 * canonical `HH:mm` this file already carries everywhere else, `label` formatted in the SAME
 * hour cycle and locale the field itself displays, so an option reads exactly like what typing it
 * by hand would have produced. The shape `@zag-js/select`'s own item collection already expects
 * (`SelectOption` minus `disabled`, `@skryensya/core/select`) — this file does not import that type
 * back, to keep TimeField ignorant of Select the way `core/splitter.ts`'s own banner keeps Table
 * ignorant of Sidebar, but the two are structurally compatible on purpose, so feeding one into the
 * other needs no mapping step. `stepMinutes` is caller-owned and unchecked beyond `> 0`: a step that
 * does not divide 1440 evenly (a 7-minute step, say) still produces a valid, if lopsided, list — the
 * same tolerance `minuteStep` already has for the segmented spinbutton.
 */
export function generateTimeOptions(
  stepMinutes: number,
  locale: string,
  cycle: HourCycle,
): readonly TimeFieldOption[] {
  if (!(stepMinutes > 0)) return [];
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: cycle === "h12",
    timeZone: "UTC",
  });
  const options: TimeFieldOption[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    options.push({
      value: formatTimeValue({ hour, minute }),
      label: formatter.format(new Date(Date.UTC(2000, 0, 1, hour, minute))),
    });
  }
  return options;
}

export function to12Hour(hour24: number): { hour12: number; period: Period } {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

export function to24Hour(hour12: number, period: Period): number {
  const base = hour12 % 12;
  return period === "PM" ? base + 12 : base;
}

/**
 * Locale-correct AM/PM strings, read off `Intl` instead of hardcoded; many locales don't spell
 * them "AM"/"PM" (e.g. `es` uses "a. m."/"p. m."). Sampled at 9 and 21 so the same call resolves
 * both, whatever the locale's actual dayPeriod boundaries are.
 */
export function getPeriodLabels(locale: string): { AM: string; PM: string } {
  const label = (hour: number) => {
    // `timeZone: "UTC"` matters here as much as `Date.UTC` on the input: a value is a wall-clock
    // time with no zone of its own, and formatting it through the system's local offset would
    // silently reinterpret; for a sample within a few hours of midnight, potentially shift
    // into the wrong calendar day and flip which dayPeriod comes back.
    const parts = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      hour12: true,
      timeZone: "UTC",
    }).formatToParts(new Date(Date.UTC(2000, 0, 1, hour)));
    return parts.find((part) => part.type === "dayPeriod")?.value ?? (hour < 12 ? "AM" : "PM");
  };
  return { AM: label(9), PM: label(21) };
}

export type TimeFieldSegmentType = "hour" | "minute" | "dayPeriod";

export type TimeFieldToken =
  | { kind: "segment"; type: TimeFieldSegmentType }
  | { kind: "literal"; value: string };

/**
 * The field's own segment order and separators, read off the platform instead of assumed: some
 * locales put the day period BEFORE the time, not after, and the separator between hour and minute
 * is not always ":". Sampled at a fixed, unambiguous instant (9:05) so only the SHAPE of the format
 * is read, `formatToParts` never returns a segment value from this, each segment's live value is
 * computed separately from the field's actual state.
 */
export function getTimeFieldTokens(locale: string, cycle: HourCycle): readonly TimeFieldToken[] {
  const sample = new Date(Date.UTC(2020, 0, 1, 9, 5));
  const parts = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: cycle === "h12",
    timeZone: "UTC",
  }).formatToParts(sample);

  const tokens: TimeFieldToken[] = [];
  for (const part of parts) {
    if (part.type === "hour" || part.type === "minute" || part.type === "dayPeriod") {
      tokens.push({ kind: "segment", type: part.type });
    } else {
      tokens.push({ kind: "literal", value: normalizeLiteral(part.value) });
    }
  }
  return tokens;
}

/**
 * Collapse a whitespace-only literal to ONE canonical character, because the exact codepoint ICU
 * picks is not stable across environments and this string is rendered.
 *
 * The concrete failure: before `AM`, Node emits U+202F (narrow no-break space) while the browser of
 * the same machine emits U+0020. Under SSR that is a server/client text mismatch, React discards the
 * hydration and re-renders the field from scratch (error #418). It is invisible in `outerHTML`, so
 * it only shows up as a console error and a silently remounted component.
 *
 * U+202F is the one kept rather than a plain space: it is what ICU means here: narrow, and
 * non-breaking, so `9:30` never wraps away from `AM`; picking the typographically correct
 * character costs nothing once the choice has to be made explicitly anyway.
 */
const NARROW_NO_BREAK_SPACE = " ";

function normalizeLiteral(value: string): string {
  return value.trim() === "" && value !== "" ? NARROW_NO_BREAK_SPACE : value;
}

/** Inclusive bounds for a segment's numeric value. `dayPeriod` has none of its own: it toggles
 * between two named values, encoded here as 0 (AM) and 1 (PM) so every segment shares one shape. */
export function segmentBounds(type: TimeFieldSegmentType, cycle: HourCycle): { min: number; max: number } {
  if (type === "hour") return cycle === "h12" ? { min: 1, max: 12 } : { min: 0, max: 23 };
  if (type === "minute") return { min: 0, max: 59 };
  return { min: 0, max: 1 };
}

/**
 * Hour, minute and (in a 12-hour locale) AM/PM, as one `role="group"` of `role="spinbutton"`
 * segments. No popover, no wheel: an earlier design put a scroll picker behind a trigger and it was
 * neither simpler nor more accessible than the segments themselves, which is the primitive every
 * native segmented time control already uses.
 *
 * The unusual part, and why this contract stops where it does: the segments and the separators are
 * DERIVED FROM THE LOCALE, through `Intl.DateTimeFormat.formatToParts`. Some locales put the day
 * period first and the separator is not always ":", so the order is not knowable when the markup is
 * written. Both bindings therefore RENDER the control; this is the CalendarView case, not the
 * enhancer case; what an author writes is the shell: a root, a label, and maybe a hint.
 *
 * The value on the wire is the canonical `HH:mm` on a hidden input, so a form behind this field
 * never parses a locale-formatted string.
 */
export const timeFieldContract = {
  id: "time-field",
  css: "@skryensya/core/components/time-field.css",
  parts: timeFieldParts,

  options: {
    name: { type: "string", attr: "data-name", machineInput: true },
    /** Decides the hour cycle, the segment order and the separators. Not decoration. */
    locale: { type: "string", default: "es", attr: "data-locale", machineInput: true },
    /**
     * Forces the hour segment to 12- or 24-hour form, overriding `getHourCycle`'s own locale-based
     * guess — see `resolveHourCycle`'s own doc for why that guess cannot be trusted to land the same
     * way in every browser. Omitted, the guess stands, unchanged from before this option existed.
     */
    hourCycle: { type: "enum", values: ["h12", "h24"], attr: "data-hour-cycle", machineInput: true },
    /**
     * Where the segments START. Spelled `data-value` in markup (what Vanilla reads off the root) and
     * `defaultValue` in React; same rename Slider makes, for the same reason: React's `value` is
     * controlled, and a usage tree has no change handler to feed it.
     */
    value: { type: "string", attr: "data-value", prop: "defaultValue", machineInput: true },
    /** How far an arrow key moves the minutes. */
    minuteStep: { type: "number", default: 1, attr: "data-minute-step", machineInput: true },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "", machineInput: true },
    readOnly: { type: "boolean", default: false, attr: "data-readonly", trueValue: "", machineInput: true },
    required: { type: "boolean", default: false, attr: "data-required", trueValue: "", machineInput: true },
    /*
     * Each segment is a spinbutton with no visible label of its own, so these ARE their accessible
     * names; "14" announced alone is a number, not an hour.
     */
    hourLabel: { type: "string", default: "Hora", attr: "data-hour-label", machineInput: true },
    minuteLabel: { type: "string", default: "Minuto", attr: "data-minute-label", machineInput: true },
    periodLabel: { type: "string", default: "Periodo", attr: "data-period-label", machineInput: true },
    clearLabel: { type: "string", default: "Limpiar hora", attr: "data-clear-label", machineInput: true },
    /**
     * How far apart the picker's own listbox rows sit, in minutes — every full multiple of it
     * across the day (`generateTimeOptions`, below). Defaults to 30: enough rows to matter (48) and
     * few enough to arrow-key through without scrolling past most of them, the common case for
     * scheduling a meeting or an appointment.
     */
    optionsStep: { type: "number", default: 30, attr: "data-options-step", machineInput: true },
    /** The picker trigger's own accessible name — it opens the listbox, so it needs one distinct
     * from the field's own label (WCAG 2.5.3, the same reasoning SplitButton's own `triggerLabel`
     * states), since the trigger carries no visible text of its own, only an icon. */
    optionsLabel: { type: "string", default: "Elegir de la lista", attr: "data-options-label", machineInput: true },
  },

  signatures: {
    TimeField: {
      intent: ["time-input", "hour-and-minute", "pick-a-time", "schedule-at"],
      host: { element: "div" },
      options: [
        "name",
        "locale",
        "hourCycle",
        "value",
        "minuteStep",
        "disabled",
        "readOnly",
        "required",
        "hourLabel",
        "minuteLabel",
        "periodLabel",
        "clearLabel",
        "optionsStep",
        "optionsLabel",
      ],
      slots: {
        label: { accepts: "text", required: true },
        hint: { accepts: "text" },
      },
      mount: "data-sk-time-field",
      /*
       * The picker's own listbox leaves the field's subtree: React portals it (`Portal`,
       * `@zag-js/react`, to `document.body` by default), while Vanilla keeps it in place, nested
       * inside the root, positioned by CSS anchoring (decision 25) — the same split every other
       * `@zag-js/*`-backed floating panel in this codebase already has (`select.ts`/`combobox.ts`'s
       * own `portals: true`). Declared so the symmetry gate measures ONE subtree, container-scoped,
       * instead of comparing a nested tree against a body-portaled one as if they disagreed.
       */
      portals: true,
      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          /*
           * A span, not a `<label>`: there is no single form control to point at; the group is made
           * of three spinbuttons; the association is `aria-labelledby` from the group, which
           * both bindings write at runtime because they own the ids.
           */
          { element: "span", part: "label", slot: "label" },
          { element: "span", part: "hint", whenGiven: "hint", slot: "hint" },
        ],
      },
      react: { from: "@skryensya/react/time-field", name: "TimeField" },
    },
  },
} as const satisfies ComponentContract;
