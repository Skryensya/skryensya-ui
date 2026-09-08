/*
 * THE THREE DASHBOARD CARDS THE CHARTS PAGE OPENS WITH.
 *
 * There is no ChartCard component. Each one is a Box, a heading, a Stat or a Badge, a Chart and a Button,
 * the same composition the `metric-panel` recipe publishes. The chart owns only the series: surface,
 * title, action and supporting numbers belong to the pieces already in the kit.
 *
 * Bars come from `@skryensya/react/chart` (a list plus a division, no engine). Area comes from
 * `@skryensya/charts/react`, which is a drop-in that paints an overlay on the same markup. Nothing
 * here names TanStack.
 */
import { Button } from "@skryensya/react/button";
import { Chart as AreaChart } from "@skryensya/charts/react";
import { Chart } from "@skryensya/react/chart";
import { Icon } from "@skryensya/react/icon";
import { Box, Grid, Inline, Stack } from "@skryensya/react/layout";
import { Stat } from "@skryensya/react/stat";
import { Heading, Text } from "@skryensya/react/typography";
import { framedIn } from "./framed";

const framed = framedIn("chart-card");

/** Compact notation for a Stat's count-up ticks, matched to the card's own locale. */
const compactCount = (locale: string) => (n: number) =>
  new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);

type DemoProps = { lang?: "es" | "en" };

const visits = [
  { label: "S1", value: 38200 },
  { label: "S2", value: 41500 },
  { label: "S3", value: 39800 },
  { label: "S4", value: 47200 },
  { label: "S5", value: 44100 },
  { label: "S6", value: 52600 },
  { label: "S7", value: 57300 },
  { label: "S8", value: 61400 },
];

const contributions = [
  { label: "Dic", value: 18, tone: "accent" as const },
  { label: "Ene", value: 22 },
  { label: "Feb", value: 16 },
  { label: "Mar", value: 31 },
  { label: "Abr", value: 24 },
];

const contributionsEn = [
  { label: "Dec", value: 18, tone: "accent" as const },
  { label: "Jan", value: 22 },
  { label: "Feb", value: 16 },
  { label: "Mar", value: 31 },
  { label: "Apr", value: 24 },
];

const power = [
  { label: "6a", value: 12 },
  { label: "8a", value: 18 },
  { label: "10a", value: 27 },
  { label: "12p", value: 31 },
  { label: "2p", value: 22 },
  { label: "4p", value: 19 },
  { label: "6p", value: 28 },
  { label: "8p", value: 16 },
];

/** The sparkline card: the number is text, the chart is only the trend, flush to the bottom edge. */
export const ChartAnalyticsCardDemo = framed(
  function ChartAnalyticsCardDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="lg">
          <Inline align="start" justify="between" wrap={false}>
            <Stack gap="xs">
              <Heading as="h3" flush size="h4">
                {es ? "Analítica" : "Analytics"}
              </Heading>
              <Stat
                animate
                change={
                  <>
                    <Icon name="arrow-up" size="sm" /> +10%
                  </>
                }
                count={418200}
                format={compactCount(es ? "es" : "en")}
                label={es ? "Visitas este mes" : "Visits this month"}
                trend="up"
                value={es ? "418,2 K" : "418.2K"}
              />
            </Stack>
            <Button size="sm" type="button" variant="translucent">
              {es ? "Ver analítica" : "View Analytics"}
            </Button>
          </Inline>
          <AreaChart
            description={
              es
                ? "Ocho semanas, subiendo de 38.200 a 61.400 visitas."
                : "Eight weeks, rising from 38,200 to 61,400 visits."
            }
            flush
            format="compact"
            height="md"
            kind="area"
            label={es ? "Visitas por semana" : "Visits per week"}
            labels={false}
            locale={es ? "es" : "en"}
            points={visits}
            tone="neutral"
          />
        </Stack>
      </Box>
    );
  },
  { label: "Analytics card", minHeight: "26rem" },
);

/** The history card: labelled bars, one entry emphasized, two sunken supporting stats. */
export const ChartHistoryCardDemo = framed(
  function ChartHistoryCardDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {es ? "Historial de aportes" : "Contribution History"}
            </Heading>
            <Text size="caption" tone="tertiary">
              {es ? "Actividad de los últimos seis meses" : "Last 6 months of activity"}
            </Text>
          </Stack>
          <Chart
            description={
              es
                ? "Cinco meses de aportes. Diciembre está destacado, marzo es el más alto."
                : "Five months of contributions. December is emphasized, March is the tallest."
            }
            height="lg"
            kind="bar"
            label={es ? "Aportes por mes" : "Contributions per month"}
            locale={es ? "es" : "en"}
            points={es ? contributions : contributionsEn}
            tone="neutral"
          />
          <Grid columns={2} gap="sm">
            <Box padding="sm" surface="sunken">
              <Stat
                label={es ? "Próximo" : "Upcoming"}
                value={es ? "Mayo 2026" : "May 2026"}
                change={es ? "Programado" : "Scheduled"}
              />
            </Box>
            <Box padding="sm" surface="sunken">
              <Stat
                label={es ? "Plan de ahorro" : "Savings plan"}
                value={es ? "Acelerado" : "Accelerated"}
                change={es ? "Recurrente" : "Recurring"}
              />
            </Box>
          </Grid>
          <Button size="sm" style={{ inlineSize: "100%" }} type="button" variant="solid">
            {es ? "Ver informe completo" : "View Full Report"}
          </Button>
        </Stack>
      </Box>
    );
  },
  { label: "History card", minHeight: "32rem" },
);

/** The usage card: labelled bars, then two stats that say the numbers the chart must not. */
export const ChartUsageCardDemo = framed(
  function ChartUsageCardDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Box as="article" border="subtle" padding="lg" surface="surface">
        <Stack gap="md">
          <Stack gap="xs">
            <Heading as="h3" flush size="h4">
              {es ? "Consumo eléctrico" : "Power Usage"}
            </Heading>
            <Text size="caption" tone="tertiary">
              {es ? "Toda la casa" : "Whole Home"}
            </Text>
          </Stack>
          <Chart
            description={
              es
                ? "Ocho intervalos de dos horas. El pico es al mediodía, 31."
                : "Eight two-hour intervals. The peak is at noon, 31."
            }
            height="lg"
            kind="bar"
            label={es ? "Consumo por hora" : "Usage by hour"}
            locale={es ? "es" : "en"}
            points={power}
            tone="neutral"
          />
          <Grid columns={2} gap="md">
            <Stat label={es ? "En uso ahora" : "Currently Using"} value="3.4 kW" />
            <Stat
              change={
                <>
                  <Icon name="arrow-up" size="sm" /> +18%
                </>
              }
              label={es ? "Generación solar" : "Solar Gen"}
              trend="up"
              value="1.2 kW"
            />
          </Grid>
        </Stack>
      </Box>
    );
  },
  { label: "Usage card", minHeight: "30rem" },
);

/** The Card page's own rung: the analytics composition, not a second invention. */
export const ChartCardDemo = ChartAnalyticsCardDemo;
