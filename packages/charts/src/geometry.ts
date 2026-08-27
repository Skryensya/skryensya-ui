import { chartFraction, chartMax, type ChartPoint } from "@skryensya/core/chart";

/*
 * The path a series traces, and the only thing in this package that the contract's own stylesheet
 * could not do.
 *
 * WHY THERE IS NO CHARTING LIBRARY BEHIND THIS. The overlay these coordinates end up in is
 * `aria-hidden`, has no axes, no legend, no ticks and no tooltips, because the contract's own list
 * already carries every one of those as real text. What is left of "draw a chart" is: put N points in
 * a box and connect them. A grammar-of-graphics library brings scales, axes, interaction and
 * animation to that job, of which we would use the scales, and a scale over one series is a division.
 *
 * The full grammar is still one import away for anyone who needs marks this cannot express (stacks,
 * facets, scatter, brushing): `@skryensya/charts/react/tanstack`. It is a separate subpath precisely
 * so that reaching for it is visible in the import, and so that its pre-alpha peer dependency is not
 * installed by everyone who wanted a line.
 *
 * THE COORDINATE SYSTEM IS A UNIT BOX, 0-100 on both axes, painted with
 * `preserveAspectRatio="none"`. That is what makes the overlay responsive without measuring
 * anything: the SVG stretches to whatever the plot's size turns out to be, at any breakpoint, with no
 * ResizeObserver, no layout pass and no re-render. The distortion that would normally cost (a stroke
 * squashed along with the box) is undone by `vector-effect: non-scaling-stroke` in the stylesheet.
 */

/** X of the entry at `index`, in the unit box. A single point sits in the middle rather than at the
 *  left edge: one value has no direction, and a dot pinned to x=0 reads as the start of a trend. */
export function chartPointX(index: number, count: number): number {
  if (count <= 1) return 50;
  return (index / (count - 1)) * 100;
}

/** Y of a value, in the unit box. Inverted, because SVG's origin is the top-left and a chart's is
 *  the bottom-left: a bigger number has to be HIGHER. */
export function chartPointY(value: number, max: number): number {
  return 100 - chartFraction(value, max) * 100;
}

/** Rounded to two decimals: the extra digits are sub-pixel at any real size and they triple the
 *  length of the `d` attribute, which is markup shipped on every render. */
const round = (n: number): number => Math.round(n * 100) / 100;

/**
 * The polyline through a series, as an SVG `d`. Empty string for an empty series, so a caller can
 * treat "nothing to draw" as falsy rather than emitting a path that renders a stray dot.
 */
export function chartLinePath(points: readonly ChartPoint[]): string {
  if (points.length === 0) return "";
  const max = chartMax(points.map((point) => point.value));

  return points
    .map((point, index) => {
      const x = round(chartPointX(index, points.length));
      const y = round(chartPointY(point.value, max));
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

/**
 * The same polyline, closed down to the baseline and back. A separate path from the line rather than
 * one filled path, because an `area` is drawn as BOTH: the fill wants to be closed and translucent,
 * the stroke on top wants to be open and opaque, and a single closed path with a stroke would draw a
 * line along the bottom and up the two sides. That vertical edge at x=0 reads as an axis the chart
 * does not have.
 */
export function chartAreaPath(points: readonly ChartPoint[]): string {
  const line = chartLinePath(points);
  if (!line) return "";
  const lastX = round(chartPointX(points.length - 1, points.length));
  const firstX = round(chartPointX(0, points.length));
  return `${line} L${lastX} 100 L${firstX} 100 Z`;
}
