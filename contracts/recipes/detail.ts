import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * The record page: who this is, and several views of the same subject.
 *
 * The identity (the avatar, the name, the status badge) sits OUTSIDE the tabs, and that is the
 * decision. Tabs are alternative views of one space; whatever identifies the record is true in every
 * view, so putting it inside means repeating it three times or losing it on two of them.
 *
 * Which is also the test for whether Tabs is the right component at all: if the sections do not
 * describe the same subject, they are not views of one space and the page wants headings, not tabs.
 */
export const detailRecipe: Recipe = {
  id: "detail",
  intent: "La ficha de un registro: la identidad arriba, y varias vistas del mismo asunto abajo.",
  notes: [
    "La identidad va **fuera** de las tabs: son vistas alternativas de un mismo espacio, y lo que identifica al registro es verdad en todas; adentro habría que repetirlo o perderlo.",
    "Si las secciones no describen el mismo asunto, no son vistas de un espacio: esa página quiere encabezados, no tabs.",
    "El Badge es de sólo lectura y dice el estado; si se pudiera quitar sería un Tag. La diferencia se nota al leerla en voz alta, no al mirarla.",
    "El error no se lleva la identidad puesta: falló una vista, no el registro.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        identity(),
        { contract: "loader", signature: "Loader", options: { size: "lg", label: "Cargando la actividad" } },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        identity(),
        {
          contract: "tabs",
          signature: "Tabs",
          options: { value: "actividad" },
          attrs: { "aria-label": "Vistas del proyecto" },
          slots: {
            items: [
              {
                options: { value: "actividad" },
                slots: {
                  label: "Actividad",
                  children: "Todavía no pasó nada en este proyecto.",
                },
              },
              { options: { value: "personas" }, slots: { label: "Personas", children: "Sólo vos, por ahora." } },
            ],
          },
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        identity(),
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "danger" },
          slots: {
            title: "No pudimos cargar la actividad",
            actions: {
              contract: "button",
              signature: "Button.action",
              options: { variant: "subtle" },
              children: "Reintentar",
            },
          },
          children: "El resto de la ficha sigue disponible.",
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        identity(),
        {
          contract: "tabs",
          signature: "Tabs",
          options: { value: "actividad" },
          attrs: { "aria-label": "Vistas del proyecto" },
          slots: {
            items: [
              {
                options: { value: "actividad" },
                slots: {
                  label: "Actividad",
                  children: {
                    contract: "process-list",
                    signature: "ProcessList",
                    children: [
                      {
                        contract: "process-list",
                        signature: "ProcessListItem",
                        slots: { title: "Se aprobó el diseño" },
                        children: "Hace dos días, por Grace Hopper.",
                      },
                      {
                        contract: "process-list",
                        signature: "ProcessListItem",
                        slots: { title: "Se creó el proyecto" },
                        children: "La semana pasada, por Ada Lovelace.",
                      },
                    ],
                  },
                },
              },
              {
                options: { value: "personas" },
                slots: {
                  label: "Personas",
                  children: {
                    contract: "list",
                    signature: "List",
                    children: [
                      {
                        contract: "list",
                        signature: "ListItem",
                        slots: {
                          leading: {
                            contract: "avatar",
                            signature: "Avatar.initials",
                            options: { name: "Ada Lovelace" },
                            children: "AL",
                          },
                          title: "Ada Lovelace",
                          description: "Diseño",
                        },
                      },
                      {
                        contract: "list",
                        signature: "ListItem",
                        slots: {
                          leading: {
                            contract: "avatar",
                            signature: "Avatar.initials",
                            options: { name: "Grace Hopper" },
                            children: "GH",
                          },
                          title: "Grace Hopper",
                          description: "Ingeniería",
                        },
                      },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
};

/** Who this record is. True in every view, so it never goes inside the tabs. */
function identity(): UsageTree {
  return {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm", wrap: false },
    children: [
      {
        contract: "avatar",
        signature: "Avatar.initials",
        options: { name: "Proyecto Atlas", size: "lg" },
        children: "AT",
      },
      { contract: "typography", signature: "Heading", children: "Atlas" },
      { contract: "badge", signature: "Badge", options: { tone: "success" }, children: "Activo" },
    ],
  };
}
