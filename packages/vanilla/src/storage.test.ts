import { beforeEach, describe, expect, it, vi } from "vitest";
import { definePreference, oneOf, readStore, STORAGE_KEY } from "@skryensya/core/storage";
import {
  clearAllPreferences,
  clearPreference,
  getPreference,
  resetStorageForTests,
  setPreference,
  subscribePreference,
} from "./storage.js";

const mode = definePreference<"system" | "light" | "dark">({
  slot: "scheme",
  fallback: "system",
  parse: oneOf(["system", "light", "dark"]),
});

const other = definePreference<"a" | "b">({
  slot: "other",
  fallback: "a",
  parse: oneOf(["a", "b"]),
});

const raw = () => localStorage.getItem(STORAGE_KEY);

beforeEach(() => {
  localStorage.clear();
  resetStorageForTests();
});

describe("storage", () => {
  it("round-trips a preference through one shared entry", () => {
    expect(getPreference(mode)).toBe("system");

    setPreference(mode, "dark");

    expect(getPreference(mode)).toBe("dark");
    expect(readStore(raw())).toEqual({ scheme: "dark" });
  });

  it("keeps two preferences in the same entry instead of one key each", () => {
    setPreference(mode, "light");
    setPreference(other, "b");

    expect(readStore(raw())).toEqual({ scheme: "light", other: "b" });
    expect(localStorage.length).toBe(1);
  });

  it("read-modify-writes, so a slot written in between is not clobbered", () => {
    setPreference(mode, "dark");
    // another tab wrote while this one held no state
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "dark", other: "b" }));

    setPreference(mode, "light");

    expect(readStore(raw())).toEqual({ scheme: "light", other: "b" });
  });

  it("falls back on a value the parser rejects, rather than propagating it", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "chartreuse" }));
    expect(getPreference(mode)).toBe("system");
  });

  it("falls back on an unparseable entry", () => {
    localStorage.setItem(STORAGE_KEY, "{ not json");
    expect(getPreference(mode)).toBe("system");
  });

  it("treats a non-object payload as absent, never spreading it into a store", () => {
    // `{...[1,2]}` would produce numeric slots and then write them back.
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2]));
    expect(getPreference(mode)).toBe("system");

    setPreference(mode, "dark");
    expect(readStore(raw())).toEqual({ scheme: "dark" });
  });

  it("clearing forgets the slot instead of storing the current default", () => {
    setPreference(mode, "dark");
    setPreference(other, "b");

    clearPreference(mode);

    expect(getPreference(mode)).toBe("system");
    // the SLOT is gone: a product that changes its default later still reaches this reader
    expect(readStore(raw())).toEqual({ other: "b" });
  });

  it("clears the whole entry in one call", () => {
    setPreference(mode, "dark");
    setPreference(other, "b");

    clearAllPreferences();

    expect(raw()).toBeNull();
    expect(getPreference(mode)).toBe("system");
  });

  describe("when localStorage throws", () => {
    /** Safari private mode and blocked site data throw on ACCESS, they do not return null. */
    function breakStorage(): void {
      resetStorageForTests();
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError");
      });
    }

    it("reads the fallback instead of taking the page down", () => {
      breakStorage();
      expect(() => getPreference(mode)).not.toThrow();
      expect(getPreference(mode)).toBe("system");
      vi.restoreAllMocks();
    });

    it("degrades to memory, so the session still works and only persistence is lost", () => {
      breakStorage();

      expect(() => setPreference(mode, "dark")).not.toThrow();
      expect(getPreference(mode)).toBe("dark");

      vi.restoreAllMocks();
    });
  });

  describe("subscribePreference", () => {
    it("fires immediately with the current value, then on change", () => {
      setPreference(mode, "dark");
      const seen: string[] = [];

      const off = subscribePreference(mode, (value) => seen.push(value));
      expect(seen).toEqual(["dark"]); // no stale first frame

      setPreference(mode, "light");
      expect(seen).toEqual(["dark", "light"]);

      off();
      setPreference(mode, "system");
      expect(seen).toEqual(["dark", "light"]);
    });

    it("ignores a change to a different slot", () => {
      const seen: string[] = [];
      const off = subscribePreference(mode, (value) => seen.push(value));

      setPreference(other, "b");

      expect(seen).toEqual(["system"]);
      off();
    });

    it("does not re-notify when the value did not actually change", () => {
      const seen: string[] = [];
      const off = subscribePreference(mode, (value) => seen.push(value));

      setPreference(mode, "system"); // same as the fallback it already reported

      expect(seen).toEqual(["system"]);
      off();
    });

    it("picks up another tab's write, which is what a bare read never does", () => {
      const seen: string[] = [];
      const off = subscribePreference(mode, (value) => seen.push(value));

      // A second tab wrote: jsdom does not dispatch `storage` for us, so simulate the browser.
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ scheme: "dark" }));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));

      expect(seen).toEqual(["system", "dark"]);
      off();
    });
  });
});
