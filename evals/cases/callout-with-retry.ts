import type { EvalCase } from "../case.js";

export const calloutWithRetryCase: EvalCase = {
  id: "callout-with-retry",
  prompt: {
    es: "Un aviso de error con un botón para reintentar la operación.",
    en: "An error notice with a button to retry the operation.",
  },
  notes: [
    "Amplitud: la acción de un Callout está restringida por el contrato a `translucent`/`danger` " +
      "(`restrictOptions`), así nunca compite visualmente con el botón primario real de la pantalla.",
  ],
  tree: {
    contract: "callout",
    signature: "Callout",
    options: { tone: "danger" },
    slots: {
      title: "No pudimos cargar los datos",
      actions: {
        contract: "button",
        signature: "Button.action",
        options: { tone: "danger" },
        children: "Reintentar",
      },
    },
    children: "Revisá tu conexión y volvé a intentar.",
  },
};
