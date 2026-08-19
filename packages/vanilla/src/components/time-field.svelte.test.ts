import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountTimeField } from "./time-field.js";

/*
 * TimeField has no Zag machine behind it (there is no `@zag-js/time-picker`): it is a `role="group"`
 * of `role="spinbutton"` segments, and unlike every other enhancer it RENDERS that chrome instead of
 * patching authored markup, because the segments are derived from the locale.
 */
function markup(root = "") {
  document.body.innerHTML = `<div class="sk-time-field" data-sk-time-field ${root}>
    <span class="sk-time-field__label">Hora de reunión</span>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-time-field]")!;
  expect(mountTimeField(document)).toBe(1);
  return element;
}

const segment = (type: "hour" | "minute" | "dayPeriod") =>
  document.querySelector<HTMLElement>(`[data-sk-time-field-segment="${type}"]`)!;
const hiddenInput = () => document.querySelector<HTMLInputElement>('input[type="hidden"]')!;
const types = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-sk-time-field-segment]")).map(
    (node) => node.dataset.skTimeFieldSegment,
  );

afterEach(() => {
  document.body.innerHTML = "";
});

describe("TimeField Vanilla contracts", () => {
  it("mounts once and names the group from the authored label", () => {
    const root = markup();
    expect(mountTimeField(document)).toBe(0);

    const group = root.querySelector<HTMLElement>("[role='group']")!;
    const label = root.querySelector<HTMLElement>(".sk-time-field__label")!;
    // The label gets an id so the group can point at it; the ROOT gets none, because nothing
    // points at the root and stamping one there is a difference React has no reason to match.
    expect(label.id).toBeTruthy();
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
    expect(root.id).toBe("");
  });

  it("derives the segments from the locale, not from the markup", () => {
    markup('data-locale="es"');
    expect(types()).toEqual(["hour", "minute"]);

    document.body.innerHTML = "";
    markup('data-locale="en-US"');
    // A 12-hour locale gets a third segment, and nobody authored it.
    expect(types()).toEqual(["hour", "minute", "dayPeriod"]);
  });

  it("starts empty, with placeholders instead of a made-up time", () => {
    markup('data-locale="es"');

    expect(segment("hour").textContent).toBe("hh");
    expect(segment("minute").textContent).toBe("mm");
    expect(segment("hour").getAttribute("data-placeholder")).toBe("");
    expect(segment("hour").hasAttribute("aria-valuenow")).toBe(false);
    expect(hiddenInput().getAttribute("value")).toBe("");
    // Nothing to clear yet, so there is no control offering to.
    expect(document.querySelector(".sk-time-field__clear")).toBeNull();
  });

  it("reads an authored value into its segments", () => {
    markup('data-locale="en-US" data-value="13:45"');

    expect(segment("hour").textContent).toBe("01");
    expect(segment("minute").textContent).toBe("45");
    expect(segment("dayPeriod").textContent).toBe("PM");
    // The canonical value stays 24-hour whatever the locale shows.
    expect(hiddenInput().getAttribute("value")).toBe("13:45");
  });

  it("steps a segment with the arrow keys and wraps at either end", async () => {
    markup('data-locale="es" data-value="00:30"');

    fireEvent.keyDown(segment("hour"), { key: "ArrowDown" });
    // Past the bottom lands on the other end rather than sticking to it.
    await waitFor(() => expect(segment("hour").textContent).toBe("23"));

    fireEvent.keyDown(segment("hour"), { key: "ArrowUp" });
    await waitFor(() => expect(segment("hour").textContent).toBe("00"));
  });

  it("honours the authored minute step", async () => {
    markup('data-locale="es" data-minute-step="15" data-value="09:00"');

    fireEvent.keyDown(segment("minute"), { key: "ArrowUp" });

    await waitFor(() => expect(segment("minute").textContent).toBe("15"));
    expect(hiddenInput().getAttribute("value")).toBe("09:15");
  });

  it("types digits and moves on once the segment cannot take another", async () => {
    markup('data-locale="es"');
    segment("hour").focus();

    fireEvent.keyDown(segment("hour"), { key: "1" });
    await waitFor(() => expect(segment("hour").textContent).toBe("01"));

    fireEvent.keyDown(segment("hour"), { key: "4" });
    await waitFor(() => expect(segment("hour").textContent).toBe("14"));
    // Two digits is all an hour can hold, so focus goes where the reader was going next.
    expect(document.activeElement).toBe(segment("minute"));
  });

  it("waits for a possible second digit in 24-hour form too, e.g. typing 22 as the hour", async () => {
    // `data-hour-cycle` forced explicitly rather than left to `data-locale="es"`'s own guess:
    // `Intl`'s hourCycle resolution for "es" is exactly the kind of thing this option exists to
    // stop depending on (`resolveHourCycle`'s own doc — confirmed against a real browser, Node and
    // Chromium disagree on this very locale). Forcing it here is what makes the test deterministic
    // regardless of which engine runs it.
    markup('data-locale="es" data-hour-cycle="h24"');
    segment("hour").focus();

    fireEvent.keyDown(segment("hour"), { key: "2" });
    await waitFor(() => expect(segment("hour").textContent).toBe("02")); // "2" could still become 20-23
    expect(document.activeElement).toBe(segment("hour")); // must NOT have advanced yet

    fireEvent.keyDown(segment("hour"), { key: "2" });
    await waitFor(() => expect(segment("hour").textContent).toBe("22"));
    expect(document.activeElement).toBe(segment("minute"));
  });

  it("an explicit hour cycle overrides whatever the locale would otherwise resolve to", () => {
    // en-US resolves to h12 on its own — forcing h24 here proves the override wins, not a
    // coincidence of what the locale already wanted.
    const root = markup('data-locale="en-US" data-hour-cycle="h24"');
    expect(types()).toEqual(["hour", "minute"]); // no dayPeriod segment
    expect(root.querySelector('[data-sk-time-field-segment="hour"]')!.getAttribute("aria-valuemax")).toBe("23");
  });

  it("picks the period from its first letter", async () => {
    markup('data-locale="en-US" data-value="09:00"');

    fireEvent.keyDown(segment("dayPeriod"), { key: "p" });

    await waitFor(() => expect(segment("dayPeriod").textContent).toBe("PM"));
    expect(hiddenInput().getAttribute("value")).toBe("21:00");
  });

  it("walks between segments with the horizontal arrows", () => {
    markup('data-locale="es" data-value="09:30"');
    segment("minute").focus();

    fireEvent.keyDown(segment("minute"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(segment("hour"));

    fireEvent.keyDown(segment("hour"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(segment("minute"));
  });

  it("empties a segment with Backspace and drops the whole value with it", async () => {
    markup('data-locale="es" data-value="09:30"');

    fireEvent.keyDown(segment("minute"), { key: "Backspace" });

    await waitFor(() => expect(segment("minute").textContent).toBe("mm"));
    // A half-written time is not a time, so the form sees nothing rather than a guess.
    expect(hiddenInput().getAttribute("value")).toBe("");
  });

  it("reports every change on the root", async () => {
    const root = markup('data-locale="es" data-value="09:30"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);

    fireEvent.keyDown(segment("hour"), { key: "End" });

    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: "23:30" } })),
    );
  });

  it("offers a clear control only while there is something to clear", async () => {
    const root = markup('data-locale="es" data-value="09:30" data-clear-label="Borrar hora"');
    const clear = root.querySelector<HTMLButtonElement>(".sk-time-field__clear")!;

    expect(clear.getAttribute("aria-label")).toBe("Borrar hora");
    expect(clear.classList.contains("sk-button")).toBe(true);
    expect(clear.getAttribute("data-size")).toBe("sm");
    expect(clear.getAttribute("data-variant")).toBe("ghost");

    fireEvent.click(clear);

    await waitFor(() => expect(root.querySelector(".sk-time-field__clear")).toBeNull());
    expect(segment("hour").textContent).toBe("hh");
    expect(hiddenInput().getAttribute("value")).toBe("");
  });

  it("stays out of the way when disabled, and still serializes under its name", async () => {
    const root = markup('data-locale="es" data-value="09:30" data-disabled data-name="reunion"');

    expect(root.querySelector("[role='group']")?.getAttribute("data-disabled")).toBe("");
    expect(segment("hour").tabIndex).toBe(-1);
    expect(root.querySelector(".sk-time-field__clear")).toBeNull();
    expect(hiddenInput().name).toBe("reunion");

    fireEvent.keyDown(segment("hour"), { key: "ArrowUp" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(segment("hour").textContent).toBe("09");
  });

  it("takes no keys while read-only, but keeps its value", async () => {
    markup('data-locale="es" data-value="09:30" data-readonly');

    fireEvent.keyDown(segment("minute"), { key: "ArrowUp" });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(segment("minute").textContent).toBe("30");
    expect(hiddenInput().getAttribute("value")).toBe("09:30");
  });

  it("resyncs its own segments when something ELSE sets data-value after mount", async () => {
    const root = markup('data-locale="es" data-value="09:30"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", (event) => onChange((event as CustomEvent).detail));

    root.setAttribute("data-value", "14:05");

    await waitFor(() => expect(segment("hour").textContent).toBe("14"));
    expect(segment("minute").textContent).toBe("05");
    expect(hiddenInput().getAttribute("value")).toBe("14:05");
    // The external write reaches a consumer the exact same way typing would — one event contract,
    // not two, for "the value changed" regardless of who changed it.
    expect(onChange).toHaveBeenCalledWith({ value: "14:05" });
  });

  it("clears itself when data-value is set to something unparseable", async () => {
    const root = markup('data-locale="es" data-value="09:30"');

    root.setAttribute("data-value", "");

    await waitFor(() => expect(segment("hour").textContent).toBe("hh"));
    expect(hiddenInput().getAttribute("value")).toBe("");
  });

  it("paints the picker trigger INSIDE the control, one bordered box, after the clear button", () => {
    const root = markup('data-locale="es" data-value="09:30"');
    const control = root.querySelector<HTMLElement>(".sk-time-field__control")!;
    const children = Array.from(control.children);
    const trailingWrapper = children.at(-1) as HTMLElement;

    expect(trailingWrapper.className).toBe("sk-time-field__trailing");
    const trigger = trailingWrapper.querySelector<HTMLButtonElement>("button")!;
    expect(trigger.getAttribute("aria-label")).toBe("Elegir de la lista");
    expect(trigger.getAttribute("role")).toBe("combobox");
    // Right after the clear button (a value is set), not before it.
    expect(children.at(-2)).toBe(control.querySelector(".sk-time-field__clear"));
  });

  it("anchors the picker's own listbox to the CONTROL, not the trigger — so it opens the field's own width, not the icon's", () => {
    // The bug this guards: anchoring to the small icon-only trigger (`anchor-size(width)`
    // resolving against a 32px square) squeezed the listbox and its rows down to that same 32px,
    // unreadable. The control is the field's own full width.
    const root = markup('data-locale="es"');
    const control = root.querySelector<HTMLElement>(".sk-time-field__control")!;
    const trigger = root.querySelector<HTMLElement>(".sk-time-field__options-trigger")!;

    expect(control.classList.contains("sk-anchor")).toBe(true);
    expect(trigger.classList.contains("sk-anchor")).toBe(false);
  });

  it("lists one option per step across the whole day, formatted in the field's own hour cycle", () => {
    const root = markup('data-locale="en-US" data-hour-cycle="h24" data-options-step="60"');
    const items = Array.from(root.querySelectorAll<HTMLElement>(".sk-select__item"));

    expect(items).toHaveLength(24);
    expect(items.some((item) => item.textContent?.includes("09:00"))).toBe(true);
    expect(items.some((item) => item.textContent?.includes("22:00"))).toBe(true); // h24, never "10:00 PM"
  });

  it("defaults to a 30-minute step when none is given — 48 rows, not 1440", () => {
    const root = markup('data-locale="en-US" data-hour-cycle="h24"');
    expect(root.querySelectorAll(".sk-select__item")).toHaveLength(48);
  });

  it("picking an option feeds the chosen time into the segmented input", async () => {
    const root = markup('data-locale="en-US" data-hour-cycle="h24" data-options-step="60"');
    const trigger = root.querySelector<HTMLButtonElement>(".sk-time-field__options-trigger")!;
    fireEvent.click(trigger);

    const option = Array.from(root.querySelectorAll<HTMLElement>(".sk-select__item")).find((item) =>
      item.textContent?.includes("22:00"),
    )!;
    fireEvent.click(option);

    await waitFor(() => expect(segment("hour").textContent).toBe("22"));
    expect(segment("minute").textContent).toBe("00");
  });

  it("opens the picker with Alt+ArrowDown from any segment, leaving plain ArrowDown alone", async () => {
    const root = markup('data-locale="es"');
    const trigger = root.querySelector<HTMLButtonElement>(".sk-time-field__options-trigger")!;

    fireEvent.keyDown(segment("hour"), { key: "ArrowDown", altKey: true });

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    // Alt+ArrowDown did not ALSO step the segment's own value.
    expect(segment("hour").hasAttribute("aria-valuenow")).toBe(false);
  });

  it("leaves the picker closed on a plain ArrowDown — that key is the segment's own", async () => {
    const root = markup('data-locale="es"');
    const trigger = root.querySelector<HTMLButtonElement>(".sk-time-field__options-trigger")!;

    fireEvent.keyDown(segment("hour"), { key: "ArrowDown" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(segment("hour").hasAttribute("aria-valuenow")).toBe(true)); // stepped instead
  });

  it("omits the picker trigger entirely while disabled or read-only — nothing to browse to", () => {
    const disabledRoot = markup('data-locale="es" data-disabled');
    expect(disabledRoot.querySelector(".sk-time-field__options-trigger")).toBeNull();

    document.body.innerHTML = "";
    const readOnlyRoot = markup('data-locale="es" data-readonly');
    expect(readOnlyRoot.querySelector(".sk-time-field__options-trigger")).toBeNull();
  });

  it("describes itself with an authored hint and marks required segments", () => {
    document.body.innerHTML = `<div class="sk-time-field" data-sk-time-field data-locale="es" data-required>
      <span class="sk-time-field__label">Hora</span>
      <span class="sk-time-field__hint">Formato de 24 horas</span>
    </div>`;
    expect(mountTimeField(document)).toBe(1);

    const group = document.querySelector<HTMLElement>("[role='group']")!;
    const hint = document.querySelector<HTMLElement>(".sk-time-field__hint")!;
    expect(group.getAttribute("aria-describedby")).toBe(hint.id);
    expect(segment("hour").getAttribute("aria-required")).toBe("true");
  });
});
