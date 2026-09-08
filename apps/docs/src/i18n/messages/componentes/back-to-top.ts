export const backToTopMessages = {
  es: {

    "backToTop.description":
      "Un botón fijado a una esquina que devuelve un scroller a su inicio. Aparece solo después de pasar un umbral de scroll y se va solo al volver arriba.",
    "backToTop.betaBadge": "Beta",
    "backToTop.lede":
      "En una página larga hay un movimiento que se repite: volver al principio. El teclado tiene <kbd>Inicio</kbd> y el trackpad un envión fuerte, y ninguno se ve. Un botón anclado a la esquina es la señal de que ese movimiento existe.",
    "backToTop.whenTitle": "Cuándo usarlo",
    "backToTop.whenBody1":
      "Cuando la página es larga y quien baja mucho quiere volver arriba sin arrastrar el scroll a mano. El botón viene con <code>hidden</code>: sin JavaScript no ocupa la esquina, y con él aparece recién después de pasar <code>threshold</code> píxeles (400 por defecto) y se esconde de nuevo al volver.",
    "backToTop.whenBody2":
      "No es <a href=\"/componentes/skip-link\">SkipLink</a>: ese va primero en el documento, se alcanza con Tab antes que nada y salta por un ancla real. Este aparece tarde, se alcanza con el puntero o tabulando hasta la esquina, y llama a <code>scrollTo</code> sobre un scroller que puede no ser el documento. Si querés llevar a una sección puntual y no al principio, eso es un enlace de ancla o <a href=\"/componentes/toc\">Toc</a>.",
    "backToTop.behaviorTitle": "El comportamiento vive en las dos bindings, no en el markup",
    "backToTop.behaviorBody1":
      "No hay máquina de Zag para \"revelar al pasar un umbral\", así que se escribe como <code>hotkey</code>: la parte pura —¿pasó el umbral?, ¿la animación se atenúa?— vive en <code>@skryensya/core/back-to-top</code> y la comparten el enhancer de Vanilla y el componente de React. Cada binding pone lo que toca la plataforma: qué scroller escuchar, prender y apagar <code>hidden</code> por frame, y el <code>scrollTo</code> al hacer clic.",
    "backToTop.behaviorBody2":
      "El scroll lo hace la plataforma: suave por defecto, instantáneo si el lector pidió menos movimiento (<code>prefers-reduced-motion</code>). En este preview <code>threshold</code> está en <code>0</code> para que se vea sin nada que scrollear; en una página real se queda escondido hasta que bajás una pantalla o dos.",
    "backToTop.demoLabel": "Volver arriba",
    "backToTop.optionsTitle": "Opciones",
    "backToTop.optionsBody":
      "<code>threshold</code>: los píxeles de scroll antes de aparecer. <code>scroller</code>: un selector CSS para un panel con overflow propio, en vez de la ventana. <code>target</code>: un selector de algo enfocable arriba al que mover el foco después del scroll, para que el siguiente Tab siga desde el principio y no desde un control que ya se escondió (el destino tiene que poder recibir el foco, con <code>tabindex=\"-1\"</code> si es un landmark o un encabezado).",
    "backToTop.a11yP1":
      "Es un <code>&lt;button type=\"button\"&gt;</code> con un nombre accesible obligatorio: la marca visible es un <code>chevron-up</code> del set de iconos (decorativo, <code>aria-hidden</code>) y la etiqueta que le pasás (<code>sk-back-to-top__label</code>) queda recortada a una caja de solo-nombre, la misma técnica que <code>sk-visually-hidden</code>. Un texto requerido en un <code>&lt;button&gt;</code> hace que el control siempre tenga nombre, así que no hay regla de a11y que evaluar: la garantía es estructural.",
    "backToTop.a11yP2":
      "Escondido es <code>visibility</code>, no <code>display</code>: la hoja pisa el <code>[hidden]</code> de la UA para que la aparición pueda animarse, y <code>visibility: hidden</code> hace el trabajo semántico —fuera del árbol de accesibilidad y fuera del orden de tabulación— que <code>[hidden]</code> promete. Sin <code>target</code>, el foco no viaja: si te importa que el Tab siguiente arranque de arriba, pasalo.",
    "backToTop.contractItem1":
      "En HTML: un <code>&lt;button class=\"sk-back-to-top sk-interactive\" data-sk-back-to-top hidden&gt;</code> con el placeholder <code>&lt;span class=\"sk-back-to-top__icon\"&gt;&lt;span data-sk-icon=\"chevron-up\"&gt;</code> y la etiqueta en un <code>&lt;span class=\"sk-back-to-top__label\"&gt;</code>. El enhancer lo monta solo por <code>montaje automático</code> (y el mismo pase enlaza el icono al set).",
    "backToTop.contractItem2":
      "En React: <code>&lt;BackToTop&gt;Volver arriba&lt;/BackToTop&gt;</code>. <code>threshold</code>, <code>scroller</code> y <code>target</code> son props; el componente maneja <code>hidden</code> por estado.",
    "backToTop.contractItem3":
      "La hoja es <code>components/back-to-top.css</code>. Para un pill con texto visible, un consumidor restaura <code>.sk-back-to-top__label</code> (<code>position: static</code>, sin recorte) y le da aire al root; el nombre ya está bien, esto solo decide si se dibuja.",
    "backToTop.demoStaticTitle": "El objeto",
    "backToTop.demoStaticBody":
      'Con <code>threshold</code> en <code>0</code> queda siempre visible, así se ve la pieza: un botón redondo con un <code>chevron-up</code> del set de iconos (Lucide en este sitio) y una sombra de superficie flotante. Al pasarle el puntero se levanta un pelo y el chevron lo acompaña.',
    "backToTop.demoStaticLabel": "BackToTop siempre visible",
    "backToTop.demoScrollTitle": "El comportamiento",
    "backToTop.demoScrollBody":
      "Acá el preview scrollea. Bajá dentro del recuadro: el botón aparece con un pop —aparece, escala desde chico, sube a su lugar— una vez que pasás el umbral, y al hacerle clic te lleva de vuelta arriba. Volvé a subir y se va solo.",
    "backToTop.demoScrollLabel": "BackToTop al scrollear",
    "backToTop.demoScrollHint": "Scrolleá dentro del recuadro para verlo aparecer.",
    "backToTop.scrollDemoP1":
      "Una página larga tiene un movimiento que se repite hasta el cansancio: volver al principio. Después de leer varias pantallas, quien quiere releer el encabezado o cambiar de sección tiene que arrastrar la barra o buscar la tecla Inicio, y ninguna de las dos se ve.",
    "backToTop.scrollDemoP2":
      "Un botón anclado a la esquina es la señal de que ese movimiento existe. No está desde el principio: aparece recién cuando ya te alejaste lo suficiente como para quererlo, y se esconde de nuevo cuando llegás. Cuando no hace falta, no ocupa la esquina.",
    "backToTop.scrollDemoP3":
      "El scroll lo hace la plataforma con <code>scrollTo</code>: suave por defecto, instantáneo si pediste menos movimiento. Con <code>target</code>, además mueve el foco a algo enfocable de arriba, así el siguiente Tab arranca del principio y no de un control que se acaba de esconder.",
    "backToTop.htmlTitle": "HTML autorado",
    "backToTop.targetTitle": "Umbral y foco",
    "backToTop.targetBody":
      '<code>data-threshold</code> son los píxeles de scroll antes de aparecer. <code>data-target</code> es un selector de algo enfocable arriba: sin él, el foco se queda en un botón que ya no se ve; con él, el siguiente Tab sigue desde el principio. El destino tiene que poder recibir el foco (<code>tabindex="-1"</code> si es un landmark o un encabezado).',
    "backToTop.pillTitle": "Pill con texto visible",
    "backToTop.pillBody":
      "Por defecto es solo ícono y la etiqueta va recortada. El nombre accesible ya está; para dibujarlo, un consumidor destapa <code>.sk-back-to-top__label</code> y le da lugar al root.",
    "backToTop.test1": "Se renderiza oculto (<code>hidden</code>) y toma su nombre accesible del contenido una vez visible.",
    "backToTop.test2": "Se muestra al pasar el umbral y vuelve a ocultarse al subir de nuevo.",
    "backToTop.test3": "Al hacer clic devuelve la ventana al inicio, con scroll suave por defecto.",
    "backToTop.test4": "Salta de forma instantánea cuando quien lee prefiere menos movimiento.",
    "backToTop.test5": "Mueve el foco a <code>target</code> después de scrollear, sin disparar un segundo scroll.",
    "backToTop.test6": "Actúa sobre un scroller interno nombrado en vez de la ventana.",
    "backToTop.test7": "Sigue llamando al <code>onClick</code> de quien lo usa, y le permite cancelar el scroll.",
    "backToTop.test8": "Revela en o después del umbral, nunca antes.",
    "backToTop.test9": "Con umbral 0 se muestra desde el primer píxel.",
    "backToTop.test10": "Un umbral inválido cae al valor por defecto, no queda siempre prendido ni siempre apagado.",
    "backToTop.test11": "Nunca se revela con una posición de scroll no finita.",
    "backToTop.test12": "Parsea <code>data-threshold</code>, y cae al valor por defecto si viene vacío o no se puede interpretar.",
    "backToTop.test13": "Anima el scroll salvo que quien lee haya pedido menos movimiento.",
    "backToTop.test14": "Se mantiene oculto bajo el umbral y se revela al pasarlo.",
    "backToTop.test15": "Respeta un <code>data-threshold</code> personalizado.",
    "backToTop.test16": "Al hacer clic devuelve la ventana al inicio, con scroll suave por defecto.",
    "backToTop.test17": "Salta de forma instantánea cuando quien lee prefiere menos movimiento.",
    "backToTop.test18": "Mueve el foco a <code>target</code> después del scroll, sin iniciar uno segundo.",
    "backToTop.test19": "Actúa sobre un scroller interno nombrado en vez de la ventana.",
    "backToTop.test20": "Deja de sincronizar una vez limpiado (<code>off()</code>).",
    "backToTop.test21": "Se monta una sola vez por raíz autorada; una segunda llamada no hace nada.",
  },
  en: {

    "backToTop.description":
      "A button pinned to a corner that returns a scroller to its start. It appears only after the reader is past a scroll threshold and hides again on the way back.",
    "backToTop.betaBadge": "Beta",
    "backToTop.lede":
      "A long page has one move the reader makes over and over: get back to the start. The keyboard has <kbd>Home</kbd> and a trackpad has a hard flick, and neither is discoverable. A button pinned to a corner is the affordance that says the move exists.",
    "backToTop.whenTitle": "When to use it",
    "backToTop.whenBody1":
      "When the page is long and a reader who scrolled far wants back to the top without dragging the scrollbar by hand. The button ships <code>hidden</code>: with no JavaScript it takes no corner, and with it, it appears only once the reader is <code>threshold</code> pixels past the top (400 by default) and hides again on the way back.",
    "backToTop.whenBody2":
      "It is not <a href=\"/en/components/skip-link\">SkipLink</a>: that one goes first in the document, is reached by Tab before anything else, and jumps through a real anchor. This one appears late, is reached by pointer or by tabbing to the corner, and calls <code>scrollTo</code> on a scroller that may not be the document. To land on a specific section rather than the start, that is an anchor link, or <a href=\"/en/components/toc\">Toc</a>.",
    "backToTop.behaviorTitle": "The behaviour lives in both bindings, not in the markup",
    "backToTop.behaviorBody1":
      "No Zag machine covers \"reveal past a scroll threshold\", so it is written the <code>hotkey</code> way: the pure half — past the threshold?, does the scroll animate? — lives in <code>@skryensya/core/back-to-top</code> and both the Vanilla enhancer and the React component share it. Each binding owns what touches the platform: which scroller to watch, toggling <code>hidden</code> per frame, and the <code>scrollTo</code> on click.",
    "backToTop.behaviorBody2":
      "The scroll is the platform's: smooth by default, instant when the reader asked for less motion (<code>prefers-reduced-motion</code>). This preview pins <code>threshold</code> to <code>0</code> so the button shows with nothing to scroll; on a real page it stays hidden until you are a screen or two down.",
    "backToTop.demoLabel": "Back to top",
    "backToTop.optionsTitle": "Options",
    "backToTop.optionsBody":
      "<code>threshold</code>: the scroll distance before it reveals. <code>scroller</code>: a CSS selector for an inner <code>overflow</code> pane instead of the window. <code>target</code>: a selector for a focusable element up top to move focus to after the scroll, so the next Tab continues from the start rather than from a control that has hidden itself (the target has to be focusable, with <code>tabindex=\"-1\"</code> if it is a landmark or a heading).",
    "backToTop.a11yP1":
      "It is a <code>&lt;button type=\"button\"&gt;</code> with a required accessible name: the visible mark is a <code>chevron-up</code> from the bound icon set (decorative, <code>aria-hidden</code>) and the label you pass (<code>sk-back-to-top__label</code>) is clipped to a name-only box, the same technique as <code>sk-visually-hidden</code>. Required text on a <code>&lt;button&gt;</code> means the control is always named, so there is no a11y rule to evaluate: the guarantee is structural.",
    "backToTop.a11yP2":
      "Hidden is <code>visibility</code>, not <code>display</code>: the stylesheet overrides the UA <code>[hidden]</code> so the reveal can animate, and <code>visibility: hidden</code> does the semantic work — out of the accessibility tree, out of the tab order — that <code>[hidden]</code> promises. Without <code>target</code>, focus does not travel: if it matters that the next Tab starts from the top, pass it.",
    "backToTop.contractItem1":
      "In HTML: a <code>&lt;button class=\"sk-back-to-top sk-interactive\" data-sk-back-to-top hidden&gt;</code> with the placeholder <code>&lt;span class=\"sk-back-to-top__icon\"&gt;&lt;span data-sk-icon=\"chevron-up\"&gt;</code> and the label in a <code>&lt;span class=\"sk-back-to-top__label\"&gt;</code>. The enhancer mounts it on its own through <code>auto-mounting</code> (and the same pass binds the icon to the set).",
    "backToTop.contractItem2":
      "In React: <code>&lt;BackToTop&gt;Back to top&lt;/BackToTop&gt;</code>. <code>threshold</code>, <code>scroller</code> and <code>target</code> are props; the component manages <code>hidden</code> from state.",
    "backToTop.contractItem3":
      "Its stylesheet is <code>components/back-to-top.css</code>. For a pill with visible text, a consumer restores <code>.sk-back-to-top__label</code> (<code>position: static</code>, no clip) and gives the root room; the name is already correct, this only decides whether it is drawn.",
    "backToTop.demoStaticTitle": "The object",
    "backToTop.demoStaticBody":
      'With <code>threshold</code> at <code>0</code> it stays visible, so you can see the piece: a round button with a <code>chevron-up</code> from the bound icon set (Lucide on this site) and a floating-surface shadow. On hover it lifts a hair and the chevron rides up with it.',
    "backToTop.demoStaticLabel": "BackToTop, always shown",
    "backToTop.demoScrollTitle": "The behaviour",
    "backToTop.demoScrollBody":
      "This preview scrolls. Scroll down inside the box: the button pops in — fades, scales up from small, rises into place — once you are past the threshold, and clicking it carries you back to the top. Scroll back up and it hides itself.",
    "backToTop.demoScrollLabel": "BackToTop on scroll",
    "backToTop.demoScrollHint": "Scroll inside the box to see it appear.",
    "backToTop.scrollDemoP1":
      "A long page has one move the reader makes over and over: get back to the start. After a few screens of reading, someone who wants to re-read the heading or jump sections has to drag the scrollbar or reach for the Home key, and neither is visible.",
    "backToTop.scrollDemoP2":
      "A button pinned to the corner is the affordance that says the move exists. It is not there from the start: it appears once you have gone far enough to want it, and hides again once you are back. When it is not needed, it takes no corner.",
    "backToTop.scrollDemoP3":
      "The scroll is the platform's, via <code>scrollTo</code>: smooth by default, instant if you asked for less motion. With <code>target</code> it also moves focus to a focusable element up top, so the next Tab starts from the beginning rather than from a control that just hid itself.",
    "backToTop.htmlTitle": "Authored HTML",
    "backToTop.targetTitle": "Threshold and focus",
    "backToTop.targetBody":
      '<code>data-threshold</code> is the scroll distance before it appears. <code>data-target</code> is a selector for a focusable element up top: without it, focus is stranded on a button that has hidden itself; with it, the next Tab continues from the start. The target has to be focusable (<code>tabindex="-1"</code> if it is a landmark or a heading).',
    "backToTop.pillTitle": "Pill with visible text",
    "backToTop.pillBody":
      "By default it is icon-only and the label is clipped. The accessible name is already there; to draw it, a consumer un-clips <code>.sk-back-to-top__label</code> and gives the root room.",
    "backToTop.test1": "Renders hidden, and takes its accessible name from its content once shown.",
    "backToTop.test2": "Reveals once scrolled past the threshold and hides again above it.",
    "backToTop.test3": "Returns the window to the top on click, smoothly by default.",
    "backToTop.test4": "Jumps instantly when the reader prefers reduced motion.",
    "backToTop.test5": "Moves focus to <code>target</code> after scrolling, without a second scroll.",
    "backToTop.test6": "Acts on a named inner scroller instead of the window.",
    "backToTop.test7": "Still calls the consumer's <code>onClick</code>, and lets it opt out of the scroll.",
    "backToTop.test8": "Reveals at or past the threshold, never before.",
    "backToTop.test9": "Shows from the first pixel when the threshold is 0.",
    "backToTop.test10": "A broken threshold falls back to the default, not always-on or always-off.",
    "backToTop.test11": "Never reveals on a non-finite scroll position.",
    "backToTop.test12": "Parses <code>data-threshold</code>, falling back to the default on empty or unparseable input.",
    "backToTop.test13": "Animates the scroll unless the reader asked for less motion.",
    "backToTop.test14": "Stays hidden below the threshold and reveals once past it.",
    "backToTop.test15": "Honours a custom <code>data-threshold</code>.",
    "backToTop.test16": "Returns the window to the top on click, smoothly by default.",
    "backToTop.test17": "Jumps instantly when the reader prefers reduced motion.",
    "backToTop.test18": "Moves focus to <code>target</code> after the scroll, without starting a second one.",
    "backToTop.test19": "Acts on a named inner scroller instead of the window.",
    "backToTop.test20": "Stops syncing once cleaned up (<code>off()</code>).",
    "backToTop.test21": "Mounts once per authored root; a second call does nothing.",
  },
} as const;
