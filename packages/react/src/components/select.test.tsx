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
        indicator={<svg className="sk-icon" data-testid="chevron-down" />}
        openIndicator={<svg className="sk-icon" data-testid="chevron-up" />}
        itemIndicator={<svg className="sk-icon" data-testid="check" />}
        label="Brand"
        name="brand"
        options={options}
        onValueChange={onValueChange}
      />,
    );

    expect(ui.getByTestId("chevron-down").classList).toContain("sk-icon");
    expect(ui.getByTestId("chevron-up").classList).toContain("sk-icon");
    fireEvent.click(ui.getByRole("combobox", { name: "Brand" }));
    expect(ui.getAllByTestId("check")).toHaveLength(options.length);
    expect(ui.getAllByTestId("check").every((icon) => icon.classList.contains("sk-icon"))).toBe(true);
    fireEvent.click(await ui.findByRole("option", { name: "Ember" }));

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(expect.objectContaining({ value: ["ember"] })));
    expect((ui.container.querySelector('select[name="brand"]') as HTMLSelectElement).value).toBe("ember");
  });

  it("moves aria-selected onto the highlighted option before Enter commits anything", async () => {
    const ui = render(<Select label="Brand" name="brand" options={options} />);
    const trigger = ui.getByRole("combobox", { name: "Brand" });

    fireEvent.click(trigger);
    await ui.findAllByRole("option");

    // Nothing chosen yet, nothing highlighted yet: no option should claim to be "selected".
    for (const option of ui.getAllByRole("option"))
      expect(option.hasAttribute("aria-selected")).toBe(false);

    // Unlike Combobox's virtual-focus-on-input model, Select moves REAL DOM focus into the
    // listbox on open (`setInitialFocus`, deferred to `raf`). Arrow keys are dispatched wherever
    // focus actually landed, not on the trigger. Waiting for "not the trigger" alone is a race:
    // the trigger blurs to `document.body` synchronously, one tick before the deferred `raf`
    // actually lands focus on the listbox, and `not.toBe(trigger)` is already true during that
    // window. The assertion below then fires the key on `<body>`, which nothing is listening on.
    await waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("listbox"));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    // Matches the WAI reference implementation (`combobox-autocomplete.js`,
    // `setCurrentOptionStyle`), and the same fix already applied to Combobox: the option under
    // `aria-activedescendant` carries `aria-selected="true"` while merely previewed, not just the
    // previously chosen value.
    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Default" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Ember" }).hasAttribute("aria-selected"),
    ).toBe(false);

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });

    await waitFor(() =>
      expect(
        ui.getByRole("option", { name: "Ember" }).getAttribute("aria-selected"),
      ).toBe("true"),
    );
    expect(
      ui.getByRole("option", { name: "Default" }).hasAttribute("aria-selected"),
    ).toBe(false);
  });
});
