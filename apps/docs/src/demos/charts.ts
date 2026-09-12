import type { ChartPoint } from "@skryensya/core/chart";
import type { ItemInput, UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";
import {
  budgetByTeam,
  bundleWeightPerWeek,
  compactWeekdays,
  contributionsPerMonth,
  documentedPerQuarter,
  latencyByEndpoint,
  latencyPerVersion,
  metricSeries,
  powerByHour,
  q4Current,
  q4Prior,
  quarterlyRevenue,
  trafficByPeriod,
  visitsPerWeek,
} from "./data/charts";

/*
 * THE CHARTS PAGE'S OWN DEMOS, tree-authored so both bindings render from one source (see this
 * folder's own README).
 *
 * Every kind lives here, `line`/`area` included: `@skryensya/charts`'s SVG overlay is a React-only
 * prop (`packages/charts/src/react/chart.tsx`'s own `overlay`), not a documented `chart` contract
 * option, so `emitMarkup` alone can only ever produce the bar-shaped anatomy for those kinds. What a
 * tree CANNOT do on its own, `../lib/../demos/chart-overlay.ts`'s `emitCompositionWithChartOverlays`
 * does after the fact: same tree, same build-time geometry the React renderer draws, spliced into the
 * one div the contract's own template reserves for it (see that file's own header). Callers needing an
 * overlay pass the tree through it in `ChartsPage.astro`, next to the pairing React component that
 * uses `@skryensya/charts/react` directly, so both bindings still show the same series.
 *
 * The period selector's own tree lives here too (it is `bar`, no overlay needed) - only the part a
 * tree cannot express, a Segmented control swapping the chart's data at runtime, is authored by hand:
 * the React side keeps its own `useState` in `chart-integrations.tsx`, and the Vanilla side gets
 * `demos/scripts/chart-period.ts`, wired to the SAME `sk-value-change` event Segmented already
 * dispatches (see that script's own header).
 */

/** One series, as the `chart` contract's own `items` slot: `{value, tone?}` options, a `label`
 *  slot. `chart.ts`'s own `itemOptions`/`slots` list is the source for this shape. */
const chartItems = (points: readonly ChartPoint[]): readonly ItemInput[] =>
  points.map((point) => ({
    options: { value: point.value, ...(point.tone ? { tone: point.tone } : {}) },
    slots: { label: point.label },
  }));

/** The history card: labelled bars, one entry emphasized, two sunken supporting stats. */
export const chartHistoryCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("demo.charts.history.heading"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "caption", tone: "tertiary" },
            children: t("demo.charts.history.subtitle"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "lg",
          tone: "neutral",
          label: t("demo.charts.history.chartLabel"),
          description: t("demo.charts.history.chartDescription"),
        },
        slots: { items: chartItems(contributionsPerMonth(t)) },
      },
      {
        contract: "layout",
        signature: "Grid",
        options: { columns: "2", gap: "sm" },
        children: [
          {
            contract: "box",
            signature: "Box",
            options: { padding: "sm", surface: "sunken" },
            children: {
              contract: "stat",
              signature: "Stat",
              slots: {
                label: t("demo.charts.history.upcomingLabel"),
                value: t("demo.charts.history.upcomingValue"),
                change: t("demo.charts.history.upcomingChange"),
              },
            },
          },
          {
            contract: "box",
            signature: "Box",
            options: { padding: "sm", surface: "sunken" },
            children: {
              contract: "stat",
              signature: "Stat",
              slots: {
                label: t("demo.charts.history.savingsLabel"),
                value: t("demo.charts.history.savingsValue"),
                change: t("demo.charts.history.savingsChange"),
              },
            },
          },
        ],
      },
      {
        // A real destination, not a click handler: "view the full report" goes somewhere, so this
        // is `Button.navigation` (an `<a>` under the same `.sk-button` look, every variant intact),
        // not `Button.action` pretending to navigate off an `onClick`. See `demos/button.ts`'s own
        // `buttonAsLinkTree` for the contract's other worked example of the same signature.
        contract: "button",
        signature: "Button.navigation",
        options: { variant: "solid", size: "sm", href: "#" },
        children: t("demo.charts.history.button"),
      },
    ],
  },
});

