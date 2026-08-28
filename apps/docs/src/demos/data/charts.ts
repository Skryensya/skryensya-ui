import type { ChartPoint } from "@skryensya/core/chart";
import type { Translate } from "../../i18n";

/*
 * THE SERIES BEHIND THE CHARTS PAGE'S OWN DEMOS, kept out of `charts.ts` for the same reason
 * `data/table.ts` keeps its rows out of `table.ts`: a tree reads as a composition, and forty numbers
 * inline would bury it.
 *
 * Most series are LOCALE-INVARIANT (a percentage, an hour, an endpoint path is the same string in
 * both languages) and stay a plain array. The few whose labels are actual words (months, weekdays)
 * are a function of the translator instead, same rule `data/tabs.ts` follows for its panel bodies.
 */

export const visitsPerWeek: readonly ChartPoint[] = [
  { label: "S1", value: 38200 },
  { label: "S2", value: 41500 },
  { label: "S3", value: 39800 },
  { label: "S4", value: 47200 },
  { label: "S5", value: 44100 },
  { label: "S6", value: 52600 },
  { label: "S7", value: 57300 },
  { label: "S8", value: 61400 },
];

export const contributionsPerMonth = (t: Translate): readonly ChartPoint[] => [
  { label: t("demo.charts.month.dec"), value: 18, tone: "accent" },
  { label: t("demo.charts.month.jan"), value: 22 },
  { label: t("demo.charts.month.feb"), value: 16 },
  { label: t("demo.charts.month.mar"), value: 31 },
  { label: t("demo.charts.month.apr"), value: 24 },
];

export const powerByHour: readonly ChartPoint[] = [
  { label: "6a", value: 12 },
  { label: "8a", value: 18 },
  { label: "10a", value: 27 },
  { label: "12p", value: 31 },
  { label: "2p", value: 22 },
  { label: "4p", value: 19 },
  { label: "6p", value: 28 },
  { label: "8p", value: 16 },
];

export const documentedPerQuarter: readonly ChartPoint[] = [
  { label: "Q1", value: 14 },
  { label: "Q2", value: 23 },
  { label: "Q3", value: 41 },
  { label: "Q4", value: 58 },
  { label: "Q5", value: 72 },
];

export const latencyPerVersion: readonly ChartPoint[] = [
  { label: "0.4", value: 182 },
  { label: "0.5", value: 164 },
  { label: "0.6", value: 131 },
  { label: "0.7", value: 118 },
  { label: "0.8", value: 96 },
  { label: "0.9", value: 74 },
];

export const bundleWeightPerWeek: readonly ChartPoint[] = [
  { label: "S1", value: 148 },
  { label: "S2", value: 152 },
  { label: "S3", value: 139 },
  { label: "S4", value: 121 },
  { label: "S5", value: 114 },
  { label: "S6", value: 103 },
];

export const quarterlyRevenue = [
  { label: "Q1", value: 184000, delta: null as string | null },
  { label: "Q2", value: 201000, delta: "+9%" },
  { label: "Q3", value: 196000, delta: "-2%" },
  { label: "Q4", value: 238000, delta: "+21%" },
] as const;

export const latencyByEndpoint: readonly ChartPoint[] = [
  { label: "/auth", value: 42 },
  { label: "/search", value: 118 },
  { label: "/orders", value: 76 },
  { label: "/users", value: 54 },
  { label: "/health", value: 9 },
];

export const budgetByTeam: readonly ChartPoint[] = [
  { label: "Eng", value: 182000, tone: "accent" },
  { label: "Sales", value: 96000, tone: "success" },
  { label: "Support", value: 54000, tone: "warning" },
  { label: "Legal", value: 21000, tone: "danger" },
  { label: "Ops", value: 68000, tone: "neutral" },
];

export const compactWeekdays = (t: Translate): readonly ChartPoint[] => [
  { label: t("demo.charts.weekday.mon"), value: 12 },
  { label: t("demo.charts.weekday.tue"), value: 19 },
  { label: t("demo.charts.weekday.wed"), value: 14 },
  { label: t("demo.charts.weekday.thu"), value: 27 },
  { label: t("demo.charts.weekday.fri"), value: 22 },
];

type MetricKey = "revenue" | "users" | "errors";

export const metricSeries: Record<MetricKey, { tone: ChartPoint["tone"]; points: readonly ChartPoint[] }> = {
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

export const q4Current: readonly ChartPoint[] = [
  { label: "Oct", value: 71000 },
  { label: "Nov", value: 76500 },
  { label: "Dec", value: 84200 },
];

export const q4Prior: readonly ChartPoint[] = [
  { label: "Oct", value: 61000 },
  { label: "Nov", value: 64800 },
  { label: "Dec", value: 69100 },
];

export const trafficByPeriod = (
  t: Translate,
): Record<"7d" | "30d" | "90d", readonly ChartPoint[]> => ({
  "7d": [
    { label: t("demo.charts.weekday.monShort"), value: 1180 },
    { label: t("demo.charts.weekday.tueShort"), value: 1340 },
    { label: t("demo.charts.weekday.wedShort"), value: 1290 },
    { label: t("demo.charts.weekday.thuShort"), value: 1510 },
    { label: t("demo.charts.weekday.friShort"), value: 1780 },
    { label: t("demo.charts.weekday.satShort"), value: 980 },
    { label: t("demo.charts.weekday.sunShort"), value: 860 },
  ],
  "30d": [
    { label: `${t("demo.charts.week")} 1`, value: 7200 },
    { label: `${t("demo.charts.week")} 2`, value: 8100 },
    { label: `${t("demo.charts.week")} 3`, value: 7650 },
    { label: `${t("demo.charts.week")} 4`, value: 9400 },
  ],
  "90d": [
    { label: t("demo.charts.month.jan"), value: 28400 },
    { label: t("demo.charts.month.feb"), value: 31200 },
    { label: t("demo.charts.month.mar"), value: 36800 },
  ],
});
