import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * A flow in steps: choose, adjust, confirm.
 *
 * The Steps bar is not decoration and it is not a progress bar. A progress bar says how much is
 * left; Steps says what the remaining work IS, which is the only way someone can decide whether to
 * finish now or come back. That is why it stays on screen in every state, including the failing one:
 * losing your place is the expensive part of a flow, not losing the form.
 *
 * The other decision worth copying: "guardar mis datos" is a Checkbox, not a Switch. It applies when
 * the flow is submitted, and a Switch would promise it already took effect.
 */
export const checkoutRecipe: Recipe = {
  id: "checkout",
  intent: "Un flujo en pasos: elegir, ajustar y confirmar sin perder de vista cuánto falta.",
  notes: [
    "Steps no es una barra de progreso: una barra dice cuánto falta, Steps dice **qué** falta, que es lo único que permite decidir entre terminar ahora o volver después.",
    "La barra de pasos se queda en los cuatro estados. Perder el lugar es lo caro de un flujo; perder el formulario no.",
    "«Guardar mis datos» es un Checkbox y no un Switch: se aplica al enviar, y un Switch prometería que ya tuvo efecto.",
    "El paso actual se marca en la entrada (`current`), no se deduce de la posición: una lista donde el lugar se infiere se desincroniza en cuanto un paso se salta.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "lg" },
      children: [
        steps("current"),
        { contract: "loader", signature: "Loader", options: { size: "lg", label: "Cargando las opciones de envío" } },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "lg" },
      children: [
        steps("current"),
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            { contract: "typography", signature: "Heading", children: "¿Cuándo lo enviamos?" },
            {
              contract: "radio-group",
              signature: "RadioGroup",
              options: { name: "envio", value: "estandar" },
              slots: {
                items: [
                  { options: { value: "estandar" }, slots: { label: "Estándar · 3 a 5 días" } },
                  { options: { value: "express" }, slots: { label: "Express · al día siguiente" } },
                ],
              },
            },
            {
              contract: "number-field",
              signature: "NumberField",
              options: { name: "unidades", min: 1, max: 9 },
              slots: { label: "Unidades" },
            },
            {
              contract: "time-field",
              signature: "TimeField",
              options: { name: "franja" },
              slots: { label: "Franja horaria", hint: "Entregamos entre las 9 y las 18." },
            },
            {
              contract: "checkbox",
              signature: "Checkbox",
              options: { name: "recordar" },
              children: "Guardar estos datos para la próxima",
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Continuar al pago",
            },
          ],
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "lg" },
      children: [
        steps("current"),
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "md" },
          children: [
            {
              contract: "callout",
              signature: "Callout",
              options: { tone: "danger" },
              slots: { title: "No hay envíos express a tu zona" },
              children: "Elegí otra opción para continuar.",
            },
            {
              contract: "radio-group",
              signature: "RadioGroup",
              options: { name: "envio" },
              slots: {
                items: [
                  { options: { value: "estandar" }, slots: { label: "Estándar · 3 a 5 días" } },
                  { options: { value: "express", disabled: true }, slots: { label: "Express · no disponible acá" } },
                ],
              },
            },
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Continuar al pago",
            },
          ],
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "lg" },
      children: [
        steps("complete"),
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "success" },
          slots: {
            title: "Pedido confirmado",
            actions: {
              contract: "button",
              signature: "Button.navigation",
              options: { href: "/pedidos/4821", variant: "subtle" },
              children: "Seguir el envío",
            },
          },
          children: "Te avisamos por correo cuando salga del depósito.",
        },
      ],
    },
  },
};

/*
 * The step bar, with the flow's position as the only thing that changes.
 *
 * A helper rather than four copies, for the reason the recipe states: the bar is the SAME bar in
 * every state, and that is the claim. Written out four times, one of them would drift and quietly
 * stop making it.
 */
function steps(shipping: "current" | "complete"): UsageTree {
  const done = shipping === "complete";
  return {
    contract: "steps",
    signature: "Steps",
    slots: {
      items: [
        { options: { status: "complete" }, slots: { label: "Carrito", marker: "✓" } },
        {
          options: done ? { status: "complete" } : { status: "current", current: true },
          slots: { label: "Envío", marker: done ? "✓" : "2" },
        },
        {
          options: done ? { status: "current", current: true } : { status: "upcoming" },
          slots: { label: "Pago", marker: "3" },
        },
      ],
    },
  };
}
