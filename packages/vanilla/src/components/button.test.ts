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
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only aria-label="Close"><svg class="sk-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
    expect(root.getAttribute("type")).toBe("button");
  });

  it("refuses a button that renders nothing at all", () => {
    const root = mount('<button class="sk-button sk-interactive" data-sk-button></button>');

    /* Full size, focusable, clickable, and on `ghost` invisible. The React binding warns on the same
     * shape; here the markup is already in the document, so the enhancer throws. */
    expect(() => mountButton(root)).toThrow(/renders nothing/);
  });

  it("accepts a button whose only content is an icon element", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button aria-label="Close"><svg class="sk-icon" data-icon="close"></svg></button>',
    );

    // An `<svg>` carries no text, and it is still content: the empty check asks for either.
    expect(() => mountButton(root)).not.toThrow();
  });

  it("refuses an icon-only button with no accessible name", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only><svg class="sk-icon" data-icon="close"></svg></button>',
    );

    expect(() => mountButton(root)).toThrow(/accessible name/i);
  });

  it("accepts an icon-only button named by visually-hidden text", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only><svg class="sk-icon" data-icon="close"></svg><span class="sk-visually-hidden">Cerrar</span></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
  });

  /*
   * The same name, in the `post` slot this time. Written down because it is the side of a PARITY
   * that used to hold by accident: this check reads `root.textContent`, so a slot was always
   * included, while React walked `children` only and rejected the same markup. The React binding now
   * walks its slots too, and this test is what says the agreement is deliberate.
   */
  it("accepts a name the author put in a slot rather than beside the icon", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button data-icon-only><svg class="sk-icon" data-icon="close"></svg><span class="sk-button__post"><span class="sk-visually-hidden">Cerrar</span></span></button>',
    );

    expect(() => mountButton(root)).not.toThrow();
  });
});

describe("Button.navigation Vanilla contracts", () => {
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
