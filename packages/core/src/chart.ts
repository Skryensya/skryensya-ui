import type { ComponentContract } from "./contract.js";

/*
 * CHART, a small series of labelled values made visible.
 *
 * THE DATA IS A LIST, AND THAT IS THE WHOLE DESIGN. Every other decision here follows from it.
 *
 * A charting library's natural shape is a canvas plus a description of what to draw on it, and a
 * contract written that way would have had to carry marks, scales, accessors and a curve factory:
 * that is not a contract, it is somebody else's API with our name on it. Worse, it would have been
 * unauthorable. There is no way to write a `<canvas>` full of scales in static markup, so the
 * Vanilla side would have had no binding at all, and the ONE artifact both bindings are supposed to
 * realize would have existed for only one of them.
 *
 * So the contract models what a chart IS to a reader instead: a series of entries, each with a label
 * and a number. That is an `items` slot, the same shape Tabs, Segmented and TreeView already use for
 * their collections, and it buys four things at once:
 *
 *   1. ACCESSIBILITY FOR FREE, and better than the alternative. The series is a real list of real
 *      text, so a screen reader reads "Dec, 14, Jan, 23" off the DOM. The usual approach (an SVG
 *      plus `aria-label="a chart of monthly contributions"`) announces that data exists and then
 *      refuses to say what it is. Here the accessible rendering is not a summary of the picture, it
 *      is the picture's own source.
 *   2. NO JAVASCRIPT FOR BARS. Each entry's value lands on a custom property, the series root
 *      carries the maximum, and `chart.css` turns those two into a height. A bar chart therefore
 *      paints from authored markup with no engine, no measurement pass and no hydration.
 *   3. A RENDERER THAT IS OPTIONAL BY CONSTRUCTION. `line` and `area` need a path, and a path needs
 *      geometry, which is the one thing CSS cannot do here. `@skryensya/charts` draws it as an
 *      `aria-hidden` overlay on top of this same markup, so the engine is an UPGRADE to a chart that
 *      already worked, not the thing that makes it work. Swapping that engine (TanStack today) can
 *      never be a breaking change, because no consumer ever named it.
 *   4. VALIDATION. An `items` slot is data the compiler can check and the MCP can compose, so an
 *      agent can be asked for a chart and get one whose entries are the right shape.
 *
 * WHAT THIS CONTRACT DELIBERATELY DOES NOT HAVE: a title, a subtitle, an action, a legend row of its
 * own, or a surface. Those belong to whatever the chart sits inside, and inventing them here would
 * have grown exactly the `sk-card`-with-variants that Card refuses to be (see the Card page). A
 * chart in a card is a COMPOSITION, published as a recipe (`contracts/recipes`), not an option on
 * this contract.
 *
 * `height` is an enum of tokens rather than a pixel number, and `format` a closed vocabulary rather
 * than a formatter function, for the same reason the data is a list: every hole shaped like
 * "and anything else you want" is a hole the underlying library climbs back out of.
 */

/** Tone of the painted series. `barTones` plus `info` and `neutral`: a chart is read, not actioned,
 *  so it needs the two quiet tones that a progress bar never did. */
export const chartTones = ["accent", "success", "warning", "danger", "info", "neutral"] as const;
export type ChartTone = (typeof chartTones)[number];

/** How the series is painted. Bars need no renderer; the other two are upgraded by one. */
export const chartKinds = ["bar", "line", "area"] as const;
export type ChartKind = (typeof chartKinds)[number];

/** Plot height, in the same token vocabulary the rest of the kit sizes things with. */
export const chartHeights = ["sm", "md", "lg"] as const;
export type ChartHeight = (typeof chartHeights)[number];

/**
 * How an entry's value is written out. A closed list, on purpose: `Intl.NumberFormat` options are a
 * fine API and a terrible contract, because half of them change the meaning of the number rather
 * than its spelling. A consumer who needs something else formats the string itself and puts it in
 * the entry's own `text` slot, which is why that slot exists.
 */
