/*
 * THREE MORE WAYS CHART SHOWS UP NEXT TO OTHER COMPONENTS, past the four in `chart-integrations.tsx`.
 *
 * Same rule as every other chart demo in this kit: nothing here is a new capability on Chart itself.
 * Each pattern is Chart plus a contract that already exists, composed the way that contract's own
 * docs already compose it.
 */
import { Badge } from "@skryensya/react/badge";
import { Chart as AreaChart } from "@skryensya/charts/react";
import { Chart } from "@skryensya/react/chart";
import { Icon } from "@skryensya/react/icon";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";
import { Tabs, type TabsItem } from "@skryensya/react/tabs";
import { Heading, Text } from "@skryensya/react/typography";
import type { ChartTone } from "@skryensya/core/chart";
import { framedIn } from "./framed";

const framed = framedIn("chart-more");

type DemoProps = { lang?: "es" | "en" };

/* ---------------------------------------------------------------------------------------------
 * 1. TABS, not Segmented: three DIFFERENT metrics, each its own panel with its own chart and its
 * own tone, not one series read under a different setting. `hero-with-audience-tabs`'s own notes
 * draw this exact line for a hero's content switch; a dashboard's metric switch is the same
 * distinction applied to a chart instead of a pitch. `chart-integrations.tsx`'s Segmented demo is
 * the other half: same series, a setting (the period) changes what it shows.
 *
 * EVERY PANEL IS THE SAME SHAPE  -  one Stat, one Chart at the same `height`  -  for the reason
 * `hero-with-audience-tabs`'s own notes give: Tabs unmounts one panel and mounts the next, and two
 * panels of different heights make the card jump the instant a reader switches. Matching the shape,
 * not just approximating it, is what keeps the switch reading as a content change, not a resize.
 * ------------------------------------------------------------------------------------------- */
type MetricKey = "revenue" | "users" | "errors";

const metrics: Record<
  MetricKey,
  { tone: ChartTone; points: readonly { label: string; value: number }[] }
> = {
  revenue: {
    tone: "accent",
    points: [
      { label: "S1", value: 42000 },
      { label: "S2", value: 45800 },
      { label: "S3", value: 44100 },
      { label: "S4", value: 51200 },
      { label: "S5", value: 53900 },
      { label: "S6", value: 58600 },
    ],
  },
  users: {
    tone: "success",
    points: [
      { label: "S1", value: 1180 },
      { label: "S2", value: 1240 },
      { label: "S3", value: 1310 },
      { label: "S4", value: 1290 },
      { label: "S5", value: 1420 },
      { label: "S6", value: 1510 },
    ],
  },
  errors: {
    tone: "danger",
    points: [
      { label: "S1", value: 86 },
      { label: "S2", value: 74 },
      { label: "S3", value: 91 },
      { label: "S4", value: 58 },
      { label: "S5", value: 47 },
      { label: "S6", value: 39 },
    ],
  },
};

const metricCopy = (es: boolean): Record<MetricKey, { tab: string; heading: string; statLabel: string; value: string; change: string; trend: "up" | "down"; chartLabel: string }> => ({
  revenue: {
    tab: es ? "Ingresos" : "Revenue",
    heading: es ? "Ingresos" : "Revenue",
    statLabel: es ? "Últimas 6 semanas" : "Last 6 weeks",
    value: "58,6K",
    change: "+15%",
    trend: "up",
    chartLabel: es ? "Ingresos por semana" : "Revenue per week",
  },
  users: {
    tab: es ? "Usuarios" : "Users",
    heading: es ? "Usuarios activos" : "Active users",
    statLabel: es ? "Últimas 6 semanas" : "Last 6 weeks",
    value: "1.510",
    change: "+8%",
    trend: "up",
    chartLabel: es ? "Usuarios activos por semana" : "Active users per week",
  },
  errors: {
    tab: es ? "Errores" : "Errors",
    heading: es ? "Errores de servidor" : "Server errors",
    statLabel: es ? "Últimas 6 semanas" : "Last 6 weeks",
    value: "39",
    change: "-19%",
    trend: "down",
    chartLabel: es ? "Errores de servidor por semana" : "Server errors per week",
  },
});

function MetricPanel({ metric, es }: { metric: MetricKey; es: boolean }) {
  const copy = metricCopy(es)[metric];
  const data = metrics[metric];
  // Fewer errors is the GOOD direction: `trend` colors the change by what it means here, not by sign.
  const goodDirection: "up" | "down" = metric === "errors" ? "down" : "up";

  return (
    <Stack gap="md">
      <Stack gap="xs">
        <Heading as="h4" flush size="h5">
          {copy.heading}
        </Heading>
        <Stat
          change={
            <>
              <Icon name={`arrow-${copy.trend}`} size="sm" /> {copy.change}
            </>
          }
          label={copy.statLabel}
          trend={copy.trend === goodDirection ? "up" : "down"}
          value={copy.value}
        />
      </Stack>
      <Chart height="md" kind="bar" label={copy.chartLabel} locale={es ? "es" : "en"} points={data.points} tone={data.tone} />
    </Stack>
  );
}

