import {
  registerInputFormat,
  type InputFormatContext,
  type InputFormatResult,
} from "@skryensya/core/input-format";
import {
  isSupportedCountry,
  ParseError,
  parsePhoneNumberWithError,
  type CountryCode,
} from "libphonenumber-js/max";

/*
 * PHONE NUMBERS, for every country, as an `@skryensya/core` input format.
 *
 * WHY THIS IS A PACKAGE OF ITS OWN and not four more functions in `core/input-format.ts`: a phone
 * number can only be checked against a numbering plan, and the plans are data. The metadata this
 * imports is about 155 kB, which is larger than the rest of the kit's validation put together and
 * is pure cost to the consumer validating a RUT and an email. So `@skryensya/core` declares the
 * `phone` format and ships no validator for it, and a page that wants one installs this and calls
 * `registerPhoneFormat()`. Same shape, and the same reason, as `@skryensya/editor` being an
 * optional peer that `runtime/registry.ts` refuses to even name.
 *
 * `/max` AND NOT `/min`, which is the one choice here worth defending, because `/min` is half the
 * size. Measured against this package's own metadata: `/min` accepts `+56 30 123 4567`, whose area
 * code does not exist in Chile, because `/min` only checks LENGTH. That is precisely the
 * "looks like one" bar that the `format` option exists to clear, so the smaller table would have
 * bought back the problem it was added to solve. `/mobile` was not considered: a phone field on a
 * form takes landlines too.
 *
 * SUBSETTING IS AVAILABLE and deliberately not done here. libphonenumber-js can generate metadata
 * for a chosen set of countries, which for a form that only ever serves two or three would be a
 * fraction of the size. This package is the "every country" answer; a consumer who needs the small
 * one builds custom metadata and registers its own validator through the same seam this one uses.
 */

/** What this validator needs the field to have told it. */
type PhoneContext = InputFormatContext;

/**
 * Validates a phone number against its country's real numbering plan.
 *
 * A value starting with `+` carries its own country and needs no context. A national-format number
 * (`923456789`) is read against `context.country`, and reported as `country` rather than as
 * malformed when there is none: the field is what is underspecified, not what the person typed.
 */
export function validatePhone(value: string, context: PhoneContext = {}): InputFormatResult {
  const trimmed = value.trim();
  const country = context.country?.toUpperCase();

  /*
   * Checked before parsing so that a typo in the FIELD's own configuration ("cl", "CHL", "XX") is
   * reported as the field's problem. Left to the parser it would come back as `INVALID_COUNTRY`,
   * indistinguishable from a national number that simply had no country to be read against.
   */
  if (country !== undefined && !isSupportedCountry(country)) return { ok: false, reason: "country" };

  try {
    const parsed = parsePhoneNumberWithError(trimmed, country as CountryCode | undefined);
    if (parsed.isValid()) return { ok: true, normalized: parsed.number };

    /*
     * The distinction that makes this worth a metadata table. `isPossible()` means the digits are
     * the right COUNT for that country, which is all a length check can ever say; reaching here
     * with it true means the number is the right size and its prefix is assigned to nobody. That is
     * `+56 9 1234 5678`: nine digits, unmistakably Chilean in shape, and the `91x` mobile range has
     * never been issued.
     */
    return { ok: false, reason: parsed.isPossible() ? "unknown-prefix" : "shape" };
  } catch (error) {
    if (!(error instanceof ParseError)) throw error;
    /* `NOT_A_NUMBER`, `TOO_SHORT`, `TOO_LONG` are all the value's shape. `INVALID_COUNTRY` here
       means a national number arrived with no country to read it against. */
    return { ok: false, reason: error.message === "INVALID_COUNTRY" ? "country" : "shape" };
  }
}

/**
 * The display form: the country's own international grouping, `+56 9 2345 6789`.
 *
 * International rather than national even when a country is set, because a field that accepted
 * `+56` and `923456789` alike should not print the two differently. Returns the input untouched
 * when it does not parse, for the same reason nothing else here rewrites what it cannot understand.
 */
export function displayPhone(value: string, context: PhoneContext = {}): string {
  const country = context.country?.toUpperCase();
  if (country !== undefined && !isSupportedCountry(country)) return value;
  try {
    const parsed = parsePhoneNumberWithError(value.trim(), country as CountryCode | undefined);
    return parsed.isValid() ? parsed.formatInternational() : value;
  } catch {
    return value;
  }
}

/**
 * Installs the phone validator into `@skryensya/core`, making `format="phone"` work in both bindings.
 *
 * Call it ONCE, at application startup, before any field mounts. An explicit call rather than an
 * import with a side effect: a side-effect-only module is the first thing an aggressive bundler
 * drops, and the failure would be a field that silently stopped validating. Idempotent, so a second
 * call from a second entry point is harmless.
 */
export function registerPhoneFormat(): void {
  registerInputFormat("phone", { validate: validatePhone, display: displayPhone });
}
