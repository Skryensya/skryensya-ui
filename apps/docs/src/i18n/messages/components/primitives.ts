export const primitivesMessages = {
  es: {
    "demo.primitives.title": "Resumen",
    "demo.primitives.body": "Un bloque con espaciado, superficie y jerarquía.",
    "demo.primitives.action": "Ver detalles",
    "demo.primitives.updated": "Actualizado hoy",
    "demo.primitives.cell.first": "Uno",
    "demo.primitives.cell.second": "Dos",
    "demo.primitives.cell.third": "Tres",

    "primitivasPage.title": "Primitivas",
    "primitivasPage.description": "Primitivas de layout y tipografía: estructura reutilizable, roles de lectura y adapters React.",
    "primitivasPage.lede":
      "Box, Wrapper, ImageFrame, Stack, Inline y Grid son patterns de layout. Text, Heading y Link expresan el rol de lectura; no reemplazan la semántica: eliges el elemento que corresponde al contenido.",
    "primitivasPage.previewLabel": "Primitivas",
    "primitivasPage.htmlTitle": "HTML autorado",
    "primitivasPage.htmlBody":
      "Importa <code>patterns/layout.css</code> para Box, Wrapper, ImageFrame, Stack, Inline y Grid, y <code>components/typography.css</code> para Text, Heading y Link. No requieren inicialización vanilla.",
    "primitivasPage.contractsTitle": "Contratos",
    "primitivasPage.contractItem1": "<code>Box</code> controla superficie, borde y padding; el consumidor elige <code>as</code>.",
    "primitivasPage.contractItem2": "<code>Wrapper</code> fija el techo de la columna de página en una escala (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>).",
    "primitivasPage.contractItem3": "<code>ImageFrame</code> recorta media a un aspect ratio y controla <code>object-fit</code> / posición.",
    "primitivasPage.contractItem4": "<code>Stack</code>, <code>Inline</code> y <code>Grid</code> tienen gaps nombrados que siguen la dimensión de densidad.",
    "primitivasPage.contractItem5": "<code>Heading</code> separa jerarquía (<code>as</code>) de tamaño visual (<code>size</code>).",
    "primitivasPage.contractItem6": "<code>Link</code> subraya por defecto: no depende solo del color para reconocerse.",
  },
  en: {
    "demo.primitives.title": "Summary",
    "demo.primitives.body": "A block with spacing, surface and hierarchy.",
    "demo.primitives.action": "See details",
    "demo.primitives.updated": "Updated today",
    "demo.primitives.cell.first": "One",
    "demo.primitives.cell.second": "Two",
    "demo.primitives.cell.third": "Three",

    "primitivasPage.title": "Primitives",
    "primitivasPage.description": "Layout and typography primitives: reusable structure, reading roles, and React adapters.",
    "primitivasPage.lede":
      "Box, Wrapper, ImageFrame, Stack, Inline, and Grid are layout patterns. Text, Heading, and Link express the reading role; they do not replace semantics: you choose the element that matches the content.",
    "primitivasPage.previewLabel": "Primitives",
    "primitivasPage.htmlTitle": "Authored HTML",
    "primitivasPage.htmlBody":
      "Import <code>patterns/layout.css</code> for Box, Wrapper, ImageFrame, Stack, Inline, and Grid, and <code>components/typography.css</code> for Text, Heading, and Link. None need vanilla initialization.",
    "primitivasPage.contractsTitle": "Contracts",
    "primitivasPage.contractItem1": "<code>Box</code> controls surface, border, and padding; the consumer chooses <code>as</code>.",
    "primitivasPage.contractItem2": "<code>Wrapper</code> sets the page column's ceiling to a scale (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>).",
    "primitivasPage.contractItem3": "<code>ImageFrame</code> crops media to an aspect ratio and controls <code>object-fit</code> / position.",
    "primitivasPage.contractItem4": "<code>Stack</code>, <code>Inline</code>, and <code>Grid</code> have named gaps that follow the density dimension.",
    "primitivasPage.contractItem5": "<code>Heading</code> separates hierarchy (<code>as</code>) from visual size (<code>size</code>).",
    "primitivasPage.contractItem6": "<code>Link</code> underlines by default: it does not rely on color alone to be recognized.",
  },
} as const;
