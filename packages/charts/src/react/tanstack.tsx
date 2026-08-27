import { chartParts } from "@skryensya/core/chart";
import type { ChartValue } from "@tanstack/charts";
import { Chart as TanStackChart, type ChartProps as TanStackChartProps } from "@tanstack/charts/react";

/*
 * THE ESCAPE HATCH, and it lives on its own subpath on purpose.
 *
 * Everything else in this package speaks the `chart` contract: a series of labelled values, a kind,
 * a tone. That vocabulary is deliberately small, and a small vocabulary always has a boundary. Some
 * charts are past it, and legitimately so: stacked and grouped marks, scatter plots, facets,
 * brushing, two series on independent axes, a tooltip that follows the pointer. Those are not
 * omissions from the contract, they are a different job.
 *
 * So this is the door, with three properties that make it safe to leave open.
 *
 * IT IS A SEPARATE IMPORT, so leaving the contract is visible in the diff rather than hidden in a
 * prop. Anyone reading a file can tell whether it is composing the design system or driving a
 * charting library.
 *
 * IT MAKES THE PEER DEPENDENCY OPTIONAL. `@tanstack/charts` is declared optional in this package's
 * `peerDependenciesMeta`, and nothing outside this file imports it, so the consumer who wanted a line
 * chart never installs it. That matters more than usual here: the library is pre-alpha (0.15.0,
 * pinned exactly), and a pre-alpha dependency on the DEFAULT path would have made every chart in
 * every app hostage to its next release.
 *
 * AND WHAT YOU GET IS TANSTACK'S OWN API, unwrapped. This file adds exactly one thing, the root
 * class, so the tokens still apply. It does not thin the types, rename the options or re-document the
 * grammar: a wrapper that did any of that would be a second contract with no changelog, which is the
 * thing this whole redesign was in aid of removing. Read TanStack's docs, and expect no support from
 * ours: nothing here is versioned by the manifest, and no gate renders it.
 */

export type TanStackChartAdapterProps<
  TDatum = unknown,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
> = TanStackChartProps<TDatum, TXValue, TYValue>;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/**
 * TanStack Charts, with the kit's root class and nothing else changed.
 *
 * Named `TanStackChart` rather than `Chart` so that an import of it can never be mistaken for the
 * contract's own component at the call site.
 */
export function TanStackChartAdapter<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({ className, ...props }: TanStackChartAdapterProps<TDatum, TXValue, TYValue>) {
  return <TanStackChart {...props} className={cx(chartParts.root, className)} />;
}

export { TanStackChartAdapter as TanStackChart };
