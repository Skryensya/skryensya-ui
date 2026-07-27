import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "./slider.js";

describe("Slider", () => {
  it("stays a native range input and reports value changes as numbers", () => {
    const onValueChange = vi.fn();
    const ui = render(<Slider aria-label="Volume" defaultValue={20} max={100} min={0} onValueChange={onValueChange} />);
    const input = ui.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
    expect(input.type).toBe("range");

    fireEvent.change(input, { target: { value: "60" } });
    expect(onValueChange).toHaveBeenCalledWith(60);
    expect(input.getAttribute("style")).toContain("--sk-slider-fill: 0.6");
  });
});
