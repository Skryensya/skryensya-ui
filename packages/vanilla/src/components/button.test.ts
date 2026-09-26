import { describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
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

  it("accepts tactile authored markup without runtime appearance logic", () => {
    const root = mount(
      '<button class="sk-button sk-interactive extra" data-sk-button data-appearance="tactile" data-variant="solid" data-tone="accent">Continue</button>',
    );

    expect(() => mountButton(root)).not.toThrow();
    expect(root.getAttribute("data-appearance")).toBe("tactile");
    expect(root.classList.contains("extra")).toBe(true);
    expect(root.getAttribute("type")).toBe("button");
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

  it("accepts tactile authored navigation markup", () => {
    const root = mount(
      '<a class="sk-button sk-interactive" data-sk-button data-appearance="tactile" href="/docs">Documentation</a>',
    );

    expect(mountButton(root)).toBe(1);
    expect(root.getAttribute("data-appearance")).toBe("tactile");
    expect(root.getAttribute("href")).toBe("/docs");
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

  /*
   * `aria-disabled` is WRITTEN FROM the disabled state, not merely left alone, which means the
   * enhancer removes a stale one as readily as it adds a true one. Authored `aria-disabled="false"`
   * is the case that shows it: the enhancer reads it as not-disabled and then clears the attribute
   * rather than echoing a value a screen reader would announce.
   */
  it("clears an aria-disabled the author left behind on an enabled button", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button aria-disabled="false">Save</button>',
    );

    mountButton(root);

    expect(root.hasAttribute("aria-disabled")).toBe(false);
    expect(root.hasAttribute("disabled")).toBe(false);
  });

  /*
   * THE AT-ONLY PATH. A control that stays focusable and announces itself unavailable carries
   * `aria-disabled` WITHOUT native `disabled`; the enhancer has to read that as disabled too, or a
   * button the author marked unavailable comes back enabled to everything but a screen reader.
   */
  it("treats aria-disabled alone as disabled, without inventing the native attribute", () => {
    const root = mount(
      '<button class="sk-button sk-interactive" data-sk-button aria-disabled="true">Save</button>',
    );

    mountButton(root);

    expect(root.getAttribute("aria-disabled")).toBe("true");
    // Not promoted to the native one: that would take the control out of the tab order, which is the
    // whole thing an `aria-disabled` button is choosing not to do.
    expect(root.hasAttribute("disabled")).toBe(false);
  });

  /*
   * The default `type` exists so a button inside a form is inert unless it says otherwise; it must
   * never overwrite one the author did say. `reset` rather than `submit` because the disabled case
   * above already covers `submit`, and a silent overwrite there would be caught by neither.
   */
  it("never replaces a type the author wrote", () => {
    const root = mount('<button class="sk-button sk-interactive" data-sk-button type="reset">Clear</button>');

    mountButton(root);

    expect(root.getAttribute("type")).toBe("reset");
  });

  /* `aria-labelledby` is the third way to name an icon-only button, beside `aria-label` and real
     text; it is the one that points somewhere else, so the enhancer cannot confirm it resolves. It
     accepts the promise, which is what the other two cases do not prove. */
  it("accepts an icon-only button named by aria-labelledby", () => {
    const root = mount(
      '<div><span id="close-label">Close</span>' +
        '<button class="sk-button sk-interactive" data-sk-button data-icon-only aria-labelledby="close-label">' +
        '<svg class="sk-icon" data-icon="close"></svg></button></div>',
    );
    const button = root.querySelector<HTMLElement>("button");
    if (!button) throw new Error("Expected a button.");

    expect(() => mountButton(button)).not.toThrow();
  });

  /* Mount, tear down, mount again: the enhancer owns no state, so the second mount has to be a real
     one (1, not the 0 an already-ready root returns) and nothing may carry over. */
  it("can be torn down and mounted again", () => {
    const root = mount('<button class="sk-button sk-interactive" data-sk-button>Save</button>');

    expect(mountButton(root)).toBe(1);
    destroyMount(root);
    expect(root.hasAttribute("data-sk-ready")).toBe(false);

    expect(mountButton(root)).toBe(1);
    expect(root.getAttribute("type")).toBe("button");
  });
});
