import { describe, expect, it } from "vitest";
import {
  isAppearance,
  nextAppearance,
  nextColorMode,
  readAppearance,
  resolveAppearance,
} from "./theme-toggle.js";

describe("color mode cycle", () => {
  it("walks system → light → dark → system", () => {
    expect(nextColorMode("system")).toBe("light");
    expect(nextColorMode("light")).toBe("dark");
    expect(nextColorMode("dark")).toBe("system");
  });
});

describe("appearance", () => {
  it("is only light or dark", () => {
    expect(isAppearance("light")).toBe(true);
    expect(isAppearance("dark")).toBe(true);
    expect(isAppearance("system")).toBe(false);
    expect(isAppearance(undefined)).toBe(false);
  });

  it("toggles light ↔ dark", () => {
    expect(nextAppearance("light")).toBe("dark");
    expect(nextAppearance("dark")).toBe("light");
  });

  it("keeps an explicit appearance and resolves system against the OS", () => {
    expect(resolveAppearance("light", true)).toBe("light");
    expect(resolveAppearance("dark", false)).toBe("dark");
    expect(resolveAppearance("system", true)).toBe("dark");
    expect(resolveAppearance("system", false)).toBe("light");
  });

  it("reads appearance from a root without returning system", () => {
    const root = (scheme: string | null) =>
      ({ getAttribute: (name: string) => (name === "data-scheme" ? scheme : null) }) as HTMLElement;

    expect(readAppearance(root("light"), true)).toBe("light");
    expect(readAppearance(root("system"), true)).toBe("dark");
    expect(readAppearance(root("system"), false)).toBe("light");
    expect(readAppearance(root(null), true)).toBe("dark");
  });
});
