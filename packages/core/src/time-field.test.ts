import { describe, expect, it } from "vitest";
import {
  formatTimeValue,
  getHourCycle,
  getPeriodLabels,
  getTimeFieldTokens,
  parseTimeValue,
  segmentBounds,
  to12Hour,
  to24Hour,
} from "./time-field.js";

/*
 * There is no `@zag-js/time-picker`, so this file owns the value model both bindings run on: what a
 * time string means, how it splits into segments, and what the locale says the field looks like.
 * Everything here is read off `Intl` rather than a hardcoded table of countries.
 */
describe("parseTimeValue", () => {
  it("reads the native HH:mm the platform's own input uses", () => {
    expect(parseTimeValue("09:30")).toEqual({ hour: 9, minute: 30 });
    expect(parseTimeValue("9:30")).toEqual({ hour: 9, minute: 30 });
    expect(parseTimeValue("  23:59  ")).toEqual({ hour: 23, minute: 59 });
    expect(parseTimeValue("00:00")).toEqual({ hour: 0, minute: 0 });
  });

  it("says nothing rather than guessing at anything else", () => {
    // Undefined is "no time", which is what lets an empty field stay empty instead of showing 00:00.
    for (const bad of ["", "  ", "24:00", "12:60", "9", "9:5", "09:30:00", "nueve", null, undefined]) {
      expect(parseTimeValue(bad)).toBeUndefined();
    }
  });
});

describe("formatTimeValue", () => {
  it("pads both halves, because HH:mm is what a form expects to receive", () => {
    expect(formatTimeValue({ hour: 9, minute: 5 })).toBe("09:05");
    expect(formatTimeValue({ hour: 0, minute: 0 })).toBe("00:00");
  });

  it("clamps out-of-range arithmetic instead of emitting an invalid time", () => {
    expect(formatTimeValue({ hour: 30, minute: 90 })).toBe("23:59");
    expect(formatTimeValue({ hour: -1, minute: -1 })).toBe("00:00");
    expect(formatTimeValue({ hour: 9.7, minute: 30.2 })).toBe("09:30");
  });

  it("round-trips whatever parse accepted", () => {
    for (const value of ["00:00", "09:05", "12:00", "23:59"]) {
      expect(formatTimeValue(parseTimeValue(value)!)).toBe(value);
    }
  });
});

describe("getHourCycle", () => {
  it("asks the platform which clock the locale reads", () => {
    expect(getHourCycle("en-US")).toBe("h12");
    expect(getHourCycle("es")).toBe("h24");
    expect(getHourCycle("es-DO")).toBe("h12");
    expect(getHourCycle("de-DE")).toBe("h24");
  });
});

describe("to12Hour / to24Hour", () => {
  it("shows midnight and noon as 12, the way every 12-hour locale expects", () => {
    expect(to12Hour(0)).toEqual({ hour12: 12, period: "AM" });
    expect(to12Hour(12)).toEqual({ hour12: 12, period: "PM" });
  });

  it("splits the day at noon", () => {
    expect(to12Hour(11)).toEqual({ hour12: 11, period: "AM" });
    expect(to12Hour(13)).toEqual({ hour12: 1, period: "PM" });
    expect(to12Hour(23)).toEqual({ hour12: 11, period: "PM" });
  });

  it("puts the hour back exactly where it came from", () => {
    for (let hour = 0; hour < 24; hour++) {
      const { hour12, period } = to12Hour(hour);
      expect(to24Hour(hour12, period)).toBe(hour);
    }
  });
});

describe("getPeriodLabels", () => {
  it("reads AM/PM off the locale rather than hardcoding two English words", () => {
    expect(getPeriodLabels("en-US")).toEqual({ AM: "AM", PM: "PM" });
    // Spanish does not spell them "AM"/"PM", which is exactly why this is not a constant.
    const es = getPeriodLabels("es-DO");
    expect(es.AM).toMatch(/a\.?\s?m\.?/i);
    expect(es.PM).toMatch(/p\.?\s?m\.?/i);
    expect(es.AM).not.toBe(es.PM);
  });
});

describe("getTimeFieldTokens", () => {
  it("derives the field's shape, separators included, from the locale", () => {
    const tokens = getTimeFieldTokens("es", "h24");
    expect(tokens.filter((token) => token.kind === "segment").map((token) => token.type)).toEqual([
      "hour",
      "minute",
    ]);
    expect(tokens.filter((token) => token.kind === "literal").map((token) => token.value)).toEqual([":"]);
  });

  it("adds the day period where the clock has one", () => {
    const tokens = getTimeFieldTokens("en-US", "h12");
    expect(tokens.filter((token) => token.kind === "segment").map((token) => token.type)).toEqual([
      "hour",
      "minute",
      "dayPeriod",
    ]);
  });

  it("keeps a whitespace separator unbreakable, so 9:30 never wraps away from AM", () => {
    const spaces = getTimeFieldTokens("en-US", "h12")
      .filter((token) => token.kind === "literal")
      .map((token) => token.value)
      .filter((value) => value.trim() === "");
    expect(spaces.length).toBeGreaterThan(0);
    // One canonical character, because which space ICU picks is not stable across environments.
    for (const space of spaces) expect(space).toBe(" ");
  });
});

describe("segmentBounds", () => {
  it("bounds the hour by the clock the locale reads", () => {
    // 12-hour hours start at 1: there is no "00" on that clock.
    expect(segmentBounds("hour", "h12")).toEqual({ min: 1, max: 12 });
    expect(segmentBounds("hour", "h24")).toEqual({ min: 0, max: 23 });
  });

  it("gives every segment the same shape, day period included", () => {
    expect(segmentBounds("minute", "h12")).toEqual({ min: 0, max: 59 });
    // AM/PM encoded as 0/1 so one stepping formula serves all three segments.
    expect(segmentBounds("dayPeriod", "h12")).toEqual({ min: 0, max: 1 });
  });
});
