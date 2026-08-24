import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "./number-field.js";

/*
 * `@zag-js/number-input`'s triggers are a press-and-hold spinner (`onPointerDown`/`onPointerUp`/
 * `onPointerLeave`, no `onClick` at all — same machine the vanilla binding runs, see that binding's
 * own `number-field.test.ts`). `isLeftClick(event)` also requires `button: 0` explicitly, since
 * jsdom's synthetic PointerEvent leaves `button` undefined by default.
 */
const press = (trigger: HTMLElement) => {
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
};

describe("NumberField (React)", () => {
  it("wires the accessible names from decrementLabel/incrementLabel onto the triggers", () => {
    const ui = render(
      <NumberField label="Quantity" defaultValue="5" decrementLabel="Disminuir" incrementLabel="Aumentar" />,
    );
    expect(ui.getByRole("button", { name: "Disminuir" })).toBeTruthy();
    expect(ui.getByRole("button", { name: "Aumentar" })).toBeTruthy();
  });

  it("increments and decrements by step, calling onValueChange", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <NumberField label="Quantity" defaultValue="5" step={1} onValueChange={onValueChange} />,
    );
    const input = ui.getByRole("spinbutton") as HTMLInputElement;
    const increment = ui.getByRole("button", { name: "Aumentar" });
    const decrement = ui.getByRole("button", { name: "Disminuir" });

    press(increment);
    await waitFor(() => expect(input.value).toBe("6"));
    expect(onValueChange).toHaveBeenCalledWith({ value: "6", valueAsNumber: 6 });

    press(decrement);
    press(decrement);
    await waitFor(() => expect(input.value).toBe("4"));
  });

  it("disables the increment trigger at max and the decrement trigger at min", async () => {
    const ui = render(<NumberField label="Quantity" defaultValue="10" min={0} max={10} step={1} />);
    const increment = ui.getByRole("button", { name: "Aumentar" }) as HTMLButtonElement;
    const decrement = ui.getByRole("button", { name: "Disminuir" }) as HTMLButtonElement;
    expect(increment.disabled).toBe(true);
    expect(decrement.disabled).toBe(false);

    // Walking back down to the floor flips the other trigger off instead.
    for (let i = 0; i < 10; i++) press(decrement);
    await waitFor(() => expect(decrement.disabled).toBe(true));
    expect(increment.disabled).toBe(false);
  });

  it("pressing a disabled trigger at the bound is a no-op", () => {
    const ui = render(<NumberField label="Quantity" defaultValue="10" min={0} max={10} />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;
    const increment = ui.getByRole("button", { name: "Aumentar" });
    press(increment); // disabled: a real DOM button, the press never fires the handler
    expect(input.value).toBe("10");
  });

  it("commits a typed value on blur and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const ui = render(<NumberField label="Quantity" defaultValue="5" onValueChange={onValueChange} />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: "8" } });
    fireEvent.blur(input);

    await waitFor(() => expect(input.value).toBe("8"));
    expect(onValueChange).toHaveBeenCalledWith({ value: "8", valueAsNumber: 8 });
  });

  it("clamps a typed value past max down to the bound on blur", async () => {
    const ui = render(<NumberField label="Quantity" defaultValue="5" min={0} max={10} />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: "99" } });
    // The machine writes the DOM value back via its own `syncInputElement`, deferred behind a real
    // `requestAnimationFrame` (see the vanilla binding's `number-field.test.ts` for the same finding)
    // — blurring before that settles leaves the guard reading a value the DOM hasn't caught up to
    // yet, same class of issue as this file's own dismiss-timing notes for Menu.
    await waitFor(() => expect(input.getAttribute("aria-valuenow")).toBe("99"));
    fireEvent.blur(input);

    await waitFor(() => expect(input.value).toBe("10"));
  });

  it("disables the input and both triggers when disabled", () => {
    const ui = render(<NumberField label="Quantity" defaultValue="5" disabled />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect((ui.getByRole("button", { name: "Disminuir" }) as HTMLButtonElement).disabled).toBe(true);
    expect((ui.getByRole("button", { name: "Aumentar" }) as HTMLButtonElement).disabled).toBe(true);
  });

  /*
   * WAI-ARIA APG's Spinbutton pattern (see docs/aria-apg-audit.md's own "Spinbutton" row) is built
   * around KEYBOARD interaction on the input itself — ArrowUp/ArrowDown/Home/End are the pattern's
   * required behaviors, not an enhancement over the pointer-button pair above. Everything above this
   * only exercises the trigger buttons and blur-commit; without this, a regression that broke the
   * input's own keyboard handling (the primary way a keyboard/screen-reader user actually drives a
   * spinbutton) would pass the whole file.
   */
  it("wires aria-valuemin/aria-valuemax/aria-valuenow", () => {
    const ui = render(<NumberField label="Quantity" defaultValue="5" min={0} max={10} />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;
    expect(input.getAttribute("aria-valuemin")).toBe("0");
    expect(input.getAttribute("aria-valuemax")).toBe("10");
    expect(input.getAttribute("aria-valuenow")).toBe("5");
  });

  it("ArrowUp/ArrowDown step from the keyboard, Home/End jump to the bounds", async () => {
    const ui = render(<NumberField label="Quantity" defaultValue="5" min={0} max={10} step={1} />);
    const input = ui.getByRole("spinbutton") as HTMLInputElement;
    const root = ui.container.querySelector(".sk-number-field")!;

    // The machine only wires ArrowUp/ArrowDown/Home/End inside its "focused" state (checked against
    // the installed `@zag-js/number-input` machine's own state chart), and React's own `onFocus`
    // handler commits that transition through a state update that lands one tick after the
    // synthetic event — `data-focus` on the root is what `getRootProps()` reflects it onto, so
    // waiting for it (rather than a fixed delay) is what makes firing the FIRST key deterministic.
    fireEvent.focus(input);
    await waitFor(() => expect(root.hasAttribute("data-focus")).toBe(true));

    fireEvent.keyDown(input, { key: "ArrowUp" });
    await waitFor(() => expect(input.value).toBe("6"));

    fireEvent.keyDown(input, { key: "End" });
    await waitFor(() => expect(input.value).toBe("10"));

    fireEvent.keyDown(input, { key: "Home" });
    await waitFor(() => expect(input.value).toBe("0"));

    // Already at the floor: ArrowDown clamps instead of going negative.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => expect(input.value).toBe("0"));
  });
});
