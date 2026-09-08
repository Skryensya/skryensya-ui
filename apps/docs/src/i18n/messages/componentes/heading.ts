export const headingMessages = {
  es: {
    "demo.heading.sample": "La plataforma está lista",
    "demo.heading.label.h4Floor": "h4 · 18 · piso (también h5 y h6)",
    "demo.heading.label.h5Same": "h5 · mismo que h4",
    "demo.heading.label.h6Same": "h6 · mismo que h4",
    "demo.heading.page.eyebrow": "OPERACIONES · MAYO 2026",
    "demo.heading.page.title":
      "La plataforma está lista para el próximo despliegue",
    "demo.heading.page.lede":
      "Un título de página comunica el resultado antes de que la persona lea los detalles.",
    "demo.heading.outline.title": "Estado del despliegue",
    "demo.heading.outline.ready": "Regiones listas",
    "demo.heading.outline.readyBody":
      "Frankfurt y São Paulo ya reciben tráfico.",
    "demo.heading.outline.next": "Siguiente verificación",
    "demo.heading.outline.nextBody":
      "Revisa la latencia después del cambio de tráfico.",
    "demo.heading.compact.title": "Uso del almacenamiento",
    "demo.heading.compact.body":
      "El nivel semántico sigue siendo h2 aunque el panel necesita el piso visual (h4).",
    "demo.heading.flush": "Título sin margen propio",

    "heading.description": "Heading: jerarquía semántica y tamaño visual independientes.",
    "heading.lede":
      "Heading separa la jerarquía del documento de su apariencia. Elige <code>as</code> según el nivel semántico y <code>size</code> según el tamaño que necesita el contexto visual.",
    "heading.sizesTitle": "Tamaños",
    "heading.sizesBody":
      "Tres displays encima de la escala de documento. En el documento, <code>h1</code>–<code>h4</code> bajan de tamaño; <code>h5</code> y <code>h6</code> comparten el piso de <code>h4</code> (18px).",
    "heading.displayTitle": "Display",
    "heading.displayLabel": "Escala display",
    "heading.documentTitle": "Documento",
    "heading.documentLabel": "Escala h1–h6",
    "heading.pageTitleTitle": "Título de página",
    "heading.pageTitleBody": "El único <code>h1</code> presenta la página; un display aporta presencia sin inventar otra semántica.",
    "heading.pageTitleLabel": "Título de página",
    "heading.outlineTitle": "Jerarquía de secciones",
    "heading.outlineBody": "La estructura avanza de <code>h2</code> a <code>h3</code>; el tamaño visual puede acompañar el nivel.",
    "heading.outlineLabel": "Jerarquía de contenido",
    "heading.compactTitle": "Jerarquía compacta",
    "heading.compactBody": "Un heading conserva su lugar en el documento aunque el contexto visual use el piso <code>h4</code>.",
    "heading.compactLabel": "Heading compacto",
    "heading.flushTitle": "Flush",
    "heading.flushBody":
      "<code>data-flush</code> (React: <code>flush</code>) quita el aire de block, arriba y abajo. Es opt-in explícito: úsalo cuando el heading es lo primero (o lo último) del contenedor (título de dialog con <code>sk-dialog__title</code>, cabecera de card) y no quieres que el margen o el padding lo empujen contra el borde. No se infiere de <code>:first-child</code>.",
    "heading.flushLabel": "Heading flush",
    "heading.contractItem1":
      "<code>data-size</code> acepta <code>display-lg</code>, <code>display-md</code>, <code>display-sm</code>, <code>h1</code>, <code>h2</code>, <code>h3</code>, <code>h4</code>, <code>h5</code> y <code>h6</code>. <code>h5</code>/<code>h6</code> pintan igual que <code>h4</code>.",
    "heading.contractItem2": "Aliases legados: <code>sm</code>→<code>h3</code>, <code>md</code>→<code>h2</code>, <code>lg</code>→<code>h1</code>, <code>display</code>→<code>display-sm</code>.",
    "heading.contractItem3": "En HTML, usa <code>h1</code>–<code>h6</code> para la jerarquía del documento; <code>data-size</code> no la modifica.",
    "heading.contractItem4": "En React, <code>as</code> acepta <code>h1</code>–<code>h6</code> (default <code>h2</code>); <code>size</code> por defecto es <code>h2</code>.",
    "heading.contractItem5": "<code>data-flush</code> / React <code>flush</code>: sin margen ni padding de block (arriba y abajo). Explícito; no automático.",
    "heading.contractItem6": "No requiere inicialización vanilla.",
    "heading.test1": "Separa la jerarquía del encabezado de su tamaño visual.",
    "heading.test2": "El flush se activa con un atributo explícito, no por posición.",
    "heading.test3": "El tamaño visual de h5 y h6 tiene un piso en h4.",
  },
  en: {
    "demo.heading.sample": "The platform is ready",
    "demo.heading.label.h4Floor": "h4 · 18 · floor (also h5 and h6)",
    "demo.heading.label.h5Same": "h5 · same as h4",
    "demo.heading.label.h6Same": "h6 · same as h4",
    "demo.heading.page.eyebrow": "OPERATIONS · MAY 2026",
    "demo.heading.page.title": "The platform is ready for the next deployment",
    "demo.heading.page.lede":
      "A page title communicates the result before the person reads the details.",
    "demo.heading.outline.title": "Deployment status",
    "demo.heading.outline.ready": "Regions ready",
    "demo.heading.outline.readyBody":
      "Frankfurt and São Paulo already receive traffic.",
    "demo.heading.outline.next": "Next verification",
    "demo.heading.outline.nextBody": "Check latency after the traffic change.",
    "demo.heading.compact.title": "Storage usage",
    "demo.heading.compact.body":
      "The semantic level is still h2 although the panel needs the visual floor (h4).",
    "demo.heading.flush": "Heading without its own margin",

    "heading.description": "Heading: semantic hierarchy and visual size, independent of each other.",
    "heading.lede":
      "Heading separates the document's hierarchy from its appearance. Choose <code>as</code> for the semantic level and <code>size</code> for whatever size the visual context needs.",
    "heading.sizesTitle": "Sizes",
    "heading.sizesBody":
      "Three displays sit above the document scale. In the document, <code>h1</code>–<code>h4</code> step down in size; <code>h5</code> and <code>h6</code> share <code>h4</code>'s floor (18px).",
    "heading.displayTitle": "Display",
    "heading.displayLabel": "Display scale",
    "heading.documentTitle": "Document",
    "heading.documentLabel": "h1–h6 scale",
    "heading.pageTitleTitle": "Page title",
    "heading.pageTitleBody": "The one <code>h1</code> presents the page; a display size adds presence without inventing another semantic level.",
    "heading.pageTitleLabel": "Page title",
    "heading.outlineTitle": "Section hierarchy",
    "heading.outlineBody": "The structure moves from <code>h2</code> to <code>h3</code>; the visual size can follow the level.",
    "heading.outlineLabel": "Content hierarchy",
    "heading.compactTitle": "Compact hierarchy",
    "heading.compactBody": "A heading keeps its place in the document even when the visual context uses the <code>h4</code> floor.",
    "heading.compactLabel": "Compact heading",
    "heading.flushTitle": "Flush",
    "heading.flushBody":
      "<code>data-flush</code> (React: <code>flush</code>) strips block space, top and bottom. It is explicit opt-in: use it when the heading is the first (or last) thing in its container (a dialog title with <code>sk-dialog__title</code>, a card header) and you do not want the margin or padding pushing it away from the edge. It is never inferred from <code>:first-child</code>.",
    "heading.flushLabel": "Flush heading",
    "heading.contractItem1":
      "<code>data-size</code> accepts <code>display-lg</code>, <code>display-md</code>, <code>display-sm</code>, <code>h1</code>, <code>h2</code>, <code>h3</code>, <code>h4</code>, <code>h5</code>, and <code>h6</code>. <code>h5</code>/<code>h6</code> paint the same as <code>h4</code>.",
    "heading.contractItem2": "Legacy aliases: <code>sm</code>→<code>h3</code>, <code>md</code>→<code>h2</code>, <code>lg</code>→<code>h1</code>, <code>display</code>→<code>display-sm</code>.",
    "heading.contractItem3": "In HTML, use <code>h1</code>–<code>h6</code> for the document hierarchy; <code>data-size</code> does not change it.",
    "heading.contractItem4": "In React, <code>as</code> accepts <code>h1</code>–<code>h6</code> (default <code>h2</code>); <code>size</code> defaults to <code>h2</code>.",
    "heading.contractItem5": "<code>data-flush</code> / React <code>flush</code>: no block margin or padding (top and bottom). Explicit; never automatic.",
    "heading.contractItem6": "Needs no vanilla initialization.",
    "heading.test1": "Separates heading hierarchy from its visual size.",
    "heading.test2": "Opts into flush with an explicit attribute, not by position.",
    "heading.test3": "Floors h5 and h6 visual size at h4.",
  },
} as const;
