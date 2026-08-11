import type { EvalCase } from "../case.js";

export const checkboxNoForIdCase: EvalCase = {
  id: "checkbox-no-for-id",
  prompt: {
    es: "Una casilla para aceptar los términos y condiciones antes de enviar un formulario.",
    en: "A checkbox to accept the terms and conditions before submitting a form.",
  },
  notes: [
    "Guarda la regla documentada: Checkbox no lleva `for` ni `id` en ningún lado, envolver ES la " +
      "asociación. Un agente que reproduzca el patrón HTML habitual (label for + input id) produce " +
      "una firma que este contrato no tiene.",
  ],
  tree: {
    contract: "checkbox",
    signature: "Checkbox",
    options: { name: "terms", value: "accepted", required: true },
    children: "Acepto los términos y condiciones",
  },
};
