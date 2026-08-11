import type { EvalCase } from "../case.js";

export const settingsToggleRowCase: EvalCase = {
  id: "settings-toggle-row",
  prompt: {
    es: "Una fila de configuración con un rótulo y un interruptor alineados uno al lado del otro.",
    en: "A settings row with a label and a switch aligned side by side.",
  },
  notes: [
    "Amplitud: `Inline` para 'cosas una al lado de la otra' en vez de `Stack`, la distinción " +
      "semántica que el contrato de layout documenta entre ambas y que un agente sólo ve si lee " +
      "`useWhen`/`avoidWhen`, no la forma del árbol.",
  ],
  tree: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", justify: "between", inlineAlign: "center" },
    children: [
      { contract: "typography", signature: "Text", children: "Notificaciones por correo" },
      {
        contract: "switch",
        signature: "Switch",
        options: { name: "email-notifications", checked: true },
      },
    ],
  },
};