export const chartFormats = ["number", "compact", "percent", "currency"] as const;
export type ChartFormat = (typeof chartFormats)[number];

export const chartParts = {
  root: "sk-chart",
  /** The box the geometry paints into: the bars, or the renderer's overlay. */
  plot: "sk-chart__plot",
  /** The series itself, as a list. The data, not a decoration of it. */
  series: "sk-chart__series",
  /** One entry. Carries its own value as a custom property; CSS derives the bar from it. */
  point: "sk-chart__point",
  /** The painted mark for one entry, when the kind is `bar`. */
  bar: "sk-chart__bar",
  /** The entry's label, under the axis. */
  label: "sk-chart__label",
  /** The entry's value, as text. Read aloud always; painted only when `values` is set. */
  value: "sk-chart__value",
  /** The renderer's overlay, for `line` and `area`. Decorative: the list above is the data. */
  overlay: "sk-chart__overlay",
  /*
   * The three classes a RENDERER paints with. They are parts, and declaring them here rather than
   * letting the renderer own them is what keeps the engine swappable: the contract promises that if
   * something fills the overlay, this is the anatomy it fills it with, and `chart.css` is what paints
   * them. So a renderer ships geometry and no stylesheet, and replacing it cannot change how a chart
   * looks.
   */
  overlaySvg: "sk-chart__svg",
  overlayLine: "sk-chart__line",
  overlayArea: "sk-chart__area",
  /** The accessible name and description, as a real caption. */
  caption: "sk-chart__caption",
} as const;

export type ChartPart = keyof typeof chartParts;
export type ChartPartClass = (typeof chartParts)[ChartPart];

/** Authored-root attributes. Only `line`/`area` need an enhancer, and only to draw the overlay. */
export const chartAttrs = {
  root: "data-sk-chart",
  /** Written by a renderer once its overlay is painted, so CSS can retire the fallback bars. */
  rendered: "data-rendered",
  max: "--sk-chart-max",
  value: "--sk-chart-value",
} as const;

/**
 * The largest value in a series, which is what every bar's height is a fraction of.
 *
 * Computed rather than authored: a hand-typed maximum that disagrees with the data draws a chart
 * whose tallest bar is not full height, or one that overflows its own plot, and nothing in the
 * markup would say which. Guards an empty series and a series of zeros, both of which would
 * otherwise divide by nothing.
 */
export function chartMax(values: readonly number[]): number {
  let max = 0;
  for (const value of values) {
    if (Number.isFinite(value) && value > max) max = value;
  }
  return max > 0 ? max : 1;
}

/** One entry's height as a fraction (0-1) of the series maximum. Clamped: a negative value is not a
 *  bar that points downward, it is a bar that is not there. */
export function chartFraction(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max(value / max, 0), 1);
}

/** One entry of a series. The React binding's `points`, the contract's `items`. */
export type ChartPoint = {
  /** The category: the month, the hour, the release. */
  readonly label: string;
  readonly value: number;
  /** Emphasis for this entry against its siblings. Overrides the series tone. */
  readonly tone?: ChartTone;
  /** The value already written out, for when `format` cannot say it. Wins over formatting. */
  readonly text?: string;
};

export type FormatChartValueOptions = {
  readonly format?: ChartFormat;
  readonly locale?: string;
  /** ISO 4217 code. Required by `Intl` when the format is `currency`; ignored otherwise. */
  readonly currency?: string;
};

/**
 * One entry's value as text, in BOTH bindings.
 *
 * Lives in Core rather than in either binding because the string is announced: if React wrote
 * "18.2K" and the enhancer wrote "18,200", the two bindings would be reading different data to a
 * screen reader off identical markup, and the symmetry gate would be right to call that a
 * divergence.
 *
 * `percent` takes a FRACTION (0.42 becomes "42%"), which is `Intl`'s own convention and worth
 * stating: the alternative (accepting 42 and dividing) makes a chart whose bars and labels disagree
 * by two orders of magnitude, and the bar heights are computed from the raw value.
 */
