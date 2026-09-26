export const presenceMessages = {
  es: {
    "presence.anatomyLabel": "Anatomía de Presence",
    "presence.anatomyPreviewLabel": "Presence, parte por parte",
    "presence.anatomyBody": "Una sola parte: la raíz que entra y sale. Lo que envuelve es tuyo, por eso la etiqueta dice <code>&gt; *</code> y no inventa una parte de contenido.",
    "presence.description": "Contenido que anima su salida antes de irse.",
    "presence.betaBadge": "Beta",

    "presence.lede":
      "Presence muestra y oculta contenido con una animación de entrada y otra de salida. El estado es <code>hidden</code>: al quitarlo, el contenido aparece y sube; al ponerlo, se desvanece y baja, y recién <em>después</em> sale del layout. La animación es CSS puro, la misma técnica que usan Dialog y Popover para cerrarse.",

    "presence.whenTitle": "Cuándo usarlo",
    "presence.whenItem1": "Un aviso, un panel o un bloque de opciones que aparece según lo que eligió la persona",
    "presence.whenItem2": "En React, contenido que hoy se renderiza con <code>{open && …}</code> y desaparece de golpe",
    "presence.whenItem3":
      "No para diálogos, popovers, menús ni tooltips: esos ya animan su propia entrada y salida. Tampoco para secciones que se expanden; eso es Details o Accordion",

    "presence.noticeHeading": "Un aviso que entra y sale solo",
    "presence.noticeIntro":
      "Guardar muestra la confirmación, y un temporizador la cierra a los dos segundos y medio: la entrada y la salida sin que nadie tenga que cerrarla. Guarda dos veces seguidas y el aviso se queda, porque cada clic reinicia la cuenta.",
    "presence.noticeLabel": "Aviso de guardado con salida automática",
    "presence.noticeSave": "Guardar cambios",
    "presence.noticeTitle": "Cambios guardados",
    "presence.noticeBody": "Tu perfil ya está actualizado.",

    "presence.fieldsHeading": "Campos que aparecen según una opción",
    "presence.fieldsIntro":
      "El caso más común en un formulario: un ajuste que revela los campos que necesita. El Switch escribe <code>hidden</code> en cada cambio. Mientras están ocultos, los campos siguen en el DOM y el formulario los envía; si no deben enviarse, desactívalos junto con <code>hidden</code>, o usa <code>unmountOnExit</code> en React.",
    "presence.fieldsLabel": "Campos de dirección condicionales",
    "presence.fieldsSwitch": "Enviar a otra dirección",
    "presence.fieldsStreet": "Calle y número",
    "presence.fieldsCity": "Ciudad",

    "presence.tuningHeading": "Ajustar el movimiento",
    "presence.tuningIntro":
      "Los seis styling hooks cambian la entrada y la salida por instancia. De izquierda a derecha: los valores por defecto, un fundido sin desplazamiento (<code>--sk-presence-*-distance: 0px</code>) y una versión más lenta que viaja más. En React, <code>Presence</code> lee la duración del estilo computado, así que espera la salida más larga sin que haya que decírselo. Pulsa dos veces rápido: cada transición se revierte desde donde estaba, sin saltos.",
    "presence.tuningLabel": "Tres movimientos con styling hooks",
    "presence.tuningToggle": "Mostrar u ocultar",
    "presence.tuningDefault": "Por defecto",
    "presence.tuningFade": "Solo fundido",
    "presence.tuningSlow": "Lento y más lejos",

    "presence.reactTitle": "En React",
    "presence.reactBody":
      "<code>{open && &lt;Panel /&gt;}</code> desmonta el contenido en el mismo commit, así que no queda nada que animar. <code>Presence</code> mantiene el contenedor montado, pone <code>hidden</code> y espera a que termine la salida antes de soltar los hijos. Cuánto esperar lo lee del estilo computado, así que respeta tus styling hooks y tus propios <code>@keyframes</code> sin que haga falta pasarle una duración.",
    "presence.reactItem1": "<code>present</code>: si el contenido se muestra (por defecto <code>true</code>)",
    "presence.reactItem2": "<code>unmountOnExit</code>: desmonta los hijos cuando termina la salida, en vez de dejarlos ocultos en el DOM",
    "presence.reactItem3": "<code>lazyMount</code>: no renderiza los hijos hasta la primera vez que <code>present</code> es <code>true</code>",
    "presence.reactItem4": "<code>onExitComplete</code>: se llama cuando la salida terminó de pintarse",

    "presence.vanillaTitle": "Sin framework",
    "presence.vanillaBody":
      "En markup escrito a mano no hay nada que montar: <code>element.hidden = true</code> ya es un cierre completo. <code>setPresent</code> escribe <code>hidden</code> y <code>data-state</code> juntos y devuelve una promesa que se resuelve cuando termina la salida, para quitar el nodo o mover el foco después.",

    "presence.notesTitle": "Notas de implementación",
    "presence.notesItem1":
      "<code>transition-behavior: allow-discrete</code> sobre <code>display</code> mantiene el contenido en pantalla durante la salida, y <code>@starting-style</code> le da un punto de partida a la entrada. Un navegador sin soporte muestra y oculta igual, sin la animación",
    "presence.notesItem2":
      "Con <code>prefers-reduced-motion</code>, los tokens de entrada y salida ya quitan el desplazamiento y dejan un fundido corto; Presence no necesita reglas propias",
    "presence.notesItem3":
      "El contenedor nunca se desmonta en React: es lo que la hoja anima, así que tiene que existir en el frame en que llega <code>hidden</code>",
    "presence.notesItem4":
      "Mientras sale, el contenido sigue en el árbol de accesibilidad; <code>display: none</code> lo saca cuando la salida termina. Si el botón que lo controla expone <code>aria-expanded</code>, actualízalo en el mismo momento en que cambias <code>hidden</code>",
  },
  en: {
    "presence.anatomyLabel": "Presence anatomy",
    "presence.anatomyPreviewLabel": "Presence, part by part",
    "presence.anatomyBody": "One part: the root that enters and leaves. What it wraps is yours, which is why the label reads <code>&gt; *</code> instead of inventing a content part.",
    "presence.description": "Content that animates its exit before it leaves.",
    "presence.betaBadge": "Beta",

    "presence.lede":
      "Presence shows and hides content with an enter animation and an exit animation. Its state is <code>hidden</code>: remove it and the content fades and rises in; set it and the content fades and falls out, and only <em>then</em> leaves the layout. The animation is plain CSS, the same technique Dialog and Popover use to close.",

    "presence.whenTitle": "When to use it",
    "presence.whenItem1": "A notice, a panel or a set of options that appears depending on what the person chose",
    "presence.whenItem2": "In React, content currently rendered with <code>{open && …}</code> that vanishes in a single frame",
    "presence.whenItem3":
      "Not for dialogs, popovers, menus or tooltips: those already animate their own enter and exit. Not for sections that expand either; that is Details or Accordion",

    "presence.noticeHeading": "A notice that comes and goes on its own",
    "presence.noticeIntro":
      "Saving shows the confirmation, and a timer closes it after two and a half seconds: the enter and the exit without anyone closing it. Save twice in a row and the notice stays, because each click restarts the countdown.",
    "presence.noticeLabel": "Save notice with an automatic exit",
    "presence.noticeSave": "Save changes",
    "presence.noticeTitle": "Changes saved",
    "presence.noticeBody": "Your profile is up to date.",

    "presence.fieldsHeading": "Fields that depend on a setting",
    "presence.fieldsIntro":
      "The most common case in a form: a setting that reveals the fields it needs. The Switch writes <code>hidden</code> on every change. While hidden, the fields are still in the DOM and the form still submits them; if they should not be sent, disable them along with <code>hidden</code>, or use <code>unmountOnExit</code> in React.",
    "presence.fieldsLabel": "Conditional address fields",
    "presence.fieldsSwitch": "Ship to a different address",
    "presence.fieldsStreet": "Street and number",
    "presence.fieldsCity": "City",

    "presence.tuningHeading": "Tuning the motion",
    "presence.tuningIntro":
      "The six styling hooks change the enter and the exit per instance. Left to right: the defaults, a fade with no travel (<code>--sk-presence-*-distance: 0px</code>), and a slower version that travels further. In React, <code>Presence</code> reads the duration from computed style, so it waits for the longer exit without being told. Click twice quickly: each transition reverses from where it was, with no jump.",
    "presence.tuningLabel": "Three motions through styling hooks",
    "presence.tuningToggle": "Show or hide",
    "presence.tuningDefault": "Default",
    "presence.tuningFade": "Fade only",
    "presence.tuningSlow": "Slower, further",

    "presence.reactTitle": "In React",
    "presence.reactBody":
      "<code>{open && &lt;Panel /&gt;}</code> unmounts the content in the same commit, so nothing is left to animate. <code>Presence</code> keeps the host mounted, sets <code>hidden</code>, and waits for the exit to finish before letting the children go. How long to wait is read from computed style, so it follows your styling hooks and your own <code>@keyframes</code> without being handed a duration.",
    "presence.reactItem1": "<code>present</code>: whether the content is shown (default <code>true</code>)",
    "presence.reactItem2": "<code>unmountOnExit</code>: unmount the children once the exit ends, instead of keeping them hidden in the DOM",
    "presence.reactItem3": "<code>lazyMount</code>: do not render the children until the first time <code>present</code> is <code>true</code>",
    "presence.reactItem4": "<code>onExitComplete</code>: called once the exit has finished painting",

    "presence.vanillaTitle": "Without a framework",
    "presence.vanillaBody":
      "Authored markup has nothing to mount: <code>element.hidden = true</code> is already a complete close. <code>setPresent</code> writes <code>hidden</code> and <code>data-state</code> together and returns a promise that resolves when the exit is over, so you can remove the node or move focus afterwards.",

    "presence.notesTitle": "Implementation notes",
    "presence.notesItem1":
      "<code>transition-behavior: allow-discrete</code> on <code>display</code> keeps the content on screen for the exit, and <code>@starting-style</code> gives the enter somewhere to start from. A browser without support still shows and hides, just without the motion",
    "presence.notesItem2":
      "Under <code>prefers-reduced-motion</code>, the enter and exit tokens already drop the travel and keep a short fade; Presence needs no rules of its own",
    "presence.notesItem3":
      "In React the host is never unmounted: it is what the stylesheet animates, so it has to exist on the frame <code>hidden</code> lands",
    "presence.notesItem4":
      "While it leaves, the content is still in the accessibility tree; <code>display: none</code> removes it once the exit ends. If the button that controls it exposes <code>aria-expanded</code>, update it at the same moment you change <code>hidden</code>",
  },
} as const;
