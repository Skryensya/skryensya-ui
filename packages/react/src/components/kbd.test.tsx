import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "./kbd.js";

describe("Kbd", () => {
  it("renders a native <kbd> carrying the part class", () => {
    const ui = render(<Kbd>⌘K</Kbd>);
    const el = ui.container.querySelector("kbd");
    expect(el).not.toBeNull();
    expect(el?.classList.contains("sk-kbd")).toBe(true);
    expect(el?.textContent).toBe("⌘K");
  });

  it("keeps a consumer className alongside the part", () => {
    const ui = render(<Kbd className="mine">Esc</Kbd>);
    const el = ui.container.querySelector("kbd")!;
    expect(el.classList.contains("sk-kbd")).toBe(true);
    expect(el.classList.contains("mine")).toBe(true);
  });

  it("passes through native attributes", () => {
    const ui = render(<Kbd aria-hidden="true">↵</Kbd>);
    expect(ui.container.querySelector("kbd")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("defaults to the neutral tone and opts into accent", () => {
    const rest = render(<Kbd>K</Kbd>);
    expect(rest.container.querySelector("kbd")?.getAttribute("data-tone")).toBe("neutral");

    const accent = render(<Kbd tone="accent">K</Kbd>);
    expect(accent.container.querySelector("kbd")?.getAttribute("data-tone")).toBe("accent");
  });
});
