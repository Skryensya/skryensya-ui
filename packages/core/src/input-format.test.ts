import { afterEach, describe, expect, it, vi } from "vitest";
import {
  formatInputValue,
  hasInputFormat,
  inputFormatMessage,
  inputFormatMessages,
  inputFormatNames,
  registerInputFormat,
  rutCheckDigit,
  validateEmail,
  validateInputFormat,
  validateRut,
  validateUrl,
  type InputFormatReason,
} from "./input-format.js";

/* The check digit of every fixture below was computed with the algorithm, never copied from a
   website: a literal nobody can verify by eye is a test that proves the code agrees with a typo. */
describe("RUT", () => {
  it("accepts a valid RUT however it was punctuated", () => {
    for (const spelling of ["12.345.678-5", "12345678-5", "123456785", "12.345.678 - 5"]) {
      expect(validateRut(spelling), spelling).toEqual({ ok: true, normalized: "12345678-5" });
    }
  });

  it("accepts a lowercase k and normalizes it", () => {
    expect(validateRut("16.982.133-k")).toEqual({ ok: true, normalized: "16982133-K" });
  });

  it("computes the check digit by modulo 11, including the K and 0 cases", () => {
    expect(rutCheckDigit("12345678")).toBe("5");
    expect(rutCheckDigit("16982133")).toBe("K");
    expect(rutCheckDigit("10000004")).toBe("0");
    expect(rutCheckDigit("7654321")).toBe("6");
  });

  it("rejects a RUT whose check digit does not match, which is the whole point", () => {
    expect(validateRut("12.345.678-4")).toEqual({ ok: false, reason: "check-digit" });
    expect(validateRut("16.982.133-1")).toEqual({ ok: false, reason: "check-digit" });
  });

  it("rejects a number that satisfies modulo 11 but was never issued", () => {
    /* `1-9` and `2-7` are arithmetically consistent and are not RUTs. A validator that checked only
       the arithmetic would pass both, which is the false positive the range bound exists for. */
    expect(rutCheckDigit("1")).toBe("9");
    expect(validateRut("1-9")).toEqual({ ok: false, reason: "shape" });
    expect(rutCheckDigit("2")).toBe("7");
    expect(validateRut("2-7")).toEqual({ ok: false, reason: "shape" });
  });

  it("rejects anything that is not digits and one check character", () => {
    for (const value of ["12.345.678", "abcdefgh-1", "12345678-Z", "123456789012-5", ""]) {
      expect(validateRut(value).ok, value).toBe(false);
    }
  });
});

describe("URL", () => {
  it("accepts a bare domain and normalizes it to https", () => {
    expect(validateUrl("example.com")).toEqual({ ok: true, normalized: "https://example.com/" });
  });

  it("keeps the path, query and an explicit scheme", () => {
    expect(validateUrl("http://example.com/a/b?c=1")).toEqual({
      ok: true,
      normalized: "http://example.com/a/b?c=1",
    });
  });

  it("rejects a URL that parses but names a scheme no browser can follow", () => {
    /* `new URL()` succeeds on all three. Parsing is not validation, which is why the protocol check
       exists as its own step. */
    expect(new URL("foo:bar").protocol).toBe("foo:");
    expect(validateUrl("foo:bar")).toEqual({ ok: false, reason: "protocol" });
    expect(validateUrl("javascript:alert(1)")).toEqual({ ok: false, reason: "protocol" });
    expect(validateUrl("ftp://example.com")).toEqual({ ok: false, reason: "protocol" });
  });

  it("rejects a host that no registry can resolve", () => {
    expect(validateUrl("https://localhost")).toEqual({ ok: false, reason: "host" });
    expect(validateUrl("https://example..com")).toEqual({ ok: false, reason: "host" });
  });

  it("rejects a value with whitespace instead of percent-encoding it", () => {
    /* `new URL()` would have accepted this and escaped the space into the path. */
    expect(validateUrl("https://example.com/a b")).toEqual({ ok: false, reason: "shape" });
    expect(validateUrl("not a url")).toEqual({ ok: false, reason: "shape" });
  });
});

describe("email", () => {
  it("accepts an address and lowercases only the domain", () => {
    expect(validateEmail("Name.Surname@Example.COM")).toEqual({
      ok: true,
      normalized: "Name.Surname@example.com",
    });
  });

  it("rejects a domain with no dot, which the HTML spec's own expression allows", () => {
    expect(validateEmail("someone@localhost")).toEqual({ ok: false, reason: "host" });
  });

  it("rejects anything the platform's own check would reject", () => {
    for (const value of ["someone", "someone@", "@example.com", "a b@example.com"]) {
      expect(validateEmail(value).ok, value).toBe(false);
    }
  });
});

