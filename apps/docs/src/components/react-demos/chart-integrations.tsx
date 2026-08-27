/*
 * CHART INTEGRATED WITH OTHER COMPONENTS, beyond the dashboard-card compositions in `chart-card.tsx`.
 *
 * Same rule as every other chart demo: no `sk-chart-*` variant grows to fit these. Each pattern below
 * is Chart plus a contract that already exists — Segmented, Table, Tooltip — composed the way their
 * own docs pages already compose them, not a new capability invented for charts specifically.
 */
import { Badge } from "@skryensya/react/badge";
import { Button } from "@skryensya/react/button";
import { Chart as PathChart } from "@skryensya/charts/react";
import { Chart } from "@skryensya/react/chart";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { SegmentedControl } from "@skryensya/react/segmented";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScroll,
} from "@skryensya/react/table";
import { Tooltip } from "@skryensya/react/tooltip";
import { Heading, Text } from "@skryensya/react/typography";
import { formatChartValue, type ChartPoint } from "@skryensya/core/chart";
import { useState, type ReactNode } from "react";
import { framedIn } from "./framed";

const framed = framedIn(import.meta.url);

type DemoProps = { lang?: "es" | "en" };

/* ---------------------------------------------------------------------------------------------
 * 1. PERIOD SELECTOR: a Segmented control swaps which series Chart draws. The heading, the
 * control and the card's own identity stay constant; only the data changes, the same rule the
 * `metric-panel` recipe's four states follow for a chart's OWN content versus its frame.
 * ------------------------------------------------------------------------------------------- */
type Period = "7d" | "30d" | "90d";

const trafficByPeriod: Record<Period, ChartPoint[]> = {
  "7d": [
    { label: "Lun", value: 1180 },
    { label: "Mar", value: 1340 },
    { label: "Mié", value: 1290 },
    { label: "Jue", value: 1510 },
    { label: "Vie", value: 1780 },
    { label: "Sáb", value: 980 },
    { label: "Dom", value: 860 },
  ],
  "30d": [
    { label: "Sem 1", value: 7200 },
    { label: "Sem 2", value: 8100 },
    { label: "Sem 3", value: 7650 },
    { label: "Sem 4", value: 9400 },
  ],
  "90d": [
    { label: "Ene", value: 28400 },
    { label: "Feb", value: 31200 },
    { label: "Mar", value: 36800 },
  ],
};

const trafficByPeriodEn: Record<Period, ChartPoint[]> = {
  "7d": [
    { label: "Mon", value: 1180 },
    { label: "Tue", value: 1340 },
    { label: "Wed", value: 1290 },
    { label: "Thu", value: 1510 },
    { label: "Fri", value: 1780 },
    { label: "Sat", value: 980 },
    { label: "Sun", value: 860 },
  ],
  "30d": [
    { label: "Wk 1", value: 7200 },
    { label: "Wk 2", value: 8100 },
    { label: "Wk 3", value: 7650 },
    { label: "Wk 4", value: 9400 },
  ],
  "90d": [
    { label: "Jan", value: 28400 },
    { label: "Feb", value: 31200 },
    { label: "Mar", value: 36800 },
  ],
};

const periodOptions = (es: boolean) => [
  { value: "7d", label: "7D" },
  { value: "30d", label: es ? "30D" : "30D" },
  { value: "90d", label: es ? "90D" : "90D" },
];

export const ChartPeriodCardDemo = framed(
  function ChartPeriodCardDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";
    const [period, setPeriod] = useState<Period>("30d");
    const series = (es ? trafficByPeriod : trafficByPeriodEn)[period];

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Inline align="start" justify="between" wrap={false}>
            <Stack gap="xs">
              <Heading as="h3" flush size="h4">
                {es ? "Tráfico del sitio" : "Site traffic"}
              </Heading>
              <Text size="caption" tone="tertiary">
                {es ? "Páginas vistas, por período" : "Page views, by period"}
              </Text>
            </Stack>
            <SegmentedControl
              label={es ? "Elegir período" : "Choose period"}
              onValueChange={(value) => setPeriod(value as Period)}
              options={periodOptions(es)}
              value={period}
            />
          </Inline>
          <Chart
            description={
              es
                ? "La serie cambia con el período elegido; el control queda arriba."
                : "The series changes with the chosen period; the control stays put."
            }
            height="lg"
            kind="bar"
            label={es ? `Páginas vistas, ${period}` : `Page views, ${period}`}
            locale={es ? "es" : "en"}
            points={series}
            tone="accent"
          />
        </Stack>
      </Box>
    );
  },
  { label: "Period selector card", minHeight: "26rem" },
);

