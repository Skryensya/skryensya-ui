import { emitMarkup } from "@skryensya/ai-compiler/emit";
import { chartAreaPath, chartLinePath } from "@skryensya/charts/geometry";
import type { ChartKind, ChartPoint } from "@skryensya/core/chart";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * LINE/AREA VANILLA PARITY, for the one thing a `chart` tree cannot ask for on its own.
 *
 * `@skryensya/charts`'s SVG overlay is a React-only prop (`packages/charts/src/react/chart.tsx`'s own
 * `overlay`), not a documented `chart` contract option, so `emitMarkup` can only ever produce the
 * bar-shaped markup: the correct anatomy, `data-kind="line"`/`"area"` and all, but with the overlay
 * div the contract's own template reserves (`core/chart.ts`) left empty.
 *
 * This fills that SAME div with the SAME geometry the React renderer draws
 * (`packages/charts/src/geometry.ts`'s own `chartLinePath`/`chartAreaPath`), computed once here at
 * build time rather than by a runtime engine: every line/area demo on the Charts page is static data,
 * so there is nothing for a renderer to react to, and this is the whole reason a real charting
 * library was never needed for it (see `geometry.ts`'s own banner).
 */

function overlaySvg(kind: "line" | "area", points: readonly ChartPoint[]): string {
  const line = chartLinePath(points);
  if (!line) return "";
  const area = kind === "area" ? `<path class="sk-chart__area" d="${chartAreaPath(points)}"></path>` : "";
  return `<svg class="sk-chart__svg" preserveAspectRatio="none" viewBox="0 0 100 100">${area}<path class="sk-chart__line" d="${line}"></path></svg>`;
}

export type OverlayChart = {
  readonly kind: ChartKind;
  readonly points: readonly ChartPoint[];
};

/**
 * Emits a composition's markup, then paints the overlay of every `line`/`area` chart inside it, IN
 * DOCUMENT ORDER: `chartsInOrder` lists every `Chart` node the tree contains, top to bottom, exactly
 * once each, `bar` ones included (as a no-op placeholder) so the Nth entry always lines up with the
 * Nth `.sk-chart__overlay` the emitted markup contains.
 *
 * `data-rendered` is added to a chart's figure the same way the React binding writes it
 * (`packages/react/src/components/chart.tsx`: present exactly when an overlay was supplied), so
 * `chart.css` retires that chart's fallback bars on both bindings alike.
 */
export function emitCompositionWithChartOverlays(
  tree: UsageTree,
  chartsInOrder: readonly OverlayChart[],
): string {
  const html = emitMarkup(tree, { fillDefaults: false });
  let cursor = 0;

  const withRendered = html.replace(/data-sk-chart\b/g, () => {
    const chart = chartsInOrder[cursor];
    cursor += 1;
    return chart && chart.kind !== "bar" ? "data-sk-chart\n  data-rendered" : "data-sk-chart";
  });

  cursor = 0;
  return withRendered.replace(/<div class="sk-chart__overlay" aria-hidden="true"><\/div>/g, (match) => {
    const chart = chartsInOrder[cursor];
    cursor += 1;
    if (!chart || chart.kind === "bar") return match;
    const svg = overlaySvg(chart.kind, chart.points);
    return svg ? `<div class="sk-chart__overlay" aria-hidden="true">${svg}</div>` : match;
  });
}

/** The common case: a tree with exactly one `Chart` node. */
export function emitChartWithOverlay(tree: UsageTree, kind: ChartKind, points: readonly ChartPoint[]): string {
  return emitCompositionWithChartOverlays(tree, [{ kind, points }]);
}
