export const fadeEdgeMessages = {
  es: {
    "fadeEdge.description": "Efecto de desvanecimiento CSS puro para ocultar contenido suavemente en los bordes.",
    "fadeEdge.betaBadge": "Beta",

    "fadeEdge.lede":
      "FadeEdge desvanece un borde del contenido, en CSS puro. Dos formas de hacerlo: hacia transparencia, dejando ver lo que hay detrás, o hacia un color determinado, pintando un degradé encima. Úsalo para indicar que hay más contenido por descubrir, en vez de cortarlo de golpe con <code>overflow: hidden</code>.",

    "fadeEdge.whenTitle": "Cuándo usarlo",
    "fadeEdge.whenItem1":
      "Una lista o feed con scroll, para insinuar que hay más filas por debajo sin una flecha ni un scrollbar grueso",
    "fadeEdge.whenItem2": "Una fila de chips o tags que se desborda horizontalmente",
    "fadeEdge.whenItem3": 'Un párrafo truncado, con un botón "Leer más" flotando sobre el desvanecido',
    "fadeEdge.whenItem4": "Contenido que se desplaza detrás de una cabecera fija",

    "fadeEdge.bottomTitle": "Fundido hacia abajo",
    "fadeEdge.bottomBody":
      "Una lista con scroll real y altura acotada: el borde inferior se desvanece para señalar que faltan filas por ver. Desplazate adentro del recuadro y vas a ver que el degradé queda fijo en el borde mientras el contenido pasa debajo.",
    "fadeEdge.bottomLabel": "Fundido hacia abajo",

    "fadeEdge.topTitle": "Fundido hacia arriba",
    "fadeEdge.topBody":
      "El mismo feed, arrancando ya scrolleado hasta el final: lo que falta está arriba, y el degradé lo señala ahí. Subí el scroll para verlo desaparecer.",
    "fadeEdge.topLabel": "Fundido hacia arriba",

    "fadeEdge.rightTitle": "Fundido hacia la derecha",
    "fadeEdge.rightBody":
      "Una fila de tags que no entra en el ancho disponible, con scroll horizontal real. El desvanecido a la derecha avisa que hay más sin necesidad de una flecha visible.",
    "fadeEdge.rightLabel": "Fundido hacia la derecha",

    "fadeEdge.leftTitle": "Fundido hacia la izquierda",
    "fadeEdge.leftBody":
      "La misma fila, arrancando ya scrolleada hasta el final: el desvanecido a la izquierda indica que hay contenido anterior.",
    "fadeEdge.leftLabel": "Fundido hacia la izquierda",

    "fadeEdge.colorTitle": "Fundido a un color determinado",
    "fadeEdge.colorBody":
      'Cuando no hay una superficie plana detrás para revelar, una foto por ejemplo, <code>data-fade="color"</code> pinta un degradé opaco encima en vez de hacer transparente el contenido. Es el patrón clásico del scrim: un texto legible sobre una imagen, sin importar qué colores tenga la foto.',
    "fadeEdge.colorLabel": "Fundido a un color",

    "fadeEdge.intensityTitle": "Ajustar la intensidad",
    "fadeEdge.intensityBody":
      "La variable <code>--sk-fade-edge-size</code> controla qué tan ancha es la zona que se desvanece (por defecto <code>4rem</code>), en cualquiera de los dos modos. Movés el control y el CSS se actualiza en vivo sobre el mismo feed con scroll de arriba.",
    "fadeEdge.intensityLabel": "Intensidad del desvanecido",

    "fadeEdge.apiTitle": "Variables y atributos",
    "fadeEdge.apiItem1":
      "<code>data-fade</code>: <code>transparent</code> (por defecto, revela el fondo detrás) o <code>color</code> (pinta un degradé opaco encima)",
    "fadeEdge.apiItem2":
      "<code>data-direction</code>: <code>to-bottom</code> (por defecto), <code>to-top</code>, <code>to-right</code>, <code>to-left</code>",
    "fadeEdge.apiItem3":
      "<code>--sk-fade-edge-size</code>: el alto o ancho de la zona que se desvanece (por defecto: <code>4rem</code>)",
    "fadeEdge.apiItem4":
      "<code>--sk-fade-edge-color</code>: el color de destino del degradé en modo <code>color</code> (por defecto: <code>var(--color-bg-canvas)</code>); no tiene efecto en modo <code>transparent</code>",

    "fadeEdge.notesTitle": "Notas de implementación",
    "fadeEdge.notesItem1":
      "Modo <code>transparent</code>: usa <code>mask-image</code> con un <code>linear-gradient</code>. El contenido sigue en el DOM y es seleccionable, solo se enmascara visualmente. Se nota únicamente si lo que hay detrás es un fondo sólido que contrasta con el contenido",
    "fadeEdge.notesItem2":
      "Modo <code>color</code>: un <code>::after</code> posicionado encima pinta el degradé, así que el elemento necesita <code>position: relative</code> (ya lo trae por defecto) y el resto de tu contenido no debe competir por ese mismo pseudo-elemento",
    "fadeEdge.notesItem3":
      "El desvanecido queda fijo en el borde del elemento aunque el contenido interno tenga scroll: no hace falta recalcularlo al desplazarse",
    "fadeEdge.notesItem4":
      "Ponele <code>overflow: auto</code> (o <code>hidden</code>, si no necesitás scroll) al mismo elemento cuando el contenido interno se desborda, para que no se vea por fuera del área desvanecida",
    "fadeEdge.notesItem5":
      "Para accesibilidad, asegurate de que el contenido crítico no quede oculto detrás del desvanecido",
  },
  en: {
    "fadeEdge.description": "Pure CSS fade-out effect to smoothly hide content at the edges.",
    "fadeEdge.betaBadge": "Beta",

    "fadeEdge.lede":
      "FadeEdge fades one edge of your content, in pure CSS. Two ways to do it: toward transparency, letting whatever sits behind show through, or toward a given colour, painting a gradient on top. Use it to say there is more content to find, rather than cutting it off with <code>overflow: hidden</code>.",

    "fadeEdge.whenTitle": "When to use it",
    "fadeEdge.whenItem1":
      "A scrolling list or feed, to hint at more rows below without an arrow or a heavy scrollbar",
    "fadeEdge.whenItem2": "A row of chips or tags that overflows horizontally",
    "fadeEdge.whenItem3": 'A truncated paragraph, with a "Read more" button floating over the fade',
    "fadeEdge.whenItem4": "Content scrolling behind a fixed header",

    "fadeEdge.bottomTitle": "Fade to bottom",
    "fadeEdge.bottomBody":
      "A list with real scrolling and a capped height: the bottom edge fades to signal the rows you cannot see yet. Scroll inside the box and the gradient stays pinned to the edge while the content passes underneath it.",
    "fadeEdge.bottomLabel": "Fade to bottom",

    "fadeEdge.topTitle": "Fade to top",
    "fadeEdge.topBody":
      "The same feed, starting already scrolled to the end: what is missing is above, and the gradient marks it there. Scroll back up to watch it go.",
    "fadeEdge.topLabel": "Fade to top",

    "fadeEdge.rightTitle": "Fade to right",
    "fadeEdge.rightBody":
      "A row of tags too wide for the space it has, with real horizontal scrolling. The fade on the right says there is more without needing a visible arrow.",
    "fadeEdge.rightLabel": "Fade to right",

    "fadeEdge.leftTitle": "Fade to left",
    "fadeEdge.leftBody":
      "The same row, starting already scrolled to the end: the fade on the left says there is content behind you.",
    "fadeEdge.leftLabel": "Fade to left",

    "fadeEdge.colorTitle": "Fade to a given colour",
    "fadeEdge.colorBody":
      'When there is no flat surface behind to reveal, a photograph for instance, <code>data-fade="color"</code> paints an opaque gradient on top instead of making the content transparent. It is the classic scrim: readable text over an image, whatever colours the photograph happens to have.',
    "fadeEdge.colorLabel": "Fade to a colour",

    "fadeEdge.intensityTitle": "Tuning the intensity",
    "fadeEdge.intensityBody":
      "<code>--sk-fade-edge-size</code> controls how wide the fading band is (<code>4rem</code> by default), in either mode. Move the control and the CSS updates live on the same scrolling feed from above.",
    "fadeEdge.intensityLabel": "Fade intensity",

    "fadeEdge.apiTitle": "Variables and attributes",
    "fadeEdge.apiItem1":
      "<code>data-fade</code>: <code>transparent</code> (default, reveals the background behind) or <code>color</code> (paints an opaque gradient on top)",
    "fadeEdge.apiItem2":
      "<code>data-direction</code>: <code>to-bottom</code> (default), <code>to-top</code>, <code>to-right</code>, <code>to-left</code>",
    "fadeEdge.apiItem3":
      "<code>--sk-fade-edge-size</code>: the height or width of the fading band (default: <code>4rem</code>)",
    "fadeEdge.apiItem4":
      "<code>--sk-fade-edge-color</code>: the gradient's destination colour in <code>color</code> mode (default: <code>var(--color-bg-canvas)</code>); no effect in <code>transparent</code> mode",

    "fadeEdge.notesTitle": "Implementation notes",
    "fadeEdge.notesItem1":
      "<code>transparent</code> mode uses <code>mask-image</code> with a <code>linear-gradient</code>. The content stays in the DOM and stays selectable, only its paint is masked. It only reads as a fade when what sits behind is a solid background that contrasts with the content",
    "fadeEdge.notesItem2":
      "<code>color</code> mode paints the gradient from an <code>::after</code> on top, so the element needs <code>position: relative</code> (it ships with it) and the rest of your content must not compete for that same pseudo-element",
    "fadeEdge.notesItem3":
      "The fade stays pinned to the element's edge even while the content inside it scrolls: there is nothing to recalculate as it moves",
    "fadeEdge.notesItem4":
      "Give the same element <code>overflow: auto</code> (or <code>hidden</code>, if you need no scrolling) when its content overflows, so nothing shows outside the faded area",
    "fadeEdge.notesItem5":
      "For accessibility, make sure no critical content ends up hidden behind the fade",
  },
} as const;
