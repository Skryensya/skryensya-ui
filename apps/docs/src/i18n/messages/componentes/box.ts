export const boxMessages = {
  es: {
    "demo.box.title": "Resumen",
    "demo.box.body": "Una sección semántica con superficie, borde y padding.",
    "demo.box.action": "Administrar",

    "box.description": "Superficie visual y semántica elegida por quien la usa; sin interacción propia.",
    "box.lede":
      "Box sólo posee superficie, borde y padding. Quien lo usa elige el elemento semántico. No aporta interacción ni convierte el contenido en un destino o acción.",
    "box.whenTitle": "Cuándo usarlo",
    "box.whenBody1":
      'Usa Box para contenido estático o para una superficie con varios controles independientes. Si toda la superficie representa exactamente una interacción, elige el componente semántico correspondiente: <a href="/componentes/link">Link</a>, <a href="/componentes/button">Button</a>, <a href="/componentes/checkbox">Checkbox</a>, <a href="/componentes/radio-group">RadioGroup</a> o <a href="/componentes/accordion">Accordion</a>.',
    "box.whenBody2":
      'Box y Tile comparten superficie, borde, radio y el vocabulario de <code>padding</code>. Usa <code>data-padding="none"</code> en HTML o <code>padding="none"</code> en React cuando el header o la imagen del contenido deban tocar el borde; ese hijo es quien declara su propio inset. La diferencia entre ambos es exclusivamente la interacción que Tile sí posee.',
    "box.whenBody3":
      'La guía <a href="/componentes/card">Card</a> aplica esta decisión a cards de contenido, noticia, producto, enlace, acción, selección y métricas.',
    "box.htmlTitle": "HTML autorado",
    "box.contractItem1": 'En HTML, elige el elemento semántico y añade la clase <code>sk-box</code>.',
    "box.contractItem2":
      '<code>data-surface</code> acepta <code>none</code>, <code>sunken</code>, <code>surface</code> o <code>raised</code>.',
    "box.contractItem3": '<code>data-border</code> acepta <code>none</code>, <code>subtle</code> o <code>default</code>.',
    "box.contractItem4":
      '<code>data-padding</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>.',
    "box.contractItem5": 'En React, <code>as</code> selecciona el elemento; <code>surface</code>, <code>border</code> y <code>padding</code> renderizan esos atributos.',
    "box.test1": "Conserva la propiedad semántica del elemento que le da el consumidor al aplicar los valores por defecto de Box.",
  },
  en: {
    "demo.box.title": "Summary",
    "demo.box.body": "A semantic section with surface, border and padding.",
    "demo.box.action": "Manage",

    "box.description": "Visual and semantic surface chosen by whoever uses it; no interaction of its own.",
    "box.lede":
      "Box only owns surface, border and padding. Whoever uses it chooses the semantic element. It adds no interaction and does not turn the content into a destination or an action.",
    "box.whenTitle": "When to use it",
    "box.whenBody1":
      'Use Box for static content or for a surface with several independent controls. If the whole surface represents exactly one interaction, choose the matching semantic component instead: <a href="/en/components/link">Link</a>, <a href="/en/components/button">Button</a>, <a href="/en/components/checkbox">Checkbox</a>, <a href="/en/components/radio-group">RadioGroup</a> or <a href="/en/components/accordion">Accordion</a>.',
    "box.whenBody2":
      'Box and Tile share surface, border, radius and the <code>padding</code> vocabulary. Use <code>data-padding="none"</code> in HTML or <code>padding="none"</code> in React when a header or the content\'s image needs to touch the border; that child is the one declaring its own inset. The only difference between the two is the interaction Tile owns and Box does not.',
    "box.whenBody3":
      'The <a href="/en/components/card">Card</a> guide applies this decision to content, news, product, link, action, selection and metric cards.',
    "box.htmlTitle": "Authored HTML",
    "box.contractItem1": 'In HTML, pick the semantic element and add the <code>sk-box</code> class.',
    "box.contractItem2":
      '<code>data-surface</code> accepts <code>none</code>, <code>sunken</code>, <code>surface</code> or <code>raised</code>.',
    "box.contractItem3": '<code>data-border</code> accepts <code>none</code>, <code>subtle</code> or <code>default</code>.',
    "box.contractItem4":
      '<code>data-padding</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> or <code>xl</code>.',
    "box.contractItem5":
      'In React, <code>as</code> selects the element; <code>surface</code>, <code>border</code> and <code>padding</code> render those attributes.',
    "box.test1": "Keeps semantic ownership with the caller while applying Box defaults.",
  },
} as const;
