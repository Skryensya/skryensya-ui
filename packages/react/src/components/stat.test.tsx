import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Stat } from "./stat.js";

describe("Stat", () => {
  it("colours the change by trend, not by sign", () => {
    const ui = render(<Stat change="▼ 2.3%" label="Churn" trend="up" value="0.9%" />);
    expect(ui.getByText("▼ 2.3%").getAttribute("data-trend")).toBe("up");
    expect(ui.getByText("Churn")).toBeTruthy();
    expect(ui.getByText("0.9%")).toBeTruthy();
  });

  it("omits the change element when no change is given", () => {
    const ui = render(<Stat label="Users" value="3,914" />);
    expect(ui.container.querySelector(".ds-stat__change")).toBeNull();
  });
});