/** The usage card: labelled bars, then two stats that say the numbers the chart must not. */
export const chartUsageCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("demo.charts.usage.heading"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "caption", tone: "tertiary" },
            children: t("demo.charts.usage.subtitle"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "lg",
          tone: "neutral",
          label: t("demo.charts.usage.chartLabel"),
          description: t("demo.charts.usage.chartDescription"),
        },
        slots: { items: chartItems(powerByHour) },
      },
      {
        contract: "layout",
        signature: "Grid",
        options: { columns: "2", gap: "md" },
        children: [
          {
            contract: "stat",
            signature: "Stat",
            slots: { label: t("demo.charts.usage.nowLabel"), value: "3.4 kW" },
          },
          {
            contract: "stat",
            signature: "Stat",
            options: { trend: "up" },
            slots: {
              label: t("demo.charts.usage.solarLabel"),
              value: "1.2 kW",
              change: [
                { contract: "icon", signature: "Icon", options: { name: "arrow-up", size: "sm" } },
                t("demo.charts.usage.solarChange"),
              ],
            },
          },
        ],
      },
    ],
  },
});

/** The bare bar chart the page's own "Chart" section opens with. */
export const chartsBarTree = (t: Translate): UsageTree => ({
  contract: "chart",
  signature: "Chart",
  options: {
    kind: "bar",
    height: "lg",
    label: t("demo.charts.bar.label"),
    description: t("demo.charts.bar.description"),
  },
  slots: { items: chartItems(documentedPerQuarter) },
});

/*
 * EVERY BAR PART filled: values painted so `sk-chart__value` has a box to name. Overlay stays empty
 * on `kind: "bar"` (no path to draw), so it is not labelled. Three quarters keep the plot readable
 * beside a gutter of class names.
 */
export const chartsAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("chartsPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "chart",
      signature: "Chart",
      options: {
        kind: "bar",
        height: "md",
        values: true,
        label: t("demo.charts.bar.label"),
        description: t("demo.charts.bar.description"),
      },
      slots: { items: chartItems(documentedPerQuarter.slice(0, 3)) },
    },
    items: [
      namePart(".sk-chart", "block-start"),
      namePart(".sk-chart__caption", "inline-start"),
      namePart(".sk-chart__plot", "inline-start"),
      namePart(".sk-chart__series", "inline-start", { ringPlacement: "offset", ringDistance: 4 }),
      namePart(".sk-chart__point", "inline-end", { ringPlacement: "offset", ringDistance: 3 }),
      namePart(".sk-chart__bar", "inline-end"),
      namePart(".sk-chart__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-chart__value", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/* Caption is `display: none` by default (a composition's own heading usually names the series). Show
 * it here so the diagram can point at `sk-chart__caption` instead of labelling a hidden box. */
export const chartsAnatomyCss = `.sk-annotated {
  --sk-annotation-font-family: var(--font-family-code);
}

.sk-annotated .sk-chart {
  --sk-chart-caption-display: block;
}`;

/** Chart + Table: the same series, read two ways. Two separate accessible names on purpose - see
 *  `chart-integrations.tsx`'s own header for why. */
export const chartTableCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("demo.charts.table.heading"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "caption", tone: "tertiary" },
            children: t("demo.charts.table.subtitle"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "md",
          format: "compact",
          tone: "neutral",
          label: t("demo.charts.table.heading"),
          description: t("demo.charts.table.chartDescription"),
        },
        slots: { items: chartItems(quarterlyRevenue.map((r) => ({ label: r.label, value: r.value }))) },
      },
      {
        contract: "table",
        signature: "TableScroll",
        children: {
          contract: "table",
          signature: "Table",
          children: [
            { contract: "table", signature: "TableCaption", children: t("demo.charts.table.caption") },
            {
              contract: "table",
              signature: "TableHead",
              children: {
                contract: "table",
                signature: "TableRow",
                children: [
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "col" },
                    children: t("demo.charts.table.headQuarter"),
                  },
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "col" },
                    children: t("demo.charts.table.headRevenue"),
                  },
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "col" },
                    children: t("demo.charts.table.headChange"),
                  },
                ],
              },
            },
            {
              contract: "table",
              signature: "TableBody",
              children: quarterlyRevenue.map((row) => ({
                contract: "table",
                signature: "TableRow",
                children: [
                  {
                    contract: "table",
                    signature: "TableHeader",
                    options: { scope: "row" },
                    children: row.label,
                  },
                  {
                    contract: "table",
                    signature: "TableCell",
                    children: `${new Intl.NumberFormat("en", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.value)}`,
                  },
                  { contract: "table", signature: "TableCell", children: row.delta ?? " - " },
                ],
              })),
            },
          ],
        },
      },
    ],
  },
});

