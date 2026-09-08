export const accordionMessages = {
  es: {
    "demo.accordion.detailsLabel": "Configuración de despliegue",
    "demo.accordion.environment.title": "Entorno",
    "demo.accordion.environment.description": "Producción · Fráncfort",
    "demo.accordion.environment.p1": "Node 24 corre en tres réplicas detrás del balanceador de Fráncfort. El tráfico se reparte por round-robin y una réplica se recicla sola si falla dos health checks seguidos.",
    "demo.accordion.environment.p2": "Los secretos se inyectan en el arranque desde el vault regional, así que ningún valor sensible queda en la imagen ni en el log de build.",
    "demo.accordion.runtime.title": "Runtime",
    "demo.accordion.runtime.description": "Versión y región",
    "demo.accordion.runtime.p1": "Node 24 sobre el pool compartido de Fráncfort. Cada despliegue reserva dos vCPU y 512 MB, con autoscaling hasta seis réplicas cuando la cola de peticiones supera el umbral.",
    "demo.accordion.runtime.p2a": "El healthcheck pega a ",
    "demo.accordion.runtime.p2code": "/status",
    "demo.accordion.runtime.p2b": " cada diez segundos; tres fallos seguidos sacan la réplica del balanceador sin cortar el tráfico en vuelo.",
    "demo.accordion.rollout.title": "Rollout",
    "demo.accordion.rollout.description": "Canary por porcentaje",
    "demo.accordion.rollout.p1": "El canary sube en tres tramos, 10%, 50% y 100%, y espera a que las métricas de error y latencia se mantengan estables antes de avanzar a cada tramo.",
    "demo.accordion.rollout.p2": "Si un tramo degrada, el rollout se detiene solo y avisa al canal de guardia: nada avanza sin luz verde.",
    "demo.accordion.rollback.title": "Rollback",
    "demo.accordion.rollback.description": "Versión estable anterior",
    "demo.accordion.rollback.p1": "Restaura v2.18.4 si el canary falla las comprobaciones.",

    /*
     * The Accordion page's own copy: one shared component (AccordionPage.astro) renders both
     * locales, so every string it needs a `t()` key rather than a hand-copied twin in a second
     * .astro file. Grouped here as its own block, the same shape `demo.*` already uses per demo.
     */
    "accordion.description": "Una o varias divulgaciones Tile coordinadas en un solo marco.",
    "accordion.intro":
      'Si el estado puede vivir en el HTML y te alcanza con un grupo exclusivo nativo, la opción más simple es {detailsLink}, al final de esta página. Elige Accordion cuando necesites valor controlado, <code>multiple</code> o escuchar los cambios de estado.',
    "accordion.detailsNativoLabel": "Details nativo",
    "accordion.iconsNote":
      'Los chevrons son placeholders (<code>&lt;span data-sk-icon="chevron-*"&gt;</code>): ningún componente monta un set de iconos por vos, así que hace falta esta línea además.',
    "accordion.oneItemTitle": "Accordion de un solo item",
    "accordion.oneItemBody":
      "Para una divulgación aislada, usa Accordion con un único item: la raíz aporta el marco y el Tile conserva la superficie y el state layer.",
    "accordion.oneItemLabel": "Accordion de un item",
    "accordion.exclusiveTitle": "Accordion de grupo exclusivo",
    "accordion.exclusiveBody":
      '<code>data-type="single"</code> en HTML, <code>type="single"</code> en React, mantiene como máximo un item abierto. Con <code>data-collapsible="false"</code> o <code>collapsible={false}</code>, el item abierto no puede cerrarse.',
    "accordion.exclusiveLabel": "Accordion single",
    "accordion.multipleTitle": "Accordion de grupo múltiple",
    "accordion.multipleBody":
      '<code>type="multiple"</code> conserva cada disclosure de forma independiente.',
    "accordion.multipleLabel": "Accordion multiple",
    "accordion.contractTitle": "Contrato",
    "accordion.contractSelection":
      'Abrir un item no pinta el borde de selección: eso queda para checkbox y radio.',
    "accordion.contractRest": "El resto del contrato (partes, opciones, valores por defecto y qué acepta cada slot) sale del contrato compilado y vive en {reference}.",
    "accordion.contractEvent":
      'El estado se escucha por evento sobre la raíz, no por callback: <code>sk:accordionvaluechange</code>, con el valor en <code>event.detail.value</code>.',
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> y <code>&lt;summary&gt;</code> ya son una divulgación accesible de la plataforma. Comparte un atributo <code>name</code> entre siblings para que el navegador mantenga un único item abierto: un accordion nativo, sin máquina ni <code>@skryensya/vanilla</code>.',
    "accordion.decisionHeadNeed": "Necesitas",
    "accordion.decisionHeadUse": "Usa",
    "accordion.decisionRow1Need": "Que funcione antes de que cargue cualquier script, o sin JavaScript",
    "accordion.decisionRow1Use": "Details nativo",
    "accordion.decisionRow2Need": "Un grupo exclusivo simple: alcanza con compartir <code>name</code>",
    "accordion.decisionRow2Use": "Details nativo",
    "accordion.decisionRow3Need": "Mantener varias secciones abiertas a la vez",
    "accordion.decisionRow3Use": "Accordion (<code>multiple</code>)",
    "accordion.decisionRow4Need": "Fijar o leer el valor abierto desde afuera: estado, props, otro componente",
    "accordion.decisionRow4Use": "Accordion",
    "accordion.decisionRow5Need": "Escuchar cuándo cambia, para sincronizar con el resto de la UI",
    "accordion.decisionRow5Use": "Accordion",
    "accordion.decisionRow6Need": "Garantizar la misma transición animada en cualquier navegador",
    "accordion.decisionRow6Use": "Accordion",
    "accordion.nativeBody":
      'Comparte los mismos tokens que Tile (título, descripción, chevron), así el grupo se ve igual sin componer un Tile adentro.',
    "accordion.nativePreviewLabel": "Details con name compartido",
    "accordion.nativeInstallTitle": "Instalar sólo Details",
    "accordion.nativeContractTitle": "Contrato nativo",
    "accordion.nativeContractItem1":
      'El primer hijo interactivo de cada <code>&lt;details&gt;</code> es su <code>&lt;summary&gt;</code>.',
    "accordion.nativeContractItem2":
      'El atributo <code>open</code> declara el estado inicial en HTML.',
    "accordion.nativeContractItem3":
      'El mismo <code>name</code> entre siblings hace exclusivo el grupo; sin <code>name</code>, cada disclosure es independiente.',
    "accordion.nativeContractItem4":
      'El navegador cambia <code>open</code>; no hay un valor controlado ni evento del sistema que escuchar.',
    "accordion.nativeContractItem5":
      'El chevron se pinta solo dentro de <code>&lt;summary&gt;</code>: reemplaza la marca nativa (<code>&lt;summary&gt;</code> apaga el triángulo del navegador) y alterna con CSS puro sobre <code>details[open]</code>, sin script propio.',
    "accordion.a11yTitle": "Accesibilidad",
    "accordion.a11yP1":
      'Cada trigger es un <code>&lt;button&gt;</code> nativo: Enter y Espacio lo activan sin script propio, y su <code>aria-expanded</code> (escrito por la máquina, nunca a mano) es lo único que anuncia el estado. El chevron es <code>aria-hidden="true"</code>: es la misma información dicha dos veces, y solo una debe llegar al lector de pantalla.',
    "accordion.a11yP2":
      "<kbd>Tab</kbd> y <kbd>Shift</kbd>+<kbd>Tab</kbd> mueven el foco entre triggers en el orden normal de la página: el patrón base que la APG de ARIA describe para un accordion no exige más que eso. Flechas, <kbd>Home</kbd> y <kbd>End</kbd> entre triggers son una mejora opcional que este componente no implementa hoy. Abrir un item no le quita el foco a su trigger ni se lo da al contenido: el recorrido con teclado sigue siendo el mismo, igual que con el mouse.",
    "accordion.a11yP3":
      '{detailsLink} no tiene nada de esto porque no lo necesita: un <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> es una divulgación accesible de la plataforma, con su propio manejo de foco y teclado ya resuelto por el navegador.',

    "accordion.testReact1":
      "En modo single, abrir un ítem cierra el anterior y dispara onValueChange con el nuevo valor.",
    "accordion.testReact2":
      "En modo multiple, abrir un ítem no cierra los demás abiertos.",
    "accordion.testReact3":
      'Un ítem trae las clases correctas (<code class="sk-code">sk-tile--expandable</code>, sin <code class="sk-code">--interactive</code>) y <code class="sk-code">aria-expanded</code> alterna al hacer click en el trigger.',
    "accordion.testReact4":
      'Cada trigger queda envuelto en un <code class="sk-code">role="heading"</code> con <code class="sk-code">aria-level</code> (3 por defecto, configurable), para que un lector de pantalla que navega por headings encuentre las secciones.',
    "accordion.testVanilla1":
      "En modo single, abrir un ítem cierra el anterior (animado) y emite el evento sk:accordionvaluechange.",
    "accordion.testVanilla2":
      "En modo multiple, los ítems se abren de forma independiente.",
  },
  en: {
    "demo.accordion.detailsLabel": "Deployment settings",
    "demo.accordion.environment.title": "Environment",
    "demo.accordion.environment.description": "Production · Frankfurt",
    "demo.accordion.environment.p1": "Node 24 runs in three replicas behind the Frankfurt balancer. Traffic is distributed round-robin and a replica recycles itself if it fails two health checks in a row.",
    "demo.accordion.environment.p2": "Secrets are injected at boot from the regional vault, so no sensitive value is left in the image or build log.",
    "demo.accordion.runtime.title": "Runtime",
    "demo.accordion.runtime.description": "Version and region",
    "demo.accordion.runtime.p1": "Node 24 on the Frankfurt shared pool. Each deployment reserves two vCPUs and 512 MB, with autoscaling up to six replicas when the request queue exceeds the threshold.",
    "demo.accordion.runtime.p2a": "The healthcheck hits ",
    "demo.accordion.runtime.p2code": "/status",
    "demo.accordion.runtime.p2b": " every ten seconds; three failures in a row take the replica out of the balancer without cutting off in-flight traffic.",
    "demo.accordion.rollout.title": "Rollout",
    "demo.accordion.rollout.description": "Canary by percentage",
    "demo.accordion.rollout.p1": "The canary rises in three legs, 10%, 50% and 100%, and waits for the error and latency metrics to remain stable before advancing to each leg.",
    "demo.accordion.rollout.p2": "If a section degrades, the rollout stops by itself and notifies the guard channel: nothing advances without a green light.",
    "demo.accordion.rollback.title": "Rollback",
    "demo.accordion.rollback.description": "Previous stable version",
    "demo.accordion.rollback.p1": "Restore v2.18.4 if the canary fails checks.",

    "accordion.description": "One or more Tile disclosures coordinated into a single frame.",
    "accordion.intro":
      'If the state can live in HTML and a native exclusive group is enough, the simplest option is {detailsLink}, at the end of this page. Choose Accordion when you need a controlled value, <code>multiple</code>, or to listen for state changes.',
    "accordion.detailsNativoLabel": "Native details",
    "accordion.iconsNote":
      'Chevrons are placeholders (<code>&lt;span data-sk-icon="chevron-*"&gt;</code>): no component mounts an icon set for you, so this line is needed too.',
    "accordion.oneItemTitle": "Accordion with a single item",
    "accordion.oneItemBody":
      "For an isolated disclosure, use Accordion with a single item: the root provides the frame and the Tile keeps the surface and state layer.",
    "accordion.oneItemLabel": "Accordion of one item",
    "accordion.exclusiveTitle": "Accordion as an exclusive group",
    "accordion.exclusiveBody":
      '<code>data-type="single"</code> in HTML, <code>type="single"</code> in React, keeps at most one item open. With <code>data-collapsible="false"</code> or <code>collapsible={false}</code>, the open item cannot be closed.',
    "accordion.exclusiveLabel": "Accordion single",
    "accordion.multipleTitle": "Accordion as a multiple group",
    "accordion.multipleBody":
      '<code>type="multiple"</code> keeps each disclosure independent.',
    "accordion.multipleLabel": "Accordion multiple",
    "accordion.contractTitle": "Contract",
    "accordion.contractSelection":
      "Opening an item does not paint the selection border: that is for checkbox and radio.",
    "accordion.contractRest": "The rest of the contract (parts, options, defaults, and what each slot accepts) comes from the compiled contract and lives in {reference}.",
    "accordion.contractEvent":
      'State is heard through an event on the root, not a callback: <code>sk:accordionvaluechange</code>, with the value on <code>event.detail.value</code>.',
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> are already an accessible platform disclosure. Share a <code>name</code> attribute between siblings so the browser keeps a single item open: a native accordion, with no machine and no <code>@skryensya/vanilla</code>.',
    "accordion.decisionHeadNeed": "You need",
    "accordion.decisionHeadUse": "Use",
    "accordion.decisionRow1Need": "It has to work before any script loads, or without JavaScript at all",
    "accordion.decisionRow1Use": "Native details",
    "accordion.decisionRow2Need": "A simple exclusive group: sharing <code>name</code> is enough",
    "accordion.decisionRow2Use": "Native details",
    "accordion.decisionRow3Need": "Keep several sections open at once",
    "accordion.decisionRow3Use": "Accordion (<code>multiple</code>)",
    "accordion.decisionRow4Need": "Set or read the open value from outside: state, props, another component",
    "accordion.decisionRow4Use": "Accordion",
    "accordion.decisionRow5Need": "Listen for when it changes, to sync with the rest of the UI",
    "accordion.decisionRow5Use": "Accordion",
    "accordion.decisionRow6Need": "Guarantee the same animated transition in every browser",
    "accordion.decisionRow6Use": "Accordion",
    "accordion.nativeBody":
      'It shares the same tokens as Tile (title, description, chevron), so the group looks the same without composing a Tile inside it.',
    "accordion.nativePreviewLabel": "Details with a shared name",
    "accordion.nativeInstallTitle": "Install only Details",
    "accordion.nativeContractTitle": "Native contract",
    "accordion.nativeContractItem1":
      'The first interactive child of each <code>&lt;details&gt;</code> is its <code>&lt;summary&gt;</code>.',
    "accordion.nativeContractItem2":
      'The <code>open</code> attribute declares the initial state in HTML.',
    "accordion.nativeContractItem3":
      'The same <code>name</code> between siblings makes the group exclusive; without <code>name</code>, each disclosure is independent.',
    "accordion.nativeContractItem4":
      'The browser changes <code>open</code>; there is no controlled value or system event to listen to.',
    "accordion.nativeContractItem5":
      "The chevron paints only inside <code>&lt;summary&gt;</code>: it replaces the native marker (<code>&lt;summary&gt;</code> turns off the browser's own triangle) and toggles with plain CSS keyed on <code>details[open]</code>, with no script of its own.",
    "accordion.a11yTitle": "Accessibility",
    "accordion.a11yP1":
      'Each trigger is a native <code>&lt;button&gt;</code>: Enter and Space activate it with no script of its own, and its <code>aria-expanded</code> (written by the machine, never by hand) is the only thing that announces the state. The chevron is <code>aria-hidden="true"</code>: it is the same information said twice, and only one should reach the screen reader.',
    "accordion.a11yP2":
      "<kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> move focus between triggers in the page's normal order: the base keyboard pattern the ARIA APG describes for an accordion asks for nothing more. Arrow keys, <kbd>Home</kbd> and <kbd>End</kbd> between triggers are an optional enhancement this component does not implement today. Opening an item does not take focus from its trigger or hand it to the content: keyboard traversal stays the same, same as with the mouse.",
    "accordion.a11yP3":
      '{detailsLink} has none of this because it does not need it: a <code>&lt;details&gt;</code>/<code>&lt;summary&gt;</code> is an accessible platform disclosure, with its own focus and keyboard handling already solved by the browser.',

    "accordion.testReact1":
      "In single mode, opening an item closes the previous one and fires onValueChange with the new value.",
    "accordion.testReact2":
      "In multiple mode, opening an item does not close the others that are open.",
    "accordion.testReact3":
      'An item carries the right classes (<code class="sk-code">sk-tile--expandable</code>, no <code class="sk-code">--interactive</code>) and <code class="sk-code">aria-expanded</code> toggles on trigger click.',
    "accordion.testReact4":
      'Each trigger is wrapped in a <code class="sk-code">role="heading"</code> with <code class="sk-code">aria-level</code> (defaults to 3, configurable), so a screen reader navigating by heading finds the sections.',
    "accordion.testVanilla1":
      "In single mode, opening an item closes the previous one (animated) and emits the sk:accordionvaluechange event.",
    "accordion.testVanilla2":
      "In multiple mode, items open independently.",
  },
} as const;
