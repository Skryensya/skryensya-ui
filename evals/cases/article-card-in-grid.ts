import type { EvalCase } from "../case.js";

export const articleCardInGridCase: EvalCase = {
  id: "article-card-in-grid",
  prompt: {
    es:
      "Una sola card de artículo (no varias) con imagen de ejemplo (de un servicio de placeholder " +
      "como picsum.photos), título, bajada, y un enlace de texto 'Ver artículo' al final del " +
      "contenido — la card en sí NO debe ser el enlace, el enlace es un elemento propio al pie — " +
      "dentro de una cuadrícula visual de tres columnas (no hace falta navegación por teclado entre " +
      "tarjetas) donde ocupa un tercio del ancho.",
    en:
      "A single article card (not several) with a sample image (from a placeholder service like " +
      "picsum.photos), title, lead text, and a 'View article' text link at the end of the content " +
      "— the card itself should NOT be the link, the link is its own element at the bottom — " +
      "inside a three-column visual grid (no keyboard navigation between cards needed) where it " +
      "takes up one third of the width.",
  },
  notes: [
    "Amplitud, y un chequeo de juicio deliberado: no hay una firma `Card` publicada — `card` no " +
      "aparece en el índice del catálogo (los demos de la página Card en apps/docs son composición " +
      "local, no un contrato). Un agente que busca 'card' y se detiene ahí falla; uno que compone " +
      "Box (superficie con borde) + ImageFrame (la imagen, con radius:top para que sólo las esquinas " +
      "superiores redondeen) + un Box interior con padding (el texto no puede compartir el padding " +
      "del Box exterior porque eso también le pondría margen a la imagen) + Stack (Heading, Text, " +
      "Link) resuelve el mismo intent con las piezas que sí existen. `columns: \"3\"` en el Grid " +
      "exterior es lo que hace que la card ocupe un tercio del ancho.",
    "Encontrado en vivo, corriendo este caso con Haiku antes de esta redacción: `DataGrid` (patrón " +
      "WAI de navegación 2D por teclado, `contracts/semantic/data-grid.yaml`) y `layout.Grid` (CSS " +
      "grid puramente visual) comparten literalmente la frase 'grilla de tarjetas' en sus propios " +
      "`useWhen`, y `DataGrid` no tiene ninguna opción `gap` (`--sk-data-grid-cell-gap: 0` a " +
      "propósito, pensado para celdas contiguas tipo tabla). Un agente que elige DataGrid para una " +
      "grilla de cards sin necesidad de navegación por flechas obtiene una composición VÁLIDA que " +
      "pasa G0-G3 pero se ve mal (sin gap) y no es lo que el pedido pide. El prompt ahora nombra " +
      "explícitamente que no hace falta navegación por teclado, citando la propia frase del " +
      "`avoidWhen` de DataGrid, para que un agente que lea el catálogo completo tenga la señal que " +
      "el propio catálogo ya da pero que la superposición de useWhen no deja ver.",
    "Un segundo intento (mismo prompt, sin la aclaración de abajo) compuso `TileLink` envolviendo " +
      "toda la card en un solo `<a>` — válido (`TileLink`'s intent incluye 'card-that-goes-somewhere'," +
      " un patrón real), pero no lo que el prompt pedía: un enlace de texto visible al final de la " +
      "card, no la card entera como enlace. La ambigüedad era del prompt ('un enlace para ver el " +
      "artículo' admite las dos lecturas), no del modelo. El prompt ahora dice explícitamente que la " +
      "card NO debe ser el enlace.",
  ],
  tree: {
    contract: "layout",
    signature: "Grid",
    options: { columns: "3", gap: "md" },
    children: [
      {
        contract: "box",
        signature: "Box",
        options: { padding: "none", surface: "surface", border: "subtle" },
        children: [
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: {
              src: "https://picsum.photos/seed/article/600/360",
              alt: "Frosted mountain ridge at sunrise",
              aspect: "3/2",
              radius: "top",
            },
          },
          {
            contract: "box",
            signature: "Box",
            options: { padding: "md" },
            children: [
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "sm" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "h3", flush: true },
                    children: "How density scopes work",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary" },
                    children:
                      "A short lead paragraph explaining what the article covers, in one or two lines.",
                  },
                  {
                    contract: "typography",
                    signature: "Link",
                    options: { href: "/articles/density-scopes" },
                    children: "View article",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