/** One focusable trigger per point, each wrapped in a Tooltip carrying the exact value - see
 *  `chart-integrations.tsx`'s own header for why a real Button, not a hover layer on the bars. */
export const chartPointDetailTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("demo.charts.pointDetail.heading"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "caption", tone: "tertiary" },
            children: t("demo.charts.pointDetail.subtitle"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "md",
          labels: false,
          tone: "info",
          label: t("demo.charts.pointDetail.heading"),
          description: t("demo.charts.pointDetail.chartDescription"),
        },
        slots: { items: chartItems(latencyByEndpoint) },
      },
      {
        contract: "layout",
        signature: "Grid",
        options: { columns: "5", gap: "sm" },
        children: latencyByEndpoint.map((point) => ({
          contract: "tooltip",
          signature: "Tooltip",
          options: { arrow: true },
          slots: {
            content: `${point.value} ms`,
            children: {
              contract: "button",
              signature: "Button.action",
              options: { variant: "ghost", size: "sm" },
              children: point.label,
            },
          },
        })),
      },
    ],
  },
});

/** A legend built from Badge, not a new part on Chart - see `chart-more.tsx`'s own header. */
export const chartLegendCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h3", flush: true },
            children: t("demo.charts.legend.heading"),
          },
          {
            contract: "typography",
            signature: "Text",
            options: { size: "caption", tone: "tertiary" },
            children: t("demo.charts.legend.subtitle"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "md",
          values: true,
          format: "compact",
          label: t("demo.charts.legend.heading"),
          description: t("demo.charts.legend.chartDescription"),
        },
        slots: { items: chartItems(budgetByTeam) },
      },
      {
        contract: "layout",
        signature: "Inline",
        options: { gap: "sm", wrap: true },
        attrs: { "aria-hidden": "true" },
        children: budgetByTeam.map((point) => ({
          contract: "badge",
          signature: "Badge",
          options: { tone: point.tone ?? "neutral" },
          children: point.label,
        })),
      },
    ],
  },
});

/** Three metrics, each its own Tabs panel with the same shape (one Stat, one Chart) so switching
 *  never resizes the card - see `chart-more.tsx`'s own header. */
export const chartMetricTabsTree = (t: Translate): UsageTree => {
  const panel = (key: "revenue" | "users" | "errors", heading: string, statLabel: string, value: string, change: string, trend: "up" | "down"): UsageTree => ({
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Heading",
            options: { headingSize: "h4", flush: true },
            children: heading,
          },
          {
            contract: "stat",
            signature: "Stat",
            options: { trend },
            slots: {
              label: statLabel,
              value,
              change: [
                { contract: "icon", signature: "Icon", options: { name: `arrow-${trend}`, size: "sm" } },
                change,
              ],
            },
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: { kind: "bar", height: "md", tone: metricSeries[key].tone ?? "neutral", label: heading },
        slots: { items: chartItems(metricSeries[key].points) },
      },
    ],
  });

  return {
    contract: "box",
    signature: "Box",
    options: { border: "subtle", padding: "lg", surface: "surface" },
    children: {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "revenue" },
      attrs: { "aria-label": t("demo.charts.metricTabs.ariaLabel") },
      slots: {
        items: [
          {
            options: { value: "revenue" },
            slots: {
              label: t("demo.charts.metricTabs.revenueTab"),
              children: panel(
                "revenue",
                t("demo.charts.metricTabs.revenueHeading"),
                t("demo.charts.metricTabs.statLabel"),
                "58,6K",
                "+15%",
                "up",
              ),
            },
          },
          {
            options: { value: "users" },
            slots: {
              label: t("demo.charts.metricTabs.usersTab"),
              children: panel(
                "users",
                t("demo.charts.metricTabs.usersHeading"),
                t("demo.charts.metricTabs.statLabel"),
                "1.510",
                "+8%",
                "up",
              ),
            },
          },
          {
            options: { value: "errors" },
            slots: {
              label: t("demo.charts.metricTabs.errorsTab"),
              children: panel(
                "errors",
                t("demo.charts.metricTabs.errorsHeading"),
                t("demo.charts.metricTabs.statLabel"),
                "39",
                "-19%",
                "down",
              ),
            },
          },
        ],
      },
    },
  };
};

