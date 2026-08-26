import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Slider } from "./slider.js";

describe("Slider", () => {
  it("uses the Zag slider machine anatomy and value state", () => {
    const ui = render(<Slider aria-label="Volume" defaultValue={20} max={100} min={0} />);
    const thumb = ui.getByRole("slider", { name: "Volume" });

    expect(thumb.getAttribute("aria-valuenow")).toBe("20");
    expect(thumb.getAttribute("aria-valuemin")).toBe("0");
    expect(thumb.getAttribute("aria-valuemax")).toBe("100");
    expect(ui.container.querySelector(".sk-slider__track")).not.toBeNull();
    expect(ui.container.querySelector(".sk-slider__range")).not.toBeNull();
  });
});
