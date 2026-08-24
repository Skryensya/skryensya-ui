import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Calendar } from "./calendar.js";

describe("Calendar", () => {
  it("defaults every accessible name to Spanish, locale-aware from `locale`", () => {
    const ui = render(<Calendar />);

    // Zag's own `defaultTranslations` is English-only and unconditional: `locale` drove
    // `DateFormatter` before this fix, and nothing else. A day cell's accessible name comes from
    // `aria-label`, not its text content (that's just the day number), so this queries by role.
    expect(ui.getAllByRole("button", { name: /^Elegir /i }).length).toBeGreaterThan(0);
    expect(ui.getByRole("button", { name: /^Mes anterior$/ })).toBeTruthy();
    expect(ui.getByRole("button", { name: /^Mes siguiente$/ })).toBeTruthy();
  });

  it("switches every default to English when `locale` says so", () => {
    const ui = render(<Calendar locale="en" />);

    expect(ui.getAllByRole("button", { name: /^Choose /i }).length).toBeGreaterThan(0);
    expect(ui.getByRole("button", { name: /^Switch to previous month$/ })).toBeTruthy();
    expect(ui.getByRole("button", { name: /^Switch to next month$/ })).toBeTruthy();
  });

  it("lets a consumer override a single label without losing the locale-aware defaults for the rest", () => {
    const ui = render(<Calendar prevTriggerLabel={() => "Atrás"} />);

    expect(ui.getByRole("button", { name: "Atrás" })).toBeTruthy();
    // nextTrigger was not overridden: still the locale-aware default.
    expect(ui.getByRole("button", { name: /^Mes siguiente$/ })).toBeTruthy();
  });
});