/** The sparkline card: the number is text, the chart is only the trend, flush to the bottom edge.
 *  `kind="area"`, so its markup needs `chart-overlay.ts`'s pass once emitted - see this file's own
 *  header. */
/*
 * THE ANALYTICS CARD'S REACT SOURCE, beside the tree it describes.
 *
 * Hand written, not emitted, for the reason `chart-overlay.ts` gives: the area overlay is a
 * React-only prop of `@skryensya/charts`, so an emitted snippet would name the bar-shaped anatomy
 * and not the drop-in a consumer actually imports.
 *
 * HERE and not in a page, because TWO pages show this same card: `/components/charts` documents the
 * chart, `/components/card` documents the surface around it. It used to be typed once per page, and
 * the two had already drifted - the Card page's copy described a `Badge` and a `Text` where the live
 * demo beside it rendered a `Stat`. One string cannot disagree with itself.
 */
export const chartAnalyticsCardSource = `import { Chart } from "@skryensya/charts/react";
import { Button } from "@skryensya/react/button";
import { Icon } from "@skryensya/react/icon";
import { Box, Inline, Stack } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";
import { Heading } from "@skryensya/react/typography";

const compactCount = (n) =>
  new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);

<Box as="article" border="subtle" padding="lg" surface="surface">
  <Stack gap="lg">
    <Inline align="start" justify="between">
      <Stack gap="xs">
        <Heading as="h3" flush size="h4">
          Analytics
        </Heading>
        <Stat
          animate
          change={<><Icon name="arrow-up" size="sm" /> +10%</>}
          count={418200}
          format={compactCount}
          label="Visits this month"
          trend="up"
          value="418.2K"
        />
      </Stack>
      <Button size="sm" variant="translucent">
        View Analytics
      </Button>
    </Inline>
    <Chart
      flush
      format="compact"
      height="md"
      kind="area"
      label="Visits per week"
      labels={false}
      points={visits}
      tone="neutral"
    />
  </Stack>
</Box>;`;

export const chartAnalyticsCardTree = (t: Translate): UsageTree => ({
  contract: "box",
  signature: "Box",
  options: { border: "subtle", padding: "lg", surface: "surface" },
  children: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "lg" },
    children: [
      {
        contract: "layout",
        signature: "Inline",
        /*
         * `inlineAlign: "start"` is not decoration: without it the row takes `Inline`'s own default
         * cross-axis alignment, and the action ends up pinned to the BOTTOM of a tall left column
         * instead of sitting beside the heading. The hand-written React island for this same card
         * (`react-demos/chart-card.tsx`) always declared `align="start"`; the tree did not, so the
         * two bindings of one card disagreed about where its button goes.
         */
        options: { justify: "between", wrap: false, inlineAlign: "start" },
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                /* `h4`, matching the React island for this card
                   (`react-demos/chart-card.tsx`'s own `size="h4"`). The tree said `h3` and the two
                   bindings rendered the title at 20px and 18px: the same disagreement the row's
                   `inlineAlign` had, in the type scale instead of the layout. */
                options: { headingSize: "h4", flush: true },
                children: t("demo.charts.analytics.heading"),
              },
              {
                contract: "stat",
                signature: "Stat",
                options: { trend: "up" },
                slots: {
                  label: t("demo.charts.analytics.statLabel"),
                  value: t("demo.charts.analytics.statValue"),
                  change: [
                    { contract: "icon", signature: "Icon", options: { name: "arrow-up", size: "sm" } },
                    t("demo.charts.analytics.statChange"),
                  ],
                },
              },
            ],
          },
          {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent", size: "sm" },
            children: t("demo.charts.analytics.button"),
          },
        ],
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "area",
          flush: true,
          format: "compact",
          height: "md",
          labels: false,
          tone: "neutral",
          label: t("demo.charts.analytics.chartLabel"),
          description: t("demo.charts.analytics.chartDescription"),
        },
        slots: { items: chartItems(visitsPerWeek) },
      },
    ],
  },
});

