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
    const root = mount('<button class="sk-button sk-interactive" data-sk-button>Save</button>');

    expect(mountButton(document)).toBe(1);
    expect(mountButton(document)).toBe(0);
    expect(root.getAttribute("type")).toBe("button");
    expect(root.hasAttribute("data-sk-ready")).toBe(true);
  });

  it("refuses a root without the required interaction class", () => {
    const root = mount('<button class="sk-button" data-sk-button>Save</button>');

    expect(() => mountButton(root)).toThrow(/\.sk-interactive/);
  });

  it("reflects authored disabled state without changing its button semantics", () => {
    const root = mount('<button class="sk-button sk-interactive" data-sk-button disabled type="submit">Save</button>');

    mountButton(root);

    expect(root.getAttribute("type")).toBe("submit");
    expect(root.getAttribute("aria-disabled")).toBe("true");
  });

  it("accepts an icon-only button named by aria-label", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only aria-label="Cerrar"><svg class="sk-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
    expect(root.getAttribute("type")).toBe("button");
  });

  it("refuses an icon-only button with no accessible name", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only><svg class="sk-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).toThrow(/accessible name/i);
  });

  it("accepts an icon-only button named by visually-hidden text", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only><svg class="sk-icon" data-icon="close"></svg><span class="sr-only">Cerrar</span></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
  });
});

describe("ButtonLink Vanilla contracts", () => {
  it("enhances an authored anchor without changing its navigation semantics", () => {
    const root = mount(
      '<a class="sk-button sk-interactive" data-sk-button href="/docs" rel="next">Documentation</a>',
    );

    expect(mountButton(root)).toBe(1);
    expect(root.getAttribute("href")).toBe("/docs");
    expect(root.getAttribute("rel")).toBe("next");
    expect(root.hasAttribute("type")).toBe(false);
  });

  it("refuses an anchor without href", () => {
    const root = mount(
      '<a class="sk-button sk-interactive" data-sk-button>Documentation</a>',
    );

    expect(() => mountButton(root)).toThrow(/expects href/i);
  });

  it("refuses a disabled link that could still navigate", () => {
    const root = mount(
      '<a class="sk-button sk-interactive" data-sk-button href="/docs" aria-disabled="true">Documentation</a>',
    );

    expect(() => mountButton(root)).toThrow(/cannot be disabled/i);
  });
});
