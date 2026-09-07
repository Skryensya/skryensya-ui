import { describe, expect, it } from "vitest";
import { suppressPointerFocusRing } from "./focus-modality.js";

function fireFocusIn(target: HTMLElement) {
  target.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
}

function firePointerDown(target: HTMLElement) {
  target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
}

function fireFocusOut(target: HTMLElement) {
  target.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
}

describe("suppressPointerFocusRing", () => {
  it("marks the target data-focus-pointer when focus is preceded by a pointerdown on it", () => {
    document.body.innerHTML = `<div class="root"><div class="content" tabindex="0"></div></div>`;
    const root = document.querySelector<HTMLElement>(".root")!;
    const content = document.querySelector<HTMLElement>(".content")!;
    suppressPointerFocusRing(root, ".content");

    firePointerDown(content);
    fireFocusIn(content);

    expect(content.hasAttribute("data-focus-pointer")).toBe(true);
  });

  it("does NOT mark the target when focus arrives with no preceding pointerdown (keyboard)", () => {
    document.body.innerHTML = `<div class="root"><div class="content" tabindex="0"></div></div>`;
    const root = document.querySelector<HTMLElement>(".root")!;
    const content = document.querySelector<HTMLElement>(".content")!;
    suppressPointerFocusRing(root, ".content");

    fireFocusIn(content);

    expect(content.hasAttribute("data-focus-pointer")).toBe(false);
  });

  it("clears the marker on focusout, so a later keyboard-triggered focus rings again", () => {
    document.body.innerHTML = `<div class="root"><div class="content" tabindex="0"></div></div>`;
    const root = document.querySelector<HTMLElement>(".root")!;
    const content = document.querySelector<HTMLElement>(".content")!;
    suppressPointerFocusRing(root, ".content");

    firePointerDown(content);
    fireFocusIn(content);
    expect(content.hasAttribute("data-focus-pointer")).toBe(true);

    fireFocusOut(content);
    expect(content.hasAttribute("data-focus-pointer")).toBe(false);

    fireFocusIn(content);
    expect(content.hasAttribute("data-focus-pointer")).toBe(false);
  });

  it("a pointerdown on a DESCENDANT of the target still marks the target itself", () => {
    document.body.innerHTML = `<div class="root"><div class="content" tabindex="0"><p>Hello</p></div></div>`;
    const root = document.querySelector<HTMLElement>(".root")!;
    const content = document.querySelector<HTMLElement>(".content")!;
    const paragraph = document.querySelector<HTMLElement>("p")!;
    suppressPointerFocusRing(root, ".content");

    firePointerDown(paragraph);
    fireFocusIn(content);

    expect(content.hasAttribute("data-focus-pointer")).toBe(true);
  });

  it("stops tracking once the returned cleanup runs", () => {
    document.body.innerHTML = `<div class="root"><div class="content" tabindex="0"></div></div>`;
    const root = document.querySelector<HTMLElement>(".root")!;
    const content = document.querySelector<HTMLElement>(".content")!;
    const stop = suppressPointerFocusRing(root, ".content");
    stop();

    firePointerDown(content);
    fireFocusIn(content);

    expect(content.hasAttribute("data-focus-pointer")).toBe(false);
  });
});
