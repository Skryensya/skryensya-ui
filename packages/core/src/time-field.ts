/*
 * TIME FIELD, a segmented editable time input: hour, minute, and AM/PM (12-hour locales) as
 * independently steppable and typeable segments in one accessible group, the shape a native
 * segmented time control already has. No popover, no wheel: an earlier design put a scroll-wheel
 * picker behind a trigger, and it turned out to be neither simpler nor more accessible than
 * building the segments directly — a screen reader user had to learn a bespoke scroll container
 * instead of the `spinbutton` pattern every platform time input already teaches.
 *
 * There is no Zag machine for time (unlike date-picker/combobox), so this file owns the value
 * model and the segment/token logic instead of re-exporting one from `@zag-js/*`.
 */

export const timeFieldParts = {
  root: "sk-time-field",
  label: "sk-time-field__label",
  hint: "sk-time-field__hint",
  control: "sk-time-field__control",
  segment: "sk-time-field__segment",
  literal: "sk-time-field__literal",
  clear: "sk-time-field__clear",
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
 * `undefined` for empty input or anything malformed — callers treat that as "no value", never throw.
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
 * Locale-correct AM/PM strings, read off `Intl` instead of hardcoded — many locales don't spell
 * them "AM"/"PM" (e.g. `es` uses "a. m."/"p. m."). Sampled at 9 and 21 so the same call resolves
 * both, whatever the locale's actual dayPeriod boundaries are.
 */
export function getPeriodLabels(locale: string): { AM: string; PM: string } {
  const label = (hour: number) => {
    // `timeZone: "UTC"` matters here as much as `Date.UTC` on the input: a value is a wall-clock
    // time with no zone of its own, and formatting it through the system's local offset would
    // silently reinterpret — and for a sample within a few hours of midnight, potentially shift
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
 * U+202F is the one kept rather than a plain space: it is what ICU means here — narrow, and
 * non-breaking, so `9:30` never wraps away from `AM` — and picking the typographically correct
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
