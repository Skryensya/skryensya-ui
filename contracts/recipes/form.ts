import type { Recipe } from "./recipe.js";

/**
 * A form that is submitted, can fail, and says so where the failure happened.
 *
 * The interesting state is `error`, and it is interesting because the error lives in TWO places at
 * once and neither is optional: the Field whose value is wrong carries the message that invalidates
 * it, and the Callout above the form says the submission did not go through. Only one of those tells
 * a screen reader which control to go back to, and only the other one is visible without scrolling.
 */
export const formRecipe: Recipe = {
  id: "form",
  intent: "Un formulario corto que se envía, puede fallar, y lo dice donde falló.",
  notes: [
    "El error del campo es lo que lo invalida: no hay una opción `invalid` aparte que pueda quedar desfasada del mensaje.",
    "El Callout de arriba no reemplaza al error del campo, lo acompaña: uno se ve sin scrollear, el otro dice a qué control volver.",
    "El estado de envío apaga los controles en vez de esconderlos: un formulario que desaparece mientras guarda pierde el contexto de lo que se escribió.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Crear proyecto" },
        {
          contract: "field",
          signature: "Field",
          slots: { label: "Nombre del proyecto" },
          children: {
            contract: "input",
            signature: "Input",
            options: { name: "nombre", disabled: true },
          },
        },
        {
          contract: "field",
          signature: "Field",
          slots: { label: "Descripción" },
          children: {
            contract: "input",
            signature: "Textarea",
            options: { name: "descripcion", disabled: true },
          },
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Guardando…",
            },
            { contract: "loader", signature: "Loader", options: { size: "sm", label: "Guardando el proyecto" } },
          ],
        },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Crear proyecto" },
        {
          contract: "field",
          signature: "Field",
          slots: { label: "Nombre del proyecto", hint: "Lo vas a poder cambiar después." },
          children: { contract: "input", signature: "Input", options: { name: "nombre" } },
        },
        {
          contract: "field",
          signature: "Field",
          slots: { label: "Descripción" },
          children: { contract: "input", signature: "Textarea", options: { name: "descripcion" } },
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Crear proyecto",
            },
            { contract: "button", signature: "Button.action", children: "Cancelar" },
          ],
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Crear proyecto" },
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "danger" },
          slots: { title: "No pudimos crear el proyecto" },
          children: "Revisá el nombre y volvé a intentar.",
        },
        {
          contract: "field",
          signature: "Field",
          slots: {
            label: "Nombre del proyecto",
            error: "Ya existe un proyecto con ese nombre.",
          },
          children: { contract: "input", signature: "Input", options: { name: "nombre" } },
        },
        {
          contract: "field",
          signature: "Field",
          slots: { label: "Descripción" },
          children: { contract: "input", signature: "Textarea", options: { name: "descripcion" } },
        },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            {
              contract: "button",
              signature: "Button.action",
              options: { variant: "primary" },
              children: "Crear proyecto",
            },
            { contract: "button", signature: "Button.action", children: "Cancelar" },
          ],
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Crear proyecto" },
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "success" },
          slots: {
            title: "Proyecto creado",
            actions: {
              contract: "button",
              signature: "Button.navigation",
              options: { href: "/proyectos/atlas", variant: "subtle" },
              children: "Ver el proyecto",
            },
          },
          children: "Atlas quedó disponible para el equipo.",
        },
      ],
    },
  },
};
