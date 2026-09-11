export const inlineMessages = {
  es: {
    "demo.inline.title": "Proyecto Atlas",
    "demo.inline.status": "3 cambios sin publicar",
    "demo.inline.preview": "Vista previa",
    "demo.inline.publish": "Publicar",
    "demo.inline.floorShortTitle": "Plan corto",
    "demo.inline.floorShortBody": "Una línea de pitch.",
    "demo.inline.floorLongTitle": "Plan largo",
    "demo.inline.floorLongBody":
      "Texto de más, para que esta card crezca más que su vecina y la fila de acciones tenga que sentarse en el piso en vez de pegarse a la última línea.",
    "demo.inline.floorSecondary": "Detalles",
    "demo.inline.floorPrimary": "Elegir",

    "inlinePage.description": "Inline, el pattern de layout horizontal y adaptable.",
    "inlinePage.lede":
      "Organiza elementos en horizontal y los devuelve a otra línea cuando el espacio se agota. Úsalo para barras de acciones y pares label–control; la semántica pertenece al elemento que eliges. No hay un <code>ButtonWrapper</code>: esa fila ya es Inline.",
    "inlinePage.previewLabel": "Barra de acciones",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.floorTitle": "Piso de una card",
    "inlinePage.floorBody":
      "Cuando la fila es lo último de una card, <code>blockStart=\"auto\"</code> absorbe la altura que sobra en la columna. Un Box cuya última hija es esa Inline se vuelve una columna flex que llena su celda de Grid, así las acciones de un set de cards se alinean abajo aunque el copy no mida lo mismo.",
    "inlinePage.floorPreviewLabel": "Fila de acciones al piso",
    "inlinePage.floorPreviewNote": "Grid + Box + Inline blockStart auto",
    "inlinePage.whereTitle": "Dónde componerlo",
    "inlinePage.whereBody":
      "Úsalo donde <em>vos</em> autorás los botones: CTAs de un <a href=\"/components/hero\">Hero</a>, pie de una card con <a href=\"/components/box\">Box</a>, un par label–control, el pie de un formulario que no tiene parte propia. No sustituyas la anatomía de <a href=\"/components/empty-state\">EmptyState</a> (<code>__actions</code>), el footer de un <a href=\"/components/dialog\">Dialog</a> ni un <a href=\"/components/toolbar\">Toolbar</a>: esas piezas ya dueñas de su fila.",
    "inlinePage.htmlTitle": "HTML autorado",
    "inlinePage.htmlBody": "Usa <code>sk-inline</code> en el elemento semántico que corresponda. Los atributos describen el espaciado, la alineación vertical, la distribución horizontal, si la fila puede envolver sus hijos y el aire encima (<code>data-block-start</code>).",
    "inlinePage.contractItem1": "<code>as</code> elige el elemento raíz; por defecto es <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; por defecto es <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> acepta <code>start</code>, <code>center</code>, <code>end</code>, <code>baseline</code> o <code>stretch</code>; por defecto es <code>end</code>.",
    "inlinePage.contractItem4": "<code>justify</code> acepta <code>start</code>, <code>center</code>, <code>end</code> o <code>between</code>; en HTML se escribe con <code>data-justify</code>.",
    "inlinePage.contractItem5": '<code>wrap</code> permite envolver los hijos; por defecto es <code>true</code>. Usa <code>data-wrap="false"</code> para una sola fila en HTML.',
    "inlinePage.contractItem6":
      '<code>blockStart</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code> o <code>auto</code>; por defecto es <code>none</code>. En HTML es <code>data-block-start</code>. <code>auto</code> sienta la fila en el piso de una card.',
    "inlinePage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
    "inlinePage.test2": "Omite <code>data-block-start</code> cuando el aire encima es el default <code>none</code>.",
  },
  en: {
    "demo.inline.title": "Project Atlas",
    "demo.inline.status": "3 unpublished changes",
    "demo.inline.preview": "Preview",
    "demo.inline.publish": "Publish",
    "demo.inline.floorShortTitle": "Short plan",
    "demo.inline.floorShortBody": "A one-line pitch.",
    "demo.inline.floorLongTitle": "Longer plan",
    "demo.inline.floorLongBody":
      "Enough copy that this card grows taller than its neighbour, so the action row has to sit on the floor rather than under the last line of text.",
    "demo.inline.floorSecondary": "Details",
    "demo.inline.floorPrimary": "Choose",

    "inlinePage.description": "Inline, the horizontal, wrapping layout pattern.",
    "inlinePage.lede":
      "Lays out elements horizontally and wraps them onto another line once space runs out. Use it for action bars and label–control pairs; the semantics belong to whichever element you choose. There is no <code>ButtonWrapper</code>: that row is already Inline.",
    "inlinePage.previewLabel": "Action bar",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.floorTitle": "Card floor",
    "inlinePage.floorBody":
      "When the row is the last thing in a card, <code>blockStart=\"auto\"</code> absorbs leftover height in the column. A Box whose last child is that Inline becomes a flex column that fills its Grid cell, so a set of cards line their actions up even when the copy does not measure the same.",
    "inlinePage.floorPreviewLabel": "Action row on the floor",
    "inlinePage.floorPreviewNote": "Grid + Box + Inline blockStart auto",
    "inlinePage.whereTitle": "Where to compose it",
    "inlinePage.whereBody":
      "Use it where <em>you</em> author the buttons: a <a href=\"/en/components/hero\">Hero</a> CTA, the footer of a card built with <a href=\"/en/components/box\">Box</a>, a label–control pair, a form footer that has no part of its own. Do not replace <a href=\"/en/components/empty-state\">EmptyState</a>'s <code>__actions</code> part, a <a href=\"/en/components/dialog\">Dialog</a> footer, or a <a href=\"/en/components/toolbar\">Toolbar</a>: those already own their row.",
    "inlinePage.htmlTitle": "Authored HTML",
    "inlinePage.htmlBody": "Use <code>sk-inline</code> on the matching semantic element. The attributes describe spacing, cross-axis alignment, horizontal distribution, whether the row can wrap its children, and the space above it (<code>data-block-start</code>).",
    "inlinePage.contractItem1": "<code>as</code> chooses the root element; the default is <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; the default is <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, <code>baseline</code>, or <code>stretch</code>; the default is <code>end</code>.",
    "inlinePage.contractItem4": "<code>justify</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, or <code>between</code>; in HTML it is written as <code>data-justify</code>.",
    "inlinePage.contractItem5": 'wrap lets children wrap; the default is <code>true</code>. Use <code>data-wrap="false"</code> for a single row in HTML.',
    "inlinePage.contractItem6":
      '<code>blockStart</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, <code>xl</code>, or <code>auto</code>; the default is <code>none</code>. In HTML it is <code>data-block-start</code>. <code>auto</code> sits the row on a card\'s floor.',
    "inlinePage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
    "inlinePage.test2": "Omits <code>data-block-start</code> when the space above is the default <code>none</code>.",
  },
} as const;
