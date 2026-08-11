import type { EvalCase } from "../case.js";

export const progressInLayoutCase: EvalCase = {
  id: "progress-in-layout",
  prompt: {
    es: "Una barra de progreso determinada dentro de un formulario de varios pasos.",
    en: "A determinate progress bar inside a multi-step form layout.",
  },
  notes: [
    "Guarda una composición que ya validaba estructuralmente pero colapsaba VISUALMENTE en el sitio " +
      "(Progress declara `inline-size: 100%` dentro de un Stack flex, y necesitó " +
      "`:has(> .sk-progress)` en component-preview.css para no encogerse a cero). Este runner sólo " +
      "prueba G0-G3 (forma): esta entrada NO prueba que el layout se vea bien, sólo que la " +
      "composición sigue siendo válida — la prueba visual vive en las gates de renderizado, no acá.",
  ],
  tree: {
    contract: "layout",
    signature: "Stack",
    options: { gap: "md" },
    children: [
      {
        contract: "progress",
        signature: "Progress",
        options: { value: 40, max: 100, label: "Paso 2 de 5" },
      },
    ],
  },
};
