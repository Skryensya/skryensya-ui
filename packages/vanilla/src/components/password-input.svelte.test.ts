import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountPasswordInput } from "./password-input.js";

/* The exact shape `passwordInputContract`'s template (core/src/password-input.ts) emits. */
function markup(extra = ""): HTMLElement {
  document.body.innerHTML = `<div class="sk-password-input" data-sk-password-input ${extra}>
    <label class="sk-password-input__label" data-sk-password-input-label>Password</label>
    <div class="sk-password-input__control" data-sk-password-input-control>
      <input class="sk-password-input__input" data-sk-password-input-input type="password" name="password" autocomplete="new-password" />
      <button class="sk-password-input__visibility-trigger" data-sk-password-input-trigger type="button"
        aria-label="Mostrar contraseña" data-hide-label="Ocultar contraseña" data-state="hidden" aria-expanded="false">
        <span data-face="show"></span><span data-face="hide"></span>
      </button>
    </div>
  </div>`;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountPasswordInput(document)).toBe(1);
  flushSync();
  return root;
}

const parts = (root: HTMLElement) => ({
  input: root.querySelector<HTMLInputElement>("[data-sk-password-input-input]")!,
  trigger: root.querySelector<HTMLButtonElement>("[data-sk-password-input-trigger]")!,
});

afterEach(() => {
  for (const root of document.querySelectorAll<HTMLElement>("[data-sk-password-input]")) destroyMount(root);
  document.body.innerHTML = "";
});

describe("PasswordInput (vanilla)", () => {
  it("wires the label, keeps the authored autocomplete and names the toggle from the markup", () => {
    const { input, trigger } = parts(markup());
    const label = document.querySelector("label")!;
    expect(label.htmlFor).toBe(input.id);
    expect(input.autocomplete).toBe("new-password");
    expect(trigger.getAttribute("aria-label")).toBe("Mostrar contraseña");
  });

  it("reveals from a pointer and swaps to the authored hide label", () => {
    const { input, trigger } = parts(markup());
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    flushSync();
    expect(input.type).toBe("text");
    expect(trigger.getAttribute("data-state")).toBe("visible");
    expect(trigger.getAttribute("aria-label")).toBe("Ocultar contraseña");
  });

  it("is a tab stop and toggles from the keyboard, like React", () => {
    const { input, trigger } = parts(markup());
    expect(trigger.tabIndex).toBe(0);
    fireEvent.click(trigger, { detail: 0 });
    flushSync();
    expect(input.type).toBe("text");
  });

  it("starts shown with data-default-visible, and dispatches the visibility event", () => {
    const root = markup("data-default-visible");
    const { input, trigger } = parts(root);
    expect(input.type).toBe("text");
    const onDom = vi.fn();
    root.addEventListener("sk:passwordinputvisibilitychange", onDom);
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    flushSync();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({ visible: false });
  });
});
