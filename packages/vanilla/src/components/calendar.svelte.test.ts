import { fireEvent, waitFor } from "@testing-library/dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mountCalendar } from "./calendar.js";

/*
 * The standalone Calendar: the same `@zag-js/date-picker` machine DatePicker runs, with `inline: true`
 * and none of the field parts. Everything it draws is DERIVED (which weeks are visible, which cell is
 * out of range), so the authored markup is one empty root and the enhancer generates the grid.
 */
function markup(root = 'data-locale="es-DO"') {
  document.body.innerHTML = `<div class="sk-calendar" data-sk-calendar ${root}></div>`;
  const element = document.querySelector<HTMLElement>("[data-sk-calendar]")!;
  expect(mountCalendar(document)).toBe(1);
  return element;
}

const cells = () =>
  Array.from(document.querySelectorAll<HTMLElement>(".sk-calendar__cell-trigger"));
/** Cells are named "Choose <date>" or "Selected date. <date>", so the date itself is the handle. */
const dayLabelled = (fragment: string) =>
  cells().find((cell) => cell.getAttribute("aria-label")?.includes(fragment))!;
const viewTrigger = () =>
  document.querySelector<HTMLButtonElement>(".sk-calendar__view-trigger")!;
const prevTrigger = () =>
  document.querySelector<HTMLButtonElement>(".sk-calendar__previous")!;
