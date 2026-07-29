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

  it("steps with Arrow Up/Down and wraps at the bounds", () => {
    const { ui, onValueChange } = setup({ defaultValue: "09:59", locale: "en-US", minuteLabel: "Minute" });
    const minute = segment(ui, "Minute");

    fireEvent.keyDown(minute, { key: "ArrowUp" });

    expect(minute.getAttribute("aria-valuetext")).toBe("00");
    expect(onValueChange).toHaveBeenLastCalledWith({ value: "09:00" });

    fireEvent.keyDown(minute, { key: "ArrowDown" });
    expect(minute.getAttribute("aria-valuetext")).toBe("59");
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
