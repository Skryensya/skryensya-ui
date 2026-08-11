import type { EvalCase } from "../case.js";

export const confirmationDialogCase: EvalCase = {
  id: "confirmation-dialog",
  prompt: {
    es: "Un diálogo que confirma el borrado de un proyecto antes de ejecutarlo.",
    en: "A dialog confirming project deletion before it happens.",
  },
  notes: [
    "Amplitud, no regresión: una confirmación destructiva completa (título, cuerpo, dos acciones en " +
      "el footer que cierran vía `<form method=\"dialog\">` sin handler propio), el mismo patrón que " +
      "resuelve `destructive-confirm` en contracts/recipes.",
  ],
  tree: {
    contract: "dialog",
    signature: "Dialog",
    slots: {
      title: "Eliminar proyecto",
      children:
        "Esta acción no se puede deshacer. El proyecto y sus archivos se eliminarán de forma permanente.",
      footer: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost" },
          attrs: { type: "submit", value: "cancel" },
          children: "Cancelar",
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "danger" },
          attrs: { type: "submit", value: "confirm" },
          children: "Eliminar",
        },
      ],
    },
  },
};