/** The bare line chart the page's own "Chart" section shows after bars. `kind="line"`, see this
 *  file's own header. */
export const chartsLineTree = (t: Translate): UsageTree => ({
  contract: "chart",
  signature: "Chart",
  options: {
    kind: "line",
    height: "lg",
    tone: "info",
    label: t("demo.charts.line.label"),
    description: t("demo.charts.line.description"),
  },
  slots: { items: chartItems(latencyPerVersion) },
});

/** The bare area chart, last of the three kinds. `kind="area"`, see this file's own header. */
export const chartsAreaTree = (t: Translate): UsageTree => ({
  contract: "chart",
  signature: "Chart",
  options: {
    kind: "area",
    height: "lg",
    label: t("demo.charts.area.label"),
    description: t("demo.charts.area.description"),
  },
  slots: { items: chartItems(bundleWeightPerWeek) },
});

/**
 * Four small cards, one per option page a chart can take, side by side. Two of the four are
 * `line`/`area` - see this file's own header for why they need `chart-overlay.ts`'s pass once
 * emitted.
 */
export const chartGalleryTree = (t: Translate): UsageTree => {
  const week = compactWeekdays(t);
  const card = (title: string, note: string, chart: UsageTree): UsageTree => ({
    contract: "box",
    signature: "Box",
    options: { border: "subtle", padding: "lg", surface: "surface" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { justify: "between", wrap: false },
          children: [
            {
              contract: "typography",
              signature: "Text",
              options: { size: "caption", tone: "tertiary", weight: "label" },
              children: title,
            },
            { contract: "badge", signature: "Badge", options: { tone: "neutral" }, children: note },
          ],
        },
        chart,
      ],
    },
  });

  return {
    contract: "layout",
    signature: "Grid",
    options: { columns: "2", gap: "md" },
    children: [
      card(t("demo.charts.gallery.conversionTitle"), "bar · percent · values", {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "md",
          format: "percent",
          tone: "success",
          values: true,
          label: t("demo.charts.gallery.conversionChartLabel"),
        },
        slots: { items: chartItems(week.map((point) => ({ ...point, value: point.value / 100 }))) },
      }),
      card(t("demo.charts.gallery.errorsTitle"), "line · @skryensya/charts", {
        contract: "chart",
        signature: "Chart",
        options: { kind: "line", height: "md", tone: "danger", label: t("demo.charts.gallery.errorsChartLabel") },
        slots: { items: chartItems(week) },
      }),
      card(t("demo.charts.gallery.cpuTitle"), "area · flush · sparkline", {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "area",
          flush: true,
          height: "md",
          labels: false,
          tone: "warning",
          label: t("demo.charts.gallery.cpuChartLabel"),
        },
        slots: { items: chartItems(week) },
      }),
      card(t("demo.charts.gallery.spendTitle"), "bar · currency · grid", {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          height: "md",
          format: "currency",
          currency: "USD",
          grid: true,
          tone: "neutral",
          label: t("demo.charts.gallery.spendChartLabel"),
        },
        slots: { items: chartItems(week.map((point) => ({ ...point, value: point.value * 4 }))) },
      }),
    ],
  };
};

/** In document order: which of the gallery's four charts need `chart-overlay.ts`'s pass, and their
 *  points, exactly as `chartGalleryTree` built them above. */
export const chartGalleryOverlays = (t: Translate) => {
  const week = compactWeekdays(t);
  return [
    { kind: "bar" as const, points: week },
    { kind: "line" as const, points: week },
    { kind: "area" as const, points: week },
    { kind: "bar" as const, points: week },
  ];
};

/** Two periods, side by side: the CURRENT one accented, the PRIOR one neutral. Both charts are
 *  `kind="area"`, see this file's own header. */
