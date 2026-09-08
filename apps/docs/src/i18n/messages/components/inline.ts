export const inlineMessages = {
  es: {
    "demo.inline.title": "Proyecto Atlas",
    "demo.inline.status": "3 cambios sin publicar",
    "demo.inline.preview": "Vista previa",
    "demo.inline.publish": "Publicar",

    "inlinePage.description": "Inline, el pattern de layout horizontal y adaptable.",
    "inlinePage.lede":
      "Organiza elementos en horizontal y los devuelve a otra línea cuando el espacio se agota. Úsalo para barras de acciones y pares label–control; la semántica pertenece al elemento que eliges.",
    "inlinePage.previewLabel": "Barra de acciones",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.htmlTitle": "HTML autorado",
    "inlinePage.htmlBody": "Usa <code>sk-inline</code> en el elemento semántico que corresponda. Los atributos describen el espaciado, la alineación vertical, la distribución horizontal y si la fila puede envolver sus hijos.",
    "inlinePage.contractItem1": "<code>as</code> elige el elemento raíz; por defecto es <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; por defecto es <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> acepta <code>start</code>, <code>center</code>, <code>end</code> o <code>baseline</code>; por defecto es <code>center</code>.",
    "inlinePage.contractItem4": "<code>justify</code> acepta <code>start</code>, <code>center</code>, <code>end</code> o <code>between</code>; en HTML se escribe con <code>data-justify</code>.",
    "inlinePage.contractItem5": '<code>wrap</code> permite envolver los hijos; por defecto es <code>true</code>. Usa <code>data-wrap="false"</code> para una sola fila en HTML.',
    "inlinePage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
  },
  en: {
    "demo.inline.title": "Project Atlas",
    "demo.inline.status": "3 unpublished changes",
    "demo.inline.preview": "Preview",
    "demo.inline.publish": "Publish",

    "inlinePage.description": "Inline, the horizontal, wrapping layout pattern.",
    "inlinePage.lede":
      "Lays out elements horizontally and wraps them onto another line once space runs out. Use it for action bars and label–control pairs; the semantics belong to whichever element you choose.",
    "inlinePage.previewLabel": "Action bar",
    "inlinePage.previewNote": "Box + Stack + Inline + Button",
    "inlinePage.htmlTitle": "Authored HTML",
    "inlinePage.htmlBody": "Use <code>sk-inline</code> on the matching semantic element. The attributes describe spacing, cross-axis alignment, horizontal distribution, and whether the row can wrap its children.",
    "inlinePage.contractItem1": "<code>as</code> chooses the root element; the default is <code>div</code>.",
    "inlinePage.contractItem2": "<code>gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; the default is <code>md</code>.",
    "inlinePage.contractItem3": "<code>align</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, or <code>baseline</code>; the default is <code>center</code>.",
    "inlinePage.contractItem4": "<code>justify</code> accepts <code>start</code>, <code>center</code>, <code>end</code>, or <code>between</code>; in HTML it is written as <code>data-justify</code>.",
    "inlinePage.contractItem5": 'wrap lets children wrap; the default is <code>true</code>. Use <code>data-wrap="false"</code> for a single row in HTML.',
    "inlinePage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
  },
} as const;
