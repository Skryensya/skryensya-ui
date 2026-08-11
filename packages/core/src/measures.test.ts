import { describe, expect, it } from "vitest";
import { avatarInitials } from "./avatar.js";
import { getCalloutLiveRegion } from "./callout.js";
import { getTwoLetterWeekdayLabel, parseCalendarDate } from "./calendar.js";
import { getToastLiveRegion, hasToastTimeout } from "./content.js";
import { progressFraction } from "./progress.js";
import { sidebarWidthPercent } from "./sidebar.js";
import { sliderFill } from "./slider.js";
import { formatStatCount, statCountFractionDigits } from "./stat.js";
import { colorModeLabel, isColorMode, nextColorMode } from "./theme-toggle.js";

/*
 * The small pure calculations, gathered in one file because each is a handful of lines and they
 * share one property worth pinning: every one of them is called by BOTH bindings, so a difference
 * here would show up as two components that look the same and say different things.
 */

describe("avatarInitials", () => {
  it("takes one letter from each of the first two words", () => {
    expect(avatarInitials("Ada Lovelace")).toBe("AL");
    // Only the first two: a long name must not grow the circle.
    expect(avatarInitials("Ada Byron King Lovelace")).toBe("AB");
  });

  it("takes two letters when there is only one word", () => {
    expect(avatarInitials("ada")).toBe("ad");
    expect(avatarInitials("a")).toBe("a");
  });

  it("keeps the source casing, because the paint is the stylesheet's job", () => {
    expect(avatarInitials("ada lovelace")).toBe("al");
  });

  it("survives whatever whitespace the data arrived with", () => {
    expect(avatarInitials("  Ada   Lovelace  ")).toBe("AL");
    expect(avatarInitials("")).toBe("");
    expect(avatarInitials("   ")).toBe("");
  });
});