export const chartComparisonTree = (t: Translate): UsageTree => {
  const panel = (
    title: string,
    points: readonly ChartPoint[],
    tone: "accent" | "neutral",
    value: string,
    change?: string,
  ): UsageTree => ({
    contract: "box",
    signature: "Box",
    options: { border: "subtle", padding: "md", surface: tone === "accent" ? "surface" : "sunken" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        {
          contract: "typography",
          signature: "Text",
          options: { size: "caption", tone: "tertiary", weight: "label" },
          children: title,
        },
        {
          contract: "stat",
          signature: "Stat",
          options: { trend: "up" },
          slots: {
            label: t("demo.charts.comparison.statLabel"),
            value,
            ...(change
              ? {
                  change: [
                    { contract: "icon", signature: "Icon", options: { name: "arrow-up", size: "sm" } },
                    change,
                  ],
                }
              : {}),
          },
        },
        {
          contract: "chart",
          signature: "Chart",
          options: {
            kind: "area",
            flush: true,
            format: "compact",
            height: "sm",
            labels: false,
            tone,
            label: `${title}: ${t("demo.charts.comparison.chartLabelSuffix")}`,
          },
          slots: { items: chartItems(points) },
        },
      ],
    },
  });

  return {
    contract: "layout",
    signature: "Grid",
    options: { columns: "2", gap: "md" },
    children: [
      panel(
        t("demo.charts.comparison.currentTitle"),
        q4Current,
        "accent",
        t("demo.charts.comparison.currentValue"),
        t("demo.charts.comparison.currentChange"),
      ),
      panel(t("demo.charts.comparison.priorTitle"), q4Prior, "neutral", t("demo.charts.comparison.priorValue")),
    ],
  };
};

/** In document order: which of the comparison's two charts need `chart-overlay.ts`'s pass, and their
 *  points, exactly as `chartComparisonTree` built them above. Both are `area`. */
export const chartComparisonOverlays = (): readonly { kind: "area"; points: readonly ChartPoint[] }[] => [
  { kind: "area", points: q4Current },
  { kind: "area", points: q4Prior },
];

/**
 * The period selector: a Segmented control swaps which series the chart draws. `bar`, so this tree
 * alone is enough for the Vanilla stage's INITIAL markup - what makes the control actually swap data
 * at runtime is `demos/scripts/chart-period.ts`, wired to the same tree's own data through the
 * `data-chart-periods`/`data-chart-label-prefix` attrs below.
 */
export const chartPeriodCardTree = (t: Translate): UsageTree => {
  const periods = trafficByPeriod(t);
  const initial: "7d" | "30d" | "90d" = "30d";

  return {
    contract: "box",
    signature: "Box",
    options: { border: "subtle", padding: "lg", surface: "surface" },
    children: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { justify: "between", wrap: false },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xs" },
              children: [
                {
                  contract: "typography",
                  signature: "Heading",
                  options: { headingSize: "h3", flush: true },
                  children: t("demo.charts.period.heading"),
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { size: "caption", tone: "tertiary" },
                  children: t("demo.charts.period.subtitle"),
                },
              ],
            },
            {
              contract: "segmented",
              signature: "Segmented",
              options: { value: initial, label: t("demo.charts.period.ariaLabel") },
              slots: {
                items: [
                  { options: { value: "7d" }, slots: { label: "7D" } },
                  { options: { value: "30d" }, slots: { label: "30D" } },
                  { options: { value: "90d" }, slots: { label: "90D" } },
                ],
              },
            },
          ],
        },
        {
          contract: "chart",
          signature: "Chart",
          options: {
            kind: "bar",
            height: "lg",
            tone: "accent",
            label: `${t("demo.charts.period.chartLabelPrefix")} ${initial}`,
            description: t("demo.charts.period.chartDescription"),
          },
          attrs: {
            "data-chart-periods": JSON.stringify(periods),
            "data-chart-label-prefix": t("demo.charts.period.chartLabelPrefix"),
          },
          slots: { items: chartItems(periods[initial]) },
        },
      ],
    },
  };
};

export { default as chartPeriodScript } from "./scripts/chart-period.ts?raw";
