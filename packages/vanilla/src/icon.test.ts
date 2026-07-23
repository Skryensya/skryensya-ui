import type { IconSet } from "@skryensya/core/icon";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountIcons } from "./icon.js";

// A minimal stand-in set, mountIcons only reads viewBox/attrs/body, so two roles are enough.
const set = {
  "arrow-up": {
    viewBox: "0 0 24 24",
    attrs: { fill: "none", stroke: "currentColor", "stroke-width": "2" },
    body: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>`,
  },
  close: { viewBox: "0 0 24 24", body: `<path d="M6 6 18 18"/>` },
} as unknown as IconSet;

const mount = (html: string) => {
  document.body.innerHTML = html;
  const count = mountIcons(document.body, set);
  return { count, icon: document.body.querySelector("svg") };
};

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe("mountIcons", () => {
  it("replaces a placeholder with the bound set's svg", () => {
    const { count, icon } = mount(`<span data-ds-icon="arrow-up"></span>`);

    expect(count).toBe(1);
    expect(document.body.querySelector("[data-ds-icon]")).toBeNull(); // the placeholder is gone
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute("class")).toBe("ds-icon");
    expect(icon!.getAttribute("data-icon")).toBe("arrow-up");
    expect(icon!.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(icon!.getAttribute("stroke")).toBe("currentColor"); // set's presentation attrs
    expect(icon!.getAttribute("aria-hidden")).toBe("true"); // decorative by default
    expect(icon!.getAttribute("focusable")).toBe("false");
    expect(icon!.childElementCount).toBeGreaterThan(0); // the set's geometry got inserted
  });

  it("preserves the author's extra classes, always keeping ds-icon", () => {
    const { icon } = mount(`<span data-ds-icon="arrow-up" class="text-up"></span>`);
    expect(icon!.getAttribute("class")).toBe("ds-icon text-up");
  });

  it("carries the author's other attributes (style, id) onto the svg", () => {
    const { icon } = mount(`<span data-ds-icon="arrow-up" id="up" style="color: green" title="Sube"></span>`);
    expect(icon!.getAttribute("id")).toBe("up");
    expect(icon!.getAttribute("style")).toContain("green");
    expect(icon!.getAttribute("title")).toBe("Sube");
    // control attrs never leak onto the result
    expect(icon!.hasAttribute("data-ds-icon")).toBe(false);
  });

  it("maps data-ds-icon-size to data-size", () => {
    const { icon } = mount(`<span data-ds-icon="close" data-ds-icon-size="sm"></span>`);
    expect(icon!.getAttribute("data-size")).toBe("sm");
  });

  it("a label makes it content: role=img + aria-label, no aria-hidden", () => {
    const { icon } = mount(`<span data-ds-icon="close" data-ds-icon-label="Cerrar"></span>`);
    expect(icon!.getAttribute("role")).toBe("img");
    expect(icon!.getAttribute("aria-label")).toBe("Cerrar");
    expect(icon!.hasAttribute("aria-hidden")).toBe(false);
  });

  it("leaves an unknown role intact and warns once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    document.body.innerHTML = `<span data-ds-icon="warehouse"></span><span data-ds-icon="warehouse"></span>`;

    const count = mountIcons(document.body, set);

    expect(count).toBe(0);
    expect(document.body.querySelectorAll("[data-ds-icon]").length).toBe(2); // untouched
    expect(warn).toHaveBeenCalledTimes(1); // once per name, not per node
  });

  it("hydrates the root element itself when it is a placeholder", () => {
    const el = document.createElement("span");
    el.setAttribute("data-ds-icon", "arrow-up");
    document.body.appendChild(el);

    expect(mountIcons(el, set)).toBe(1);
    expect(document.body.querySelector("svg[data-icon='arrow-up']")).not.toBeNull();
  });

  it("is idempotent, a second pass finds no placeholders", () => {
    document.body.innerHTML = `<span data-ds-icon="arrow-up"></span>`;
    expect(mountIcons(document.body, set)).toBe(1);
    expect(mountIcons(document.body, set)).toBe(0);
  });
});
