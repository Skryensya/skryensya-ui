import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE METRIC PANEL: one number that matters, its trend, and where to go next.
 *
 * This is the dashboard card everyone asks for by pointing at a screenshot, and it is a RECIPE rather
 * than a component on purpose. There is no `sk-metric-panel`, no `<ChartCard>` and no `variant`
 * prop: it is a `Box`, a heading, a `Stat`, a `Chart` and a `Button`, each already contracted, sitting
 * in a `Stack`. Publishing it as a composition instead of a component is what keeps the parts
 * reusable and keeps the kit from growing the card-with-variants that Card refuses to be. Move any
 * piece, drop the footer, swap the chart's kind, and it is still this recipe.
 *
 * WHAT MAKES IT READ AS ONE THING rather than as five stacked elements:
 *
 * THE NUMBER IS TEXT, NOT THE CHART. The `Stat` says "418.2K" and "+10%"; the chart says only which
 * way it has been going. This is the whole reason the panel is legible: a reader who wants the value
 * reads it, and one who wants the shape looks at it, and neither has to estimate a bar against an
 * axis. It is also why the chart below can afford to have no axis at all.
 *
 * THE CHART IS FLUSH AND UNLABELLED, which is the same decision twice. `flush` cancels the Box's own
 * padding so the series reaches the card's edges (the card's `overflow: hidden` clips it to the
 * radius), and `labels: false` drops the tick text. What is left is a sparkline: a shape, deliberately
 * not a chart you could read values off. Note that `labels: false` HIDES the labels, it does not
 * remove them: they stay in the DOM, so the series is still read out entry by entry.
 *
 * THE FOOTER CELLS ARE SUNKEN, not bordered. They are subordinate to the headline number, and a
 * border would make them look like three peers in one box. `Grid` with two columns, because two is
 * what fits before the numbers start truncating.
 *
 * THE FOUR STATES ARE WHERE THE REAL WORK IS. A chart's states are worse than most, because a chart
 * has TWO ways of being empty and they mean opposite things: no series at all ("nothing has happened
 * yet") and a series of zeros ("something happened: it was zero"). The empty state below is the
 * first; the second is a success state with flat bars and must never be drawn as an empty one, or the
 * panel reports silence where it should report a number.
 */
export const metricPanelRecipe: Recipe = {
  id: "metric-panel",
  intent: "La card de dashboard: un número que importa, su tendencia, y a dónde ir después.",
  notes: [
    "No hay componente `MetricPanel`: es un `Box` con un `Stat`, un `Chart` y un `Button`. Publicarlo como composición y no como componente es lo que mantiene las piezas reutilizables y evita la card con variantes que Card se niega a ser.",
    "**El número lo dice el texto, no el gráfico.** El `Stat` dice 418.2K y +10%; el gráfico sólo dice para dónde viene yendo. Por eso el gráfico puede permitirse no tener eje: nadie tiene que estimar una barra contra una escala.",
    "`flush` cancela el padding del Box para que la serie llegue al borde de la card, y `labels: false` saca las etiquetas. Lo que queda es un sparkline: una forma, a propósito no un gráfico del que se puedan leer valores.",
    "`labels: false` OCULTA las etiquetas, no las borra: siguen en el DOM, así que un lector de pantalla igual recorre la serie entrada por entrada.",
    "Un gráfico tiene **dos maneras de estar vacío y significan lo opuesto**: no haber serie (todavía no pasó nada) y una serie de ceros (pasó algo: fue cero). El estado vacío de acá es el primero; el segundo es un estado de éxito con barras planas y nunca se dibuja como vacío, o el panel reporta silencio donde debería reportar un número.",
    "Las celdas del pie van `sunken` y no con borde: están subordinadas al número principal, y un borde las haría parecer tres pares dentro de una caja.",
  ],

  states: {
    /*
     * Placeholders in the shape of what is coming, not a spinner in the middle of the card. The
     * heading is already known (it does not load), so it stays: replacing it too would make the card
     * change size and lose its identity for as long as the request takes.
     */
    loading: panel([
      /*
       * `Loader.status` and NOT a spinner. The placeholders below are already the visible answer to
       * "is something coming", so a spinner on top would be the same news twice; what the skeleton
       * cannot do is announce itself, and this draws nothing but the live region that does.
       */
      { contract: "loader", signature: "Loader.status", options: { label: "Cargando las visitas" } },
      { contract: "placeholder", signature: "Placeholder" },
      { contract: "placeholder", signature: "Placeholder.block" },
    ]),

    /*
     * No series at all: nothing has been measured yet. The action is what would produce data, not a
     * "retry", because nothing failed.
     */
    empty: panel([
      {
        contract: "empty-state",
        signature: "EmptyState",
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "clock" } },
          title: "Todavía no hay visitas para mostrar",
          description: "En cuanto alguien entre al sitio, la serie de este mes empieza a llenarse.",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Cómo se miden las visitas",
          },
        },
      },
    ]),

    /*
     * The panel failed, the page did not. The heading stays and the callout replaces only the data,
     * for the same reason `detail`'s error keeps its identity: a view failed, not the record.
     */
    error: panel([
      {
        contract: "callout",
        signature: "Callout",
        options: { tone: "danger" },
        slots: {
          title: "No pudimos cargar las visitas",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Reintentar",
          },
        },
        children: "El último dato que alcanzamos a leer es de hace 20 minutos.",
      },
    ]),

    success: panel([
      {
        contract: "stat",
        signature: "Stat",
        options: { trend: "up" },
        slots: { label: "Visitas este mes", value: "418.2K", change: "+10%" },
      },
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "area",
          tone: "accent",
          height: "sm",
          labels: false,
          flush: true,
          format: "compact",
          label: "Visitas por semana, últimas ocho semanas",
        },
        slots: {
          items: [
            { options: { value: 38200 }, slots: { label: "Sem 1" } },
            { options: { value: 41500 }, slots: { label: "Sem 2" } },
            { options: { value: 39800 }, slots: { label: "Sem 3" } },
            { options: { value: 47200 }, slots: { label: "Sem 4" } },
            { options: { value: 44100 }, slots: { label: "Sem 5" } },
            { options: { value: 52600 }, slots: { label: "Sem 6" } },
            { options: { value: 57300 }, slots: { label: "Sem 7" } },
            { options: { value: 61400 }, slots: { label: "Sem 8" } },
          ],
        },
      },
      {
        contract: "layout",
        signature: "Grid",
        options: { columns: "2", gap: "sm" },
        children: [footerCell("Sesión media", "4m 12s"), footerCell("Rebote", "38%")],
      },
    ]),
  },
};

/**
 * The card, its heading row and its action. Every state shares them, which is the point: what
 * identifies the panel is true while it loads, while it is empty and while it is broken, so only the
 * DATA is passed in.
 */
function panel(children: readonly UsageTree[]): UsageTree {
  return {
    contract: "box",
    signature: "Box",
    options: { padding: "md", surface: "raised", border: "subtle" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "md" },
        children: [
          {
            contract: "layout",
            signature: "Inline",
            options: { justify: "between", inlineAlign: "center", wrap: false },
            children: [
              { contract: "typography", signature: "Heading", options: { headingSize: "h3" }, children: "Visitas" },
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "translucent", size: "sm" },
                children: "Ver informe",
              },
            ],
          },
          ...children,
        ],
      },
    ],
  };
}

/** One subordinate number under the headline. Sunken, so it reads as supporting rather than as a peer. */
function footerCell(label: string, value: string): UsageTree {
  return {
    contract: "box",
    signature: "Box",
    options: { padding: "sm", surface: "sunken" },
    children: [{ contract: "stat", signature: "Stat", slots: { label, value } }],
  };
}
