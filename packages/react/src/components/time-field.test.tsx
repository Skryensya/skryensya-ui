import { fireEvent, render, waitFor, type RenderResult } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TimeField } from "./time-field.js";

// Distinct from the default `hourLabel` ("Hora"): the field label and the hour segment's own
// label would otherwise both read "Hora", and role queries couldn't tell which is meant.
const setup = (props: Partial<Parameters<typeof TimeField>[0]> = {}) => {
  const onValueChange = vi.fn();
  const ui = render(<TimeField label="Hora de inicio" onValueChange={onValueChange} {...props} />);
  return { ui, onValueChange };
};

const segment = (ui: RenderResult, name: string) => ui.getByRole("spinbutton", { name });
const querySegment = (ui: RenderResult, name: string) => ui.queryByRole("spinbutton", { name });
const hiddenValue = (ui: RenderResult) =>
  (ui.container.querySelector('input[type="hidden"]') as HTMLInputElement).value;

describe("TimeField", () => {
  it("groups the segments under one accessible name, with no native type=time anywhere", () => {
    const { ui } = setup({ defaultValue: "09:30", locale: "en-US" });

    expect(ui.getByRole("group", { name: "Hora de inicio" })).toBeTruthy();
    expect(ui.container.querySelectorAll('input[type="time"]')).toHaveLength(0);
  });

  it("shows an hour, minute and period segment for a 12-hour locale", () => {
    const { ui } = setup({
      defaultValue: "09:30",
      hourLabel: "Hour",
      locale: "en-US",
      minuteLabel: "Minute",
      periodLabel: "Period",
    });

    expect(segment(ui, "Hour")).toBeTruthy();
    expect(segment(ui, "Minute")).toBeTruthy();
    expect(segment(ui, "Period")).toBeTruthy();
  });

  it("drops the period segment for a 24-hour locale", () => {
    const { ui } = setup({
      defaultValue: "14:05",
      hourLabel: "Stunde",
      locale: "de-DE",
      minuteLabel: "Minute",
      periodLabel: "Zeitraum",
    });

    expect(segment(ui, "Stunde")).toBeTruthy();
    expect(querySegment(ui, "Zeitraum")).toBeNull();
  });

  it("reflects the current value on each segment's accessible value", () => {
    const { ui } = setup({
      defaultValue: "09:30",
      hourLabel: "Hour",
      locale: "en-US",
      minuteLabel: "Minute",
      periodLabel: "Period",
    });

    expect(segment(ui, "Hour").getAttribute("aria-valuetext")).toBe("09");
    expect(segment(ui, "Hour").getAttribute("aria-valuenow")).toBe("9");
    expect(segment(ui, "Minute").getAttribute("aria-valuetext")).toBe("30");
    expect(segment(ui, "Period").getAttribute("aria-valuetext")).toBe("AM");
  });

  it("shows a placeholder and no aria-valuenow when nothing is set yet", () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US" });
    const hour = segment(ui, "Hour");

    expect(hour.getAttribute("aria-valuenow")).toBeNull();
    expect(hour.getAttribute("aria-valuetext")).toBe("hh");
    expect(hour.hasAttribute("data-placeholder")).toBe(true);
  });

  it("commits the canonical value only once every segment is filled", () => {
    const { ui, onValueChange } = setup({
      hourLabel: "Hour",
      locale: "en-US",
      minuteLabel: "Minute",
      periodLabel: "Period",
    });

    fireEvent.keyDown(segment(ui, "Hour"), { key: "9" });
    expect(hiddenValue(ui)).toBe("");

    fireEvent.keyDown(segment(ui, "Minute"), { key: "3" });
    fireEvent.keyDown(segment(ui, "Minute"), { key: "0" });
    expect(hiddenValue(ui)).toBe(""); // period still unset in a 12-hour locale

    fireEvent.keyDown(segment(ui, "Period"), { key: "a" });
    expect(hiddenValue(ui)).toBe("09:30");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "09:30" });
  });

  it("auto-advances immediately after a digit that could not extend further", () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    hour.focus();

    // "9" as an hour: 9*10=90 exceeds the 12-hour max, so no second digit could ever follow.
    fireEvent.keyDown(hour, { key: "9" });

    expect(hour.getAttribute("aria-valuetext")).toBe("09");
    expect(document.activeElement).toBe(segment(ui, "Minute"));
  });

  it("builds a two-digit value from two keystrokes before advancing", () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    hour.focus();

    fireEvent.keyDown(hour, { key: "1" });
    expect(hour.getAttribute("aria-valuetext")).toBe("01"); // still waiting on a possible second digit
    expect(document.activeElement).toBe(hour);

    fireEvent.keyDown(hour, { key: "2" });
    expect(hour.getAttribute("aria-valuetext")).toBe("12");
    expect(document.activeElement).toBe(segment(ui, "Minute"));
  });

  it("settles an unfinished digit and advances after the debounce, with no second keystroke", async () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    hour.focus();

    fireEvent.keyDown(hour, { key: "1" }); // could still become 10/11/12

    await waitFor(() => expect(document.activeElement).toBe(segment(ui, "Minute")), { timeout: 1000 });
    expect(hour.getAttribute("aria-valuetext")).toBe("01");
  });

  it("waits for a possible second digit in 24-hour form too, e.g. typing 22 as the hour", () => {
    // Forced explicitly rather than left to `locale="es"`'s own guess: `Intl`'s hourCycle
    // resolution for "es" is exactly the kind of thing `hourCycle` exists to stop depending on
    // (`resolveHourCycle`'s own doc. Confirmed against a real browser, Node and Chromium disagree
    // on this very locale). Forcing it here is what makes the assertion deterministic.
    const { ui } = setup({ hourCycle: "h24", hourLabel: "Hour", locale: "es", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    hour.focus();

    fireEvent.keyDown(hour, { key: "2" });
    expect(hour.getAttribute("aria-valuetext")).toBe("02"); // "2" could still become 20-23
    expect(document.activeElement).toBe(hour); // must NOT have advanced yet

    fireEvent.keyDown(hour, { key: "2" });
    expect(hour.getAttribute("aria-valuetext")).toBe("22");
    expect(document.activeElement).toBe(segment(ui, "Minute"));
  });

  it("an explicit hourCycle overrides whatever the locale would otherwise resolve to", () => {
    // en-US resolves to h12 on its own. Forcing h24 here proves the override wins, not a
    // coincidence of what the locale already wanted.
    const { ui } = setup({ hourCycle: "h24", hourLabel: "Hour", locale: "en-US" });
    expect(querySegment(ui, "Period")).toBeNull();
    expect(segment(ui, "Hour").getAttribute("aria-valuemax")).toBe("23");
  });

  it("steps with Arrow Up/Down and wraps at the bounds", () => {
    const { ui, onValueChange } = setup({ defaultValue: "09:59", locale: "en-US", minuteLabel: "Minute" });
    const minute = segment(ui, "Minute");

    fireEvent.keyDown(minute, { key: "ArrowUp" });

    expect(minute.getAttribute("aria-valuetext")).toBe("00");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "09:00" });

    fireEvent.keyDown(minute, { key: "ArrowDown" });
    expect(minute.getAttribute("aria-valuetext")).toBe("59");
  });

  it("paints the picker trigger INSIDE the control, one bordered box, after the clear button", () => {
    const { ui } = setup({ defaultValue: "09:30", locale: "en-US" });

    const control = ui.container.querySelector(".sk-time-field__control") as HTMLElement;
    const children = Array.from(control.children);
    const trailingWrapper = children.at(-1) as HTMLElement;

    expect(trailingWrapper.className).toBe("sk-time-field__trailing");
    expect(control.contains(ui.getByRole("combobox", { name: "Elegir de la lista" }))).toBe(true);
    // The clear button (present, since a value is set) sits right before it, not after.
    expect(children.at(-2)).toBe(ui.getByRole("button", { name: "Limpiar hora" }));
  });

  it("anchors the picker's own listbox to the CONTROL, not the trigger, so it opens the field's own width, not the icon's", () => {
    // The bug this guards: anchoring to the small icon-only trigger (`anchor-size(width)`
    // resolving against a 32px square) squeezed the listbox and its rows down to that same 32px,
    // unreadable. The control is the field's own full width.
    const { ui } = setup({ locale: "en-US" });
    const control = ui.container.querySelector(".sk-time-field__control") as HTMLElement;
    const trigger = ui.getByRole("combobox", { name: "Elegir de la lista" });

    expect(control.classList.contains("sk-anchor")).toBe(true);
    expect(trigger.classList.contains("sk-anchor")).toBe(false);
  });

  it("opens the picker with Alt+ArrowDown from any segment, leaving plain ArrowDown alone", async () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    const trigger = ui.getByRole("combobox", { name: "Elegir de la lista" });

    fireEvent.keyDown(hour, { key: "ArrowDown", altKey: true });

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    // Alt+ArrowDown did not ALSO step the segment's own value.
    expect(hour.getAttribute("aria-valuetext")).toBe("hh");
  });

  it("leaves the picker closed on a plain ArrowDown. That key is the segment's own", () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US" });
    const hour = segment(ui, "Hour");
    const trigger = ui.getByRole("combobox", { name: "Elegir de la lista" });

    fireEvent.keyDown(hour, { key: "ArrowDown" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(hour.getAttribute("aria-valuetext")).not.toBe("hh"); // stepped instead
  });

  it("starts an empty segment at its minimum on Arrow Up", () => {
    const { ui } = setup({ hourLabel: "Hour", locale: "en-US" });
    const hour = segment(ui, "Hour");

    fireEvent.keyDown(hour, { key: "ArrowUp" });

    expect(hour.getAttribute("aria-valuetext")).toBe("01"); // 12-hour minimum
  });

  it("clears one segment on Backspace without touching the others", () => {
    const { ui } = setup({ defaultValue: "09:30", hourLabel: "Hour", locale: "en-US" });
    const hour = segment(ui, "Hour");

    fireEvent.keyDown(hour, { key: "Backspace" });

    expect(hour.getAttribute("aria-valuenow")).toBeNull();
    expect(hour.getAttribute("aria-valuetext")).toBe("hh");
    expect(segment(ui, "Minuto").getAttribute("aria-valuetext")).toBe("30");
    expect(hiddenValue(ui)).toBe("");
  });

  it("sets the period by typing its first letter", () => {
    const { ui, onValueChange } = setup({
      defaultValue: "09:30",
      locale: "en-US",
      periodLabel: "Period",
    });

    fireEvent.keyDown(segment(ui, "Period"), { key: "p" });

    expect(segment(ui, "Period").getAttribute("aria-valuetext")).toBe("PM");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "21:30" });
  });

  it("moves focus between segments with Arrow Left/Right", () => {
    const { ui } = setup({ defaultValue: "09:30", hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute" });
    const hour = segment(ui, "Hour");
    hour.focus();

    fireEvent.keyDown(hour, { key: "ArrowRight" });
    expect(document.activeElement).toBe(segment(ui, "Minute"));

    fireEvent.keyDown(segment(ui, "Minute"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(hour);
  });

  it("submits the canonical HH:mm through a hidden input, regardless of the display locale", () => {
    const ui = render(
      <form data-testid="form">
        <TimeField defaultValue="14:05" label="Salida" locale="en-US" name="departure" required />
      </form>,
    );
    const form = ui.getByTestId("form") as HTMLFormElement;

    expect(new FormData(form).get("departure")).toBe("14:05");
    // `aria-required` on the group is invalid (role="group" does not support it); each segment
    // carries it instead.
    expect(ui.getAllByRole("spinbutton")[0]?.getAttribute("aria-required")).toBe("true");
  });

  it("clears every segment, and the clear trigger disappears once there is nothing left to clear", () => {
    const { ui, onValueChange } = setup({ clearLabel: "Clear", defaultValue: "09:30", locale: "en-US" });

    fireEvent.click(ui.getByRole("button", { name: "Clear" }));

    expect(onValueChange).toHaveBeenCalledWith({ value: "" });
    expect(ui.queryByRole("button", { name: "Clear" })).toBeNull();
    expect(hiddenValue(ui)).toBe("");
  });
});

describe("TimeField picker", () => {
  // A real click/keyboard interaction moves REAL DOM focus into the listbox on open
  // (`role="listbox"`, deferred to a `raf` inside `@zag-js/select`). The same mechanics
  // `select.test.tsx` already established for `Select` itself, since this drives the identical
  // machine. Waiting for the listbox to actually hold focus, not just for the trigger to have lost
  // it, avoids the race that file's own comment documents (the trigger blurs to `document.body`
  // one tick before the deferred focus actually lands).
  const openPicker = async (ui: RenderResult, name = "Elegir de la lista") => {
    fireEvent.click(ui.getByRole("combobox", { name }));
    await waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("listbox"));
  };

  it("carries its own accessible name, distinct from the field's label", () => {
    const { ui } = setup({ defaultValue: "09:30", locale: "en-US" });

    expect(ui.getByRole("combobox", { name: "Elegir de la lista" })).toBeTruthy();
    // The field's own label stays the group's name. The trigger did not steal it.
    expect(ui.getByRole("group", { name: "Hora de inicio" })).toBeTruthy();
  });

  it("lists one option per step across the whole day, formatted in the field's own hour cycle", async () => {
    const { ui } = setup({ hourCycle: "h24", locale: "en-US", optionsStep: 60 });

    await openPicker(ui);

    expect(ui.getAllByRole("option")).toHaveLength(24);
    expect(ui.getByRole("option", { name: "09:00" })).toBeTruthy();
    expect(ui.getByRole("option", { name: "22:00" })).toBeTruthy(); // never "10:00 PM". H24 was forced
  });

  it("defaults to a 30-minute step when none is given. 48 rows, not 1440", async () => {
    const { ui } = setup({ hourCycle: "h24", locale: "en-US" });

    await openPicker(ui);

    expect(ui.getAllByRole("option")).toHaveLength(48);
  });

  it("picking an option feeds the chosen time into the segmented input, uncontrolled", async () => {
    const { ui } = setup({ hourCycle: "h24", hourLabel: "Hour", locale: "en-US", minuteLabel: "Minute", optionsStep: 60 });

    await openPicker(ui);
    fireEvent.click(ui.getByRole("option", { name: "22:00" }));

    await waitFor(() => expect(segment(ui, "Hour").getAttribute("aria-valuetext")).toBe("22"));
    expect(segment(ui, "Minute").getAttribute("aria-valuetext")).toBe("00");
  });

  it("picking an option calls onValueChange with the canonical HH:mm, same shape as typing would", async () => {
    const { ui, onValueChange } = setup({ hourCycle: "h24", locale: "en-US", optionsStep: 60 });

    await openPicker(ui);
    fireEvent.click(ui.getByRole("option", { name: "22:00" }));

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith({ value: "22:00" }));
  });

  it("updates the segments immediately when `value` is given, the same as typing already does", async () => {
    // Picking and typing commit through the SAME path now (`commit`, inside `TimeField` itself) -
    // one code path for "the value changed," not two. A controlled consumer still gets to veto or
    // override it, exactly the way a controlled `<input>` does: by feeding a DIFFERENT `value` back
    // on its own next render, which the segments' own resync effect already picks up (untouched by
    // this feature): not by the field silently refusing to show what was just picked.
    const { ui, onValueChange } = setup({
      hourCycle: "h24",
      hourLabel: "Hour",
      locale: "en-US",
      optionsStep: 60,
      value: "09:00",
    });

    await openPicker(ui);
    fireEvent.click(ui.getByRole("option", { name: "22:00" }));

    await waitFor(() => expect(segment(ui, "Hour").getAttribute("aria-valuetext")).toBe("22"));
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "22:00" });
  });

  it("omits the trigger entirely while disabled or read-only: nothing to browse to", () => {
    const { ui } = setup({ disabled: true, locale: "en-US" });
    expect(ui.queryByRole("combobox", { name: "Elegir de la lista" })).toBeNull();

    const { ui: readOnlyUi } = setup({ locale: "en-US", readOnly: true });
    expect(readOnlyUi.queryByRole("combobox", { name: "Elegir de la lista" })).toBeNull();
  });

  it("carries a distinct `optionsLabel` when given one", () => {
    const { ui } = setup({ locale: "en-US", optionsLabel: "Choose from the list" });
    expect(ui.getByRole("combobox", { name: "Choose from the list" })).toBeTruthy();
  });
});
