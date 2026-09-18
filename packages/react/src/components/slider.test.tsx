import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
    expect(ui.container.querySelector("[data-sk-slider]")).not.toBeNull();
  });

  it("dispatches sk:slidervaluechange with the same detail vanilla does", async () => {
    const onDom = vi.fn();
    const onValueChange = vi.fn();
    const ui = render(
      <Slider aria-label="Volume" defaultValue={20} max={100} min={0} step={1} onValueChange={onValueChange} />,
    );
    const root = ui.container.querySelector("[data-sk-slider]")!;
    const thumb = ui.getByRole("slider", { name: "Volume" });
    root.addEventListener("sk:slidervaluechange", onDom);

    // Zag only steps from the keyboard once the thumb is focused (same NumberField pattern).
    fireEvent.focus(thumb);
    await waitFor(() => expect(root.hasAttribute("data-focus")).toBe(true));

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    await waitFor(() => expect(onValueChange).toHaveBeenCalled());
    expect(onDom).toHaveBeenCalled();
    expect((onDom.mock.calls[0]![0] as CustomEvent).detail).toEqual({
      value: onValueChange.mock.calls[0]![0],
    });
  });
});
