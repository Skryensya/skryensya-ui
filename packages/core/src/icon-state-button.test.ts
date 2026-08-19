import { describe, expect, it } from "vitest";
import { getIconState, setIconState } from "./icon-state-button.js";

function fakeElement() {
  const attrs = new Map<string, string>();
  return {
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    removeAttribute: (name: string) => attrs.delete(name),
    getAttribute: (name: string) => attrs.get(name) ?? null,
  } as unknown as HTMLElement;
}

describe("setIconState / getIconState", () => {
  it("writes the value and, when given, the accessible name", () => {
    const root = fakeElement();
    setIconState(root, "data-scheme", "dark", "Color mode: dark");
    expect(getIconState(root, "data-scheme")).toBe("dark");
    expect(root.getAttribute("aria-label")).toBe("Color mode: dark");
  });

  it("removes the attribute when the value is undefined, idle rather than a written state", () => {
    const root = fakeElement();
    setIconState(root, "data-current", "copied");
    setIconState(root, "data-current", undefined, "Copy");
    expect(getIconState(root, "data-current")).toBeNull();
    expect(root.getAttribute("aria-label")).toBe("Copy");
  });

  it("leaves aria-label untouched when none is given", () => {
    const root = fakeElement();
    root.setAttribute("aria-label", "kept");
    setIconState(root, "data-scheme", "light");
    expect(root.getAttribute("aria-label")).toBe("kept");
  });
});