export function formatChartValue(value: number, options: FormatChartValueOptions = {}): string {
  if (!Number.isFinite(value)) return "";
  const { currency, format = "number", locale } = options;

  if (format === "currency" && !currency) {
    // `Intl` throws without a code, and a chart that renders nothing is worse than one that renders
    // the bare number: the bars are still right, only the unit is missing.
    return new Intl.NumberFormat(locale).format(value);
  }

  return new Intl.NumberFormat(locale, {
    compact: { notation: "compact" as const, maximumFractionDigits: 1 },
    currency: { style: "currency" as const, currency, maximumFractionDigits: 0 },
    number: {},
    percent: { style: "percent" as const, maximumFractionDigits: 1 },
  }[format]).format(value);
}

export const chartContract = {
  id: "chart",
  css: "@skryensya/core/components/chart.css",
  parts: chartParts,

  options: {
    kind: { type: "enum", values: chartKinds, default: "bar", attr: "data-kind" },
    tone: { type: "enum", values: chartTones, default: "accent", attr: "data-tone" },
    height: { type: "enum", values: chartHeights, default: "md", attr: "data-height" },
    /**
     * Whether the entry labels are painted under the plot. The labels are always in the DOM, because
     * they are what makes the list readable; this only decides whether they are shown, which is the
     * difference between a chart with an axis and a sparkline.
     */
    labels: { type: "boolean", default: true, attr: "data-labels", falseValue: "false" },
    /** Whether each entry's value is painted next to its label. Off by default: on a series of any
     *  length the numbers collide, and the label plus the shape is the point. */
    values: { type: "boolean", default: false, attr: "data-values", trueValue: "" },
    /** Horizontal rules behind the plot, at the same steps the maximum implies. */
    grid: { type: "boolean", default: false, attr: "data-grid", trueValue: "" },
    /**
     * Let the plot reach the edges of whatever contains it.
     *
     * For the chart that IS the bottom of a card (the analytics panel every dashboard has): the
     * surface's padding is right for its text and wrong for its graph, and a chart that stops short
     * of the edge reads as a mistake rather than as a margin.
     */
    flush: { type: "boolean", default: false, attr: "data-flush", trueValue: "" },
    format: { type: "enum", values: chartFormats, default: "number", attr: "data-format" },
    /** Currency code, when `format` is `currency`. Meaningless otherwise. */
    currency: { type: "string", attr: "data-currency", machineInput: true },
    locale: { type: "string", attr: "data-locale", machineInput: true },
    /**
     * The accessible name. Required: a series of numbers with nothing saying what it measures is the
     * one chart that is worse than no chart.
     */
    label: { type: "string", attr: "aria-label" },
    /** The shape of the data in words, for a reader who is not going to see it. */
    description: { type: "string", attr: "data-description" },
  },

  a11y: [
    {
      when: { label: "absent" },
      requiresOneOf: ["label"],
      because:
        "A chart's series is announced entry by entry, but nothing in the list says what the numbers measure. Without a name, a screen reader reads six numbers about nothing.",
    },
  ],

  signatures: {
    Chart: {
      intent: [
        "series-of-labelled-values",
        "trend-over-time",
        "bar-chart",
        "sparkline",
        "dashboard-graph",
      ],
      /*
       * `figure`, not `div`: this is exactly what a figure is for, self-contained content referred to
       * from the main flow, and it gives the caption below a real `figcaption` to be rather than a
       * paragraph that merely sits nearby.
       */
      host: { element: "figure" },
      options: [
        "kind",
        "tone",
        "height",
        "labels",
        "values",
        "grid",
        "flush",
        "format",
        "currency",
        "locale",
        "label",
        "description",
      ],
      requires: ["label"],
      slots: {
        items: {
          accepts: "items",
          required: true,
          /* The contract keys every collection `items`; a chart's entries are its `points`. */
          prop: "points",
          item: {
            options: {
              /**
               * The number, as an attribute and nothing more.
               *
               * The HEIGHT it implies is not declared here, and that is Meter's precedent rather than
               * an omission (`meter.ts`: the bindings compute the fill, the stylesheet carries a
               * fallback for the static-markup window). A bar's height is `value / max`, and `max`
               * belongs to the series, not to the entry: no per-entry declaration can reach it. So
               * both bindings read `data-value` off the entries, compute the maximum once, and write
               * `--sk-chart-value` / `--sk-chart-max`. That is ~15 lines of arithmetic on either
               * side, which is the entire "engine" a bar chart needs.
               */
              value: { type: "number", attr: "data-value" },
              /**
               * Emphasis for one entry against its siblings: the month being proposed, the hour that
               * is now. An enum rather than a boolean because "which one is special" is not always
               * "the good one", and a chart that can only highlight in the accent tone cannot say
               * that the tall bar is the problem.
               */
              tone: { type: "enum", values: chartTones, attr: "data-tone" },
            },
            slots: {
              /** The category this entry belongs to: the month, the hour, the release. A slot rather
               *  than an option because it is CONTENT: it is read aloud and it is painted. */
              label: { accepts: "text", required: true },
              /**
               * The value as the author wants it written, when the closed `format` vocabulary above
               * cannot say it. Optional: with nothing here the binding formats `value` itself, which
               * is the case that should not require typing every number twice.
               */
              text: { accepts: "text" },
            },
          },
        },
      },

      template: {
        element: "figure",
        part: "root",
        host: true,
        mount: chartAttrs.root,
        children: [
          /*
           * THE CAPTION COMES FIRST IN THE MARKUP and is visually hidden by default, which is the
           * same ordering `Stat` uses for its label: what the numbers measure has to be announced
           * before the numbers, or the first thing a screen reader reads is a quantity with no unit.
           *
           * It repeats `label`, which is also on the host as `aria-label`. That is deliberate and not
           * redundant in the way Meter's painted header was: THIS one is the accessible name's only
           * rendering for a sighted reader when a composition chooses to show it, and the host's
           * `aria-label` is what names the figure when the caption is hidden. A composition that
           * already has a heading (every card on the docs page) leaves it hidden; a bare chart on a
           * page shows it.
           */
          {
            element: "figcaption",
            part: "caption",
            whenGiven: "label",
            textFromOption: "label",
          },
          {
            element: "div",
            part: "plot",
            children: [
              /*
               * The overlay's node exists in the markup from the start, empty, rather than being
               * created by the renderer. Two reasons: a renderer that appends its own container
               * makes the two bindings emit different DOM (which the symmetry gate would flag, and
               * correctly), and an element that appears after paint is an element the plot's own
               * layout has to be re-measured for.
               *
               * `aria-hidden`, always. Whatever is drawn in here is a second rendering of the list
               * below it, and a screen reader that read both would read the series twice.
               */
              {
                element: "div",
                part: "overlay",
                attrs: { "aria-hidden": "true" },
              },
              {
                element: "ul",
                part: "series",
                /* `role="list"`, spelled out: `list-style: none` removes the implicit list role in
                   Safari, and the series being a LIST is the entire accessible rendering here. */
                attrs: { role: "list" },
                children: [
                  {
                    element: "li",
                    part: "point",
                    repeat: "items",
                    itemOptions: ["value", "tone"],
                    children: [
                      { element: "span", part: "bar", attrs: { "aria-hidden": "true" } },
                      { element: "span", part: "label", itemSlot: "label" },
                      { element: "span", part: "value", itemSlot: "text" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },

      react: { from: "@skryensya/react/chart", name: "Chart" },
    },
  },
} as const satisfies ComponentContract;