/* ---------------------------------------------------------------------------------------------
 * 2. CHART + TABLE: the same series, read two ways. The chart says the shape; a reader who wants
 * to compare quarters or quote an exact figure wants the table, not an estimate off a bar's
 * height — the exact case `contracts/semantic/chart.yaml`'s `avoidWhen` already names.
 *
 * The two carry SEPARATE accessible names (`label` on Chart, `TableCaption` on Table): they are
 * two renderings of one dataset, not one thing described twice.
 * ------------------------------------------------------------------------------------------- */
const quarterlyRevenue = [
  { label: "Q1", value: 184000, delta: null as string | null },
  { label: "Q2", value: 201000, delta: "+9%" },
  { label: "Q3", value: 196000, delta: "-2%" },
  { label: "Q4", value: 238000, delta: "+21%" },
];

export const ChartTableCardDemo = framed(
  function ChartTableCardDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {es ? "Ingresos por trimestre" : "Revenue by quarter"}
            </Heading>
            <Text size="caption" tone="tertiary">
              {es ? "La forma arriba, el número exacto abajo" : "The shape above, the exact figure below"}
            </Text>
          </Stack>
          <Chart
            description={
              es
                ? "Cuatro trimestres, subiendo de 184 mil a 238 mil, con una baja en el tercero."
                : "Four quarters, rising from 184K to 238K, with a dip in the third."
            }
            format="compact"
            height="md"
            kind="bar"
            label={es ? "Ingresos por trimestre" : "Revenue by quarter"}
            locale={es ? "es" : "en"}
            points={quarterlyRevenue}
            tone="neutral"
          />
          <TableScroll>
            <Table>
              <TableCaption>
                {es ? "Ingresos por trimestre, en dólares" : "Revenue by quarter, in dollars"}
              </TableCaption>
              <TableHead>
                <TableRow>
                  <TableHeader scope="col">{es ? "Trimestre" : "Quarter"}</TableHeader>
                  <TableHeader scope="col">{es ? "Ingresos" : "Revenue"}</TableHeader>
                  <TableHeader scope="col">{es ? "Variación" : "Change"}</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {quarterlyRevenue.map((row) => (
                  <TableRow key={row.label}>
                    <TableHeader scope="row">{row.label}</TableHeader>
                    <TableCell>
                      {formatChartValue(row.value, { format: "currency", currency: "USD", locale: es ? "es" : "en" })}
                    </TableCell>
                    <TableCell>{row.delta ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableScroll>
        </Stack>
      </Box>
    );
  },
  { label: "Chart + table card", minHeight: "34rem" },
);

/* ---------------------------------------------------------------------------------------------
 * 3. POINT DETAIL: a real focusable trigger per point, each wrapped in a Tooltip carrying the
 * exact value. NOT a hover layer on the chart's own bars: `chart.ts`'s `bar` part is `aria-hidden`
 * by contract, and Tooltip's `children` slot requires a signature that already carries its own
 * accessible name (`tooltip.ts`: "the control being described... carries its own accessible
 * name"). A decorative bar has neither, so the trigger is a real `Button.action` underneath the
 * chart instead — it does not duplicate the overlay, and it does not touch the accessible list.
 * ------------------------------------------------------------------------------------------- */
const latency = [
  { label: "/auth", value: 42 },
  { label: "/search", value: 118 },
  { label: "/orders", value: 76 },
  { label: "/users", value: 54 },
  { label: "/health", value: 9 },
];

export const ChartPointDetailDemo = framed(
  function ChartPointDetailDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {es ? "Latencia por endpoint" : "Latency by endpoint"}
            </Heading>
            <Text size="caption" tone="tertiary">
              {es
                ? "El valor exacto está siempre en la lista; el tooltip lo repite para quien mira las barras"
                : "The exact value is always in the list; the tooltip repeats it for someone reading the bars"}
            </Text>
          </Stack>
          <Chart
            description={
              es
                ? "Cinco endpoints. El más lento es /search con 118 ms, el más rápido /health con 9 ms."
                : "Five endpoints. The slowest is /search at 118 ms, the fastest /health at 9 ms."
            }
            height="md"
            kind="bar"
            label={es ? "Latencia por endpoint" : "Latency by endpoint"}
            labels={false}
            locale={es ? "es" : "en"}
            points={latency}
            tone="info"
          />
          {/*
           * ONE COLUMN PER POINT, matching `.sk-chart__series` (`chart.css`) exactly — same
           * `grid-auto-flow: column` + `grid-auto-columns: 1fr` track sizing, same gap token — so
           * each trigger sits directly under its bar instead of a wrapped row whose widths follow
           * each label's own text length. A flex `Inline` was tried first and drifted out of
           * alignment the moment two labels differed in width, exactly the mismatch this grid
           * exists to rule out by construction rather than by eyeballing it back into place.
           */}
          <div
            style={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: "1fr",
              gap: "var(--space-inline-xs)",
            }}
          >
            {latency.map((point) => (
              <Tooltip
                content={`${formatChartValue(point.value, { locale: es ? "es" : "en" })} ms`}
                key={point.label}
              >
                <Button size="sm" style={{ inlineSize: "100%" }} type="button" variant="ghost">
                  {point.label}
                </Button>
              </Tooltip>
            ))}
          </div>
        </Stack>
      </Box>
    );
  },
  { label: "Point detail card", minHeight: "24rem" },
);

