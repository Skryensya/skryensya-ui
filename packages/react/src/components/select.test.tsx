import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "./select.js";

const options = [
  { value: "default", label: "Default" },
  { value: "ember", label: "Ember" },
  { value: "dusk", label: "Dusk", disabled: true },
];

describe("Select", () => {
  it("uses the Zag select machine for popup selection and form value", async () => {
    const onValueChange = vi.fn();
    const ui = render(
      <Select
        indicator={<svg className="ds-icon" data-testid="chevron-down" />}
        openIndicator={<svg className="ds-icon" data-testid="chevron-up" />}
        itemIndicator={<svg className="ds-icon" data-testid="check" />}
        label="Brand"
        name="brand"
        options={options}
        onValueChange={onValueChange}
      />,
    );

    expect(ui.getByTestId("chevron-down").classList).toContain("ds-icon");
    expect(ui.getByTestId("chevron-up").classList).toContain("ds-icon");
    fireEvent.click(ui.getByRole("combobox", { name: "Brand" }));
    expect(ui.getAllByTestId("check")).toHaveLength(options.length);
    expect(ui.getAllByTestId("check").every((icon) => icon.classList.contains("ds-icon"))).toBe(true);
    fireEvent.click(await ui.findByRole("option", { name: "Ember" }));

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["ember"] })));
    expect((ui.container.querySelector('select[name="brand"]') as HTMLSelectElement).value).toBe("ember");
  });
});
