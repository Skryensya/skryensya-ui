import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * THE PERIOD PANEL: the dashboard card whose series changes with a control, without becoming a
 * different card.
 *
 * `metric-panel` already publishes the chart-in-a-card composition; this recipe is the other real
 * shape that composition takes, a Segmented picking WHICH series draws rather than one fixed series.
 * Still no `ChartCard`, still no `variant` prop: a `Box`, a heading, a `Segmented` and a `Chart`, in a
 * `Stack`. The only new decision this recipe makes is where the control lives.
 *
 * THE SEGMENTED SITS IN THE HEADER, next to the heading, not above or below the chart. It is a
 * property of the CARD ("which window of time am I looking at"), the same rank as the heading itself,
 * not a control that belongs to the chart the way an axis would; `Chart`'s own contract has no option
 * for this and should not grow one; the period is a fact about the composition, not about the series.
 *
 * THE CONTROL OUTLIVES THE DATA. It sits in every one of the four states, including loading and
 * error, for the reason `metric-panel`'s own heading does: what identifies the panel — here, which
 * period a reader asked for — stays true whether or not this attempt to show it succeeded. A
 * Segmented that vanishes while its own request is in flight cannot be re-pressed to retry a
 * different window; it comes back once there is data again, which is later than a reader should have
 * to wait to change their mind.
 *
 * THE STATIC SNAPSHOT SELECTS "30D": a recipe is one still moment, not a live control (the same
 * caveat `hero-with-pricing-toggle`'s own notes give its Segmented) — a consumer wiring this for real
 * reads the control's change event and swaps `Chart`'s `points`, the same shape
 * `ChartPeriodCardDemo` in the docs implements live.
 */
export const chartPeriodPanelRecipe: Recipe = {
  id: "chart-period-panel",
  intent: "El panel de tráfico cuyo período se elige con un selector, sin dejar de ser la misma card.",
  notes: [
    "No hay componente nuevo: es la misma composición de `metric-panel` (`Box` + `Stack` + `Chart`), con un `Segmented` en el encabezado en vez de un botón.",
    "El `Segmented` es del ENCABEZADO, no del gráfico: decide qué serie se ve, la misma jerarquía que el título, no una opción de `Chart`. El contrato de Chart no tiene ni necesita un option para esto.",
    "El control se queda en las cuatro estados, cargando y roto incluidos: qué período pidió quien lee sigue siendo cierto aunque este intento de mostrarlo haya fallado, y un control que desaparece no se puede volver a tocar para pedir otra ventana.",
    "La foto es un momento estático (`value: \"30d\"`): quien conecte esto de verdad lee el evento de cambio del `Segmented` y cambia los `points` de `Chart`, la misma forma que ya implementa `ChartPeriodCardDemo` en los docs, en vivo.",
  ],

  states: {
    loading: panel([
      { contract: "loader", signature: "Loader.status", options: { label: "Cargando el tráfico" } },
      { contract: "placeholder", signature: "Placeholder", options: { shape: "block" } },
    ]),

    empty: panel([
      {
        contract: "empty-state",
        signature: "EmptyState",
        slots: {
          icon: { contract: "icon", signature: "Icon", options: { name: "clock" } },
          title: "Todavía no hay tráfico para este período",
          description: "En cuanto alguien entre al sitio, esta ventana empieza a llenarse.",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Cómo se mide el tráfico",
          },
        },
      },
    ]),

    error: panel([
      {
        contract: "callout",
        signature: "Callout",
        options: { tone: "danger" },
        slots: {
          title: "No pudimos cargar el tráfico",
          actions: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "translucent" },
            children: "Reintentar",
          },
        },
        children: "El período elegido sigue siendo 30D; probá de nuevo cuando quieras.",
      },
    ]),

    success: panel([
      {
        contract: "chart",
        signature: "Chart",
        options: {
          kind: "bar",
          tone: "accent",
          height: "md",
          format: "compact",
          label: "Páginas vistas, últimos 30 días",
          description: "Cuatro semanas, subiendo de 7.200 a 9.400 páginas vistas.",
        },
        slots: {
          items: [
            { options: { value: 7200 }, slots: { label: "Sem 1" } },
            { options: { value: 8100 }, slots: { label: "Sem 2" } },
            { options: { value: 7650 }, slots: { label: "Sem 3" } },
            { options: { value: 9400 }, slots: { label: "Sem 4" } },
          ],
        },
      },
    ]),
  },
};

/** The card, its heading row and its period control. Every state shares them: the same reasoning as
 *  `metric-panel`'s own `panel`, applied to a Segmented instead of a Button. */
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
              { contract: "typography", signature: "Heading", options: { headingSize: "h3" }, children: "Tráfico" },
              {
                contract: "segmented",
                signature: "Segmented",
                options: { value: "30d", label: "Elegir período" },
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
          ...children,
        ],
      },
    ],
  };
}
