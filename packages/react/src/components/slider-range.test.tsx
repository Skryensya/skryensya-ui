import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    expect(ui.container.querySelector("[data-sk-slider-range]")).not.toBeNull();
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

  it("dispatches sk:slidervaluechange with { low, high } like vanilla", async () => {
    const onDom = vi.fn();
    const onValueChange = vi.fn();
    const ui = render(
      <SliderRange
        defaultHighValue={80}
        defaultLowValue={20}
        highLabel="Máximo"
        lowLabel="Mínimo"
        step={1}
        onValueChange={onValueChange}
      />,
    );
    const root = ui.container.querySelector("[data-sk-slider-range]")!;
    const thumb = ui.getByRole("slider", { name: "Mínimo" });
    root.addEventListener("sk:slidervaluechange", onDom);

    fireEvent.focus(thumb);
    await waitFor(() => expect(root.hasAttribute("data-focus")).toBe(true));

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual(onValueChange.mock.calls[0]![0]);
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toMatchObject({
      low: expect.any(Number),
      high: expect.any(Number),
    });
  });
});
