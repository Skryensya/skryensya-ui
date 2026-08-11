import type { EvalCase } from "../case.js";

export const switchImmediateSettingCase: EvalCase = {
  id: "switch-immediate-setting",
  prompt: {
    es: "Un interruptor para activar el modo oscuro que cambia de inmediato, sin botón de guardar.",
    en: "A switch to turn on dark mode immediately, with no save button involved.",
  },
  notes: [
    "Distingue Switch de Checkbox por INTENCIÓN (`on-off`, `immediate-setting`) y no por apariencia: " +
      "comparten el mismo par de reglas de asociación por envoltura, y la elección de contrato la " +
      "decide si el cambio se envía con un formulario o surte efecto en el momento.",
  ],
  tree: {
    contract: "switch",
    signature: "Switch",
    options: { name: "dark-mode" },
    children: "Modo oscuro",
  },
};
