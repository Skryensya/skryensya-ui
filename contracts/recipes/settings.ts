import type { Recipe } from "./recipe.js";

/**
 * A settings screen: preferences that apply as soon as they are touched.
 *
 * Every control here is a Switch and not a Checkbox, and that is the decision the recipe exists to
 * carry: a switch says "this is on now", a checkbox says "this will be true when you submit". A
 * settings page with checkboxes and no save button is a promise it does not keep.
 *
 * The tiles are surfaces because each preference needs a sentence explaining it — a bare label in a
 * list has nowhere to put the reason.
 */
export const settingsRecipe: Recipe = {
  id: "settings",
  intent: "Preferencias que se aplican al tocarlas, cada una con su explicación.",
  notes: [
    "Switch y no Checkbox: un switch dice «esto está prendido ahora», un checkbox dice «esto va a ser verdad cuando envíes». Una pantalla de preferencias sin botón de guardar y con checkboxes es una promesa que no cumple.",
    "Cada preferencia es una superficie porque necesita una frase que la explique; un rótulo suelto en una lista no tiene dónde poner el motivo.",
    "El error no reemplaza la pantalla: las otras preferencias siguen funcionando, así que sigue siendo la misma lista con un aviso arriba.",
  ],

  states: {
    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Notificaciones" },
        { contract: "loader", signature: "Loader", options: { size: "lg", label: "Cargando tus preferencias" } },
      ],
    },

    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Notificaciones" },
        {
          contract: "empty-state",
          signature: "EmptyState",
          slots: {
            title: "No hay nada que configurar todavía",
            description: "Cuando te sumes a un proyecto vas a poder elegir cómo te avisamos.",
            actions: {
              contract: "button",
              signature: "Button.navigation",
              options: { href: "/proyectos", variant: "primary" },
              children: "Ver proyectos",
            },
          },
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Notificaciones" },
        {
          contract: "alert",
          signature: "Alert",
          options: { tone: "danger" },
          slots: {
            title: "No pudimos guardar el cambio",
            actions: { contract: "button", signature: "Button.action", children: "Reintentar" },
          },
          children: "El resumen semanal quedó como estaba.",
        },
        {
          contract: "tile",
          signature: "TileSwitch",
          options: { name: "resumen", value: "semanal", padding: "md" },
          children: "Resumen semanal por correo",
        },
        {
          contract: "tile",
          signature: "TileSwitch",
          options: { name: "menciones", value: "todas", padding: "md" },
          children: "Avisarme cuando me mencionen",
        },
      ],
    },

    success: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Notificaciones" },
        {
          contract: "tile",
          signature: "TileSwitch",
          options: { name: "resumen", value: "semanal", padding: "md" },
          children: "Resumen semanal por correo",
        },
        {
          contract: "tile",
          signature: "TileSwitch",
          options: { name: "menciones", value: "todas", padding: "md" },
          children: "Avisarme cuando me mencionen",
        },
        {
          contract: "accordion",
          signature: "Accordion",
          children: {
            contract: "accordion",
            signature: "Accordion.Item",
            options: { value: "avanzado" },
            children: [
              { contract: "accordion", signature: "Accordion.Trigger", children: "Opciones avanzadas" },
              {
                contract: "accordion",
                signature: "Accordion.Content",
                children: {
                  contract: "tile",
                  signature: "TileSwitch",
                  options: { name: "digest", value: "diario", padding: "md" },
                  children: "Agrupar los avisos en un solo correo diario",
                },
              },
            ],
          },
        },
      ],
    },
  },
};
