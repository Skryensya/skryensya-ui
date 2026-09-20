import type { EvalCase } from "../case.js";

export const confirmationDialogCase: EvalCase = {
  id: "confirmation-dialog",
  prompt: {
    es: "Un diálogo que confirma el borrado de un proyecto antes de ejecutarlo.",
    en: "A dialog confirming project deletion before it happens.",
  },
  notes: [
    "Amplitud, no regresión: una confirmación destructiva completa (título, cuerpo, dos acciones en " +
      "el footer que cierran vía `<form method=\"dialog\">` sin handler propio).",
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
          options: { variant: "ghost", type: "submit" },
          attrs: { value: "cancel" },
          children: "Cancelar",
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { tone: "danger", type: "submit" },
          attrs: { value: "confirm" },
          children: "Eliminar",
        },
      ],
    },
  },
};
