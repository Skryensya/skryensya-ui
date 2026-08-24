import { fireEvent } from "@testing-library/dom";
import { flushSync } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountNumberField } from "./number-field.js";

/*
 * The exact shape `numberFieldContract`'s template (core/src/number-field.ts) emits: a labelled
 * root, decrement/input/increment inside a control row. `value` is the HTML attribute the
 * contract's `defaultValue` option maps to: `NumberField.svelte` reads it off `input.defaultValue`
 * (the attribute mirror), never the live `.value`.
 */
function markup({ value = "5", min = "0", max = "10", step = "1", disabled = false } = {}): HTMLElement {
  document.body.innerHTML = `<div data-sk-number-field>
    <label data-sk-number-field-label>Quantity</label>
    <div data-sk-number-field-control>
      <button data-sk-number-field-decrement type="button" aria-label="Disminuir">
        <span data-sk-icon="remove"></span>
      </button>
      <input
        data-sk-number-field-input
        type="text"
        inputmode="decimal"
        value="${value}"
        min="${min}"
        max="${max}"
        step="${step}"
        ${disabled ? "disabled" : ""}
      />
      <button data-sk-number-field-increment type="button" aria-label="Aumentar">
        <span data-sk-icon="add"></span>
      </button>
    </div>
  </div>`;
  const root = document.body.firstElementChild as HTMLElement;
  expect(mountNumberField(document)).toBe(1);
  flushSync();
  return root;
}

const parts = (root: HTMLElement) => ({
  input: root.querySelector<HTMLInputElement>("[data-sk-number-field-input]")!,
  decrement: root.querySelector<HTMLButtonElement>("[data-sk-number-field-decrement]")!,
  increment: root.querySelector<HTMLButtonElement>("[data-sk-number-field-increment]")!,
});

/*
 * `@zag-js/number-input`'s triggers are a press-and-hold spinner, not a plain click: `getIncrement/
 * DecrementTriggerProps()` wire only `onPointerDown`/`onPointerUp`/`onPointerLeave`, no `onClick` at
 * all (checked against the installed `@zag-js/number-input` source). A `fireEvent.click` never
 * reaches them; `isLeftClick(event)` also requires `button: 0` explicitly, since jsdom's synthetic
 * PointerEvent leaves `button` undefined by default.
 */
const press = (trigger: HTMLButtonElement) => {
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
};

/*
 * `@zag-js/svelte`'s own `normalizeProps` (`normalize-props.js`'s `propMap`) remaps `onFocus`/
 * `onBlur` to `onfocusin`/`onfocusout`. The bubbling pair, not plain `focus`/`blur`. `bindZagEvents`
 * binds whatever event name comes out of that map, so the real listener is on `focusin`/`focusout`;
 * `fireEvent.focus`/`.blur` fire an event type nothing here listens for, and the machine silently
 * never sees them. Confirmed against the installed `@zag-js/number-input` machine's own `debug: true`
 * transition log: nothing logs for `fireEvent.blur`, `INPUT.BLUR` logs immediately for
 * `fireEvent.focusOut`. React's own adapter does NOT remap these (`onBlur` stays `onBlur`), which is
 * why the React binding's equivalent test can use plain `fireEvent.blur`.
 *
 * Both helpers await one animation frame after their `flushSync()`: `syncInputElement` (the
 * machine's own action that writes the committed/clamped value back to the DOM) is itself deferred
 * behind a real `requestAnimationFrame`, same as the dismiss machinery `menu.test.ts` documents. Real
 * `.focus()`, not `fireEvent.focusIn`: a synthetic `focusin` with no actual DOM focus left an extra,
 * unexplained `INPUT.FOCUS` re-transition after the blur fired (checked against the machine's own
 * `debug: true` log). Real focus does not.
 */
