import type { EvalCase } from "../case.js";

export const iconOnlyButtonLabelledCase: EvalCase = {
  id: "icon-only-button-labelled",
  prompt: {
    es: "Un botón de sólo ícono para eliminar un elemento, sin texto visible.",
    en: "An icon-only button to delete an item, with no visible text.",
  },
  notes: [
    "Guarda dos regresiones documentadas a la vez: el ícono usa el enum `stableIconNames` (un nombre " +
      "inventado falla validando, no al montar), y el nombre accesible vive en el BOTÓN (`aria-label`, " +
      "exigido por la regla a11y de `iconOnly`), no en el ícono decorativo que lo acompaña.",
  ],
  tree: {
    contract: "button",
    signature: "Button.action",
    options: { variant: "ghost", iconOnly: true },
    attrs: { "aria-label": "Eliminar" },
    children: { contract: "icon", signature: "Icon", options: { name: "delete" } },
  },
};
