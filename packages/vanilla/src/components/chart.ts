import { chartAttrs, chartMax, chartParts, formatChartValue, type ChartFormat } from "@skryensya/core/chart";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = `[${chartAttrs.root}]`;

export const mountChart = createConnectMount({ key: "chart", rootSelector, connect: connectChart });

/**
 * Turns an authored series into a painted one: reads `data-value` off every entry, computes the
 * maximum once, and writes `--sk-chart-max` on the figure and `--sk-chart-value` on each entry.
 * `chart.css` divides one by the other to get a bar's height.
 *
 * The arithmetic is the whole enhancer, and that is the design (`core/chart.ts`'s banner): a bar
 * chart needs a division, not a charting library. Meter's precedent for the shape, with one
 * difference that matters. A meter reads a value that is already ON the element it paints, so it can
 * work from attributes alone; a bar's height depends on the LARGEST value in the series, which no
 * single entry knows. Hence the pass over the whole list before anything is written.
 *
 * It also fills in an entry's value TEXT when the author left it empty, using the same
 * `formatChartValue` the React binding calls. Without that, identical markup would announce the
 * number on one side and nothing on the other, which is exactly the divergence the symmetry gate
 * exists to catch.
 */
export function connectChart(root: HTMLElement): () => void {
  const points = Array.from(root.querySelectorAll<HTMLElement>(`.${chartParts.point}`));
  const values = points.map((point) => Number(point.getAttribute("data-value")));
  const max = chartMax(values);

  root.style.setProperty(chartAttrs.max, String(max));

  const format = (root.getAttribute("data-format") ?? undefined) as ChartFormat | undefined;
  const currency = root.getAttribute("data-currency") ?? undefined;
  const locale = root.getAttribute("data-locale") ?? undefined;
  const filled: HTMLElement[] = [];

  points.forEach((point, index) => {
    const value = values[index] ?? 0;
    point.style.setProperty(chartAttrs.value, String(value));

    const text = point.querySelector<HTMLElement>(`.${chartParts.value}`);
    if (text && text.textContent?.trim() === "") {
      text.textContent = formatChartValue(value, { currency, format, locale });
      filled.push(text);
    }
  });

  return () => {
    root.style.removeProperty(chartAttrs.max);
    for (const point of points) point.style.removeProperty(chartAttrs.value);
    // Only the ones this enhancer wrote: an author's own string is not ours to clear.
    for (const text of filled) text.textContent = "";
  };
}
