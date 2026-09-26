import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./form-field.js";
import { NativeSelect } from "./select-native.js";

describe("NativeSelect", () => {
  it("renders a platform select without an enhancer marker", () => {
    const ui = render(
      <NativeSelect
        aria-label="Plan"
        options={[
          { value: "starter", label: "Starter" },
          { value: "pro", label: "Pro" },
        ]}
      />,
    );

    const control = ui.getByRole("combobox", { name: "Plan" });
    expect(control.tagName).toBe("SELECT");
    expect(control.getAttribute("data-sk-select")).toBeNull();
    expect(control.classList.contains("sk-select-native")).toBe(true);
    expect((control as HTMLSelectElement).value).toBe("starter");
  });

  /*
   * Inside a FormField the select is the field's control, the same as Input: the label points at it
   * and the hint describes it. It used to take none of that wiring, so the label's `for` named an id
   * no element had and the hint was never announced, while the Vanilla binding wired both.
   */
  it("takes its id, description and required state from a FormField around it", () => {
    const ui = render(
      <FormField label="Plan" hint="You can change it later." required>
        <NativeSelect name="plan" options={[{ value: "starter", label: "Starter" }]} />
      </FormField>,
    );

    const control = ui.getByRole("combobox", { name: "Plan" });
    const hint = ui.getByText("You can change it later.");
    expect(control.getAttribute("aria-describedby")).toContain(hint.id);
    expect((control as HTMLSelectElement).required).toBe(true);
  });

  it("keeps an id and description passed to it directly", () => {
    const ui = render(
      <FormField label="Plan">
        <NativeSelect id="own" aria-describedby="elsewhere" options={[{ value: "a", label: "A" }]} />
      </FormField>,
    );

    const control = ui.getByRole("combobox");
    expect(control.id).toBe("own");
    expect(control.getAttribute("aria-describedby")).toBe("elsewhere");
  });
});
