export const canvasMessages = {
  es: {
    "canvas.anatomyLabel": "Anatomía de Canvas",
    "canvas.anatomyPreviewLabel": "Canvas, parte por parte",
    "canvas.anatomyBody": "El viewport recorta y recibe los gestos, la capa de contenido es la que se transforma, y los controles hacen zoom. Las dos pistas de gesto aparecen sólo en la primera interacción del dispositivo que las necesita.",
    "canvas.description":
      "Un visor con paneo y zoom para un dibujo que debe conservar su geometría aunque no entre en pantalla.",
    "canvas.betaBadge": "Beta",
    "canvas.lede":
      "Canvas no es un lienzo para dibujar ni una caja con scroll. Conserva un dibujo grande tal como fue compuesto y lo ajusta al espacio disponible. Quien lee puede acercarse a una parte sin que el diagrama se reordene ni que la página pierda su scroll.",
    "canvas.whenTitle": "Cuándo usarlo",
    "canvas.whenBody":
      "Para un plano, un diagrama o una anatomía que perdería significado al reacomodarse. En un teléfono se ve entero, aunque pequeño; el zoom recupera el detalle cuando hace falta.",
    "canvas.notForTitle": "Cuándo no usarlo",
    "canvas.notForBody":
      "No envuelvas contenido que entra en pantalla, una imagen que sólo necesita abrirse más grande, una tabla ancha o una UI interactiva. En esos casos el gesto de arrastrar añade fricción o compite con los controles que ya existen.",
    "canvas.demoTitle": "El dibujo conserva su forma",
    "canvas.demoBody":
      "Este flujo se compone a su propio ancho. Prueba los botones, enfoca el visor y usa <kbd>+</kbd>, <kbd>-</kbd> o <kbd>0</kbd>, o acerca con <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + rueda. Arrastra para desplazar la vista.",
    "canvas.demoLabel": "Flujo de publicación",
    "canvas.nodeDraft": "Borrador",
    "canvas.nodeReview": "Revisión editorial",
    "canvas.nodePublish": "Programar",
    "canvas.nodeLive": "Publicado",
    "canvas.edgeApproved": "aprobado",
    "canvas.touchHint": "Usa dos dedos para mover el diagrama",
    "canvas.wheelHint": "Usa Ctrl + scroll para hacer zoom",
    "canvas.zoomInLabel": "Acercar",
    "canvas.zoomOutLabel": "Alejar",
    "canvas.fitLabel": "Ajustar a la vista",
    "canvas.controlsTitle": "Gestos que no secuestran la página",
    "canvas.controlsBody":
      "La rueda sola y un dedo siguen desplazando la página. El canvas responde a <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + rueda, pellizco de trackpad, dos dedos en táctil y sus controles de teclado. Si alguien intenta arrastrar con un dedo o hacer zoom con la rueda sola, el aviso explica el gesto correcto.",
    "canvas.optionsTitle": "Opciones",
    "canvas.optionsBody":
      "<code>label</code> nombra el grupo; <code>minZoom</code> y <code>maxZoom</code> acotan la escala; <code>zoomInLabel</code>, <code>zoomOutLabel</code> y <code>fitLabel</code> nombran los controles. <code>touchHint</code> y <code>wheelHint</code> cambian los avisos breves.",
    "canvas.cssTitle": "Hooks de estilo",
    "canvas.cssBody":
      "Ajusta el alto máximo, el fondo del visor y la cuadrícula desde el canvas. El tamaño del dibujo pertenece a su contenido, no al componente.",
    "canvas.a11yP1":
      "Con <code>label</code>, el canvas es un grupo nombrado. El visor recibe foco para que <kbd>+</kbd>, <kbd>-</kbd> y <kbd>0</kbd> funcionen sin ratón.",
    "canvas.a11yP2":
      "Los controles tienen nombres accesibles propios y los avisos de gesto son decorativos: explican una interacción visual, no duplican contenido que deba leerse.",
    "canvas.contractItem1":
      "En HTML: <code>.sk-canvas</code> contiene visor, contenido, controles y avisos. El hijo puede ser cualquier dibujo estático; Canvas sólo mide y transforma esa caja.",
    "canvas.contractItem2":
      "En React: <code>&lt;Canvas&gt;</code> recibe el dibujo como <code>children</code>. No envuelvas <code>Annotated</code>: ese componente ya incorpora un Canvas y deja su leyenda fuera de la escala.",
  },
  en: {
    "canvas.anatomyLabel": "Canvas anatomy",
    "canvas.anatomyPreviewLabel": "Canvas, part by part",
    "canvas.anatomyBody": "The viewport clips and takes the gestures, the content layer is what gets transformed, and the controls zoom. The two gesture hints only appear on first interaction with a device that needs them.",
    "canvas.description":
      "A pan-and-zoom viewport for a drawing that must retain its geometry even when it does not fit on screen.",
    "canvas.betaBadge": "Beta",
    "canvas.lede":
      "Canvas is not a drawing surface or a scrolling box. It keeps a large drawing as composed and fits it into the available space. Readers can inspect a detail without rearranging the diagram or losing the page scroll.",
    "canvas.whenTitle": "When to use it",
    "canvas.whenBody":
      "For a plan, diagram, or anatomy whose meaning would be lost when reflowed. On a phone it remains visible in full, though small; zoom restores detail when needed.",
    "canvas.notForTitle": "When not to use it",
    "canvas.notForBody":
      "Do not wrap content that fits on screen, an image that only needs a larger view, a wide table, or an interactive UI. In those cases dragging adds friction or conflicts with existing controls.",
    "canvas.demoTitle": "The drawing keeps its shape",
    "canvas.demoBody":
      "This flow is laid out at its own width. Try the controls, focus the viewport and press <kbd>+</kbd>, <kbd>-</kbd>, or <kbd>0</kbd>, or zoom with <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + wheel. Drag to move the view.",
    "canvas.demoLabel": "Publishing flow",
    "canvas.nodeDraft": "Draft",
    "canvas.nodeReview": "Editorial review",
    "canvas.nodePublish": "Schedule",
    "canvas.nodeLive": "Published",
    "canvas.edgeApproved": "approved",
    "canvas.touchHint": "Use two fingers to move the diagram",
    "canvas.wheelHint": "Use Ctrl + scroll to zoom",
    "canvas.zoomInLabel": "Zoom in",
    "canvas.zoomOutLabel": "Zoom out",
    "canvas.fitLabel": "Fit to view",
    "canvas.controlsTitle": "Gestures that do not hijack the page",
    "canvas.controlsBody":
      "A plain wheel and one finger still scroll the page. The canvas responds to <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + wheel, trackpad pinch, two fingers on touch, and its keyboard controls. If someone tries a one-finger drag or plain-wheel zoom, a hint explains the correct gesture.",
    "canvas.optionsTitle": "Options",
    "canvas.optionsBody":
      "<code>label</code> names the group; <code>minZoom</code> and <code>maxZoom</code> bound its scale; <code>zoomInLabel</code>, <code>zoomOutLabel</code>, and <code>fitLabel</code> name its controls. <code>touchHint</code> and <code>wheelHint</code> replace the short hints.",
    "canvas.cssTitle": "Styling hooks",
    "canvas.cssBody":
      "Set the maximum height, viewport background, and grid from the canvas. The drawing size belongs to its content, not to the component.",
    "canvas.a11yP1":
      "With <code>label</code>, the canvas is a named group. Its viewport receives focus so <kbd>+</kbd>, <kbd>-</kbd>, and <kbd>0</kbd> work without a mouse.",
    "canvas.a11yP2":
      "Controls have their own accessible names and gesture hints are decorative: they explain visual interaction without duplicating content that must be read.",
    "canvas.contractItem1":
      "In HTML: <code>.sk-canvas</code> holds a viewport, content, controls, and hints. Its child can be any static drawing; Canvas only measures and transforms that box.",
    "canvas.contractItem2":
      "In React: <code>&lt;Canvas&gt;</code> receives the drawing as <code>children</code>. Do not wrap <code>Annotated</code>: it already includes a Canvas and keeps its legend outside the scale.",
  },
} as const;
