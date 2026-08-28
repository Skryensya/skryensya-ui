/*
 * Standalone series, for the part of the Charts page that documents Chart itself.
 *
 * Same contract as the cards: `points`, `kind`, `label`. Bars never leave `@skryensya/react/chart`.
 * Line and area swap the import to `@skryensya/charts/react`, which is a drop-in: same props, one
 * more kind that paints. TanStack is not in this file.
 */
import { Chart as PathChart } from "@skryensya/charts/react";
import { Chart } from "@skryensya/react/chart";
import { framedIn } from "./framed";

const framed = framedIn("charts");

type DemoProps = { lang?: "es" | "en" };

const documented = [
  { label: "Q1", value: 14 },
  { label: "Q2", value: 23 },
  { label: "Q3", value: 41 },
  { label: "Q4", value: 58 },
  { label: "Q5", value: 72 },
];

const latency = [
  { label: "0.4", value: 182 },
  { label: "0.5", value: 164 },
  { label: "0.6", value: 131 },
  { label: "0.7", value: 118 },
  { label: "0.8", value: 96 },
  { label: "0.9", value: 74 },
];

const weight = [
  { label: "S1", value: 148 },
  { label: "S2", value: 152 },
  { label: "S3", value: 139 },
  { label: "S4", value: 121 },
  { label: "S5", value: 114 },
  { label: "S6", value: 103 },
];

export const ChartsBarDemo = framed(
  function ChartsBarDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <Chart
        description={
          es
            ? "Cinco barras, una por trimestre, subiendo de 14 a 72 componentes."
            : "Five bars, one per quarter, rising from 14 to 72 components."
        }
        height="lg"
        kind="bar"
        label={es ? "Componentes documentados por trimestre" : "Documented components per quarter"}
        locale={es ? "es" : "en"}
        points={documented}
      />
    );
  },
  { label: "Bar", minHeight: "22rem" },
);

export const ChartsLineDemo = framed(
  function ChartsLineDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <PathChart
        description={
          es
            ? "Una línea descendente: la latencia baja de 182 a 74 milisegundos entre la 0.4 y la 0.9."
            : "A descending line: latency drops from 182 to 74 milliseconds between 0.4 and 0.9."
        }
        height="lg"
        kind="line"
        label={es ? "Latencia de interacción por versión" : "Interaction latency per version"}
        locale={es ? "es" : "en"}
        points={latency}
        tone="info"
      />
    );
  },
  { label: "Line", minHeight: "22rem" },
);

export const ChartsAreaDemo = framed(
  function ChartsAreaDemo({ lang = "es" }: DemoProps) {
    const es = lang === "es";

    return (
      <PathChart
        description={
          es
            ? "Un área con el peso del bundle, bajando de 148 a 103 kB a lo largo de seis semanas."
            : "An area for bundle weight, falling from 148 to 103 kB across six weeks."
        }
        height="lg"
        kind="area"
        label={es ? "Peso del bundle por semana" : "Bundle weight per week"}
        locale={es ? "es" : "en"}
        points={weight}
      />
    );
  },
  { label: "Area", minHeight: "22rem" },
);