/* ---------------------------------------------------------------------------------------------
 * 4. GALLERY: the same options page (kind, tone, height, format, flush, grid) at card scale, side
 * by side, so the difference between them reads at a glance instead of one at a time down the
 * page.
 * ------------------------------------------------------------------------------------------- */
type GalleryCardProps = {
  title: string;
  chart: ReactNode;
  note: string;
};

function GalleryCard({ title, chart, note }: GalleryCardProps) {
  return (
    <Box border="subtle" padding="lg" surface="surface">
      <Stack gap="md">
        <Inline align="center" justify="between" wrap={false}>
          <Text size="caption" tone="tertiary" weight="label">
            {title}
          </Text>
          <Badge tone="neutral">{note}</Badge>
        </Inline>
        {chart}
      </Stack>
    </Box>
  );
}

const compact = [
  { label: "L", value: 12 },
  { label: "M", value: 19 },
  { label: "X", value: 14 },
  { label: "J", value: 27 },
  { label: "V", value: 22 },
];

const compactEn = [
  { label: "Mo", value: 12 },
  { label: "Tu", value: 19 },
  { label: "We", value: 14 },
  { label: "Th", value: 27 },
  { label: "Fr", value: 22 },
];

export const ChartGalleryDemo = framed(
  function ChartGalleryDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";
    const points = es ? compact : compactEn;

    return (
      <Grid columns={2} gap="md">
        <GalleryCard
          chart={
            <Chart
              format="percent"
              height="md"
              kind="bar"
              label={es ? "Conversión diaria" : "Daily conversion"}
              locale={es ? "es" : "en"}
              points={points.map((p) => ({ ...p, value: p.value / 100 }))}
              tone="success"
              values
            />
          }
          note="bar · percent · values"
          title={es ? "Conversión" : "Conversion"}
        />
        <GalleryCard
          chart={
            <PathChart
              height="md"
              kind="line"
              label={es ? "Errores por día" : "Errors per day"}
              locale={es ? "es" : "en"}
              points={points}
              tone="danger"
            />
          }
          note="line · @skryensya/charts"
          title={es ? "Errores" : "Errors"}
        />
        <GalleryCard
          chart={
            <PathChart
              flush
              height="md"
              kind="area"
              label={es ? "Uso de CPU" : "CPU usage"}
              labels={false}
              locale={es ? "es" : "en"}
              points={points}
              tone="warning"
            />
          }
          note="area · flush · sparkline"
          title={es ? "CPU" : "CPU"}
        />
        <GalleryCard
          chart={
            <Chart
              currency="USD"
              format="currency"
              grid
              height="md"
              kind="bar"
              label={es ? "Gasto diario" : "Daily spend"}
              locale={es ? "es" : "en"}
              points={points.map((p) => ({ ...p, value: p.value * 4 }))}
              tone="neutral"
            />
          }
          note="bar · currency · grid"
          title={es ? "Gasto" : "Spend"}
        />
      </Grid>
    );
  },
  { label: "Chart gallery", minHeight: "32rem" },
);
