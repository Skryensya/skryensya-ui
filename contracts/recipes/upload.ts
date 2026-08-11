import type { Recipe } from "./recipe.js";
import type { UsageTree } from "@skryensya/core/usage-tree";

/**
 * Attaching files, and telling someone when it finished.
 *
 * The reason this screen is worth a recipe is the SUCCESS state, and it is the only one in the set
 * that ends in a Toast rather than a Callout. An upload takes long enough that the person left: they
 * scrolled, they switched tabs, they started writing the next thing. A message that waits quietly on
 * a page nobody is looking at has not told anyone anything, so the confirmation floats and
 * announces itself, which is exactly what a Toast is for and what a Callout is not.
 *
 * The failure does the opposite: it stays, because it needs a decision, and something that needs a
 * decision must not leave on a timer.
 */
export const uploadRecipe: Recipe = {
  id: "upload",
  intent: "Adjuntar archivos y avisar cuando terminó, aunque la persona ya se haya ido a otra cosa.",
  notes: [
    "El éxito es un **Toast** y no un Callout: la subida tarda lo suficiente como para que la persona se haya ido, y un mensaje quieto en una página que nadie mira no le avisó a nadie.",
    "El error es un **Callout** y no un Toast: necesita una decisión, y algo que necesita una decisión no puede irse solo a los cinco segundos.",
    "La barra de progreso lleva nombre. Sin él es una animación: un `progressbar` sin nombre anuncia un número sobre nada.",
    "El dropzone sigue ahí mientras sube y después de fallar: sacarlo obliga a recargar para reintentar.",
  ],

  states: {
    // Nothing chosen yet. This is the screen's resting state, not an absence of data.
    empty: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Documentos de respaldo" },
        dropzone(),
      ],
    },

    loading: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Documentos de respaldo" },
        dropzone(),
        {
          contract: "progress",
          signature: "Progress",
          options: { value: 62, label: "Subiendo contrato.pdf" },
        },
      ],
    },

    error: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "md" },
      children: [
        { contract: "typography", signature: "Heading", children: "Documentos de respaldo" },
        {
          contract: "callout",
          signature: "Callout",
          options: { tone: "danger" },
          slots: {
            title: "No pudimos subir contrato.pdf",
            actions: {
              contract: "button",
              signature: "Button.action",
              options: { variant: "translucent" },
              children: "Reintentar",
            },
          },
          children: "El archivo pesa 24 MB y el máximo son 10 MB.",
        },
        dropzone(),
      ],
    },

    success: {
      contract: "content",
      signature: "ToastRegion",
      children: {
        contract: "content",
        signature: "Toast",
        options: { tone: "success", dismissible: true, dismissLabel: "Descartar el aviso" },
        slots: {
          title: "Se subieron 3 archivos",
          actions: {
            contract: "button",
            signature: "Button.navigation",
            options: { href: "/expedientes/4821" },
            children: "Ver el expediente",
          },
        },
        children: "Ya están adjuntos al expediente.",
      },
    },
  },
};

/** The dropzone, present in every state where retrying is possible, which is all but success. */
function dropzone(): UsageTree {
  return {
    contract: "file-upload",
    signature: "FileUpload",
    options: { name: "adjuntos", multiple: true, accept: ".pdf,.docx" },
    slots: {
      label: "Adjuntá los documentos",
      dropzoneLabel: "Arrastralos acá",
      triggerLabel: "Elegir archivos",
    },
  };
}