const nextTrigger = () =>
  document.querySelector<HTMLButtonElement>(".sk-calendar__next")!;

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Calendar Vanilla contracts", () => {
  it("generates the whole grid from an empty authored root, once", () => {
    const root = markup();
    expect(mountCalendar(document)).toBe(0);

    expect(root.querySelector(".sk-calendar__table")).toBeTruthy();
    // Six rows always, so turning the month never reflows the page under the reader.
    expect(root.querySelectorAll(".sk-calendar__table-body tr")).toHaveLength(6);
    // Inline: there is no field and no popover around it.
    expect(root.querySelector(".sk-date-picker__positioner")).toBeNull();
  });

  it("names the weekdays in the authored locale", () => {
    const root = markup('data-locale="es-DO"');
    const weekdays = Array.from(root.querySelectorAll<HTMLElement>(".sk-calendar__table-header abbr"));

    expect(weekdays.map((day) => day.textContent)).toEqual(["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"]);
    // The two-letter label is the visible one; the full name stays reachable as its title.
    expect(weekdays.map((day) => day.title)).toEqual([
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ]);
  });

  it("opens on the authored date rather than on today", () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');

    const selected = cells().filter((cell) => cell.hasAttribute("data-selected"));
    expect(selected).toHaveLength(1);
    expect(selected[0].textContent?.trim()).toBe("15");
    expect(selected[0].getAttribute("aria-label")).toContain("15 de marzo de 2024");
    expect(selected[0].closest("td")?.getAttribute("aria-selected")).toBe("true");
  });

  it("reports a picked day as the locale's own string", async () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);

    fireEvent.click(dayLabelled("20 de marzo de 2024"));

    // `valueAsString`, which is FORMATTED for the locale rather than ISO: the same string the
    // field would show, so a listener does not have to reformat what the reader already read.
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ detail: { value: ["20/03/2024"] } }),
      ),
    );
    expect(dayLabelled("20 de marzo de 2024").hasAttribute("data-selected")).toBe(true);
  });

  it("keeps days outside the authored range unpickable", () => {
    markup('data-locale="es-DO" data-value="2024-03-15" data-min="2024-03-10" data-max="2024-03-20"');

    // Out of range is announced, not only greyed: "Not available", aria-disabled, off the tab order.
    for (const outside of ["5 de marzo de 2024", "25 de marzo de 2024"]) {
      expect(dayLabelled(outside).getAttribute("aria-disabled")).toBe("true");
      expect(dayLabelled(outside).tabIndex).toBe(-1);
    }
    expect(dayLabelled("12 de marzo de 2024").hasAttribute("aria-disabled")).toBe(false);
  });

  it("also marks the prev/next month triggers aria-disabled at the range's edge, not just native-disabled", () => {
    // min/max both fall inside the same visible month: neither direction has anywhere left to go.
    markup('data-locale="es-DO" data-value="2024-03-15" data-min="2024-03-01" data-max="2024-03-31"');

    expect(prevTrigger().disabled).toBe(true);
    expect(prevTrigger().getAttribute("aria-disabled")).toBe("true");
    expect(nextTrigger().disabled).toBe(true);
    expect(nextTrigger().getAttribute("aria-disabled")).toBe("true");
  });

  it("collects both ends of a range", async () => {
    const root = markup('data-locale="es-DO" data-selection-mode="range" data-value="2024-03-10 2024-03-14"');
    const onChange = vi.fn();
    root.addEventListener("sk-value-change", onChange);

    fireEvent.click(dayLabelled("20 de marzo de 2024"));
    fireEvent.click(dayLabelled("25 de marzo de 2024"));

    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({ detail: { value: ["20/03/2024", "25/03/2024"] } }),
      ),
    );
  });

  it("escalates the view instead of offering two selects", async () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');

    fireEvent.click(viewTrigger());
    await waitFor(() => expect(document.querySelector(".sk-calendar__month-grid")).toBeTruthy());

    fireEvent.click(viewTrigger());
    await waitFor(() => expect(document.querySelector(".sk-calendar__year-grid")).toBeTruthy());

    // The year view is the top of the escalation: clicking again cancels back to the day grid.
    fireEvent.click(viewTrigger());
    await waitFor(() => expect(document.querySelector(".sk-calendar__table-header")).toBeTruthy());
  });

  it("turns the month with the header's own triggers", async () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');
    expect(dayLabelled("20 de marzo de 2024")).toBeTruthy();

    fireEvent.click(document.querySelector<HTMLButtonElement>(".sk-calendar__next")!);

    await waitFor(() => expect(dayLabelled("20 de abril de 2024")).toBeTruthy());

    fireEvent.click(document.querySelector<HTMLButtonElement>(".sk-calendar__previous")!);

    await waitFor(() => expect(dayLabelled("20 de marzo de 2024")).toBeTruthy());
  });

  it("marks a disabled calendar as one", () => {
    const root = markup('data-locale="es-DO" data-value="2024-03-15" data-disabled');
    expect(root.getAttribute("data-disabled")).toBe("");
  });

  it("names every accessible string in Spanish by default, not Zag's own English", () => {
    markup('data-locale="es-DO" data-value="2024-03-15"');

    // Zag's `defaultTranslations` (`@zag-js/date-picker`) is English-only, unconditionally — a day
    // cell was announced "Choose miércoles, 20 de marzo..." (English verb, Spanish date) before this.
    expect(dayLabelled("20 de marzo de 2024").getAttribute("aria-label")).toMatch(/^Elegir /);
    const next = document.querySelector<HTMLButtonElement>(".sk-calendar__next")!;
    const previous = document.querySelector<HTMLButtonElement>(".sk-calendar__previous")!;
    expect(next.getAttribute("aria-label")).toBe("Mes siguiente");
    expect(previous.getAttribute("aria-label")).toBe("Mes anterior");
  });

  it("switches every accessible string to English when the locale says so", () => {
    markup('data-locale="en-US" data-value="2024-03-15"');

    expect(dayLabelled("March 20, 2024").getAttribute("aria-label")).toMatch(/^Choose /);
    const next = document.querySelector<HTMLButtonElement>(".sk-calendar__next")!;
    const previous = document.querySelector<HTMLButtonElement>(".sk-calendar__previous")!;
    expect(next.getAttribute("aria-label")).toBe("Switch to next month");
    expect(previous.getAttribute("aria-label")).toBe("Switch to previous month");
  });

  it("names the year-view cancel trigger in the authored locale too", async () => {
    markup('data-locale="en-US" data-value="2024-03-15"');

    fireEvent.click(viewTrigger());
    await waitFor(() => expect(document.querySelector(".sk-calendar__month-grid")).toBeTruthy());
    fireEvent.click(viewTrigger());
    await waitFor(() => expect(document.querySelector(".sk-calendar__year-grid")).toBeTruthy());

    // This one is authored directly in `CalendarView.svelte`, not sourced from Zag's `translations`
    // at all — it had the exact same English-locale gap, just hardcoded the other language.
    expect(viewTrigger().getAttribute("aria-label")).toBe("Back to current month");
  });
});
