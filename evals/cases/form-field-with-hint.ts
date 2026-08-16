import type { EvalCase } from "../case.js";

export const formFieldWithHintCase: EvalCase = {
  id: "form-field-with-hint",
  prompt: {
    es: "Un campo de texto para el nombre de usuario con una ayuda breve debajo.",
    en: "A text field for a username with a short hint underneath.",
  },
  notes: [
    "Amplitud: FormField resuelve el `for`/`id`/`aria-describedby` entre el rótulo, la ayuda y el " +
      "control por sí mismo (`wiring` del contrato); un agente no debería reescribir esa asociación " +
      "a mano ni debería hacer falta que lo haga.",
  ],
  tree: {
    contract: "form-field",
    signature: "FormField",
    slots: {
      label: "Nombre de usuario",
      hint: "Sólo minúsculas, números y guiones.",
      children: {
        contract: "input",
        signature: "Input",
        options: { name: "username", placeholder: "ej. maria-lopez" },
      },
    },
  },
};