const tick = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const type = async (input: HTMLInputElement, value: string) => {
  input.focus();
  fireEvent.input(input, { target: { value } });
  flushSync();
  await tick();
};
const leave = async (input: HTMLInputElement) => {
  fireEvent.focusOut(input);
  flushSync();
  await tick();
};

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-number-field]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("NumberField vanilla enhancer", () => {
  it("wires the accessible names from the authored aria-label onto the triggers", () => {
    const root = markup();
    const { decrement, increment } = parts(root);
    expect(decrement.getAttribute("aria-label")).toBe("Disminuir");
    expect(increment.getAttribute("aria-label")).toBe("Aumentar");
  });

  it("increments and decrements by step, emitting sk-value-change", () => {
    const root = markup({ value: "5", step: "1" });
    const { input, decrement, increment } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk-value-change", handler);

    press(increment);
    flushSync();
    expect(input.value).toBe("6");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "6", valueAsNumber: 6 } }),
    );

    press(decrement);
    flushSync();
    press(decrement);
    flushSync();
    expect(input.value).toBe("4");
  });

  it("disables the increment trigger at max and the decrement trigger at min", () => {
    const root = markup({ value: "10", min: "0", max: "10" });
    const { decrement, increment } = parts(root);
    expect(increment.disabled).toBe(true);
    expect(decrement.disabled).toBe(false);

    // Walking back down to the floor flips the other trigger off instead.
    for (let i = 0; i < 10; i++) press(decrement);
    flushSync();
    expect(decrement.disabled).toBe(true);
    expect(increment.disabled).toBe(false);
  });

  it("pressing a disabled trigger at the bound is a no-op", () => {
    const root = markup({ value: "10", min: "0", max: "10" });
    const { input, increment } = parts(root);
    press(increment); // disabled: a real DOM button, the press never fires the handler
    flushSync();
    expect(input.value).toBe("10");
  });

  it("commits a typed value on blur and emits sk-value-change", async () => {
    const root = markup({ value: "5" });
    const { input } = parts(root);
    const handler = vi.fn();
    root.addEventListener("sk-value-change", handler);

    await type(input, "8");
    await leave(input);

    expect(input.value).toBe("8");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: "8", valueAsNumber: 8 } }),
    );
  });

  it("clamps a typed value past max down to the bound on blur", async () => {
    const root = markup({ value: "5", min: "0", max: "10" });
    const { input } = parts(root);

    await type(input, "99");
    await leave(input);

    expect(input.value).toBe("10");
  });

  it("disables the input and both triggers when the root's own input is authored disabled", () => {
    const root = markup({ disabled: true });
    const { input, decrement, increment } = parts(root);
    expect(input.disabled).toBe(true);
    expect(decrement.disabled).toBe(true);
    expect(increment.disabled).toBe(true);
  });

  /*
   * WAI-ARIA APG's Spinbutton pattern (see docs/aria-apg-audit.md's own "Spinbutton" row) is built
   * around KEYBOARD interaction on the input itself. ArrowUp/ArrowDown/Home/End are the pattern's
   * required behaviors, not an enhancement over the pointer-button pair above. Everything above this
   * only exercises the trigger buttons and blur-commit; without this, a regression that broke the
   * input's own keyboard handling (the primary way a keyboard/screen-reader user actually drives a
   * spinbutton) would pass the whole file.
   */
  it("wires role=spinbutton with aria-valuemin/aria-valuemax/aria-valuenow", () => {
    const root = markup({ value: "5", min: "0", max: "10" });
    const { input } = parts(root);
    expect(input.getAttribute("role")).toBe("spinbutton");
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(input.getAttribute("aria-valuenow")).toBe("5");
  });

  it("ArrowUp/ArrowDown step from the keyboard, Home/End jump to the bounds", () => {
    const root = markup({ value: "5", min: "0", max: "10", step: "1" });
    const { input } = parts(root);
    // Real `.focus()`, not a synthetic event: the machine only wires ArrowUp/ArrowDown/Home/End
    // inside its "focused" state (checked against the installed `@zag-js/number-input` machine's own
    // state chart). Same requirement `type()`'s own doc above documents for the blur-commit path.
    input.focus();

    fireEvent.keyDown(input, { key: "ArrowUp" });
    flushSync();
    expect(input.value).toBe("6");

    fireEvent.keyDown(input, { key: "End" });
    flushSync();
    expect(input.value).toBe("10");

    fireEvent.keyDown(input, { key: "Home" });
    flushSync();
    expect(input.value).toBe("0");

    // Already at the floor: ArrowDown clamps instead of going negative.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    flushSync();
    expect(input.value).toBe("0");
  });
});
