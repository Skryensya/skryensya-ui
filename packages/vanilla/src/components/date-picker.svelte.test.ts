import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountDatePicker } from "./date-picker.js";

/*
 * DatePicker splits the work by owner: the CONTROL (label, input, trigger, clear) is authored markup
 * the enhancer patches, and the CALENDAR is chrome it renders inside its own popover. The native
 * `type="date"` field is the layer below, sharing `.sk-date-picker__control`, so with no JS the
 * consumer authors that instead and the field looks the same.
 */
function markup(root = 'data-locale="es-DO"', clear = true) {
  document.body.innerHTML = `<div class="sk-date-picker" data-sk-date-picker ${root}>
    <label class="sk-date-picker__label">Llegada</label>
    <div class="sk-date-picker__control">
      <input class="sk-date-picker__input" placeholder="dd/mm/aaaa" type="text" />
      ${clear ? '<button class="sk-date-picker__clear" aria-label="Limpiar" type="button">×</button>' : ""}
      <button class="sk-date-picker__trigger" type="button">Abrir</button>
    </div>
  </div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-date-picker]")!;
  expect(mountDatePicker(document)).toBe(1);
  return element;
}

const input = () => document.querySelector<HTMLInputElement>(".sk-date-picker__input")!;
const trigger = () => document.querySelector<HTMLButtonElement>(".sk-date-picker__trigger")!;
const clearButton = () => document.querySelector<HTMLButtonElement>(".sk-date-picker__clear")!;
const content = () => document.querySelector<HTMLElement>(".sk-date-picker__content")!;
const dayLabelled = (fragment: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(".sk-calendar__cell-trigger")).find((cell) =>
    cell.getAttribute("aria-label")?.includes(fragment),
  )!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("DatePicker Vanilla contracts", () => {
  it("refuses markup that is missing a part it must patch", () => {
    document.body.innerHTML = `<div class="sk-date-picker" data-sk-date-picker></div>`;
    // Loud rather than half-mounted: a field with no control is not a field.
    expect(() => mountDatePicker(document)).toThrow(/sk-date-picker__control/);
  });

  it("patches the authored control and renders the popover around a calendar", () => {
    const root = markup('data-locale="es-DO"');
    expect(mountDatePicker(document)).toBe(0);

    const label = root.querySelector<HTMLLabelElement>(".sk-date-picker__label")!;
    // A real `for`, not an aria-* stand-in: the label was already a `<label>` in the markup.
    expect(label.getAttribute("for")).toBe(input().id);
    expect(root.querySelector(".sk-date-picker__positioner")).toBeTruthy();
    expect(content().classList.contains("sk-calendar")).toBe(true);
    expect(content().querySelector(".sk-calendar__table")).toBeTruthy();
    // The anchor half of the Anclaje pattern goes on the control, which is what the popup measures.
    expect(root.querySelector(".sk-date-picker__control")?.classList.contains("sk-anchor")).toBe(true);
  });

  it("keeps the placeholder the author wrote", () => {
    markup('data-locale="es-DO"');
    // The machine writes its own; the authored one wins, because it is the one in the page's language.
    expect(input().placeholder).toBe("dd/mm/aaaa");
  });

  it("opens the calendar from the trigger and closes it again", async () => {
    markup('data-locale="es-DO"');
    expect(content().getAttribute("data-state")).toBe("closed");

    fireEvent.click(trigger());

    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    expect(trigger().getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(trigger());
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("false"));
  });

  it("fills the field with the day the reader picked", async () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);

    expect(input().value).toBe("15/03/2024");

    fireEvent.click(trigger());
    await waitFor(() => expect(content().getAttribute("data-state")).toBe("open"));
    fireEvent.click(dayLabelled("20 de marzo de 2024"));

    await waitFor(() => expect(input().value).toBe("20/03/2024"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { value: ["20/03/2024"] } }),
    );
  });

  it("shows the clear control only once there is a date to clear", async () => {
    markup('data-locale="es-DO"');
    // Hidden, not absent: the enhancer patches authored markup and can only toggle `hidden`.
    expect(clearButton().hidden).toBe(true);

    document.body.innerHTML = "";
    markup('data-locale="es-DO" data-value="2024-03-15"');
    expect(clearButton().hidden).toBe(false);
    // The authored label survives the patch, so the field keeps speaking the page's language.
    expect(clearButton().getAttribute("aria-label")).toBe("Limpiar");

    fireEvent.click(clearButton());

    await waitFor(() => expect(input().value).toBe(""));
    expect(clearButton().hidden).toBe(true);
  });

  it("works with no clear control authored at all", () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15"', false);
    expect(root.querySelector(".sk-date-picker__clear")).toBeNull();
    expect(input().value).toBe("15/03/2024");
  });

  it("respects the authored range and flags", () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15" data-min="2024-03-10" data-max="2024-03-20" data-required');

    fireEvent.click(trigger());
    expect(dayLabelled("5 de marzo de 2024").getAttribute("aria-disabled")).toBe("true");
    expect(input().getAttribute("required")).toBe("");

    document.body.innerHTML = "";
    const disabled = markup('data-locale="es-DO" data-disabled');
    expect(disabled.getAttribute("data-disabled")).toBe("");
    expect(input().disabled).toBe(true);
  });

  it("names the field for a form under the name the markup gave it", () => {
    markup('data-locale="es-DO" data-name="llegada" data-value="2024-03-15"');
    expect(document.querySelector<HTMLInputElement>('input[name="llegada"]')).toBeTruthy();
  });

  it("names the trigger and the popover in Spanish by default, not Zag's own English", async () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');

    // Zag's `defaultTranslations` (`@zag-js/date-picker`) is English-only, unconditionally.
    expect(trigger().getAttribute("aria-label")).toBe("Abrir calendario");
    expect(content().getAttribute("aria-label")).toBe("calendario");

    fireEvent.click(trigger());
    await waitFor(() => expect(trigger().getAttribute("aria-expanded")).toBe("true"));
    expect(trigger().getAttribute("aria-label")).toBe("Cerrar calendario");
  });

  it("switches the trigger and popover names to English when the locale says so", () => {
    markup('data-locale="en-US" data-value="2024-03-15"');

    expect(trigger().getAttribute("aria-label")).toBe("Open calendar");
    expect(content().getAttribute("aria-label")).toBe("calendar");
  });
});
