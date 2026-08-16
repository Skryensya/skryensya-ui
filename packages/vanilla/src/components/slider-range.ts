import { clampSliderRange, sliderFill, sliderRangeBounds } from "@skryensya/core/slider";
import { bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-slider-range]",
  low: "[data-sk-slider-range-low]",
  high: "[data-sk-slider-range-high]",
  fill: "[data-sk-slider-range-fill]",
} as const;

type Cleanup = () => void;

/*
 * Keeps the two native inputs of a `SliderRange` from being dragged past each other, and the fill
 * bar between them in sync — the one thing native `min`/`max` can't do on their own, because
 * neither input's bounds know about the other's current value. See `slider.ts`'s own "MULTI-THUMB"
 * banner for why two plain range inputs were chosen over a hand-rolled widget in the first place.
 */
export function connectSliderRange(root: HTMLElement): Cleanup {
  const low = root.querySelector<HTMLInputElement>(selector.low);
  const high = root.querySelector<HTMLInputElement>(selector.high);
  const fill = root.querySelector<HTMLElement>(selector.fill);
  if (!low || !high) return () => {};

  const numberOr = (raw: string, fallback: number) => {
    const n = Number(raw);
    return raw === "" || !Number.isFinite(n) ? fallback : n;
  };

  // Captured ONCE, before either input's own `min`/`max` gets narrowed to the other thumb's
  // current value below — reading them back off the inputs on a LATER sync would see the
  // already-narrowed bound instead of the true, fixed ends of the whole range.
  const min = numberOr(low.min || high.min, 0);
  const max = numberOr(low.max || high.max, 100);

  const sync = () => {
    const { low: lowValue, high: highValue } = clampSliderRange(Number(low.value), Number(high.value));
    const bounds = sliderRangeBounds(lowValue, highValue, min, max);
    low.min = String(bounds.lowMin);
    low.max = String(bounds.lowMax);
    high.min = String(bounds.highMin);
    high.max = String(bounds.highMax);
    fill?.style.setProperty("--sk-slider-range-fill-start", String(sliderFill(lowValue, min, max)));
    fill?.style.setProperty("--sk-slider-range-fill-end", String(sliderFill(highValue, min, max)));
  };

  sync();
  const cleanups = [bindEvents(low, { input: sync }), bindEvents(high, { input: sync })];
  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

export const mountSliderRange = createConnectMount({
  key: "slider-range",
  rootSelector: selector.root,
  connect: connectSliderRange,
});
