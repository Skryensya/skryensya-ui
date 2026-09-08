import type { EvalCase } from "../case.js";

export const tooltipAnchoredPublishedCase: EvalCase = {
  id: "tooltip-anchored-published",
  prompt: {
    es: "Un botón de sólo ícono con un tooltip que explica su función.",
    en: "An icon-only button with a tooltip explaining what it does.",
  },
  notes: [
    "Guarda la publicación de las familias ANCLADAS (tooltip, popover, menu, select, combobox, " +
      "date-picker, calendar, split-button), bloqueadas en su momento por la divergencia " +
      "portal-vs-markup entre bindings (ver ai-ui-platform.md). `artifacts/ai-manifest.json` " +
      "confirma que las 65 familias publicadas ya incluyen las ocho; esta entrada existe para que " +
      "una regresión que las vuelva a bloquear falle acá primero, no en un agente en producción.",
  ],
  tree: {
    contract: "tooltip",
    signature: "Tooltip",
    options: { placement: "block-start" },
    slots: {
      content: "Elimina este elemento",
      children: {
        contract: "button",
        signature: "Button.action",
        options: { variant: "ghost", iconOnly: true },
        attrs: { "aria-label": "Eliminar" },
        children: { contract: "icon", signature: "Icon", options: { name: "delete" } },
      },
    },
  },
};
