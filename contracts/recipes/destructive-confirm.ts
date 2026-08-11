import type { Recipe } from "./recipe.js";

/**
 * Confirming something that cannot be undone.
 *
 * KNOWN LIMIT, and named rather than hidden: the MODAL form of this (a Dialog that traps focus and
 * makes the rest of the page inert) is not here, because `dialog` has no React binding at all and
 * a family with one binding has nothing to compare. What is published is the INLINE form, which is
 * a real pattern and not a consolation prize: the confirmation appears where the action was, so the
 * thing being deleted is still on screen while you decide.
 *
 * Two decisions the recipe carries. The destructive button is `danger` AND is not the default
 * focus: colour is a warning, not a guard. And the confirming label repeats the object ("Eliminar
 * el proyecto Atlas"), because "Confirmar" read aloud, out of context, names nothing.
 */
export const destructiveConfirmRecipe: Recipe = {
  id: "destructive-confirm",
  intent: "Confirmar una acción que no se puede deshacer, sin sacar de pantalla lo que se va a borrar.",
  notes: [
    "El botón destructivo dice qué destruye: «Confirmar», leído en voz alta y fuera de contexto, no nombra nada.",
    "El color es un aviso, no una barrera: por eso la confirmación es un paso aparte y no sólo un botón rojo.",
    "La forma MODAL de esto no está publicada: `dialog` no tiene binding React, y una familia con un solo binding no tiene qué comparar. Ésta es la forma en línea, que además deja a la vista lo que se va a borrar.",
  ],

  states: {
    // Nothing has been asked yet: the action is available and says what it does.
    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        { contract: "typography", signature: "Heading", children: "Atlas" },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: "12 tareas · 5 personas",
        },
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "danger" },
          children: "Eliminar el proyecto",
        },
      ],
    },

    // Asked. The object is still on screen, and the confirming label names it.
    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        { contract: "typography", signature: "Heading", children: "Atlas" },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary" },
          children: "12 tareas · 5 personas",
        },
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "danger" },
          slots: {
            title: "Esto no se puede deshacer",
            actions: [
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "translucent" },
                children: "Cancelar",
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "danger" },
                children: "Eliminar el proyecto Atlas",
              },
            ],
          },
          children: "Se eliminan las 12 tareas y el historial del proyecto.",
        },
      ],
    },

    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        { contract: "typography", signature: "Heading", children: "Atlas" },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm" },
          children: [
            { contract: "loader", signature: "Loader", options: { size: "sm", label: "Eliminando el proyecto" } },
            { contract: "typography", signature: "Text", options: { tone: "secondary" }, children: "Eliminando…" },
          ],
        },
      ],
    },

    success: {
      contract: "callout",
      signature: "Callout",
      options: { tone: "neutral" },
      slots: {
        title: "Se eliminó Atlas",
        actions: {
          contract: "button",
          signature: "Button.navigation",
          options: { href: "/proyectos", variant: "translucent" },
          children: "Volver a proyectos",
        },
      },
      children: "El proyecto y sus 12 tareas ya no están.",
    },
  },
};