describe("progressFraction", () => {
  it("reports the completed share of the maximum", () => {
    expect(progressFraction(25, 100)).toBe(0.25);
    expect(progressFraction(3, 4)).toBe(0.75);
  });

  it("clamps rather than letting a bar overrun its track", () => {
    expect(progressFraction(150, 100)).toBe(1);
    expect(progressFraction(-10, 100)).toBe(0);
  });

  it("answers zero for a range that cannot mean anything", () => {
    // Zero, not NaN: a bad max must paint an empty bar, not an unstyleable one.
    expect(progressFraction(50, 0)).toBe(0);
    expect(progressFraction(50, -1)).toBe(0);
    expect(progressFraction(Number.NaN, 100)).toBe(0);
    expect(progressFraction(50, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("sliderFill", () => {
  it("places the value between the two ends", () => {
    expect(sliderFill(50, 0, 100)).toBe(0.5);
    expect(sliderFill(0, -50, 50)).toBe(0.5);
    expect(sliderFill(10, 10, 20)).toBe(0);
  });

  it("clamps outside the range and refuses an inverted one", () => {
    expect(sliderFill(500, 0, 100)).toBe(1);
    expect(sliderFill(-500, 0, 100)).toBe(0);
    expect(sliderFill(5, 100, 0)).toBe(0);
    expect(sliderFill(5, 10, 10)).toBe(0);
    expect(sliderFill(Number.NaN, 0, 100)).toBe(0);
  });
});

describe("sidebarWidthPercent", () => {
  it("reports where the splitter sits between its bounds, not a raw pixel count", () => {
    // "40%" tells a screen reader something; "208" tells it nothing.
    expect(sidebarWidthPercent(300, 200, 400)).toBe(50);
    expect(sidebarWidthPercent(200, 200, 400)).toBe(0);
    expect(sidebarWidthPercent(400, 200, 400)).toBe(100);
  });

  it("clamps a width that escaped its bounds", () => {
    expect(sidebarWidthPercent(50, 200, 400)).toBe(0);
    expect(sidebarWidthPercent(900, 200, 400)).toBe(100);
  });

  it("says fully open for a degenerate range instead of dividing by zero", () => {
    expect(sidebarWidthPercent(200, 200, 200)).toBe(100);
    expect(sidebarWidthPercent(200, 400, 200)).toBe(100);
  });
});

describe("statCountFractionDigits / formatStatCount", () => {
  it("keeps exactly as many decimals as the target value has", () => {
    // So a count animating to 4.5 does not flicker between 4 and 4.50 on its way there.
    expect(statCountFractionDigits(1234)).toBe(0);
    expect(statCountFractionDigits(4.5)).toBe(1);
    expect(statCountFractionDigits(0.125)).toBe(3);
    expect(statCountFractionDigits(Number.NaN)).toBe(0);
  });

  it("formats for the locale and wraps the affixes around it", () => {
    expect(formatStatCount(1234.5, { locale: "en-US" })).toBe("1,234.5");
    // Five digits, because Spanish does not group a four-digit number at all: the separator each
    // locale uses is exactly the kind of thing neither binding should be deciding for itself.
    expect(formatStatCount(12345.5, { locale: "es-ES" })).toBe("12.345,5");
    expect(formatStatCount(99, { locale: "en-US", suffix: "%" })).toBe("99%");
    expect(formatStatCount(1200, { locale: "en-US", prefix: "$" })).toBe("$1,200");
  });

  it("takes an explicit decimal count over the one it would infer", () => {
    expect(formatStatCount(4, { fractionDigits: 2, locale: "en-US" })).toBe("4.00");
  });
});

describe("live regions", () => {
  it("interrupts only for danger, in both families that announce", () => {
    // Assertive cuts the reader off mid-sentence; anything less urgent waits its turn.
    expect(getToastLiveRegion("danger")).toBe("assertive");
    expect(getToastLiveRegion("success")).toBe("polite");
    expect(getCalloutLiveRegion("danger")).toBe("assertive");
    expect(getCalloutLiveRegion("info")).toBe("polite");
  });
});

describe("hasToastTimeout", () => {
  it("treats only a positive finite number as a timeout", () => {
    expect(hasToastTimeout(4000)).toBe(true);
    // Zero and below mean "stays until dismissed", not "closes instantly".
    expect(hasToastTimeout(0)).toBe(false);
    expect(hasToastTimeout(-1)).toBe(false);
    expect(hasToastTimeout(undefined)).toBe(false);
    expect(hasToastTimeout(Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe("color mode", () => {
  it("cycles through the three modes and comes back round", () => {
    expect(nextColorMode("system")).toBe("light");
    expect(nextColorMode("light")).toBe("dark");
    expect(nextColorMode("dark")).toBe("system");
  });

  it("only recognises the three it has", () => {
    expect(isColorMode("system")).toBe(true);
    expect(isColorMode("Dark")).toBe(false);
    expect(isColorMode(null)).toBe(false);
    expect(isColorMode(undefined)).toBe(false);
  });

  it("lets a consumer relabel a mode without losing the others", () => {
    expect(colorModeLabel("dark", { dark: "Oscuro" })).toBe("Oscuro");
    expect(colorModeLabel("light", { dark: "Oscuro" })).toBe(colorModeLabel("light"));
  });
});

describe("calendar helpers", () => {
  it("parses an authored date attribute and nothing else", () => {
    expect(parseCalendarDate("2024-03-15")?.toString()).toBe("2024-03-15");
    expect(parseCalendarDate(undefined)).toBeUndefined();
    expect(parseCalendarDate(null)).toBeUndefined();
    expect(parseCalendarDate("")).toBeUndefined();
    // Loud, not swallowed: a malformed date in the markup is an authoring error.
    expect(() => parseCalendarDate("15/03/2024")).toThrow();
  });

  it("builds a two-letter weekday the way the locale capitalises it", () => {
    expect(getTwoLetterWeekdayLabel({ long: "domingo", short: "dom" }, "es")).toBe("Do");
    expect(getTwoLetterWeekdayLabel({ long: "miércoles", short: "mié" }, "es")).toBe("Mi");
    expect(getTwoLetterWeekdayLabel({ long: "sábado", short: "sáb" }, "es")).toBe("Sá");
    expect(getTwoLetterWeekdayLabel({ long: "Monday", short: "Mon" }, "en")).toBe("Mo");
  });

  it("falls back to the long name when the short one is a single letter", () => {
    // Several locales abbreviate to one character, and a one-letter column is ambiguous.
    expect(getTwoLetterWeekdayLabel({ long: "lunes", short: "L" }, "es")).toBe("Lu");
  });
});
