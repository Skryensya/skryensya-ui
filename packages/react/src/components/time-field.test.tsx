import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TimeField } from "./time-field.js";

describe("TimeField", () => {
  it("renders one native time input inside the field chrome", () => {
    const ui = render(
      <TimeField
        defaultValue="09:30"
        label="Inicio"
        name="start"
      />,
    );
    const input = ui.getByLabelText("Inicio") as HTMLInputElement;

    expect(input.type).toBe("time");
    expect(input.value).toBe("09:30");
    expect(ui.container.querySelectorAll("input")).toHaveLength(1);
    expect(
      ui.container.querySelector(".sk-time-field__control")?.contains(input),
    ).toBe(true);
  });

  it("submits and validates through that same native input", () => {
    const ui = render(
      <form data-testid="form">
        <TimeField
          defaultValue="09:30"
          label="Inicio"
          max="18:00"
          min="08:00"
          name="start"
          required
          step={60}
        />
      </form>,
    );
    const form = ui.getByTestId("form") as HTMLFormElement;
    const input = ui.getByLabelText("Inicio") as HTMLInputElement;

    expect(new FormData(form).get("start")).toBe("09:30");
    expect(input.required).toBe(true);
    expect(input.min).toBe("08:00");
    expect(input.max).toBe("18:00");
    expect(input.step).toBe("60");
  });
});
