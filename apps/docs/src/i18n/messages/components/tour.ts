export const tourMessages = {
  es: {
    "tour.description": "Recorre la interfaz paso a paso, resaltando un elemento a la vez sin bloquear la página.",
    "tour.lede":
      "Un aro alrededor de un elemento y un diálogo <strong>no modal</strong> que lo explica. No hay fondo que tape la página, ni siquiera uno transparente: todo lo que está fuera de la caja sigue siendo clicable, desplazable y enfocable mientras el recorrido está abierto.",
    "tour.anatomyBody":
      "Un paso detenido: el aro alrededor del objetivo y, debajo, la caja con su flecha apuntando a él. Es un espécimen fijo, no un recorrido en marcha; el recorrido vivo empieza en la pestaña Uso. «Omitir tour» sólo aparece en el primer paso, en el lugar de Anterior.",
    "tour.anatomyLabel": "Anatomía de Tour",
    "tour.anatomyPreviewLabel": "Un paso de Tour, parte por parte",
    "tour.basicTitle": "Un recorrido de cuatro pasos",
    "tour.basicBody":
      "Cada paso es un elemento y una idea: su <code>target</code> (un selector), un título, una descripción breve y una ubicación preferida. El recorrido sólo empieza con <code>Tour.Trigger</code> o <code>start()</code>, nunca al cargar, y nunca avanza solo.",
    "tour.tryBody":
      "Prueba <kbd>Tab</kbd> desde el último botón de la caja (llega al elemento destacado), <kbd>Esc</kbd> desde la caja o desde el elemento, y hacer clic fuera: no cierra ni avanza. Al terminar u omitir, el disparador dice «Repetir tour».",
    "tour.missingTitle": "Objetivos ausentes",
    "tour.missingBody":
      "Esta página no tiene el filtro, así que su paso se omite: el progreso cuenta tres pasos y la caja nunca queda flotando sin un elemento al que referirse. Lo mismo ocurre si un objetivo está oculto, o si desaparece mientras el recorrido está abierto.",
    "tour.programmaticTitle": "Iniciar, cerrar y reiniciar desde código",
    "tour.programmaticBody":
      "<code>start()</code> empieza en el primer paso disponible (y no hace nada si ya está en curso), <code>restart()</code> vuelve siempre al primero, y <code>close()</code> lo cierra como descartado y devuelve el foco. También están <code>next</code>, <code>previous</code>, <code>goTo</code>, <code>skip</code>, <code>refresh</code> y <code>forget</code>.",
    "tour.vanillaTitle": "Vanilla",
    "tour.vanillaBody":
      "El enhancer lee los pasos de la lista oculta y escucha los disparadores en todo el documento. <code>getTour(id)</code> devuelve el controlador.",
    "tour.memoryTitle": "Qué recuerda",
    "tour.memoryBody":
      "Si se completó, se omitió o se cerró, en la única entrada de almacenamiento del sistema (<code>tour:&lt;id&gt;</code>). Nunca lo usa para abrirse ni para bloquear nada: sirve para que el producto decida no insistir y para que el disparador diga «Repetir tour». <code>remember={false}</code> no escribe nada; <code>forget()</code> lo borra.",
    "tour.writingTitle": "Cómo escribir los pasos",
    "tour.writingBody":
      "Tres a cinco pasos. Una idea por paso: el título nombra el elemento (no «Paso 2», que ya dice el progreso) y la descripción dice qué hace y por qué importa, en una o dos frases. Si un paso necesita más, es una página de ayuda.",
    "tour.contractItem1":
      "La caja y el aro son <code>popover=\"manual\"</code>: están en la capa superior (sin <code>z-index</code> que ganar ni <code>overflow</code> que los recorte) y sin el cierre ligero del Popover API, porque un clic fuera no debe cerrar un recorrido.",
    "tour.contractItem2":
      "La caja se coloca en el lado pedido; si no cabe, en el opuesto; luego en el otro eje; y si no cabe en ninguno, se acopla a la mitad de la pantalla donde no está el objetivo. Se reubica con scroll, resize y cambios del objetivo, y la página sólo se desplaza cuando el objetivo de un paso nuevo no está a la vista.",
    "tour.contractItem3":
      "El aro copia el radio de cada esquina del objetivo más su separación, así que una píldora tiene un aro de píldora. No cambia el layout: es una caja fija encima, con <code>pointer-events: none</code>.",
    "tour.a11yP1":
      "La caja es un <code>role=\"dialog\"</code> no modal, nombrado por su título y descrito por el progreso y la descripción. No es <code>role=\"tooltip\"</code>, porque contiene botones. No se aplica <code>aria-modal</code>, <code>inert</code> ni <code>aria-hidden</code> a la página; el aro sí es <code>aria-hidden</code>.",
    "tour.a11yItem1":
      "El foco va a Continuar al iniciar y en cada cambio de paso hecho con los controles del recorrido, así que <kbd>Enter</kbd> recorre todo el tour sin un solo <kbd>Tab</kbd>; nunca se mueve cuando el paso cambia porque el objetivo desapareció mientras trabajas en otra parte. Al cerrar vuelve al disparador, o a una alternativa si ya no está.",
    "tour.a11yItem2":
      "No hay trampa de foco: <kbd>Tab</kbd> y <kbd>Shift + Tab</kbd> salen de la caja como de cualquier región, y <kbd>Tab</kbd> desde su último botón llega al elemento destacado.",
    "tour.a11yItem3":
      "<kbd>Esc</kbd> cierra, salvo que otro lo reclame antes: un menú, un listbox o un diálogo abiertos, un control con su popup expandido o un campo de texto con algo que borrar.",
    "tour.a11yItem4":
      "Al entrar, el lector dice el nombre del diálogo (el título) y su descripción (progreso y cuerpo) una sola vez. En los pasos siguientes el foco ya está en Continuar y moverlo no dice nada nuevo, así que una región <code>aria-live=\"polite\"</code> anuncia el paso nuevo una vez; en el primer paso queda en silencio para no repetirlo.",
    "tour.a11yItem5":
      "La caja es una superficie sólida, clara y sobria derivada del acento (con un borde de acento en modo claro), con texto oscuro a 4.5:1 o más en ambos modos, y Continuar es el único botón de acento; dentro de ella el anillo de foco toma el color del texto, porque el azul de foco sobre un fondo azulado no se vería. El aro es del color de acento con un halo del fondo de la página, al menos 3:1, y distinto del anillo de foco (más grueso y más lejos). Botones compactos con área de 44 × 44 px. En colores forzados el aro usa <code>Highlight</code>. Con <code>prefers-reduced-motion</code> no hay desplazamiento animado ni deslizamiento: sólo un fundido.",
    "tour.keyboardTitle": "Teclado",
    "tour.key.tab": "Recorre los botones de la caja; desde el último (Continuar), pasa al elemento destacado.",
    "tour.key.enter": "Activa el botón enfocado (comportamiento nativo del botón).",
    "tour.key.escape": "Cierra el recorrido y devuelve el foco, si nadie más reclama la tecla.",
    "tour.verifiedTitle": "Qué se comprobó y qué no",
    "tour.verifiedBody":
      "Las pruebas automáticas cubren navegación, cierre, omisión, repetición, objetivos ausentes y ocultos, la prioridad de <kbd>Esc</kbd>, cada movimiento de foco y la memoria, en ambos bindings. No sustituyen una revisión con lector de pantalla, móvil real, zoom al 400% y movimiento reducido: pasar un análisis automático no es conformidad.",
    "tour.progressLabel": "Paso {index} de {count}",
    "tour.nextLabel": "Continuar",
    "tour.finishLabel": "Finalizar",
    "tour.previousLabel": "Anterior",
    "tour.skipLabel": "Omitir tour",
    "tour.closeLabel": "Cerrar tour",
    "tour.demo.label": "Lista de proyectos con recorrido guiado",
    "tour.demo.missingLabel": "Recorrido con un objetivo ausente",
    "tour.demo.searchLabel": "Buscar proyectos",
    "tour.demo.searchPlaceholder": "Nombre del proyecto",
    "tour.demo.filterLabel": "Estado",
    "tour.demo.filterActive": "Activos",
    "tour.demo.filterArchived": "Archivados",
    "tour.demo.newProject": "Nuevo proyecto",
    "tour.demo.start": "Iniciar tour",
    "tour.demo.repeat": "Repetir tour",
    "tour.demo.step1Title": "Búsqueda",
    "tour.demo.step1Body": "Encuentra cualquier proyecto escribiendo parte de su nombre.",
    "tour.demo.step2Title": "Filtro de estado",
    "tour.demo.step2Body": "Cambia entre proyectos activos y archivados.",
    "tour.demo.step3Title": "Nuevo proyecto",
    "tour.demo.step3Body": "Crea un proyecto desde cero. Nada se crea hasta que lo confirmes.",
    "tour.demo.step4Title": "Repetir el recorrido",
    "tour.demo.step4Body": "Este botón vuelve a abrir el recorrido cuando quieras, desde el primer paso.",
  },
  en: {
    "tour.description": "Walks through an interface step by step, highlighting one element at a time without blocking the page.",
    "tour.lede":
      "A ring around one element and a <strong>non-modal</strong> dialog that explains it. There is no backdrop covering the page, not even a transparent one: everything outside the box stays clickable, scrollable and focusable while the tour is open.",
    "tour.anatomyBody":
      "One step, held still: the ring around the target and, under it, the box with its arrow pointing at it. It is a frozen specimen, not a running tour; the live one starts in the Usage tab. \"Skip tour\" only appears on the first step, where Previous would be.",
    "tour.anatomyLabel": "Tour anatomy",
    "tour.anatomyPreviewLabel": "One Tour step, part by part",
    "tour.basicTitle": "A four-step tour",
    "tour.basicBody":
      "Each step is one element and one idea: its <code>target</code> (a selector), a title, a short description and a preferred placement. The tour starts only from <code>Tour.Trigger</code> or <code>start()</code>, never on load, and never advances on its own.",
    "tour.tryBody":
      "Try <kbd>Tab</kbd> from the box's last button (it lands on the highlighted element), <kbd>Esc</kbd> from the box or from the element, and clicking outside: it neither closes nor advances. After finishing or skipping, the trigger reads \"Repeat tour\".",
    "tour.missingTitle": "Missing targets",
    "tour.missingBody":
      "This page has no filter, so its step is skipped: the progress counts three steps and the box never floats with nothing to point at. The same happens when a target is hidden, or disappears while the tour is open.",
    "tour.programmaticTitle": "Start, close and restart from code",
    "tour.programmaticBody":
      "<code>start()</code> begins at the first available step (and does nothing while running), <code>restart()</code> always goes back to the first, and <code>close()</code> ends it as dismissed and returns focus. There are also <code>next</code>, <code>previous</code>, <code>goTo</code>, <code>skip</code>, <code>refresh</code> and <code>forget</code>.",
    "tour.vanillaTitle": "Vanilla",
    "tour.vanillaBody":
      "The enhancer reads the steps from the hidden list and listens for triggers anywhere in the document. <code>getTour(id)</code> returns the controller.",
    "tour.memoryTitle": "What it remembers",
    "tour.memoryBody":
      "Whether it was completed, skipped or closed, in the system's one storage entry (<code>tour:&lt;id&gt;</code>). It never uses that to open itself or to block anything: it is there so a product can decide not to insist, and so the trigger can read \"Repeat tour\". <code>remember={false}</code> writes nothing; <code>forget()</code> clears it.",
    "tour.writingTitle": "Writing the steps",
    "tour.writingBody":
      "Three to five steps. One idea per step: the title names the element (not \"Step 2\", which the progress already says) and the description says what it does and why it matters, in one or two sentences. A step that needs more is a help page.",
    "tour.contractItem1":
      "The box and the ring are <code>popover=\"manual\"</code>: in the top layer (no <code>z-index</code> to win, no <code>overflow</code> to clip them) and without the Popover API's light dismiss, because a click outside must not close a tour.",
    "tour.contractItem2":
      "The box goes on the requested side; if it does not fit, the opposite one; then the other axis; and when it fits on none, it docks to the half of the screen the target is not in. It follows scroll, resize and changes to the target, and the page scrolls only when a new step's target is out of view.",
    "tour.contractItem3":
      "The ring copies each of the target's corner radii plus its offset, so a pill gets a pill-shaped ring. It changes no layout: it is a fixed box on top, with <code>pointer-events: none</code>.",
    "tour.a11yP1":
      "The box is a non-modal <code>role=\"dialog\"</code>, named by its title and described by the progress and the description. It is not <code>role=\"tooltip\"</code>, because it holds buttons. No <code>aria-modal</code>, <code>inert</code> or <code>aria-hidden</code> is applied to the page; the ring itself is <code>aria-hidden</code>.",
    "tour.a11yItem1":
      "Focus goes to Continue on start and on every step change made with the tour's controls, so <kbd>Enter</kbd> walks the whole tour without a single <kbd>Tab</kbd>; it never moves when the step changes because its target vanished while you were working elsewhere. On close it returns to the trigger, or to a fallback when that is gone.",
    "tour.a11yItem2":
      "There is no focus trap: <kbd>Tab</kbd> and <kbd>Shift + Tab</kbd> leave the box like any region, and <kbd>Tab</kbd> from its last button lands on the highlighted element.",
    "tour.a11yItem3":
      "<kbd>Esc</kbd> closes it, unless something else claims the key first: an open menu, listbox or dialog, a control with its popup expanded, or a text field with something to clear.",
    "tour.a11yItem4":
      "On entry a screen reader says the dialog's name (the title) and description (progress and body) once. On later steps focus is already on Continue and moving it says nothing new, so an <code>aria-live=\"polite\"</code> region announces the new step once; on the first step it stays silent so nothing is said twice.",
    "tour.a11yItem5":
      "The box is a solid, pale, quiet surface derived from the accent (with an accent edge in light mode), with dark text at 4.5:1 or more in both modes, and Continue is its one accent button; inside it the focus ring takes the text colour, because a blue focus ring on a bluish box would not show. The ring is the accent colour with a halo of the page background, at least 3:1, and unlike the focus ring (thicker and farther out). Compact buttons with a 44 × 44 px hit area. In forced colours the ring uses <code>Highlight</code>. Under <code>prefers-reduced-motion</code> there is no animated scroll and no slide: only a fade.",
    "tour.keyboardTitle": "Keyboard",
    "tour.key.tab": "Moves through the box's buttons; from the last one (Continue), on to the highlighted element.",
    "tour.key.enter": "Activates the focused button (the button's native behaviour).",
    "tour.key.escape": "Closes the tour and returns focus, when nothing else claims the key.",
    "tour.verifiedTitle": "What was checked, and what was not",
    "tour.verifiedBody":
      "The automated tests cover navigation, closing, skipping, repeating, missing and hidden targets, Escape's priority, every focus move and the memory, in both bindings. They do not replace a pass with a screen reader, a real phone, 400% zoom and reduced motion: passing an automated scan is not conformance.",
    "tour.progressLabel": "Step {index} of {count}",
    "tour.nextLabel": "Continue",
    "tour.finishLabel": "Finish",
    "tour.previousLabel": "Previous",
    "tour.skipLabel": "Skip tour",
    "tour.closeLabel": "Close tour",
    "tour.demo.label": "A project list with a guided tour",
    "tour.demo.missingLabel": "A tour with a missing target",
    "tour.demo.searchLabel": "Search projects",
    "tour.demo.searchPlaceholder": "Project name",
    "tour.demo.filterLabel": "Status",
    "tour.demo.filterActive": "Active",
    "tour.demo.filterArchived": "Archived",
    "tour.demo.newProject": "New project",
    "tour.demo.start": "Take the tour",
    "tour.demo.repeat": "Repeat tour",
    "tour.demo.step1Title": "Search",
    "tour.demo.step1Body": "Find any project by typing part of its name.",
    "tour.demo.step2Title": "Status filter",
    "tour.demo.step2Body": "Switch between active and archived projects.",
    "tour.demo.step3Title": "New project",
    "tour.demo.step3Body": "Create a project from scratch. Nothing is created until you confirm.",
    "tour.demo.step4Title": "Repeat the tour",
    "tour.demo.step4Body": "This button opens the tour again whenever you like, from the first step.",
  },
} as const;
