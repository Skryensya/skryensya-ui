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
      'Un solo componente con dos mitades. Cuatro signatures corren una máquina (<code>Accordion</code>, <code>Accordion.Item</code>, <code>Accordion.Trigger</code>, <code>Accordion.Content</code>); las otras cuatro son el <code>&lt;details&gt;</code> del navegador ({detailsLink}), sin script. Las dos animan y las dos son accesibles: lo que decide es el control, no la capacidad.',
    "accordion.detailsNativoLabel": "Details nativo",
    "accordion.choiceTitle": "Qué mitad usar",
    "accordion.choiceBody":
      'La máquina existe para lo que la plataforma no ofrece, y la lista es corta. Si nada de eso hace falta, el navegador ya lo resuelve. No es una versión menor: son dos dueños del mismo comportamiento.',
    "accordion.installIntro":
      "Empieza por quién controla el comportamiento: React y Vanilla usan la máquina controlada de Accordion; Details nativo deja la apertura y el cierre al navegador.",
    "accordion.reactInstallTitle": "React",
    "accordion.reactInstallBody":
      "Instala el binding de React y carga los estilos del marco Accordion y de los items Tile. El binding monta la máquina por ti.",
    "accordion.iconsNote":
      'Los chevrons son placeholders (<code>&lt;span data-sk-icon="chevron-*"&gt;</code>): ningún componente monta un set de iconos por ti, así que hace falta esta línea además.',
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
    "accordion.nativeTitle": "El mismo grupo exclusivo, sin JavaScript",
    "accordion.nativeAnatomyLabel": "Anatomía de Details nativo",
    "accordion.nativeAnatomyBody":
      'El otro juego de partes de este contrato. <code>&lt;details&gt;</code> no es un Accordion con otra piel: tiene su propia anatomía, y estas cinco clases son las que puedes estilar. Fíjate en que el resumen lleva título y descripción y ninguno de los dos tiene etiqueta: el contenido del <code>&lt;summary&gt;</code> lo compones tú, no es una parte que este contrato nombre. La primera sección está abierta porque <code>::details-content</code> no tiene caja mientras el disclosure está cerrado.',
    "accordion.nativeAnatomyPreviewLabel": "Anatomía de DetailsGroup",
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> y <code>&lt;summary&gt;</code> ya son una divulgación accesible de la plataforma. Comparte un atributo <code>name</code> entre siblings y el navegador mantiene un único item abierto: exactamente lo que hace <code>type="single"</code> arriba, sin máquina y sin <code>@skryensya/vanilla</code>.',
    "accordion.choiceDiagramLabel": "Cómo elegir entre Accordion y DetailsGroup",
    "accordion.choicePreviewLabel": "El árbol de decisión",
    "accordion.choiceListMultiple": "Varias secciones abiertas a la vez",
    "accordion.choiceListValue": "Fijar o leer el valor abierto desde afuera: estado, props, otro componente",
    "accordion.choiceListChange": "Escuchar cuándo cambia, para sincronizar con el resto de la UI",
    "accordion.choiceListDisabled": "Deshabilitar una sección sin sacarla del documento",
    "accordion.choiceAskNeeds": "¿Algo de esa lista?",
    "accordion.choiceAskNoJs": "¿Tiene que abrir sin JavaScript?",
    "accordion.choiceYes": "sí",
    "accordion.choiceNo": "no",
    "accordion.choiceNoJs":
      'La primera pregunta va primero porque la máquina no existe hasta que el script corre: si tiene que abrir antes de eso, no hay nada que elegir y lo de la lista queda fuera de alcance. Y cuando la respuesta a la segunda es no, compartir <code>name</code> entre los <code>&lt;details&gt;</code> ya te da el grupo exclusivo, sin nada más.',
    "accordion.nativeBody":
      'Comparte los mismos tokens que Tile (título, descripción, chevron), así el grupo se ve igual sin componer un Tile adentro.',
    "accordion.nativePreviewLabel": "Details con name compartido",
    "accordion.nativeInstallTitle": "Sin JavaScript: el mismo paquete, una hoja más",
    "accordion.nativeInstallBody":
      "Instala sólo Core e importa la hoja de Details. El navegador abre, cierra y coordina disclosures con el atributo <code>name</code>.",
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
    "accordion.a11yIntro":
      "El Accordion mejorado usa controles nativos y la máquina mantiene sus relaciones ARIA. Escribe el contenido del trigger como una etiqueta clara de la sección; no añadas ARIA que duplique esa semántica.",
    "accordion.a11ySemanticsTitle": "Qué anuncia",
    "accordion.a11ySemanticsItem1":
      'Cada trigger es un <code>&lt;button&gt;</code> nativo. Dale un título visible y claro; si incluyes descripción, también forma parte de su nombre accesible. El chevron es <code>aria-hidden="true"</code> porque no añade información.',
    "accordion.a11ySemanticsItem2":
      'La máquina escribe <code>aria-expanded</code> y <code>aria-controls</code>. El primero anuncia si la sección está abierta; el segundo la relaciona con su contenido. No escribas ni alternes esos atributos a mano.',
    "accordion.a11ySemanticsItem3":
      'Cada trigger está dentro de un <code>role="heading"</code> con <code>aria-level</code> 3 por defecto (configurable de 1 a 6), para encontrar secciones desde la navegación por encabezados.',
    "accordion.a11yKeyboardTitle": "Teclado y foco",
    "accordion.a11yKeyboardBody":
      '<kbd>Tab</kbd> y <kbd>Shift</kbd>+<kbd>Tab</kbd> recorren los triggers en el orden de la página; <kbd>Enter</kbd> y <kbd>Espacio</kbd> abren o cierran el que tiene foco. Al cambiar el estado, el foco sigue en el trigger y el contenido cerrado queda fuera del recorrido. Flechas, <kbd>Inicio</kbd> y <kbd>Fin</kbd> no están implementadas: son una mejora opcional del patrón de la APG.',
    "accordion.a11yNativeTitle": "Details nativo",
    "accordion.a11yNativeBody":
      '<code>&lt;details&gt;</code> usa el comportamiento nativo del navegador. Conserva <code>&lt;summary&gt;</code> como primer hijo interactivo de cada <code>&lt;details&gt;</code>; el navegador aporta el foco, teclado y estado expandido sin una máquina ni ARIA adicional.',

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
      'One component with two halves. Four signatures run a machine (<code>Accordion</code>, <code>Accordion.Item</code>, <code>Accordion.Trigger</code>, <code>Accordion.Content</code>); the other four are the browser\'s own <code>&lt;details&gt;</code> ({detailsLink}), with no script. Both animate and both are accessible: what decides is control, not capability.',
    "accordion.detailsNativoLabel": "Native details",
    "accordion.choiceTitle": "Which half to use",
    "accordion.choiceBody":
      'The machine exists for what the platform does not offer, and the list is short. If none of that is needed, the browser already solves it. This is not a lesser version: they are two owners of the same behaviour.',
    "accordion.installIntro":
      "Start with the owner of the behaviour: React and Vanilla use the controlled Accordion machine; native Details leaves opening and closing to the browser.",
    "accordion.reactInstallTitle": "React",
    "accordion.reactInstallBody":
      "Install the React binding, then load the Accordion frame and Tile item styles. The binding mounts the machine for you.",
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
    "accordion.nativeTitle": "The same exclusive group, without JavaScript",
    "accordion.nativeAnatomyLabel": "Native details anatomy",
    "accordion.nativeAnatomyBody":
      'This contract\'s other set of parts. <code>&lt;details&gt;</code> is not an Accordion wearing a different skin: it has an anatomy of its own, and these five classes are the ones you can style. Note that the summary carries a title and a description and neither is labelled: what goes inside <code>&lt;summary&gt;</code> is yours to compose, not a part this contract names. The first section is open because <code>::details-content</code> has no box at all while the disclosure is closed.',
    "accordion.nativeAnatomyPreviewLabel": "DetailsGroup anatomy",
    "accordion.nativeLede":
      '<code>&lt;details&gt;</code> and <code>&lt;summary&gt;</code> are already an accessible platform disclosure. Share a <code>name</code> attribute between siblings and the browser keeps a single item open: exactly what <code>type="single"</code> does above, with no machine and no <code>@skryensya/vanilla</code>.',
    "accordion.choiceDiagramLabel": "Choosing between Accordion and DetailsGroup",
    "accordion.choicePreviewLabel": "The decision tree",
    "accordion.choiceListMultiple": "Several sections open at once",
    "accordion.choiceListValue": "Set or read the open value from outside: state, props, another component",
    "accordion.choiceListChange": "Listen for when it changes, to sync with the rest of the UI",
    "accordion.choiceListDisabled": "Disable a section without taking it out of the document",
    "accordion.choiceAskNeeds": "Any of that?",
    "accordion.choiceAskNoJs": "Must it open without JavaScript?",
    "accordion.choiceYes": "yes",
    "accordion.choiceNo": "no",
    "accordion.choiceNoJs":
      'The first question comes first because the machine does not exist until the script runs: if it has to open before that, there is nothing to choose and the list is out of reach. And when the answer to the second one is no, sharing a <code>name</code> between the <code>&lt;details&gt;</code> is already the exclusive group, with nothing else to write.',
    "accordion.nativeBody":
      'It shares the same tokens as Tile (title, description, chevron), so the group looks the same without composing a Tile inside it.',
    "accordion.nativePreviewLabel": "Details with a shared name",
    "accordion.nativeInstallTitle": "Without JavaScript: same package, one more stylesheet",
    "accordion.nativeInstallBody":
      "Install Core only and import the Details stylesheet. The browser opens, closes, and coordinates disclosures through the <code>name</code> attribute.",
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
    "accordion.a11yIntro":
      "The enhanced Accordion uses native controls and the machine maintains their ARIA relationships. Write the trigger content as a clear section label; do not add ARIA that repeats that semantics.",
    "accordion.a11ySemanticsTitle": "What it announces",
    "accordion.a11ySemanticsItem1":
      'Each trigger is a native <code>&lt;button&gt;</code>. Give it a clear visible title; if you include a description, it also becomes part of the accessible name. The chevron is <code>aria-hidden="true"</code> because it adds no information.',
    "accordion.a11ySemanticsItem2":
      'The machine writes <code>aria-expanded</code> and <code>aria-controls</code>. The first announces whether the section is open; the second relates it to its content. Do not write or toggle either attribute by hand.',
    "accordion.a11ySemanticsItem3":
      'Each trigger sits inside a <code>role="heading"</code> with <code>aria-level</code> 3 by default (configurable from 1 to 6), so people can find sections through heading navigation.',
    "accordion.a11yKeyboardTitle": "Keyboard and focus",
    "accordion.a11yKeyboardBody":
      '<kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> move through triggers in page order; <kbd>Enter</kbd> and <kbd>Space</kbd> open or close the focused trigger. When state changes, focus stays on that trigger and closed content leaves the tab order. Arrow keys, <kbd>Home</kbd>, and <kbd>End</kbd> are not implemented: they are an optional APG pattern enhancement.',
    "accordion.a11yNativeTitle": "Native details",
    "accordion.a11yNativeBody":
      '<code>&lt;details&gt;</code> uses the browser’s native behaviour. Keep <code>&lt;summary&gt;</code> as the first interactive child of each <code>&lt;details&gt;</code>; the browser supplies focus, keyboard operation, and expanded state without a machine or extra ARIA.',

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
