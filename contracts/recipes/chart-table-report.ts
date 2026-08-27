import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE REPORT: the same series read two ways, because a chart and a table answer different
 * questions and neither one should have to pretend to answer the other's.
 *
 * `contracts/semantic/chart.yaml`'s own `avoidWhen` already names the case this recipe exists to
 * show the RIGHT way to handle, rather than a chart straining to cover it alone: "los valores hay
 * que poder leerlos con precisión, compararlos fila por fila u ordenarlos; eso es una Table, y un
 * gráfico de cinco barras es una tabla peor". A reader who wants the trend looks at the chart; a
 * reader who wants to quote Q3's exact figure, or compare it against Q2's, wants the table below it.
 * Neither is asked to do the other's job.
 *
 * TWO SEPARATE ACCESSIBLE NAMES, on purpose. `Chart`'s `label` and `Table`'s `TableCaption` each name
 * their OWN rendering ("Revenue by quarter" vs "Revenue by quarter, in dollars"): they are two
 * readings of one dataset, not one thing announced twice under one name. A screen reader user moving
 * from one to the other hears two distinct, named regions, not an echo.
 *
 * THE TABLE IS NOT A FALLBACK FOR WHEN THE CHART FAILS. Both read from the same data and both are
 * always there in `success`; there is no toggle, no "view as table" link. A consumer who only wants
 * one of the two is composing a different recipe (the chart alone, or `data-table`), not this one.
 */
export const chartTableReportRecipe: Recipe = {
  id: "chart-table-report",
  intent: "El reporte donde la misma serie se lee dos veces: el gráfico dice la forma, la tabla dice el número exacto.",
  notes: [
    "No es un chart con fallback de tabla: las dos están siempre ahí en `success`, leyendo el mismo dato. Quien sólo quiere una de las dos está componiendo otra cosa (el chart solo, o `data-table`).",
    "Dos nombres accesibles separados: `label` en Chart, `TableCaption` en Table. Son dos lecturas del mismo dataset, no la misma cosa anunciada dos veces bajo un nombre.",
    "El caso que esto resuelve ya está nombrado en la semántica de Chart (`avoidWhen`): valores que hay que leer con precisión o comparar fila por fila. Un gráfico de barras no reemplaza esa lectura; la tabla de abajo sí.",
    "La primera celda de cada fila de datos es un `TableHeader` con `scope=\"row\"`, no una celda más: es lo que le da a cada fila un nombre accesible (\"Q3\"), la misma razón por la que la Table de `data-table` ya lo hace.",
  ],

  states: {
    loading: stack([
      { contract: "loader", signature: "Loader.status", options: { label: "Cargando los ingresos" } },
      { contract: "placeholder", signature: "Placeholder", options: { shape: "block" } },
      { contract: "placeholder", signature: "Placeholder", options: { shape: "text" } },
    ]),

    empty: stack([
      {
        contract: "empty-state",
        signature: "EmptyState",
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "clock" } },
          title: "Todavía no hay ingresos para este trimestre",
          description: "En cuanto se registre el primero, el gráfico y la tabla empiezan a llenarse juntos.",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Cómo se registran los ingresos",
          },
        },
      },
    ]),

    error: stack([
      {
        contract: "callout",
        signature: "Callout",
        options: { tone: "danger" },
        slots: {
          title: "No pudimos cargar los ingresos",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Reintentar",
          },
        },
        children: "Ni el gráfico ni la tabla tienen datos más recientes que mostrar todavía.",
      },
    ]),

    success: stack([
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          tone: "neutral",
          height: "sm",
          format: "compact",
          label: "Ingresos por trimestre",
          description: "Cuatro trimestres, subiendo de 184 mil a 238 mil, con una baja en el tercero.",
        },
        slots: {
          items: [
            { options: { value: 184000 }, slots: { label: "Q1" } },
            { options: { value: 201000 }, slots: { label: "Q2" } },
            { options: { value: 196000 }, slots: { label: "Q3" } },
            { options: { value: 238000 }, slots: { label: "Q4" } },
          ],
        },
      },
      {
        contract: "table",
        signature: "Table",
        children: [
          { contract: "table", signature: "TableCaption", children: "Ingresos por trimestre, en dólares" },
          {
            contract: "table",
            signature: "TableHead",
            children: {
              contract: "table",
              signature: "TableRow",
              children: [
                { contract: "table", signature: "TableHeader", children: "Trimestre" },
                { contract: "table", signature: "TableHeader", children: "Ingresos" },
                { contract: "table", signature: "TableHeader", children: "Variación" },
              ],
            },
          },
          {
            contract: "table",
            signature: "TableBody",
            children: [
              row("Q1", "$184.000", "—"),
              row("Q2", "$201.000", "+9%"),
              row("Q3", "$196.000", "-2%"),
              row("Q4", "$238.000", "+21%"),
            ],
          },
        ],
      },
    ]),
  },
};

/** Every state's own root: a `Stack` of whatever that state shows, the same wrapper `data-table`'s
 *  own recipe uses so a failing or loading state is still one composed tree, not a bare list. */
function stack(children: readonly UsageTree[]): UsageTree {
  return { contract: "layout", signature: "Stack", options: { gap: "md" }, children };
}

/** One row: the quarter is the ROW's own header (`scope="row"`), not a fourth cell. */
function row(quarter: string, revenue: string, delta: string): UsageTree {
  return {
    contract: "table",
    signature: "TableRow",
    children: [
      { contract: "table", signature: "TableHeader", options: { scope: "row" }, children: quarter },
      { contract: "table", signature: "TableCell", children: revenue },
      { contract: "table", signature: "TableCell", children: delta },
    ],
  };
}
