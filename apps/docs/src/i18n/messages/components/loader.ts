export const loaderMessages = {
  es: {
    "demo.loader.sizesLabel": "Tamaños de Loader",
    "demo.loader.speedsLabel": "Velocidades de Loader",
    "demo.loader.size.sm": "Dentro de controles",
    "demo.loader.size.md": "Estado inline",
    "demo.loader.size.lg": "Región o carga inicial",
    "demo.loader.speed.fast": "Ciclo corto",
    "demo.loader.speed.normal": "Ciclo base",
    "demo.loader.speed.slow": "Ciclo largo",
    "demo.loader.loadingResults": "Cargando resultados",
    "demo.loader.syncing": "Sincronizando en segundo plano",
    "demo.loader.simulation": "Simulación de carga",
    "demo.loader.busy": "Cargando resultados…",
    "demo.loader.ready": "Resultados listos.",
    "demo.loader.start": "Simular carga",
    "demo.loader.contexts": "Loader en contexto",
    "demo.loader.page.title": "Página",
    "demo.loader.page.body": "Carga una vista completa.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Carga contenido dentro de una superficie.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserva espacio junto a una acción.",

    "loaderPage.description": "Loader: simulación de carga indeterminada, patrones de uso, tamaños y velocidad.",
    "loaderPage.lede":
      "Loader comunica trabajo <strong>indeterminado</strong>: la operación está activa, pero no existe una fracción honesta que mostrar. El sistema ofrece dos diseños circulares y dos lineales con las mismas reglas semánticas para componer acciones, regiones y cargas iniciales.",
    "loaderPage.calloutBody":
      "El contrato contiene <code>ring</code>, <code>sweep</code>, <code>bars</code> y <code>dots</code>. Son diseños visuales del mismo Loader, no componentes distintos.",
    "loaderPage.simTitle": "Simulación",
    "loaderPage.simBody":
      "Un único contenedor cambia de ocupado a listo. No necesita una pantalla, métricas ni una card exterior: sólo la marca, el texto que explica el trabajo y una acción para repetirlo.",
    "loaderPage.simLabel": "Análisis de mezcla",
    "loaderPage.simNote": "Ocupado → listo",
    "loaderPage.simBody2":
      "<code>bars</code> aporta movimiento sin fingir un porcentaje. El contenedor conserva <code>aria-busy</code> y el estado visible aporta el anuncio accesible.",
    "loaderPage.contextsTitle": "Patrones completos",
    "loaderPage.contextsLabel": "Loader en contexto",
    "loaderPage.contextsBody":
      "Loader posee la marca, no la superficie ni el ciclo de vida. El contexto decide dónde vive, quién aporta el nombre accesible y qué región conserva <code>aria-busy=\"true\"</code>.",
    "loaderPage.contextsNote": "Acción local · actualización de región · carga inicial",
    "loaderPage.contextsItem1": "En un botón, Loader es decorativo: «Guardando…» ya nombra el estado.",
    "loaderPage.contextsItem2": "En una actualización local, conserva el contenido previo y marca la región como ocupada.",
    "loaderPage.contextsItem3": "En una carga inicial, acompaña la marca con un título y una explicación; evita una pantalla vacía.",
    "loaderPage.sizeTitle": "Tamaño",
    "loaderPage.sizeBody":
      "Usa <code>sm</code> dentro de controles, <code>md</code> junto a texto y <code>lg</code> cuando la marca ocupa una región propia. El tamaño no comunica cuánto trabajo queda.",
    "loaderPage.sizeLabel": "Tamaños de Loader",
    "loaderPage.speedTitle": "Velocidad",
    "loaderPage.speedBody":
      "<code>speed</code> reescribe el styling hook <code>--sk-loader-duration</code> desde tokens de intención (<code>--motion-loading-duration*</code>), no desde milisegundos crudos. Elige la cadencia por presencia visual, no como promesa sobre la duración real de la operación.",
    "loaderPage.speedLabel": "Velocidades de Loader",
    "loaderPage.speedOverrideLabel": "override local",
    "loaderPage.hookPlaygroundTitle": "Pruébalo",
    "loaderPage.hookPlaygroundBody":
      "Cada control mueve un solo hook sobre esta misma marca. Es una prueba de concepto: sin encabezado, sin código, sólo la variable y su efecto.",
    "loaderPage.hookPlaygroundLabel": "Playground de hooks de Loader",
    "loaderPage.semanticsTitle": "Semántica",
    "loaderPage.semanticsItem1": 'Con nombre accesible usa <code>role="status"</code>; React lo escribe al pasar <code>label</code>.',
    "loaderPage.semanticsItem2": "Sin <code>label</code>, React lo vuelve decorativo para acompañar texto sin duplicarlo.",
    "loaderPage.semanticsItem3": 'Marca la región afectada con <code>aria-busy="true"</code>; Loader no controla la operación.',
    "loaderPage.semanticsItem4":
      'Si conoces el avance, usa <a href="/components/progress">Progress</a>, no una velocidad distinta.',
    "loaderPage.reducedTitle": "Movimiento reducido",
    "loaderPage.reducedBody":
      "Los cuatro diseños conservan una silueta reconocible y detienen todo movimiento con <code>prefers-reduced-motion: reduce</code>. El texto de estado permanece: reducir movimiento no puede convertir una operación pendiente en una señal invisible.",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code> y <code>label</code>. Los valores por defecto son <code>md</code>, <code>ring</code> y <code>normal</code>.",
    "loaderPage.test1": "Expone el trabajo indeterminado con nombre como un status cortés (<code>polite</code>).",
    "loaderPage.test2": "Escribe los ejes ortogonales de variante y velocidad en la raíz.",
    "loaderPage.test3": "Queda decorativo cuando el control que lo rodea ya aporta el significado de estado.",
  },
  en: {
    "demo.loader.sizesLabel": "Loader sizes",
    "demo.loader.speedsLabel": "Loader speeds",
    "demo.loader.size.sm": "Inside controls",
    "demo.loader.size.md": "Inline status",
    "demo.loader.size.lg": "Region or initial load",
    "demo.loader.speed.fast": "Short cycle",
    "demo.loader.speed.normal": "Base cycle",
    "demo.loader.speed.slow": "Long cycle",
    "demo.loader.loadingResults": "Loading results",
    "demo.loader.syncing": "Syncing in the background",
    "demo.loader.simulation": "Loading simulation",
    "demo.loader.busy": "Loading results…",
    "demo.loader.ready": "Results are ready.",
    "demo.loader.start": "Simulate loading",
    "demo.loader.contexts": "Loader in context",
    "demo.loader.page.title": "Page",
    "demo.loader.page.body": "Loading a complete view.",
    "demo.loader.card.title": "Card",
    "demo.loader.card.body": "Loading content inside a surface.",
    "demo.loader.control.title": "Control",
    "demo.loader.control.body": "Reserving space beside an action.",

    "loaderPage.description": "Loader: indeterminate loading simulation, usage patterns, sizes, and speed.",
    "loaderPage.lede":
      "Loader communicates <strong>indeterminate</strong> work: the operation is active, but there is no honest fraction to show. The system offers two circular designs and two linear ones, with the same semantic rules for composing actions, regions, and initial loads.",
    "loaderPage.calloutBody":
      "The contract carries <code>ring</code>, <code>sweep</code>, <code>bars</code>, and <code>dots</code>. They are visual designs of the same Loader, not separate components.",
    "loaderPage.simTitle": "Simulation",
    "loaderPage.simBody":
      "A single container switches from busy to ready. It needs no screen, no metrics, no outer card: just the mark, the text explaining the work, and an action to run it again.",
    "loaderPage.simLabel": "Blend analysis",
    "loaderPage.simNote": "Busy → ready",
    "loaderPage.simBody2":
      "<code>bars</code> adds motion with no percentage to fake. The container carries <code>aria-busy</code>, and the visible state provides the accessible announcement.",
    "loaderPage.contextsTitle": "Full patterns",
    "loaderPage.contextsLabel": "Loader in context",
    "loaderPage.contextsBody":
      "Loader owns the mark, not the surface or the lifecycle. Context decides where it lives, who supplies the accessible name, and which region carries <code>aria-busy=\"true\"</code>.",
    "loaderPage.contextsNote": "Local action · region update · initial load",
    "loaderPage.contextsItem1": "In a button, Loader is decorative: \"Saving…\" already names the state.",
    "loaderPage.contextsItem2": "In a local update, it keeps the previous content and marks the region busy.",
    "loaderPage.contextsItem3": "In an initial load, it pairs the mark with a title and an explanation; it avoids a blank screen.",
    "loaderPage.sizeTitle": "Size",
    "loaderPage.sizeBody":
      "Use <code>sm</code> inside controls, <code>md</code> beside text, and <code>lg</code> when the mark owns its own region. Size does not communicate how much work is left.",
    "loaderPage.sizeLabel": "Loader sizes",
    "loaderPage.speedTitle": "Speed",
    "loaderPage.speedBody":
      "<code>speed</code> rewrites the <code>--sk-loader-duration</code> styling hook from intent tokens (<code>--motion-loading-duration*</code>), not raw milliseconds. Choose the cadence for visual presence, not as a promise about the operation's real duration.",
    "loaderPage.speedLabel": "Loader speeds",
    "loaderPage.speedOverrideLabel": "local override",
    "loaderPage.hookPlaygroundTitle": "Try it",
    "loaderPage.hookPlaygroundBody":
      "Each control moves a single hook on this same mark. It's a proof of concept: no header, no code, just the variable and its effect.",
    "loaderPage.hookPlaygroundLabel": "Loader hook playground",
    "loaderPage.semanticsTitle": "Semantics",
    "loaderPage.semanticsItem1": 'With an accessible name it uses <code>role="status"</code>; React writes it when you pass <code>label</code>.',
    "loaderPage.semanticsItem2": "With no <code>label</code>, React makes it decorative, to pair with text without duplicating it.",
    "loaderPage.semanticsItem3": 'It marks the affected region with <code>aria-busy="true"</code>; Loader does not control the operation.',
    "loaderPage.semanticsItem4":
      'If you know the progress, use <a href="/en/components/progress">Progress</a>, not a different speed.',
    "loaderPage.reducedTitle": "Reduced motion",
    "loaderPage.reducedBody":
      "All four designs keep a recognizable silhouette and stop all motion under <code>prefers-reduced-motion: reduce</code>. The status text stays: reducing motion cannot turn a pending operation into an invisible signal.",
    "loaderPage.reactBody":
      "Props: <code>size</code>, <code>variant</code>, <code>speed</code>, and <code>label</code>. The defaults are <code>md</code>, <code>ring</code>, and <code>normal</code>.",
    "loaderPage.test1": "Exposes labelled indeterminate work as a polite status.",
    "loaderPage.test2": "Writes orthogonal variant and speed axes onto the root.",
    "loaderPage.test3": "Stays decorative when the surrounding control already carries the status meaning.",
  },
} as const;
