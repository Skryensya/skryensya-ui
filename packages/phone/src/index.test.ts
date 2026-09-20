import { validateInputFormat } from "@skryensya/core/input-format";
import { describe, expect, it } from "vitest";
import { displayPhone, registerPhoneFormat, validatePhone } from "./index.js";

/*
 * Every number below was checked against the real metadata before being written down, the same rule
 * `input-format.test.ts` follows for RUT check digits: a fixture nobody verified is a test that
 * proves the code agrees with a guess.
 */
describe("phone validation", () => {
  it("accepts a real number in international form, whatever the country", () => {
    for (const value of [
      "+56 9 2345 6789", // Chile, mobile
      "+56 2 2345 6789", // Chile, Santiago landline
      "+1 415 555 2671", // United States
      "+44 7911 123456", // United Kingdom, mobile
      "+49 30 12345678", // Germany, Berlin
      "+54 11 2345 6789", // Argentina
    ]) {
      expect(validatePhone(value).ok, value).toBe(true);
    }
  });

  it("normalizes every spelling of one number to E.164", () => {
    for (const spelling of ["+56 9 2345 6789", "+56923456789", "+56 (9) 2345-6789"]) {
      expect(validatePhone(spelling), spelling).toEqual({ ok: true, normalized: "+56923456789" });
    }
  });

  it("reads a national number against the field's own country", () => {
    expect(validatePhone("923456789", { country: "CL" })).toEqual({
      ok: true,
      normalized: "+56923456789",
    });
    expect(validatePhone("4155552671", { country: "US" })).toEqual({
      ok: true,
      normalized: "+14155552671",
    });
    /* The same digits, read against a different plan, are not a number there. */
    expect(validatePhone("923456789", { country: "US" }).ok).toBe(false);
  });

  it("rejects a number of the right length whose range was never assigned", () => {
    /*
     * THE CASE THIS WHOLE PACKAGE EXISTS FOR, and the one a hand-written Chilean plan got wrong:
     * nine digits, unmistakably Chilean in shape, and Subtel has never issued the `91x` mobile
     * range. A length check calls it valid. `unknown-prefix` is the metadata saying otherwise.
     */
    expect(validatePhone("+56 9 1234 5678")).toEqual({ ok: false, reason: "unknown-prefix" });
    expect(validatePhone("912345678", { country: "CL" })).toEqual({
      ok: false,
      reason: "unknown-prefix",
    });
    /* And the area code the hand-written list simply missed is a real one. */
    expect(validatePhone("+56 44 234 5678").ok).toBe(true);
  });

  it("reports the FIELD as underspecified when a national number has no country", () => {
    /* Not the value's fault, so not `shape`: there is nothing the person could type to fix it. */
    expect(validatePhone("923456789")).toEqual({ ok: false, reason: "country" });
  });

  it("reports a country code the field got wrong, rather than blaming the value", () => {
    for (const country of ["XX", "CHL", "cl-CL"]) {
      expect(validatePhone("+56923456789", { country }), country).toEqual({
        ok: false,
        reason: "country",
      });
    }
  });

  it("accepts a lowercase country code, because an attribute is text", () => {
    expect(validatePhone("923456789", { country: "cl" })).toEqual({
      ok: true,
      normalized: "+56923456789",
    });
  });

  it("rejects what is not a phone number at all", () => {
    for (const value of ["not a phone", "1", "abcdefghij"]) {
      expect(validatePhone(value, { country: "CL" }), value).toEqual({ ok: false, reason: "shape" });
    }
  });
});

describe("phone display", () => {
  it("prints the country's own international grouping", () => {
    expect(displayPhone("+56923456789")).toBe("+56 9 2345 6789");
    expect(displayPhone("923456789", { country: "CL" })).toBe("+56 9 2345 6789");
    expect(displayPhone("4155552671", { country: "US" })).toBe("+1 415 555 2671");
  });

  it("hands back exactly what it was given when the value does not parse", () => {
    expect(displayPhone("still typing")).toBe("still typing");
    expect(displayPhone("+56 9 1234 5678")).toBe("+56 9 1234 5678");
  });
});

describe("registration", () => {
  it("makes format=\"phone\" work through core once it is called", () => {
    registerPhoneFormat();

    expect(validateInputFormat("phone", "+56 9 2345 6789")).toEqual({
      ok: true,
      normalized: "+56923456789",
    });
    expect(validateInputFormat("phone", "923456789", { country: "CL" })).toEqual({
      ok: true,
      normalized: "+56923456789",
    });
    expect(validateInputFormat("phone", "+56 9 1234 5678")).toEqual({
      ok: false,
      reason: "unknown-prefix",
    });
  });

  it("is idempotent, so a second entry point calling it changes nothing", () => {
    registerPhoneFormat();
    registerPhoneFormat();
    expect(validateInputFormat("phone", "+56 9 2345 6789").ok).toBe(true);
  });

  /* Emptiness stays core's answer, not this package's: an optional field is still optional. */
  it("leaves an empty value to required, the same as every other format", () => {
    registerPhoneFormat();
    expect(validateInputFormat("phone", "")).toEqual({ ok: true, normalized: "" });
  });
});
