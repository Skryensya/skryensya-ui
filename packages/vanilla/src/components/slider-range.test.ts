import { fireEvent } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { destroyMount } from "../runtime/svelte-hydrate.js";
import { mountSliderRange } from "./slider-range.js";

function markup() {
  document.body.innerHTML = `<div class="sk-slider-range" data-sk-slider-range>
    <div class="sk-slider-range__track" data-sk-slider-range-track aria-hidden="true"></div>
    <div class="sk-slider-range__fill" data-sk-slider-range-fill aria-hidden="true"></div>
    <input class="sk-slider-range__low sk-slider" data-sk-slider-range-low type="range" min="0" max="100" value="20" aria-label="Mínimo" />
    <input class="sk-slider-range__high sk-slider" data-sk-slider-range-high type="range" min="0" max="100" value="80" aria-label="Máximo" />
  </div>`;
  const root = document.querySelector<HTMLElement>("[data-sk-slider-range]")!;
  expect(mountSliderRange(document)).toBe(1);
  return root;
}

const low = () => document.querySelector<HTMLInputElement>("[data-sk-slider-range-low]")!;
const high = () => document.querySelector<HTMLInputElement>("[data-sk-slider-range-high]")!;
const fill = () => document.querySelector<HTMLElement>("[data-sk-slider-range-fill]")!;

afterEach(() => {
  const root = document.querySelector<HTMLElement>("[data-sk-slider-range]");
  if (root) destroyMount(root);
  document.body.innerHTML = "";
});

describe("SliderRange vanilla enhancer", () => {
  it("bounds each thumb's max/min at the other's CURRENT value on mount", () => {
    markup();
    expect(low().max).toBe("80");
    expect(high().min).toBe("20");
    // The true ends of the range stay put — neither is the OTHER thumb's value.
    expect(low().min).toBe("0");
    expect(high().max).toBe("100");
  });

  it("paints the fill bar's start/end fractions from each thumb's value", () => {
    markup();
    expect(fill().style.getPropertyValue("--sk-slider-range-fill-start")).toBe("0.2");
    expect(fill().style.getPropertyValue("--sk-slider-range-fill-end")).toBe("0.8");
  });

  it("re-narrows the OTHER thumb's bound after a real drag, without losing the true range ends", () => {
    const root = markup();
    low().value = "50";
    fireEvent.input(low());
    expect(high().min).toBe("50");
    // A SECOND sync (moving the other thumb) must not have drifted the true ends — this is the
    // exact bug caught while writing this enhancer: reading `min`/`max` back off the already-
    // narrowed inputs on a later sync, instead of the ends captured once at connect time.
    high().value = "90";
    fireEvent.input(high());
    expect(low().max).toBe("90");
    expect(low().min).toBe("0");
    expect(high().max).toBe("100");
    void root;
  });

  it("never lets one thumb's value exceed the other — native min/max clamps a direct value write past the bound", () => {
    markup();
    low().value = "50";
    fireEvent.input(low());
    // Native range inputs clamp `.value` assignment to their own `min`/`max`; low's `max` is now 80.
    low().value = "95";
    expect(Number(low().value)).toBeLessThanOrEqual(80);
  });
});
