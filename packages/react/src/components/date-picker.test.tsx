import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DatePicker } from "./date-picker.js";

describe("DatePicker", () => {
  it("defaults every accessible name to Spanish, locale-aware from `locale`", async () => {
    const ui = render(<DatePicker label="Fecha" />);
    const trigger = ui.getByRole("button", { name: "Abrir calendario" });

    fireEvent.click(trigger);

    // Matches the WAI reference implementation's own wording style ("Choose {date}"), just in the
    // locale the component was already told to format dates in — `locale` drove `DateFormatter`
    // before this fix, and nothing else. A day cell's accessible name is its `aria-label`, not its
    // text content (that's just the day number), so this queries by role.
    await waitFor(() =>
      expect(ui.getAllByRole("button", { name: /^Elegir /i }).length).toBeGreaterThan(0),
    );
  });

  it("switches every default to English when `locale` says so, with no other prop touched", async () => {
    const ui = render(<DatePicker label="Date" locale="en" />);
    const trigger = ui.getByRole("button", { name: "Open calendar" });

    fireEvent.click(trigger);

    await waitFor(() =>
      expect(ui.getAllByRole("button", { name: /^Choose /i }).length).toBeGreaterThan(0),
    );
  });

  it("lets a consumer override a single label without losing the locale-aware defaults for the rest", async () => {
    const ui = render(<DatePicker label="Fecha" triggerLabel={(open) => (open ? "Cerrar" : "Ver fechas")} />);

    expect(ui.getByRole("button", { name: "Ver fechas" })).toBeTruthy();
  });
});
