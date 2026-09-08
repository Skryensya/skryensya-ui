export const marqueeMessages = {
  es: {
    "marquee.description": "Franja continua con dos causas de movimiento explícitas: pedido por la persona o automático con pausa.",
    "marquee.betaBadge": "Beta",
    "marquee.lede":
      "Marquee repite una fila corta de logotipos inertes. La diferencia importante no es la velocidad: es <strong>quién pidió el movimiento</strong>. <code>Marquee</code> espera un Play; <code>Marquee.autoplay</code> empieza sola y carga con el costo completo de hacerlo bien.",
    "marquee.whenTitle": "Dos firmas, dos causas",
    "marquee.whenBody":
      "Usa la versión pedida por defecto. Reserva autoplay para una franja secundaria cuyo movimiento aporte identidad o contexto; nunca para información necesaria ni para controles.",
    "marquee.manualTitle": "Movimiento pedido",
    "marquee.manualBody":
      "Queda quieta hasta que se presiona Play. Es la opción segura cuando el movimiento ayuda pero no debe asumir intención.",
    "marquee.manualLabel": "Marquee que espera Play",
    "marquee.autoplayTitle": "Movimiento automático",
    "marquee.autoplayBody":
      "Empieza sola y se pausa al pasar el puntero. Así se ve por defecto: sin botón, porque una franja ambiental no es un reproductor y un control que nadie vino a apretar es una cosa más en la pantalla.",
    "marquee.autoplayLabel": "Marquee con autoplay, sin control",
    "marquee.autoplayNote": "Pasa el puntero por encima para pausarla temporalmente",
    "marquee.controlTitle": "El control es opt-in",
    "marquee.controlBody":
      "<code>control</code> agrega el botón de Play/Pausa; viene apagado. Apagarlo es una decisión de conformidad además de visual: sin él la franja igual se detiene con el puntero y nunca arranca con <code>prefers-reduced-motion</code>, pero ninguna de las dos cosas es el control explícito que pide WCAG 2.2.2 para movimiento que empieza solo y dura más de cinco segundos. Y como los hijos son inertes, sin botón no queda ningún mecanismo para quien usa teclado. Apagado sirve para decoración que se puede ignorar; encendido, apenas la franja lleve algo que alguien quiera leer.",
    "marquee.controlLabel": "La misma franja con control",
    "marquee.anyChildTitle": "Acepta cualquier hijo, uno por franja",
    "marquee.anyChildBody":
      "El contrato no nombra qué va adentro: recibe nodos inertes y los repite. Eso no es permiso para mezclarlos. Una franja con un logotipo, un ícono y una línea suelta no se lee como <em>acepta cualquier cosa</em>, se lee como sin terminar. Cada ejemplo de acá lleva un solo tipo de hijo; la variedad está entre las franjas, nunca dentro de una.",
    "marquee.badgeLabel": "Franja de badges de lanzamiento",
    "marquee.avatarLabel": "Franja de avatares del equipo",
    "marquee.verticalTitle": "También puede viajar en vertical",
    "marquee.verticalBody":
      "Usa <code>up</code> o <code>down</code> para una columna corta, define <code>--sk-marquee-vertical-size</code> para el alto visible y conserva los ítems inertes. La medición cambia al alto real de la columna, y el vertical pide bloques: tarjetas iguales, no ítems sueltos.",
    "marquee.verticalLabel": "Columna de tarjetas de novedades",
    "marquee.fadeTitle": "El desvanecido es de la ventana, no de un envoltorio",
    "marquee.fadeBody":
      "Una fila que se repite y corta de golpe en el borde se lee como un error, no como \"hay más\", así que <code>fade</code> viene encendido y suaviza los dos bordes por donde la ventana recorta. Lo dibuja la ventana misma y no un <code>FadeEdge</code> envolviendo el componente: una máscara alcanza todo lo que contiene, y así también desteñía el botón de Play/Pausa. <code>FadeEdge</code> sigue siendo la herramienta para un borde recortado propio; éste es el que Marquee ya sabe que tiene. Abajo, <code>fade=\"none\"</code> muestra lo que se pierde.",
    "marquee.fadeLabel": "La misma fila con fade=\"none\", cortada en seco",
    "marquee.behaviorTitle": "Una copia para leer, dos para pintar",
    "marquee.behaviorBody1":
      "La pista duplica la fila para cerrar el loop, pero la segunda copia lleva <code>aria-hidden=\"true\"</code>. El lector de pantalla recibe el contenido una vez; la vista obtiene una unión continua.",
    "marquee.behaviorBody2":
      "Los hijos deben ser inertes. Un link o botón duplicado crea dos paradas visualmente iguales y una copia escondida del árbol accesible. Para destinos, tarjetas o controles usa Carousel, Inline o List.",
    "marquee.behaviorBody3":
      "Dos copias sólo se ven infinitas mientras una alcance a cubrir la ventana. Si la fila autorada es más corta, al completar un ciclo el hueco cruza la franja a la vista. Por eso el binding mide la ventana y ensancha todos los gaps, incluido el que separa la última marca de la primera de la copia siguiente, hasta que una sola fila la cubra: el ritmo queda parejo en la unión y el loop no se corta nunca.",
    "marquee.optionsTitle": "Dirección, velocidad, desvanecido y control",
    "marquee.optionsBody":
      "<code>direction</code> acepta <code>left</code>, <code>right</code>, <code>up</code> o <code>down</code>. <code>speed</code> acepta <code>slow</code>, <code>normal</code> o <code>fast</code>; el enhancer mide el ancho o el alto real para mantener la velocidad percibida en vez de fijar una duración frágil. <code>fade</code> acepta <code>edges</code> (por defecto) o <code>none</code>, y el ancho de la banda sale de <code>--sk-marquee-fade-size</code>. <code>control</code> es booleano, apagado por defecto, y sólo existe en la firma con autoplay.",
    "marquee.a11yP1":
      "WCAG 2.2.2 exige pausar, detener u ocultar contenido que empieza solo y dura más de cinco segundos. <code>control</code> emite ese botón y queda a criterio de quien lo usa, así que apagarlo deja la franja fuera del criterio: el hover es una ayuda, no un mecanismo, y con hijos inertes no hay nada que reciba foco. La firma pedida es el otro camino: su botón no es opcional porque es su única causa de movimiento.",
    "marquee.a11yP2":
      "Con <code>prefers-reduced-motion: reduce</code> la animación no arranca y el control inerte se oculta. El contenido queda visible y estático.",
    "marquee.installBody":
      "Importa la hoja y el auto-loader para HTML autorado, o usa una de las dos exportaciones React. FadeEdge se importa aparte porque sigue siendo una composición opcional.",
    "marquee.test1": "La versión pedida empieza pausada, cambia a Play/Pause y mantiene una sola copia semántica.",
    "marquee.test2": "Autoplay empieza reproduciendo y publica dirección, velocidad y estado en la raíz.",
    "marquee.test3": "Un cambio vivo a reduced motion detiene autoplay.",
    "marquee.test4": "La duración sale del ancho medido y de píxeles por segundo, no de una constante por contenido.",
    "marquee.test5": "Un ciclo de preferencia nunca deshace una pausa explícita.",
    "marquee.test6": "Una fila más corta que su ventana ensancha los gaps hasta cubrirla, y una fila que ya la cubre no toca nada.",
    "marquee.test7": "El ancho que alimenta la duración es el de la fila ya ensanchada, no el autorado.",
    "marquee.test8": "El control es un Button real (sk-button, translucent, icon-only) con su glifo propio, y el fade viene encendido.",
    "marquee.test9": "Autoplay no emite botón salvo que se pida `control`, y sin botón nunca arranca pausada.",
    "marquee.test10": "El enhancer mide y sigue la preferencia igual cuando no hay ningún toggle en el DOM.",
    "demo.marquee.play": "Reproducir movimiento",
    "demo.marquee.pause": "Pausar movimiento",
    "demo.marquee.person": "Integrante {initials}",
    "demo.marquee.badge1": "v4.2 estable",
    "demo.marquee.badge2": "Tokens de motion",
    "demo.marquee.badge3": "Marquee beta",
    "demo.marquee.badge4": "Vaul en revisión",
    "demo.marquee.badge5": "Paleta derivada",
    "demo.marquee.badge6": "Contrastes AA",
    "demo.marquee.badge7": "Set de íconos",
    "demo.marquee.note1Title": "Contraste revisado",
    "demo.marquee.note1Body": "Los cuatro tonos de estado pasan AA sobre superficie elevada.",
    "demo.marquee.note2Title": "Escala de duración",
    "demo.marquee.note2Body": "Las cadencias del marquee salen de la escala, no de constantes sueltas.",
    "demo.marquee.note3Title": "Foco visible",
    "demo.marquee.note3Body": "El anillo de foco ya no se recorta dentro de contenedores con overflow.",
    "demo.marquee.note4Title": "Tipografía fluida",
    "demo.marquee.note4Body": "Los tamaños display interpolan entre 360px y 1280px de ancho.",
  },
  en: {
    "marquee.description": "A continuous strip with two explicit causes of motion: reader-requested or automatic with pause.",
    "marquee.betaBadge": "Beta",
    "marquee.lede":
      "Marquee repeats a short row of inert logos. The important difference is not speed; it is <strong>who requested the motion</strong>. <code>Marquee</code> waits for Play; <code>Marquee.autoplay</code> starts by itself and carries the full cost of doing that honestly.",
    "marquee.whenTitle": "Two signatures, two causes",
    "marquee.whenBody":
      "Default to the requested version. Reserve autoplay for secondary material whose movement adds identity or context; never use it for required information or controls.",
    "marquee.manualTitle": "Requested motion",
    "marquee.manualBody":
      "It remains still until Play is pressed. This is the safe choice when motion helps but must not assume intent.",
    "marquee.manualLabel": "Marquee waiting for Play",
    "marquee.autoplayTitle": "Automatic motion",
    "marquee.autoplayBody":
      "It starts by itself and pauses on pointer hover. This is what it looks like by default: no button, because an ambient strip is not a media player and a control nobody came to press is one more thing on the screen.",
    "marquee.autoplayLabel": "Autoplay marquee, no control",
    "marquee.autoplayNote": "Hover it to pause temporarily",
    "marquee.controlTitle": "The control is opt-in",
    "marquee.controlBody":
      "<code>control</code> adds the Play/Pause button; it ships off. Turning it off is a conformance decision as much as a visual one: without it the strip still stops on hover and still never starts under <code>prefers-reduced-motion</code>, but neither is the explicit control WCAG 2.2.2 asks for on motion that starts by itself and runs past five seconds. And since the children are inert, with no button there is no mechanism at all for a keyboard. Off is right for decoration a reader can ignore; on, the moment the strip carries anything they might want to read.",
    "marquee.controlLabel": "The same strip with the control",
    "marquee.anyChildTitle": "It accepts any child, one kind per strip",
    "marquee.anyChildBody":
      "The contract never names what goes inside: it takes inert nodes and repeats them. That is not permission to mix them. A strip holding a logo, an icon, and a loose line of text does not read as <em>accepts anything</em>, it reads as unfinished. Every example below carries a single kind of child; the variety lives between the strips, never inside one.",
    "marquee.badgeLabel": "Strip of release badges",
    "marquee.avatarLabel": "Strip of team avatars",
    "marquee.verticalTitle": "It can travel vertically too",
    "marquee.verticalBody":
      "Use <code>up</code> or <code>down</code> for a short column, set <code>--sk-marquee-vertical-size</code> for its visible height, and keep the items inert. Measurement switches to the column’s real height, and vertical travel wants blocks: equal cards, not loose items.",
    "marquee.verticalLabel": "Column of update cards",
    "marquee.fadeTitle": "The fade belongs to the viewport, not to a wrapper",
    "marquee.fadeBody":
      "A repeating row cut off hard at the boundary reads as a mistake, not as \"there is more\", so <code>fade</code> ships on and softens both edges where the viewport clips the run. The viewport draws it itself rather than a <code>FadeEdge</code> wrapped around the component: a mask reaches everything it contains, so a wrapper washed out the Play/Pause button along with the strip. <code>FadeEdge</code> is still the tool for a clipped edge of your own; this is the one Marquee already knows it has. Below, <code>fade=\"none\"</code> shows what it buys.",
    "marquee.fadeLabel": "The same row with fade=\"none\", cut off flat",
    "marquee.behaviorTitle": "One copy to read, two to paint",
    "marquee.behaviorBody1":
      "The track duplicates the row to close the loop, but the second copy carries <code>aria-hidden=\"true\"</code>. A screen reader gets the content once; the viewport gets a continuous seam.",
    "marquee.behaviorBody2":
      "Children must be inert. A duplicated link or button creates two visually identical stops and a copy hidden from the accessibility tree. Use Carousel, Inline, or List for destinations, cards, or controls.",
    "marquee.behaviorBody3":
      "Two copies only look infinite while one of them covers the window. When the authored row is shorter, completing a cycle drags a visible hole across the strip. The binding therefore measures the window and widens every gap, the one between the last mark and the first mark of the next copy included, until a single row covers it: the rhythm stays even at the seam, and the loop never breaks.",
    "marquee.optionsTitle": "Direction, velocity, fade, and control",
    "marquee.optionsBody":
      "<code>direction</code> accepts <code>left</code>, <code>right</code>, <code>up</code>, or <code>down</code>. <code>speed</code> accepts <code>slow</code>, <code>normal</code>, or <code>fast</code>; the enhancer measures real width or height to preserve perceived velocity instead of fixing a brittle per-content duration. <code>fade</code> accepts <code>edges</code> (the default) or <code>none</code>, and the band's width comes from <code>--sk-marquee-fade-size</code>. <code>control</code> is a boolean, off by default, and exists only on the autoplay signature.",
    "marquee.a11yP1":
      "WCAG 2.2.2 requires a way to pause, stop, or hide content that starts automatically and lasts more than five seconds. <code>control</code> emits that button and is the consumer's call, so leaving it off puts the strip outside the criterion: hover is help, not a mechanism, and with inert children nothing inside can take focus. The requested signature is the other road: its button is not optional, because it is the only cause of motion it has.",
    "marquee.a11yP2":
      "Under <code>prefers-reduced-motion: reduce</code>, animation does not start and the inert control is hidden. Content remains visible and static.",
    "marquee.installBody":
      "Import the stylesheet and auto-loader for authored HTML, or use either React export. Import FadeEdge separately because it remains optional composition.",
    "marquee.test1": "Requested motion starts paused, swaps Play/Pause, and keeps one semantic content copy.",
    "marquee.test2": "Autoplay starts playing and exposes direction, velocity, and state on the root.",
    "marquee.test3": "A live change to reduced motion stops autoplay.",
    "marquee.test4": "Duration comes from measured width and pixels per second, not a per-content constant.",
    "marquee.test5": "A preference cycle never overrides an explicit pause.",
    "marquee.test6": "A run shorter than its viewport widens its gaps until it covers it; a run that already covers it is left alone.",
    "marquee.test7": "The width feeding the duration is the widened run, not the authored one.",
    "marquee.test8": "The control is a real Button (sk-button, translucent, icon-only) with its own glyph, and the fade ships on.",
    "marquee.test9": "Autoplay emits no button unless `control` asks for one, and with no button it never starts paused.",
    "marquee.test10": "The enhancer still measures and follows the preference when no toggle exists in the DOM.",
    "demo.marquee.play": "Play motion",
    "demo.marquee.pause": "Pause motion",
    "demo.marquee.person": "Team member {initials}",
    "demo.marquee.badge1": "v4.2 stable",
    "demo.marquee.badge2": "Motion tokens",
    "demo.marquee.badge3": "Marquee beta",
    "demo.marquee.badge4": "Vaul in review",
    "demo.marquee.badge5": "Derived palette",
    "demo.marquee.badge6": "AA contrast",
    "demo.marquee.badge7": "Icon set",
    "demo.marquee.note1Title": "Contrast reviewed",
    "demo.marquee.note1Body": "All four status tones pass AA on a raised surface.",
    "demo.marquee.note2Title": "Duration scale",
    "demo.marquee.note2Body": "Marquee cadences come from the scale, not from loose constants.",
    "demo.marquee.note3Title": "Visible focus",
    "demo.marquee.note3Body": "The focus ring is no longer clipped inside overflow containers.",
    "demo.marquee.note4Title": "Fluid typography",
    "demo.marquee.note4Body": "Display sizes interpolate between 360px and 1280px of width.",
  },
} as const;
