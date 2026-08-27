/*
 * The renderer for the `chart` contract's `line` and `area` kinds.
 *
 * `Chart` here is a drop-in for `@skryensya/react/chart`'s own: same props, same markup, one more
 * kind that paints. Bar charts do not need this package at all.
 *
 * The full TanStack grammar is NOT re-exported here. It lives at `@skryensya/charts/react/tanstack`,
 * so that reaching past the contract is visible in the import and its pre-alpha peer dependency stays
 * uninstalled for everyone who did not.
 */
export { Chart } from "./chart.js";
export type { ChartProps } from "./chart.js";
