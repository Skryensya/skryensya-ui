import { fireEvent } from "@testing-library/dom";
import { describe, expect, it } from "vitest";
import { sliderFillProperty } from "@skryensya/core/slider";
import { connectSlider, mountSlider } from "./slider.js";

function mount(html: string) {
  document.body.innerHTML = html;
  const root = document.querySelector<HTMLInputElement>("[data-sk-slider]");
  if (!root) throw new Error("Expected slider root.");
  return root;
}

const fill = (el: HTMLElement) => el.style.getPropertyValue(sliderFillProperty);

describe("Slider Vanilla contracts", () => {
  it("paints the initial fill from value within [min, max] on mount", () => {
    const root = mount(`<input class="sk-slider" type="range" min="0" max="100" value="65" data-sk-slider />`);
    const cleanup = connectSlider(root);

    expect(fill(root)).toBe("0.65");
    cleanup();
  });

  it("tracks the value on input, and honours a non-zero min", () => {
    const root = mount(`<input class="sk-slider" type="range" min="20" max="70" value="20" data-sk-slider />`);
    const cleanup = connectSlider(root);
    expect(fill(root)).toBe("0"); // at min

    root.value = "45"; // the midpoint of [20, 70]
    fireEvent.input(root);
    expect(fill(root)).toBe("0.5");

    cleanup();
  });

  it("falls back to the platform default range (0–100) when min/max are unset", () => {
    const root = mount(`<input class="sk-slider" type="range" value="25" data-sk-slider />`);
    const cleanup = connectSlider(root);

    expect(fill(root)).toBe("0.25");
    cleanup();
  });

  it("stops updating after cleanup", () => {
    const root = mount(`<input class="sk-slider" type="range" min="0" max="100" value="10" data-sk-slider />`);
    const cleanup = connectSlider(root);
    expect(fill(root)).toBe("0.1");

    cleanup();
    root.value = "90";
    fireEvent.input(root);
    expect(fill(root)).toBe("0.1"); // unchanged: the listener is gone
  });

  it("auto-mounts via the enhancer and refuses a non-range root", () => {
    const root = mount(`<input class="sk-slider" type="range" min="0" max="100" value="50" data-sk-slider />`);
    expect(mountSlider(document)).toBe(1);
    expect(fill(root)).toBe("0.5");

    document.body.innerHTML = `<input class="sk-slider" type="text" data-sk-slider />`;
    const wrong = document.querySelector<HTMLElement>("[data-sk-slider]")!;
    expect(() => connectSlider(wrong)).toThrow(/range/);
  });
});