describe("the format dispatcher", () => {
  it("accepts an empty value for every format, because emptiness is required's question", () => {
    for (const format of inputFormatNames) {
      expect(validateInputFormat(format, ""), format).toEqual({ ok: true, normalized: "" });
      expect(validateInputFormat(format, "   "), format).toEqual({ ok: true, normalized: "" });
    }
  });

  it("routes each format to its own validator", () => {
    expect(validateInputFormat("rut", "12.345.678-4").ok).toBe(false);
    expect(validateInputFormat("url", "example.com").ok).toBe(true);
    expect(validateInputFormat("email", "a@b.com").ok).toBe(true);
  });
});

describe("the messages", () => {
  /*
   * ANTI-DRIFT, not decoration: a reason with no sentence is a field that turns red and says
   * nothing. This walks the reasons each validator can actually PRODUCE (by feeding it values that
   * trigger each branch) rather than the reason union, so a format that stops producing one does
   * not keep a dead message and a new branch cannot ship without words.
   */
  const produced: Record<string, readonly string[]> = {
    rut: ["shape", "check-digit"],
    /* Owned by `@skryensya/phone`, worded here. See `inputFormatMessages`' own comment. */
    phone: ["shape", "unknown-prefix", "country"],
    url: ["shape", "protocol", "host"],
    email: ["shape", "host"],
  };

  it("has a sentence for every reason its own validator can return", () => {
    for (const format of inputFormatNames) {
      const declared = Object.keys(inputFormatMessages[format]).sort();
      expect(declared, format).toEqual([...produced[format]].sort());
      for (const reason of produced[format]) {
        expect(inputFormatMessage(format, reason as InputFormatReason), `${format}/${reason}`).not.toBe("");
      }
    }
  });

  it("never leaves a caller without a sentence, even for a reason this format cannot return", () => {
    expect(inputFormatMessage("rut", "protocol")).toBe(inputFormatMessages.rut.shape);
  });
});

describe("the display form", () => {
  it("punctuates a RUT the way the country writes it, at both body lengths", () => {
    expect(formatInputValue("rut", "123456785")).toBe("12.345.678-5");
    expect(formatInputValue("rut", "76543216")).toBe("7.654.321-6");
  });

  it("hands back exactly what it was given when the value is not valid", () => {
    /* Never rewrite what cannot be understood: the person is still typing it. */
    expect(formatInputValue("rut", "12.345")).toBe("12.345");
    expect(formatInputValue("url", "not a url")).toBe("not a url");
  });
});

/*
 * THE SEAM the optional packages plug into. What matters is not that a Map works: it is that a
 * format nobody implemented fails OPEN, because a missing devDependency must never paint a correct
 * value red for the person filling in the form.
 */
describe("the format registry", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not ship a validator for phone, which is a whole metadata table", () => {
    expect(hasInputFormat("rut")).toBe(true);
    expect(hasInputFormat("url")).toBe(true);
    expect(hasInputFormat("email")).toBe(true);
    expect(hasInputFormat("phone")).toBe(false);
  });

  it("accepts anything for an unregistered format, and says so once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    /* Nonsense, and it passes: better an unvalidated field than a red one nobody can clear. */
    expect(validateInputFormat("phone", "not a phone at all")).toEqual({
      ok: true,
      normalized: "not a phone at all",
    });
    validateInputFormat("phone", "+56 9 2345 6789");
    validateInputFormat("phone", "+1 415 555 2671");

    /* Once per format, however many fields are on the page. */
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("@skryensya/phone");
  });

  it("uses a registered validator, and its context, once one is installed", () => {
    const seen: unknown[] = [];
    registerInputFormat("phone", {
      validate: (value, context) => {
        seen.push(context.country);
        return value === "912345678" && context.country === "CL"
          ? { ok: true, normalized: "+56912345678" }
          : { ok: false, reason: "unknown-prefix" };
      },
      display: () => "+56 9 1234 5678",
    });

    expect(hasInputFormat("phone")).toBe(true);
    expect(validateInputFormat("phone", "912345678", { country: "CL" })).toEqual({
      ok: true,
      normalized: "+56912345678",
    });
    expect(validateInputFormat("phone", "912345678", { country: "AR" })).toEqual({
      ok: false,
      reason: "unknown-prefix",
    });
    expect(seen).toEqual(["CL", "AR"]);
    /* A registered `display` wins over the normalized value. */
    expect(formatInputValue("phone", "912345678", { country: "CL" })).toBe("+56 9 1234 5678");
  });
});
