import type { EvalCase } from "../case.js";

export const radioGroupValueAtGroupCase: EvalCase = {
  id: "radio-group-value-at-group",
  prompt: {
    es: "Una encuesta corta con una pregunta de opción única entre tres alternativas.",
    en: "A short survey with a single-choice question among three alternatives.",
  },
  notes: [
    "Guarda la regresión documentada en plataforma-ai-ui.md: la selección es del GRUPO (`value` a " +
      "nivel de RadioGroup), no de cada entrada (`checked` por opción). El contrato marca la entrada " +
      "que coincide vía `selectedBy`; nada en la data puede dejar dos entradas marcadas a la vez.",
  ],
  tree: {
    contract: "radio-group",
    signature: "RadioGroup",
    options: { name: "plan", value: "pro", orientation: "vertical" },
    attrs: { "aria-label": "Elegí tu plan" },
    slots: {
      items: [
        { options: { value: "free" }, slots: { label: "Gratis" } },
        { options: { value: "pro" }, slots: { label: "Pro" } },
        { options: { value: "team" }, slots: { label: "Equipo" } },
      ],
    },
  },
};