export const ChartMetricTabsDemo = framed(
  function ChartMetricTabsDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";
    const copy = metricCopy(es);

    const items: TabsItem[] = (["revenue", "users", "errors"] as const).map((key) => ({
      value: key,
      label: copy[key].tab,
      children: <MetricPanel es={es} metric={key} />,
    }));

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Tabs aria-label={es ? "Elegir métrica" : "Choose metric"} defaultValue="revenue" items={items} />
      </Box>
    );
  },
  { label: "Metric tabs card", minHeight: "28rem" },
);

/* ---------------------------------------------------------------------------------------------
 * 2. A LEGEND, from Badge, not a new part on Chart. Each entry carries its own `tone` (the
 * contract's own per-point override, `chart.ts`'s `items` slot), and the legend below just repeats
 * that same mapping in words. `Badge`'s five tones (`neutral`/`accent`/`success`/`warning`/`danger`)
 * are a subset of Chart's six  -  this composition sticks to that subset on purpose, so one Badge per
 * category can borrow the bar's own color instead of inventing a second palette next to it.
 *
 * THE LEGEND IS DECORATIVE, not a second name for the data: `values` is on, so every bar already
 * carries its own number in the accessible list. A reader who cannot see the colors still gets the
 * category from `Chart`'s own label under each bar; the legend below is a recap for a sighted
 * reader scanning the shape first and the specifics second.
 * ------------------------------------------------------------------------------------------- */
const budget = [
  { label: "Eng", value: 182000, tone: "accent" as const },
  { label: "Sales", value: 96000, tone: "success" as const },
  { label: "Support", value: 54000, tone: "warning" as const },
  { label: "Legal", value: 21000, tone: "danger" as const },
  { label: "Ops", value: 68000, tone: "neutral" as const },
];

const budgetEn = budget;

export const ChartCategoryLegendDemo = framed(
  function ChartCategoryLegendDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";
    const points = es ? budget : budgetEn;

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {es ? "Presupuesto por equipo" : "Budget by team"}
            </Heading>
            <Text size="caption" tone="tertiary">
              {es ? "Año fiscal 2026, en dólares" : "Fiscal year 2026, in dollars"}
            </Text>
          </Stack>
          <Chart
            description={
              es
                ? "Cinco equipos. Ingeniería es el mayor con 182 mil; Legal el menor con 21 mil."
                : "Five teams. Engineering is the largest at 182K; Legal the smallest at 21K."
            }
            format="compact"
            height="md"
            kind="bar"
            label={es ? "Presupuesto por equipo" : "Budget by team"}
            locale={es ? "es" : "en"}
            points={points}
            values
          />
          <Inline aria-hidden="true" gap="sm" wrap>
            {points.map((point) => (
              <Badge key={point.label} tone={point.tone}>
                {point.label}
              </Badge>
            ))}
          </Inline>
        </Stack>
      </Box>
    );
  },
  { label: "Category legend card", minHeight: "26rem" },
);

/* ---------------------------------------------------------------------------------------------
 * 3. TWO PERIODS, SIDE BY SIDE: the year-over-year comparison every dashboard eventually grows.
 * Not one chart with two series (Chart's own contract has no second series to give it, `chart.ts`'s
 * own banner: "the data is a list")  -  two independent metric panels in a Grid, the CURRENT one
 * accented, the PRIOR one neutral, so the eye finds "now" before it finds "then".
 * ------------------------------------------------------------------------------------------- */
const q4Current = [
  { label: "Oct", value: 71000 },
  { label: "Nov", value: 76500 },
  { label: "Dec", value: 84200 },
];

const q4Prior = [
  { label: "Oct", value: 61000 },
  { label: "Nov", value: 64800 },
  { label: "Dec", value: 69100 },
];

function ComparisonPanel({
  es,
  title,
  points,
  tone,
  value,
  change,
  trend,
}: {
  es: boolean;
  title: string;
  points: readonly { label: string; value: number }[];
  tone: ChartTone;
  value: string;
  change?: string;
  trend?: "up" | "down";
}) {
  return (
    <Box border="subtle" padding="md" surface={tone === "accent" ? "surface" : "sunken"}>
      <Stack gap="sm">
        <Text size="caption" tone="tertiary" weight="label">
          {title}
        </Text>
        <Stat
          change={
            change ? (
              <>
                <Icon name={`arrow-${trend}`} size="sm" /> {change}
              </>
            ) : undefined
          }
          label={es ? "Ingresos del trimestre" : "Quarterly revenue"}
          trend={trend}
          value={value}
        />
        <AreaChart
          flush
          format="compact"
          height="sm"
          kind="area"
          label={`${title}: ${es ? "ingresos por mes" : "revenue by month"}`}
          labels={false}
          locale={es ? "es" : "en"}
          points={points}
          tone={tone}
        />
      </Stack>
    </Box>
  );
}

export const ChartComparisonDemo = framed(
  function ChartComparisonDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Grid columns={2} gap="md">
        <ComparisonPanel
          change="+22%"
          es={es}
          points={q4Current}
          title={es ? "T4 2026" : "Q4 2026"}
          tone="accent"
          trend="up"
          value="231,7K"
        />
        <ComparisonPanel es={es} points={q4Prior} title={es ? "T4 2025" : "Q4 2025"} tone="neutral" value="194,9K" />
      </Grid>
    );
  },
  { label: "Year-over-year comparison", minHeight: "26rem" },
);
