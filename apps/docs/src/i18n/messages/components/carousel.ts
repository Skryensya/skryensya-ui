export const carouselMessages = {
  es: {
    "demo.carousel.label": "Novedades",
    "demo.carousel.productivity.eyebrow": "Productividad",
    "demo.carousel.productivity.title": "Búsqueda",
    "demo.carousel.productivity.body":
      "Encuentra cualquier proyecto al instante, con atajos y filtros vivos.",
    "demo.carousel.context.eyebrow": "Contexto",
    "demo.carousel.context.title": "Actividad",
    "demo.carousel.context.body":
      "Seis meses de cambios en una línea de tiempo que no pierde el hilo.",
    "demo.carousel.analytics.eyebrow": "Analítica",
    "demo.carousel.analytics.title": "Informes",
    "demo.carousel.analytics.body":
      "Cohortes, exportación programada y métricas que caben en una card.",
    "demo.carousel.collaboration.eyebrow": "Colaboración",
    "demo.carousel.collaboration.title": "Equipo",
    "demo.carousel.collaboration.body":
      "Invita, asigna roles y comparte espacios sin salir del flujo.",
    "demo.carousel.readMore": "Leer más",
    "demo.carousel.focusLabel": "Novedades, con enlace en cada tarjeta",
    "demo.carousel.team.label": "Equipo",
    "demo.carousel.person.first.role": "Plataforma",
    "demo.carousel.person.second.role": "Compiladores",
    "demo.carousel.person.third.role": "Redes",
    "demo.carousel.person.fourth.role": "Genética",
    "demo.carousel.person.fifth.role": "Recuperación",

    "demo.carousel.nativeLabel": "Novedades (sin JS)",

    "carousel.description":
      "Carousel: región scroll-snap nativa de slides con controles machine-backed (Zag), snap-to-index y una base sin JS.",
    "carousel.betaBadge": "Beta",
    "carousel.lede":
      "Secciones desplazables <strong>nativas</strong>: la pista es un <code>&lt;div&gt;</code> con <code>scroll-snap-type</code>, así que el desplazamiento, el momentum táctil y los puntos de anclaje son de la plataforma, no de un script. Encima van dos capas de control sobre ese mismo sustrato: una base <strong>sin JS</strong> con los pseudo-elementos nativos de carrusel, y un enhancer <strong>machine-backed</strong> sobre <code>@zag-js/carousel</code> que mide la pista, deriva las páginas y dibuja botones y dots. Cada slide es cualquier contenido: una card, una imagen, un stat.",
    "carousel.cardsTitle": "Carrusel de tarjetas",
    "carousel.cardsBody":
      'Con <code>data-sk-carousel</code> el enhancer corre la máquina: prev/next (se deshabilitan en los extremos), un dot por <strong>página</strong>, teclado, arrastre y re-medición al cambiar de tamaño. Aquí cada slide es una card con <a href="/components/image-frame">ImageFrame</a> y un cuerpo compuesto con <code>Box</code>, <code>Stack</code> y <code>Text</code>, sin clases locales. El tamaño base de CSS deja asomar la siguiente.',
    "carousel.cardsLabel": "Carrusel de tarjetas",
    "carousel.dotsTitle": "Un dot por página, no por slide",
    "carousel.dotsBody":
      "Es la razón concreta por la que acá hay una máquina y no un contador. Las posiciones de anclaje <strong>alcanzables</strong> no son una por slide: cuando un slide asoma, los últimos se recortan todos contra el scroll máximo y colapsan en la misma posición. Un carrusel hecho a mano dibuja ahí un dot por slide y termina con dots que <em>nunca</em> se pueden activar y un botón «siguiente» que nunca se deshabilita. La máquina deriva las páginas de <code>getScrollSnapPositions</code> (medidas, recortadas y deduplicadas), así que los dots y el scroll coinciden por construcción. Se ve achicando la ventana sobre cualquiera de los ejemplos: cambian los slides que entran, cambia la cantidad de dots, y el último siempre se puede alcanzar.",
    "carousel.multiTitle": "Multi-up, loop y autoplay",
    "carousel.multiBody1":
      "Slides más angostos entran de a varios por página, y la máquina las cuenta midiendo. Con <code>data-loop</code> el carrusel da la vuelta, con <code>data-autoplay</code> avanza solo (vacío para los 4000 ms por defecto, o un retardo en ms).",
    "carousel.multiBody2":
      "Con <code>data-autoplay</code> aparece además un <strong>botón de pausa</strong>: algo que se mueve solo tiene que poder detenerse (WCAG 2.2.2), así que la opción y el control son una sola cosa. El botón siempre dice lo que va a hacer según lo último que el usuario pidió: pasar el mouse por encima o llevar el foco de teclado a cualquier parte del carrusel: no sólo a los botones: pausa la rotación mientras dure, y la retoma al salir, salvo que la otra condición siga activa. Un click en el botón manda por encima de todo eso hasta el próximo click. A quien declara <code>prefers-reduced-motion</code> no se le arranca: el carrusel queda quieto y el botón ofrece reproducir. También se pausa solo cuando la pestaña deja de estar visible.",
    "carousel.multiLabel": "Multi-up + autoplay",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Foco dentro de una tarjeta",
    "carousel.focusLabel": "Foco dentro de una tarjeta",
    "carousel.focusBody1":
      "El patrón de WAI-ARIA dice que el foco de teclado pausa la rotación \"en cualquier parte del carrusel, incluyendo los elementos de siguiente y anterior slide\". Una frase fácil de leer como \"sólo los botones\". Esta tarjeta agrega un enlace real (\"Leer más\") adentro de cada slide para probar que también cuenta: Tab hacia el enlace pausa el autoplay, Tab o Shift+Tab hacia afuera lo retoma.",
    "carousel.focusBody2":
      "No hizo falta código nuevo para esto: el listener de foco vive en la raíz del carrusel, y <code>focusin</code>/<code>focusout</code> burbujean desde cualquier descendiente, así que un enlace, un botón o cualquier control dentro de una tarjeta ya queda cubierto.",
    "carousel.focusNote": "Link real por tarjeta · Tab para probar la pausa",
    "carousel.bareTitle": "Sin controles",
    "carousel.bareBody1":
      "<code>data-controls=\"none\"</code> apaga las <strong>dos</strong> capas: ni botones y dots del enhancer, ni <code>::scroll-button</code> y <code>::scroll-marker</code> nativos. Queda la pista desnuda, que sigue siendo un scroller con snap: cada slide es una parada (<code>scroll-snap-stop: always</code>), así que deslizar nunca se saltea una card.",
    "carousel.bareBody2":
      "Lo que no cambia es el comportamiento: los controles eran el chrome. El teclado sigue andando con el foco en la pista, y <code>sk-carousel-goto</code> / <code>sk-carousel-change</code> siguen siendo el mismo par de eventos.",
    "carousel.bareBody3":
      "Y acá se ve por qué el <strong>arrastre con mouse viene prendido</strong>: una rueda vertical scrollea la <em>página</em>, no la pista horizontal que tienes debajo del cursor. Sin arrastre, un puntero de escritorio no tendría ninguna forma de recorrer esto. El cursor <code>grab</code> es todo el aviso, y sólo aparece donde el arrastre de verdad funciona. Desactívalo con <code>data-mouse-drag=\"off\"</code> cuando el texto de los slides esté para seleccionarse: el arrastre suprime la selección.",
    "carousel.bareLabel": "Sin controles",
    "carousel.bareNote": 'data-controls="none" · arrastra y desliza',
    "carousel.nativeTitle": "Sin JS: controles nativos",
    "carousel.nativeBody":
      "El <strong>mismo markup</strong> sin <code>data-sk-carousel</code>: el enhancer no lo toca y los pseudo-elementos nativos (<code>::scroll-button</code> y <code>::scroll-marker</code>) dibujan los controles con <strong>cero JavaScript</strong>. El adapter CSS del set elegido les da los SVG de <code>chevron-left</code> y <code>chevron-right</code>, sin sustituirlos por glifos tipográficos. Hoy funciona en Chrome/Edge; en el resto degrada a un scroller con snap nativo (sin flechas ni dots, pero se desliza igual). Cuando el enhancer monta, esta capa se apaga para no duplicar.",
    "carousel.nativeLabel": "Sin JS (CSS nativo)",
    "carousel.nativeNote": "iconos del set + scroll buttons nativos",
    "carousel.nativeCssLabel": "la base sin JS",
    "carousel.apiTitle": "Snap-to-index y eventos",
    "carousel.apiBody":
      "El control programático es un par de eventos en la raíz: envía <code>sk-carousel-goto</code> para anclar a una página y escucha <code>sk-carousel-change</code> para saber cuál está activa. En React, el <code>ref</code> del <code>&lt;Carousel&gt;</code> expone <code>snapTo(index)</code>, que envía ese mismo evento.",
    "carousel.contractItem1":
      'Raíz: <code>&lt;section class="sk-carousel" data-sk-carousel&gt;</code> con una pista <code>&lt;div class="sk-carousel__track"&gt;</code> de <code>&lt;div class="sk-carousel__slide"&gt;</code>. No es una lista: la máquina le da <code>role="group"</code> a cada slide, lo que la saca de la lista y dejaría una lista sin ítems.',
    "carousel.contractItem2":
      "Slides: cualquier contenido. <code>--sk-carousel-slide-size</code> fija el ancho (peek o multi-up) y es la <strong>única</strong> perilla de tamaño: vale igual con y sin JS, porque la máquina mide la pista en vez de imponerle anchos.",
    "carousel.contractItem3":
      'Opciones en la raíz: <code>data-controls="none"</code>, <code>data-loop</code>, <code>data-autoplay</code> (vacío o ms), <code>data-orientation="vertical"</code>.',
    "carousel.contractItem4":
      'Arrastre con mouse: <strong>prendido</strong>. <code>data-mouse-drag="off"</code> lo apaga, para slides cuyo texto se tenga que poder seleccionar.',
    "carousel.contractItem5":
      "Snap: cada slide es una parada, con <code>scroll-snap-stop: always</code>, así que deslizar nunca salta una. Las paradas <em>alcanzables</em> se recortan contra el fin del scroll, por eso los últimos slides pueden compartir la última.",
    "carousel.contractItem6":
      "Controles: el enhancer los dibuja, uno por página medida; en un extremo el botón se deshabilita. Prev/next respetan el floor táctil. Los dots se ven compactos; el área clicable crece en bloque sin ensanchar el layout ni solaparse. Sin JS, los pseudo-elementos nativos hacen de baseline (Chrome/Edge) y el adapter <code>@skryensya/icons-*/carousel.css</code> les suministra los mismos roles estables de chevron que usa el enhancer.",
    "carousel.contractItem7":
      "Teclado: con el foco en la pista, <kbd class=\"sk-kbd\">←</kbd>/<kbd class=\"sk-kbd\">→</kbd> mueven una página y <kbd class=\"sk-kbd\">Inicio</kbd>/<kbd class=\"sk-kbd\">Fin</kbd> saltan a los extremos; las mismas teclas funcionan con el foco en los dots.",
    "carousel.contractItem8":
      'API: <code>sk-carousel-goto</code> (comando) y <code>sk-carousel-change</code> (salida, con <code>{"{ index, count }"}</code>); en React, <code>ref.snapTo(index)</code>.',
    "carousel.contractItem9": "Movimiento reducido: el desplazamiento suave se apaga con <code>prefers-reduced-motion</code>.",
    "carousel.nativeCssComment1": "cero JS: la plataforma dibuja los controles",
    "carousel.nativeCssComment2": "Anterior",
    "carousel.nativeCssComment3": "Siguiente",
    "carousel.nativeCssComment4": "la fila de dots",
    "carousel.nativeCssComment5":
      "Las cajas de ::scroll-button se maquetan después del scroller, en el\n   flujo del padre. El grid de 3 columnas les reserva los extremos.",
    "carousel.bootstrapComment": "corre la máquina en cada [data-sk-carousel]",
    "carousel.apiComment1": "anclar a una página (0-based): el mismo comando que envía snapTo() del ref de React",
    "carousel.apiComment2": "leer la página activa cada vez que cambia (swipe, rueda, botón, tecla, arrastre o goto)",
    "carousel.apiComment3": "{ index, count }  ← count son PÁGINAS medidas, no slides",
    "carousel.test1": "Renderiza una región <code>section</code> con una pista de slides con scroll-snap.",
    "carousel.test2": "Nombra la región y cada slide para la tecnología de asistencia.",
    "carousel.test3": "Dibuja un punto por página MEDIDA, no uno por slide.",
    "carousel.test4": "Se ancla a un punto y reporta la página en el evento de cambio.",
    "carousel.test5":
      "El foco en el ENLACE de una tarjeta (no sólo en los botones prev/next) pausa el autoplay, y lo retoma al perderlo.",
  },
  en: {
    "demo.carousel.label": "What's new",
    "demo.carousel.productivity.eyebrow": "Productivity",
    "demo.carousel.productivity.title": "Search",
    "demo.carousel.productivity.body":
      "Find any project instantly, with shortcuts and live filters.",
    "demo.carousel.context.eyebrow": "Context",
    "demo.carousel.context.title": "Activity",
    "demo.carousel.context.body":
      "Six months of changes in a timeline that keeps its thread.",
    "demo.carousel.analytics.eyebrow": "Analytics",
    "demo.carousel.analytics.title": "Reports",
    "demo.carousel.analytics.body":
      "Cohorts, scheduled exports, and metrics that fit in one card.",
    "demo.carousel.collaboration.eyebrow": "Collaboration",
    "demo.carousel.collaboration.title": "Team",
    "demo.carousel.collaboration.body":
      "Invite, assign roles, and share spaces without leaving the flow.",
    "demo.carousel.readMore": "Read more",
    "demo.carousel.focusLabel": "What's new, with a link on every card",
    "demo.carousel.team.label": "Team",
    "demo.carousel.person.first.role": "Platform",
    "demo.carousel.person.second.role": "Compilers",
    "demo.carousel.person.third.role": "Networks",
    "demo.carousel.person.fourth.role": "Genetics",
    "demo.carousel.person.fifth.role": "Retrieval",

    "demo.carousel.nativeLabel": "News (no JS)",

    "carousel.description":
      "Carousel: a native scroll-snap slide region with machine-backed (Zag) controls, snap-to-index, and a JS-free base.",
    "carousel.betaBadge": "Beta",
    "carousel.lede":
      "Scrollable sections that are <strong>native</strong>: the track is a <code>&lt;div&gt;</code> with <code>scroll-snap-type</code>, so scrolling, touch momentum and anchor points belong to the platform, not a script. On top of that sit two control layers over the same substrate: a <strong>JS-free</strong> base using native carousel pseudo-elements, and a <strong>machine-backed</strong> enhancer over <code>@zag-js/carousel</code> that measures the track, derives the pages, and draws buttons and dots. Each slide is any content: a card, an image, a stat.",
    "carousel.cardsTitle": "Card carousel",
    "carousel.cardsBody":
      'With <code>data-sk-carousel</code> the enhancer runs the machine: prev/next (disabled at the ends), one dot per <strong>page</strong>, keyboard, drag, and re-measuring on resize. Here every slide is a card with <a href="/en/components/image-frame">ImageFrame</a> and a body composed of <code>Box</code>, <code>Stack</code> and <code>Text</code>, with no local classes. The default CSS size lets the next one peek through.',
    "carousel.cardsLabel": "Card carousel",
    "carousel.dotsTitle": "One dot per page, not per slide",
    "carousel.dotsBody":
      "This is the concrete reason there is a machine here and not a counter. The <strong>reachable</strong> anchor positions are not one per slide: once a slide starts to peek through, the trailing ones all clip against the maximum scroll and collapse onto the same position. A hand-rolled carousel draws one dot per slide there and ends up with dots that can <em>never</em> be activated and a \"next\" button that never disables. The machine derives pages from <code>getScrollSnapPositions</code> (measured, clipped and deduplicated), so the dots and the scroll agree by construction. You can see it by shrinking the window over any of the examples: the slides that fit change, the dot count changes, and the last one is always reachable.",
    "carousel.multiTitle": "Multi-up, loop and autoplay",
    "carousel.multiBody1":
      "Narrower slides fit several per page, and the machine counts them by measuring. With <code>data-loop</code> the carousel wraps around; with <code>data-autoplay</code> it advances on its own (empty for the default 4000ms, or a delay in ms).",
    "carousel.multiBody2":
      "<code>data-autoplay</code> also brings a <strong>pause button</strong>: anything that moves on its own has to be stoppable (WCAG 2.2.2), so the option and the control are one and the same thing. The button always says what it will do based on what the user last asked for: hovering the mouse over the carousel or moving keyboard focus anywhere inside it: not just the buttons: pauses rotation for as long as that lasts, and resumes it on leaving, unless the other condition is still active. A click on the button overrides all of that until the next click. For anyone who declares <code>prefers-reduced-motion</code>, it never starts: the carousel stays still and the button offers to play. It also pauses on its own once the tab is no longer visible.",
    "carousel.multiLabel": "Multi-up + autoplay",
    "carousel.multiNote": "Avatar + meta · data-loop · data-autoplay",
    "carousel.focusTitle": "Focus inside a card",
    "carousel.focusLabel": "Focus inside a card",
    "carousel.focusBody1":
      "The WAI-ARIA pattern says keyboard focus pauses rotation \"anywhere in the carousel content, including the next and previous slide elements\". Easy to read as \"only the buttons\". This card adds a real link (\"Read more\") inside every slide to prove it also counts: Tab onto the link pauses autoplay, Tab or Shift+Tab away resumes it.",
    "carousel.focusBody2":
      "No new code was needed for this: the focus listener lives on the carousel's root, and <code>focusin</code>/<code>focusout</code> bubble from any descendant, so a link, a button, or any control inside a card is already covered.",
    "carousel.focusNote": "A real link per card · Tab to test the pause",
    "carousel.bareTitle": "No controls",
    "carousel.bareBody1":
      "<code>data-controls=\"none\"</code> turns off <strong>both</strong> layers: neither the enhancer's buttons and dots, nor the native <code>::scroll-button</code> and <code>::scroll-marker</code>. What is left is the bare track, still a scroller with snap: every slide is a stop (<code>scroll-snap-stop: always</code>), so swiping never skips a card.",
    "carousel.bareBody2":
      "What does not change is the behavior: the controls were only the chrome. The keyboard still works with focus on the track, and <code>sk-carousel-goto</code> / <code>sk-carousel-change</code> are still the same pair of events.",
    "carousel.bareBody3":
      "And here you can see why <strong>mouse drag ships on</strong>: a vertical wheel scrolls the <em>page</em>, not the horizontal track sitting under the cursor. Without drag, a desktop pointer would have no way to move through this at all. The <code>grab</code> cursor is the entire hint, and it only shows up where drag actually works. Turn it off with <code>data-mouse-drag=\"off\"</code> when the slide text needs to stay selectable: drag suppresses selection.",
    "carousel.bareLabel": "No controls",
    "carousel.bareNote": 'data-controls="none" · drag and swipe',
    "carousel.nativeTitle": "No JS: native controls",
    "carousel.nativeBody":
      "The <strong>same markup</strong> without <code>data-sk-carousel</code>: the enhancer never touches it, and the native pseudo-elements (<code>::scroll-button</code> and <code>::scroll-marker</code>) draw the controls with <strong>zero JavaScript</strong>. The chosen set's CSS adapter feeds them the <code>chevron-left</code> and <code>chevron-right</code> SVGs, rather than swapping in typographic glyphs. It works in Chrome/Edge today; everywhere else it degrades to a scroller with native snap (no arrows or dots, but it still swipes). Once the enhancer mounts, this layer turns itself off so nothing doubles up.",
    "carousel.nativeLabel": "No JS (native CSS)",
    "carousel.nativeNote": "set icons + native scroll buttons",
    "carousel.nativeCssLabel": "the JS-free base",
    "carousel.apiTitle": "Snap-to-index and events",
    "carousel.apiBody":
      "Programmatic control is a pair of events on the root: send <code>sk-carousel-goto</code> to pin to a page, and listen for <code>sk-carousel-change</code> to know which one is active. In React, the <code>&lt;Carousel&gt;</code>'s <code>ref</code> exposes <code>snapTo(index)</code>, which sends that same event.",
    "carousel.contractItem1":
      'Root: <code>&lt;section class="sk-carousel" data-sk-carousel&gt;</code> with a track <code>&lt;div class="sk-carousel__track"&gt;</code> of <code>&lt;div class="sk-carousel__slide"&gt;</code>. Not a list: the machine gives every slide <code>role="group"</code>, which takes it out of listhood and would otherwise leave a list with no list items.',
    "carousel.contractItem2":
      "Slides: any content. <code>--sk-carousel-slide-size</code> sets the width (peek or multi-up) and is the <strong>only</strong> sizing knob: it holds equally with and without JS, because the machine measures the track instead of imposing widths on it.",
    "carousel.contractItem3":
      'Root options: <code>data-controls="none"</code>, <code>data-loop</code>, <code>data-autoplay</code> (empty or ms), <code>data-orientation="vertical"</code>.',
    "carousel.contractItem4":
      'Mouse drag: <strong>on</strong>. <code>data-mouse-drag="off"</code> turns it off, for slides whose text needs to stay selectable.',
    "carousel.contractItem5":
      "Snap: every slide is a stop, with <code>scroll-snap-stop: always</code>, so swiping never skips one. <em>Reachable</em> stops clip against the end of the scroll, which is why the last few slides can end up sharing the final one.",
    "carousel.contractItem6":
      "Controls: the enhancer draws them, one per measured page; the button disables at each end. Prev/next respect the touch-target floor. The dots read compact; the clickable area grows as a block without widening the layout or overlapping. Without JS, the native pseudo-elements act as the baseline (Chrome/Edge), and the <code>@skryensya/icons-*/carousel.css</code> adapter feeds them the same stable chevron roles the enhancer uses.",
    "carousel.contractItem7":
      "Keyboard: with focus on the track, <kbd class=\"sk-kbd\">←</kbd>/<kbd class=\"sk-kbd\">→</kbd> move one page and <kbd class=\"sk-kbd\">Home</kbd>/<kbd class=\"sk-kbd\">End</kbd> jump to the ends; the same keys work with focus on the dots.",
    "carousel.contractItem8":
      'API: <code>sk-carousel-goto</code> (command) and <code>sk-carousel-change</code> (output, with <code>{"{ index, count }"}</code>); in React, <code>ref.snapTo(index)</code>.',
    "carousel.contractItem9": "Reduced motion: smooth scrolling turns off with <code>prefers-reduced-motion</code>.",
    "carousel.nativeCssComment1": "zero JS: the platform draws the controls",
    "carousel.nativeCssComment2": "Previous",
    "carousel.nativeCssComment3": "Next",
    "carousel.nativeCssComment4": "the dot row",
    "carousel.nativeCssComment5":
      "The ::scroll-button boxes are laid out after the scroller, in the\n   parent's flow. The 3-column grid reserves the ends for them.",
    "carousel.bootstrapComment": "runs the machine on every [data-sk-carousel]",
    "carousel.apiComment1": "pin to a page (0-based): the same command snapTo() sends from the React ref",
    "carousel.apiComment2": "read the active page every time it changes (swipe, wheel, button, key, drag or goto)",
    "carousel.apiComment3": "{ index, count } ← count is measured PAGES, not slides",
    "carousel.test1": "Renders a <code>section</code> region with a scroll-snap track of slides.",
    "carousel.test2": "Names the region and every slide for assistive tech.",
    "carousel.test3": "Draws one dot per MEASURED page, not one per slide.",
    "carousel.test4": "Snaps to a dot and reports the page on the change event.",
    "carousel.test5":
      "Focus landing on a card's LINK (not just the prev/next buttons) pauses autoplay, and resumes it on blur.",
  },
} as const;
