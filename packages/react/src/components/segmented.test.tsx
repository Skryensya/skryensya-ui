import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "./segmented.js";

const options = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

describe("SegmentedControl", () => {
  it("is a radiogroup with exactly one checked option", () => {
    const ui = render(<SegmentedControl defaultValue="week" options={options} />);
    expect(ui.getByRole("radiogroup")).toBeTruthy();
    const selected = ui.getByRole("radio", { checked: true });
    expect(selected.textContent).toBe("Week");
    expect(selected.classList.contains("ds-interactive")).toBe(true);
  });

  it("moves its selection indicator to the newly checked option", () => {
    const ui = render(<SegmentedControl defaultValue="day" options={options} />);
    const month = ui.getByRole("radio", { name: "Month" });
    Object.defineProperties(month, {
      offsetHeight: { configurable: true, value: 32 },
      offsetLeft: { configurable: true, value: 104 },
      offsetTop: { configurable: true, value: 4 },
      offsetWidth: { configurable: true, value: 76 },
    });

    fireEvent.click(month);

    const indicator = ui.container.querySelector<HTMLElement>(".ds-segmented__indicator");
    if (!indicator) throw new Error("Segmented control did not render an indicator");
    expect(indicator.style.getPropertyValue("--ds-segmented-indicator-x")).toBe("104px");
    expect(indicator.style.getPropertyValue("--ds-segmented-indicator-y")).toBe("4px");
    expect(indicator.style.getPropertyValue("--ds-segmented-indicator-width")).toBe("76px");
    expect(indicator.style.getPropertyValue("--ds-segmented-indicator-height")).toBe("32px");
  });

  it("reports the selected value when uncontrolled", () => {
    const onValueChange = vi.fn();
    const ui = render(<SegmentedControl defaultValue="day" onValueChange={onValueChange} options={options} />);
    fireEvent.click(ui.getByText("Month"));
    expect(onValueChange).toHaveBeenCalledWith("month");
    expect(ui.getByRole("radio", { checked: true }).textContent).toBe("Month");
  });

  it("selects the next enabled option with an arrow key", () => {
    const ui = render(<SegmentedControl defaultValue="day" options={[...options, { value: "year", label: "Year", disabled: true }]} />);
    const day = ui.getByRole("radio", { name: "Day" });
    const week = ui.getByRole("radio", { name: "Week" });

    day.focus();
    fireEvent.keyDown(day, { key: "ArrowRight" });

    expect(document.activeElement).toBe(week);
    expect(week.getAttribute("aria-checked")).toBe("true");
    expect(week.getAttribute("tabindex")).toBe("0");
  });
});
