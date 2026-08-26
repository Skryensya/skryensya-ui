import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SliderRange } from "./slider.js";

describe("SliderRange React contracts", () => {
  it("names each thumb distinctly and starts at the authored defaults", () => {
    const ui = render(
      <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="Máximo" lowLabel="Mínimo" />,
    );
    const min = ui.getByRole("slider", { name: "Mínimo" });
    const max = ui.getByRole("slider", { name: "Máximo" });
    expect(min.getAttribute("aria-valuenow")).toBe("20");
    expect(max.getAttribute("aria-valuenow")).toBe("80");
  });

  it("bounds each thumb's max/min at the other's CURRENT value", () => {
    const ui = render(
      <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="Máximo" lowLabel="Mínimo" />,
    );
    const min = ui.getByRole("slider", { name: "Mínimo" });
    const max = ui.getByRole("slider", { name: "Máximo" });
    expect(min.getAttribute("aria-valuemax")).toBe("80");
    expect(max.getAttribute("aria-valuemin")).toBe("20");
    expect(min.getAttribute("aria-valuemin")).toBe("0");
    expect(max.getAttribute("aria-valuemax")).toBe("100");
  });
});
