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
