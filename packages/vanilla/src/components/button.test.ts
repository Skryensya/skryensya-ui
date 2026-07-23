import { describe, expect, it } from "vitest";
import { mountButton } from "./button.js";

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  const root = document.body.firstElementChild;
  if (!(root instanceof HTMLElement)) throw new Error("Expected root element.");
  return root;
}

describe("Button Vanilla contracts", () => {
  it("enhances authored buttons with a safe type and idempotent mounting", () => {
    const root = mount('<button class="ds-button" data-ds-button>Save</button>');

    expect(mountButton(document)).toBe(1);
    expect(mountButton(document)).toBe(0);
    expect(root.getAttribute("type")).toBe("button");
    expect(root.hasAttribute("data-ds-ready")).toBe(true);
  });

  it("reflects authored disabled state without changing its button semantics", () => {
    const root = mount('<button class="ds-button" data-ds-button disabled type="submit">Save</button>');

    mountButton(root);

    expect(root.getAttribute("type")).toBe("submit");
    expect(root.getAttribute("aria-disabled")).toBe("true");
  });

  it("accepts an icon-only button named by aria-label", () => {
    const root = mount(
      '<button class="ds-button" data-ds-button data-icon-only aria-label="Cerrar"><svg class="ds-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
    expect(root.getAttribute("type")).toBe("button");
  });

  it("refuses an icon-only button with no accessible name", () => {
    const root = mount(
      '<button class="ds-button" data-ds-button data-icon-only><svg class="ds-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).toThrow(/accessible name/i);
  });

  it("accepts an icon-only button named by visually-hidden text", () => {
    const root = mount(
      '<button class="ds-button" data-ds-button data-icon-only><svg class="ds-icon" data-icon="close"></svg><span class="sr-only">Cerrar</span></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
  });
});
