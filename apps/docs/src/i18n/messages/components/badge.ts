export const badgeMessages = {
  es: {
    "demo.badge.settings": "Configuración",
    "demo.badge.unread": "Novedades sin leer",
    "demo.badge.anatomyTag": "En revisión",
    "demo.badge.online": "En línea",

    "badge.description": "Badge: etiqueta estática con tonos semánticos, styling hooks y componente React.",
    "badge.lede":
      "Badge es una etiqueta visual estática para estados, categorías o metadatos cortos. No comunica selección, contador ni navegación por sí sola; esa semántica pertenece al contenido o al contenedor.",
    "badge.anatomyBody":
      "<code>sk-badge</code> es una sola clase con dos formas, así que el dibujo trae las dos: un dot pulsante en la esquina de su holder y una etiqueta con texto suelta en el flujo. La etiqueta señala a las dos, porque el nombre cubre a las dos; <code>sk-badge-holder</code> es singular y su única guía dice cuál de los dos espécimenes lo tiene. Están congelados; los tonos y el pulse vivos empiezan abajo.",
    "badge.anatomyLabel": "Anatomía de Badge",
    "badge.anatomyPreviewLabel": "Badge, parte por parte",
    "badge.tagTitle": "Etiqueta",
    "badge.tagBody":
      "La forma con texto: un estado, una categoría o un metadato corto. Cada tono lleva un borde de su propio color, así el neutral, cuyo fondo es el lienzo, no queda como un rectángulo invisible.",
    "badge.tagLabel": "Badge",
    "badge.smallTitle": "Tamaño sm",
    "badge.smallBody":
      'El tamaño <code>sm</code> conserva la cápsula de texto pero baja su altura para metadatos compactos, como un contador al final de una fila de navegación.',
    "badge.smallLabel": "Badge sm",
    "badge.dotTitle": "Dot",
    "badge.dotBody":
      "Un badge que es <strong>sólo un punto</strong>: sin texto, comunica por color y posición. Suelto es una luz de estado; su relleno es un tono saturado para que se lea a unos pocos píxeles.",
    "badge.dotLabel": "Badge dot",
    "badge.pulseTitle": "Dot pulsante",
    "badge.pulseBody":
      'Cualquier dot puede sumar <code>pulse</code> cuando el estado está vivo o acaba de cambiar. El halo usa el mismo color del punto; este ejemplo muestra el pulso en todos los tonos y se apaga con <code>prefers-reduced-motion</code>.',
    "badge.pulseLabel": "Badge dot pulsante",
    "badge.cornerTitle": "En la esquina de un elemento",
    "badge.cornerBody":
      'Envuelve el elemento en <code>sk-badge-holder</code> y el dot se ancla arriba a la derecha, un indicador de novedades sobre un botón, de presencia sobre un avatar. Un anillo del color de la superficie lo despega del contenido de abajo. Los dos ejemplos usan <code>pulse</code>. El punto lleva su propio <code>aria-label</code> porque significa algo; el elemento anfitrión no cambia.',
    "badge.cornerLabel": "Badge dot en la esquina",
    "badge.test1": "Renderiza su etiqueta accesible y reenvía los atributos semánticos.",
    "badge.test2": "Ancla un dot de estado sin agregar contenido visible.",
  },
  en: {
    "demo.badge.settings": "Settings",
    "demo.badge.unread": "Unread news",
    "demo.badge.anatomyTag": "In review",
    "demo.badge.online": "Online",

    "badge.description": "Badge: static tag with semantic tones, styling hooks and a React component.",
    "badge.lede":
      "Badge is a static visual label for statuses, categories or short metadata. It does not communicate selection, a counter or navigation on its own; that semantics belongs to the content or the container.",
    "badge.anatomyBody":
      "<code>sk-badge</code> is one class with two shapes, so the drawing carries both: a pulsing dot in its holder's corner, and a standalone tag with text in the flow. The label names both, because the name covers both; <code>sk-badge-holder</code> is singular, and its one leader says which of the two specimens has one. They are frozen; the live tones and pulse start below.",
    "badge.anatomyLabel": "Badge anatomy",
    "badge.anatomyPreviewLabel": "Badge, part by part",
    "badge.tagTitle": "Label",
    "badge.tagBody":
      "The shape with text: a status, a category or a short piece of metadata. Every tone carries a border in its own color, so neutral, whose background is the canvas: never reads as an invisible rectangle.",
    "badge.tagLabel": "Badge",
    "badge.smallTitle": "sm size",
    "badge.smallBody":
      'The <code>sm</code> size keeps the text capsule but lowers its height for compact metadata, like a trailing count at the end of a navigation row.',
    "badge.smallLabel": "Badge sm",
    "badge.dotTitle": "Dot",
    "badge.dotBody":
      "A badge that is <strong>just a dot</strong>: no text, it communicates through color and position. On its own it's a status light; its fill is a saturated tone so it reads at just a few pixels.",
    "badge.dotLabel": "Badge dot",
    "badge.pulseTitle": "Pulsing dot",
    "badge.pulseBody":
      'Any dot can add <code>pulse</code> when the state is live or just changed. The halo uses the dot’s own color; this example shows every tone pulsing and turns off under <code>prefers-reduced-motion</code>.',
    "badge.pulseLabel": "Pulsing badge dot",
    "badge.cornerTitle": "In the corner of an element",
    "badge.cornerBody":
      "Wrap the element in <code>sk-badge-holder</code> and the dot anchors to the top right: a new-activity indicator on a button, a presence indicator on an avatar. A ring in the surface's color lifts it off the content underneath. Both examples use <code>pulse</code>. The dot carries its own <code>aria-label</code> because it means something; the host element does not change.",
    "badge.cornerLabel": "Badge dot in the corner",
    "badge.test1": "Renders its accessible label and forwards semantic attributes.",
    "badge.test2": "Anchors a status dot without adding visible content.",
  },
} as const;
