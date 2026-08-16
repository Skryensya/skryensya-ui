import { meterFraction } from "@skryensya/core/meter";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-meter]";

export const mountMeter = createConnectMount({ key: "meter", rootSelector, connect: connectMeter });

/**
 * Sets `--sk-meter-fill` from the authored `aria-valuenow`/`aria-valuemin`/`aria-valuemax`.
 * `meter.css`'s own `0%` default only covers the instant before this runs; a meter is a static
 * measurement, not an interactive control, so there is nothing to wire beyond this one read.
 */
export function connectMeter(root: HTMLElement): () => void {
  const value = Number(root.getAttribute("aria-valuenow"));
  const min = Number(root.getAttribute("aria-valuemin") ?? 0);
  const max = Number(root.getAttribute("aria-valuemax") ?? 100);
  root.style.setProperty("--sk-meter-fill", `${meterFraction(value, min, max) * 100}%`);

  return () => {
    root.style.removeProperty("--sk-meter-fill");
  };
}
