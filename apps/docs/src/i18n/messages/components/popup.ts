export const popupMessages = {
  es: {
    "demo.popup.trigger": "Filtros",
    "demo.popup.onlyActive": "Solo activos",

    "popupPage.description": "Superficie flotante mínima para composiciones que no necesitan chrome de Popover.",
    "popupPage.betaBadge": "Beta",
    "popupPage.anatomyBody":
      "Un Popup es un ancla y una superficie, y el dibujo lo muestra literal: el disparador lleva <code>sk-anchor</code>, y el panel es <strong>un solo nodo</strong> que usa dos clases a la vez, <code>sk-popover__content</code> (lo que pinta la superficie) y <code>sk-anchored</code> (el patrón que la ubica). Por eso hay dos anillos concéntricos sobre la misma caja. Adentro no se nombra nada: qué va ahí es asunto de la composición, que es justamente para lo que existe la signature bare. El espécimen está congelado y abierto a la fuerza; el vivo está arriba.",
    "popupPage.anatomyLabel": "Anatomía de Popup",
    "popupPage.anatomyPreviewLabel": "Popup, parte por parte",
    "popupPage.contractBody": "Popup aporta ancla y superficie, no semántica interna. Si el patrón tiene título y acciones de cierre, usa Popover.",
    "popupPage.a11yBody": "El contenido debe aportar su propia semántica; Popup no inventa roles dialog o menu.",
  },
  en: {
    "demo.popup.trigger": "Filters",
    "demo.popup.onlyActive": "Active only",

    "popupPage.description": "A minimal floating surface for compositions that need none of Popover's chrome.",
    "popupPage.betaBadge": "Beta",
    "popupPage.anatomyBody":
      "A Popup is an anchor and a surface, and the drawing shows exactly that: the trigger carries <code>sk-anchor</code>, and the panel is <strong>one node</strong> wearing two classes at once, <code>sk-popover__content</code> (which paints the surface) and <code>sk-anchored</code> (the pattern that places it). Hence the two concentric rings on one box. Nothing inside is named: what goes there is the composition's business, which is what the bare signature exists for. The specimen is frozen and forced open; the live one is above.",
    "popupPage.anatomyLabel": "Popup anatomy",
    "popupPage.anatomyPreviewLabel": "Popup, part by part",
    "popupPage.contractBody": "Popup provides an anchor and a surface, not internal semantics. If the pattern has a title and closing actions, use Popover.",
    "popupPage.a11yBody": "The content must provide its own semantics; Popup invents no dialog or menu roles.",
  },
} as const;
