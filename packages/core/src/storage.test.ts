import { describe, expect, it } from "vitest";
import {
  booleanValue,
  clearPreference,
  definePreference,
  numberValue,
  oneOf,
  patchStore,
  readPreference,
  readStore,
  stringValue,
  writeStore,
  type StorageStore,
} from "./storage.js";

/*
 * The three rules this module exists to hold: one entry for the whole system, a preference is
 * DECLARED with its parser, and reading never fails. The last one is the one worth testing hardest,
 * because the input is a string a reader can edit and a shape a version you shipped last month
 * could have written.
 */
const scheme = definePreference({
  fallback: "system" as "system" | "light" | "dark",
  parse: oneOf(["system", "light", "dark"] as const),
  slot: "scheme",
});

describe("readStore", () => {
  it("parses the one entry into a store", () => {
    expect(readStore('{"scheme":"dark","density":"compact"}')).toEqual({
      density: "compact",
      scheme: "dark",
    });
  });

  it("treats anything that is not an object as absent", () => {
    // `{...null}` is silently `{}` but `{...[1,2]}` is `{0:1,1:2}`, and a store with numeric slots
    // is a corrupted one that would then be written back over the reader's real preferences.
    for (const raw of ["null", "3", "[]", '["a"]', '"texto"']) {
      expect(readStore(raw)).toEqual({});
    }
  });

  it("never throws on garbage or on nothing at all", () => {
    expect(readStore("{no es json")).toEqual({});
    expect(readStore("")).toEqual({});
    expect(readStore(null)).toEqual({});
    expect(readStore(undefined)).toEqual({});
  });

  it("round-trips through writeStore", () => {
    const store: StorageStore = { count: 3, scheme: "dark" };
    expect(readStore(writeStore(store))).toEqual(store);
  });
});

describe("readPreference", () => {
  it("returns the stored value once the parser accepts it", () => {
    expect(readPreference({ scheme: "dark" }, scheme)).toBe("dark");
  });

  it("falls back on anything the parser rejects", () => {
    // A slot that is absent, a value from a version that no longer exists, or a hand-edited one:
    // all three are the same answer, because a preference is a nicety and never a failure.
    expect(readPreference({}, scheme)).toBe("system");
    expect(readPreference({ scheme: "neon" }, scheme)).toBe("system");
    expect(readPreference({ scheme: 3 }, scheme)).toBe("system");
    expect(readPreference({ scheme: null }, scheme)).toBe("system");
  });
});

describe("patchStore / clearPreference", () => {
  it("replaces one slot and leaves the rest of the store alone", () => {
    const store = { density: "compact", scheme: "light" };
    expect(patchStore(store, scheme, "dark")).toEqual({ density: "compact", scheme: "dark" });
  });

  it("does not mutate the store it was handed", () => {
    // Read-modify-write over the whole object is what keeps a second tab's write from being
    // clobbered; mutating in place would defeat that.
    const store = { scheme: "light" };
    patchStore(store, scheme, "dark");
    clearPreference(store, scheme);
    expect(store).toEqual({ scheme: "light" });
  });

  it("removes the slot instead of storing the default in it", () => {
    expect(clearPreference({ density: "compact", scheme: "dark" }, scheme)).toEqual({
      density: "compact",
    });
    expect(readPreference(clearPreference({ scheme: "dark" }, scheme), scheme)).toBe("system");
  });
});

describe("parse helpers", () => {
  it("oneOf accepts only what the closed set names", () => {
    const parse = oneOf(["vanilla", "react"] as const);
    expect(parse("react")).toBe("react");
    expect(parse("React")).toBeUndefined();
    expect(parse("svelte")).toBeUndefined();
    expect(parse(3)).toBeUndefined();
  });

  it("stringValue caps the length, because a store is untrusted input", () => {
    expect(stringValue(4)("abcd")).toBe("abcd");
    expect(stringValue(4)("abcde")).toBeUndefined();
    expect(stringValue()(3)).toBeUndefined();
  });

  it("booleanValue refuses the strings that look like booleans", () => {
    expect(booleanValue()(true)).toBe(true);
    expect(booleanValue()(false)).toBe(false);
    expect(booleanValue()("true")).toBeUndefined();
  });

  it("numberValue rejects out of range at PARSE time, not with a later clamp", () => {
    // A width of -1 or 1e9 restored from a hand-edited store would otherwise be written straight
    // onto an element, leaving a layout the reader cannot undo without clearing storage.
    const parse = numberValue(0, 10000);
    expect(parse(320)).toBe(320);
    expect(parse(-1)).toBeUndefined();
    expect(parse(1e9)).toBeUndefined();
    expect(parse(Number.NaN)).toBeUndefined();
    expect(parse(Number.POSITIVE_INFINITY)).toBeUndefined();
    expect(parse("320")).toBeUndefined();
  });

  it("numberValue is unbounded when nobody said otherwise", () => {
    expect(numberValue()(-5)).toBe(-5);
  });
});
