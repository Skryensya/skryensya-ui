export const boxMessages = {
  es: {
    "demo.box.title": "Resumen",
    "demo.box.body": "Una sección semántica con superficie, borde y padding.",
    "demo.box.action": "Administrar",

    "demo.box.surface.sunken.title": "Hundida",
    "demo.box.surface.sunken.body": "Un escalón por debajo de la página. Para un área que recibe contenido: una lista embebida, un panel de resultados.",
    "demo.box.surface.surface.title": "Superficie",
    "demo.box.surface.surface.body": "El valor por defecto, al mismo nivel que la página que la contiene.",
    "demo.box.surface.raised.title": "Elevada",
    "demo.box.surface.raised.body": "Un escalón por encima. Para algo que se lee como apoyado sobre el contenido que lo rodea.",

    "demo.box.controls.title": "Notificaciones",
    "demo.box.controls.body": "Tres controles independientes sobre una misma superficie: ninguno de ellos la posee.",
    "demo.box.controls.primary": "Guardar cambios",
    "demo.box.controls.secondary": "Descartar",
    "demo.box.controls.switch": "Avisarme por correo",

    "box.description": "Superficie visual y semántica elegida por quien la usa; sin interacción propia.",
    "demo.layoutAnatomy.cellA": "Uno",
    "demo.layoutAnatomy.cellB": "Dos",
    "demo.layoutAnatomy.cellC": "Tres",
    "demo.layoutAnatomy.narrow": "data-width=\"narrow\"",
    "demo.layoutAnatomy.breakout": "data-width=\"breakout\"",
    "box.anatomyBody":
      "Un Box es un solo elemento con una sola clase, así que el dibujo no nombra partes: nombra el <strong>espacio</strong>. La franja entre el anillo de afuera y el de adentro es <code>data-padding</code>, dibujado al valor que pidió el espécimen. La etiqueta de adentro dice <code>sk-box &gt; *</code> porque eso es lo que hay: los hijos de un layout no llevan clase, ni atributo, ni requisito más allá de ser elementos.",
    "box.anatomyLabel": "Anatomía de Box",
    "box.anatomyPreviewLabel": "Box, parte por parte",
    "box.lede":
      "Box sólo posee superficie, borde y padding. Quien lo usa elige el elemento semántico. No aporta interacción ni convierte el contenido en un destino o acción.",
    "box.whenTitle": "Cuándo usarlo",
    "box.whenBody1":
      'Usa Box para contenido estático o para una superficie con varios controles independientes. Si toda la superficie representa exactamente una interacción, elige el componente semántico correspondiente: <a href="/components/link">Link</a>, <a href="/components/button">Button</a>, <a href="/components/checkbox">Checkbox</a>, <a href="/components/radio-group">RadioGroup</a> o <a href="/components/accordion">Accordion</a>.',
    "box.whenBody2":
      'Box y Tile comparten superficie, borde, radio y el vocabulario de <code>padding</code>. Usa <code>data-padding="none"</code> en HTML o <code>padding="none"</code> en React cuando el header o la imagen del contenido deban tocar el borde; ese hijo es quien declara su propio inset. La diferencia entre ambos es exclusivamente la interacción que Tile sí posee.',
    "box.whenBody3":
      'La guía <a href="/components/card">Card</a> aplica esta decisión a cards de contenido, noticia, producto, enlace, acción, selección y métricas.',
    "box.htmlTitle": "HTML escrito a mano",
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

    "demo.box.surface.sunken.title": "Sunken",
    "demo.box.surface.sunken.body": "One step below the page. For an area that receives content: an embedded list, a results panel.",
    "demo.box.surface.surface.title": "Surface",
    "demo.box.surface.surface.body": "The default, level with the page that holds it.",
    "demo.box.surface.raised.title": "Raised",
    "demo.box.surface.raised.body": "One step above. For something that reads as resting on the content around it.",

    "demo.box.controls.title": "Notifications",
    "demo.box.controls.body": "Three independent controls on one surface: none of them owns it.",
    "demo.box.controls.primary": "Save changes",
    "demo.box.controls.secondary": "Discard",
    "demo.box.controls.switch": "Email me",

    "box.description": "Visual and semantic surface chosen by whoever uses it; no interaction of its own.",
    "demo.layoutAnatomy.cellA": "One",
    "demo.layoutAnatomy.cellB": "Two",
    "demo.layoutAnatomy.cellC": "Three",
    "demo.layoutAnatomy.narrow": "data-width=\"narrow\"",
    "demo.layoutAnatomy.breakout": "data-width=\"breakout\"",
    "box.anatomyBody":
      "A Box is one element with one class, so the drawing names no parts: it names the <strong>space</strong>. The band between the outer ring and the inner one is <code>data-padding</code>, drawn at whatever value the specimen asked for. The inner label reads <code>sk-box &gt; *</code> because that is what is there: a layout’s children carry no class, no attribute, and no requirement beyond being elements.",
    "box.anatomyLabel": "Box anatomy",
    "box.anatomyPreviewLabel": "Box, part by part",
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
