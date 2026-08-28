/*
 * Live React demos for /components/calendar. `Calendar` is the standalone date grid (Zag's
 * date-picker machine configured `inline`), no field or popover: a safe island since its props
 * are primitives/DateValue, no function props cross the boundary.
 */
import { Calendar } from "@skryensya/react/calendar";
import { parseCalendarDate } from "@skryensya/core/calendar";
import { framedIn } from "./framed";

/** Every demo below runs inside its own preview frame. See `framed.tsx`. */
const framed = framedIn("calendar");

export const CalendarBasicDemo = framed(function CalendarBasicDemo() {
  return <Calendar label="Availability" locale="en" />;
});

export const CalendarRangeDemo = framed(function CalendarRangeDemo() {
  return <Calendar label="Stay" locale="en" selectionMode="range" />;
});

/* Anchored to TODAY on every load instead of a fixed date, so the demo never reads as "expired". */
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const todayDate = new Date();
const maxDate = new Date(todayDate);
maxDate.setDate(maxDate.getDate() + 14);

export const CalendarMinMaxDemo = framed(function CalendarMinMaxDemo() {
  const min = parseCalendarDate(isoDate(todayDate));
  const max = parseCalendarDate(isoDate(maxDate));
  return <Calendar label="Availability" locale="en" min={min} max={max} />;
});
