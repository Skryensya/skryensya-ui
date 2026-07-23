import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    expect(control.getAttribute("data-ds-select")).toBeNull();
    expect(control.classList.contains("ds-select-native")).toBe(true);
    expect((control as HTMLSelectElement).value).toBe("starter");
  });
});
