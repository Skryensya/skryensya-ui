import { sliderFill, sliderFillProperty, sliderParts } from "@skryensya/core/slider";
import { bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-ds-slider]";

type Cleanup = () => void;

/*
 * SLIDER, keeps `--ds-slider-fill` in sync with a native range's value.
 *
 * The track paints its filled portion against that custom property (see components/slider.css), and
 * CSS alone can read the initial `value` but cannot follow the thumb as it moves, a range input
 * exposes no `:has()`-able "current value" selector. So this is the one thing the platform doesn't
 * give: recompute the fraction on every `input` and write it back. Everything else, keyboard, form
 * participation, the a11y tree, stays the platform's. The enhancer patches no markup and writes no
 * class; it only sets the property, on mount and on change.
 */
export function connectSlider(root: HTMLElement): Cleanup {
  if (!(root instanceof HTMLInputElement) || root.type !== "range") {
    throw new Error(`Slider enhancer expects an <input type="range"> as its root (${rootSelector}).`);
  }
  if (!root.classList.contains(sliderParts.root)) {
    throw new Error(`Slider enhancer expects .${sliderParts.root} on the root element.`);
  }

  const paint = () => {
    // An unset min/max reflects as "", fall back to the range input's own platform defaults (0–100)
    // rather than to NaN, which sliderFill would floor to 0.
    const min = root.min === "" ? 0 : Number(root.min);
    const max = root.max === "" ? 100 : Number(root.max);
    root.style.setProperty(sliderFillProperty, String(sliderFill(Number(root.value), min, max)));
  };

  paint();
  return bindEvents(root, { input: paint });
}

export const mountSlider = createConnectMount({ key: "slider", rootSelector, connect: connectSlider });
