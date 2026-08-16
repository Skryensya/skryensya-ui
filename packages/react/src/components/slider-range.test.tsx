import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SliderRange } from "./slider.js";

describe("SliderRange React contracts", () => {
  it("names each thumb distinctly and starts at the authored defaults", () => {
    const ui = render(
      <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="Máximo" lowLabel="Mínimo" />,
    );
    const min = ui.getByRole("slider", { name: "Mínimo" }) as HTMLInputElement;
    const max = ui.getByRole("slider", { name: "Máximo" }) as HTMLInputElement;
    expect(min.value).toBe("20");
    expect(max.value).toBe("80");
  });

  it("bounds each thumb's max/min at the other's CURRENT value", () => {
    const ui = render(
      <SliderRange defaultHighValue={80} defaultLowValue={20} highLabel="Máximo" lowLabel="Mínimo" />,
    );
    const min = ui.getByRole("slider", { name: "Mínimo" }) as HTMLInputElement;
    const max = ui.getByRole("slider", { name: "Máximo" }) as HTMLInputElement;
    expect(min.max).toBe("80");
    expect(max.min).toBe("20");
    expect(min.min).toBe("0");
    expect(max.max).toBe("100");
  });

  it("re-bounds the OTHER thumb after a value changes, reporting both values on change", () => {
    const onValueChange = vi.fn();
    const ui = render(
      <SliderRange
        defaultHighValue={80}
        defaultLowValue={20}
        highLabel="Máximo"
        lowLabel="Mínimo"
        onValueChange={onValueChange}
      />,
    );
    const min = ui.getByRole("slider", { name: "Mínimo" }) as HTMLInputElement;
    const max = ui.getByRole("slider", { name: "Máximo" }) as HTMLInputElement;

    fireEvent.change(min, { target: { value: "50" } });
    expect(onValueChange).toHaveBeenCalledWith({ low: 50, high: 80 });
    expect(max.min).toBe("50");
  });
});
