import { chartParts } from "@skryensya/core/chart";
import type { ChartPoint } from "@skryensya/core/chart";
import { Chart as ContractChart, type ChartProps as ContractChartProps } from "@skryensya/react/chart";
import { chartAreaPath, chartLinePath } from "../geometry.js";

/*
 * THE RENDERER. Same contract, one more kind that actually paints.
 *
 * The props here are the CONTRACT's props, imported rather than restated: this component is a
 * drop-in for `@skryensya/react/chart`'s own `Chart`, and swapping the import is the entire migration
 * from "bars work" to "lines work too". Nothing in this signature is this package's invention, and
 * nothing in it names a charting library, which is what makes the engine below replaceable.
 *
 * A bar chart never reaches this file's geometry at all: `kind="bar"` renders the contract's markup
 * and the stylesheet paints it. So a consumer who installs this package for one line chart does not
 * change how their bar charts work, and one who never installs it still has bar charts.
 */

export type ChartProps = ContractChartProps;

export function Chart({ kind = "bar", points, ...props }: ChartProps) {
  return (
    <ContractChart
      {...props}
      kind={kind}
      overlay={kind === "bar" ? undefined : <ChartOverlay kind={kind} points={points} />}
      points={points}
    />
  );
}

type ChartOverlayProps = {
  kind: "line" | "area";
  points: readonly ChartPoint[];
};

/**
 * The painted series, for the kinds CSS cannot compute.
 *
 * `preserveAspectRatio="none"` over a 0-100 box is what makes this responsive with no measurement:
 * see `geometry.ts`'s own banner. No `role`, no title, no `aria-label`: the parent overlay is already
 * `aria-hidden` because the list underneath is the data, and a second accessible rendering of one
 * series is a series read twice.
 */
function ChartOverlay({ kind, points }: ChartOverlayProps) {
  const line = chartLinePath(points);
  if (!line) return null;

  return (
    <svg className={chartParts.overlaySvg} preserveAspectRatio="none" viewBox="0 0 100 100">
      {kind === "area" && <path className={chartParts.overlayArea} d={chartAreaPath(points)} />}
      <path className={chartParts.overlayLine} d={line} />
    </svg>
  );
}
