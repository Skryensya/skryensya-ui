import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountSliderRange } from "./slider-range.js";

function markup() {
  document.body.innerHTML = `<div class="sk-slider-range" data-sk-slider-range data-low-value="20" data-high-value="80" data-min="0" data-max="100">
    <div class="sk-slider-range__control" data-sk-slider-range-control>
      <div class="sk-slider-range__track" data-sk-slider-range-track><div class="sk-slider-range__fill" data-sk-slider-range-fill></div></div>
      <div class="sk-slider-range__low" data-sk-slider-range-low aria-label="Mínimo"><input class="sk-slider-range__low-input" data-sk-slider-range-low-input type="text" hidden /></div>
      <div class="sk-slider-range__high" data-sk-slider-range-high aria-label="Máximo"><input class="sk-slider-range__high-input" data-sk-slider-range-high-input type="text" hidden /></div>
    </div>
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-slider-range]")!;
  expect(mountSliderRange(document)).toBe(1);
  return root;
}

const low = () => document.querySelector<HTMLElement>("[data-sk-slider-range-low]")!;
const high = () => document.querySelector<HTMLElement>("[data-sk-slider-range-high]")!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-slider-range]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("SliderRange vanilla enhancer", () => {
  it("bounds each thumb's max/min at the other's CURRENT value on mount", () => {
    markup();
    expect(low().getAttribute("aria-valuemax")).toBe("80");
    expect(high().getAttribute("aria-valuemin")).toBe("20");
    expect(low().getAttribute("aria-valuemin")).toBe("0");
    expect(high().getAttribute("aria-valuemax")).toBe("100");
  });

  it("paints the fill bar's start/end offsets from each thumb's value", () => {
    const root = markup();
    expect(root.style.getPropertyValue("--slider-range-start")).toBe("20%");
    expect(root.style.getPropertyValue("--slider-range-end")).toBe("20%");
  });
});
