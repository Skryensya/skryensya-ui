export const componentPreviewMessages = {
  es: {
    "demo.componentPreview.title": "Botón primario",
    "demo.componentPreview.button": "Guardar",
    "demo.componentPreview.saveChanges": "Guardar cambios",
    "demo.componentPreview.billingTitle": "Facturación",
    "demo.componentPreview.billingBody": "Planes, pagos y recibos.",
    "demo.componentPreview.teamTitle": "Equipo",
    "demo.componentPreview.teamBody": "Personas, roles y permisos.",
    "demo.componentPreview.domainsTitle": "Dominios",
    "demo.componentPreview.domainsBody": "DNS y certificados.",
    "demo.componentPreview.logsTitle": "Registros",
    "demo.componentPreview.logsBody": "Actividad y auditoría.",
    "demo.componentPreview.integrationsTitle": "Integraciones",
    "demo.componentPreview.integrationsBody": "Webhooks y llaves de API.",
    "demo.componentPreview.notificationsTitle": "Notificaciones",
    "demo.componentPreview.notificationsBody": "Correo y alertas.",

    "componentPreview.description":
      "Render de un componente y su código en una superficie documentada, con bindings y fuentes opcionales.",
    "componentPreview.lede":
      "Une el <strong>render real del componente</strong> y su implementación en una sola superficie. El stage es un <code>iframe srcdoc</code> estático: no crea una ruta, pero sí su propio DOM, viewport y top layer. Debajo, CodePreview muestra el código.",
    "componentPreview.responsibilitiesTitle": "Responsabilidades",
    "componentPreview.respItem1":
      "<strong>ComponentPreview</strong> posee el marco, la cabecera, el stage renderizado y los paneles de binding o fuente.",
    "componentPreview.respItem2":
      "<strong>CodePreview</strong> posee cada superficie de código: Shiki, copiar, densidad y expansión de bloques largos.",
    "componentPreview.respItem3":
      "El frame queda en <code>about:srcdoc</code>. Toast, Dialog, Drawer, estilos fixed y queries de viewport se resuelven contra el ejemplo, no contra el chrome de documentación.",
    "componentPreview.crossBody":
      "CSS y JavaScript no atraviesan el límite del documento automáticamente. El adapter de este sitio copia sus stylesheets, sincroniza modo, contraste, radio y densidad, y ejecuta el mismo bootstrap Vanilla dentro del realm del frame. El contenido es autorado y de confianza; no se usa para HTML arbitrario de terceros.",
    "componentPreview.minimalTitle": "Anatomía mínima",
    "componentPreview.minimalBody":
      "El stage de este ejemplo es otro ComponentPreview: el mismo <code>srcdoc</code>, un nivel más adentro. El frame anidado clona los estilos de su padre y monta su propio runtime, así que recargar, arrastrar el borde o cambiar el modo de color funcionan en los dos niveles a la vez.",
    "componentPreview.minimalNote": "dentro de un ComponentPreview",
    "componentPreview.flushBody":
      'Añade <code>data-sk-component-preview-flush</code> al iframe y a su body cuando el componente sea un layout. Usa <code>data-sk-component-preview-viewport="menu"</code> para listboxes y popovers, u <code>overlay</code> para dialogs, drawers y toasts. El botón de recarga remonta el <code>srcdoc</code> (útil para count-ups y loaders). Los tabs son <code>SegmentedControl</code> normales.',
    "componentPreview.resizerBody":
      "El <code>resizer</code> es el borde inferior del stage, al estilo del asa de un <code>textarea</code>: arrastrarlo (o <kbd class=\"sk-kbd\">↑</kbd> / <kbd class=\"sk-kbd\">↓</kbd> con el foco puesto) fija el alto en <code>data-sk-component-preview-resized</code>. Desde ahí el alto es del lector: el runtime del frame deja de auto-ajustarlo y pasa su documento a <code>overflow: auto</code>, así achicarlo muestra scroll en vez de recortar el ejemplo. Doble clic (o <kbd class=\"sk-kbd\">Home</kbd>) devuelve el alto al contenido.",
    "componentPreview.screenTitle": "Tamaño de pantalla",
    "componentPreview.screenBody1":
      "<code>screens</code> agrega al header un segmented <strong>Libre · Tablet · Móvil</strong>. <em>Libre</em> es el stage de siempre: ancho completo y alto ajustado al contenido. <em>Tablet</em> y <em>Móvil</em> sólo cambian el ancho: el alto sigue ajustándose al contenido o al resizer del lector, para que los presets muestren reflow sin modificarlo. <em>Desktop alejado</em> (1440 px con zoom out) no va en todos: se pide con <code>zoomedDesktop</code> en layouts que necesitan un viewport más ancho que la columna, como Navbar o Layout Grid, y nunca aparece en pantalla completa.",
    "componentPreview.screenBody2":
      "Las medidas caen a propósito a cada lado de los breakpoints del sistema (<code>compact</code> 36rem, <code>desktop</code> 52rem): móvil 390 px queda debajo de los dos, tablet 768 px queda en medio, XL 1440 px queda por encima (también de la banda de 72rem del layout-grid). Así los presets ejercitan las bandas donde el layout realmente cambia, en vez de ser anchos arbitrarios. Van en <code>px</code> y no en <code>rem</code> porque el viewport de un dispositivo es una medida física: quien sube el tamaño de fuente raíz quiere ver <em>ese</em> reflow en una pantalla de teléfono, no un teléfono que creció.",
    "componentPreview.screenBody3":
      "El ejemplo de abajo es un <code>Grid</code> multicol, cuyos carriles están atados justamente a esos breakpoints: uno debajo de <code>compact</code>, dos a partir de ahí, tres desde <code>desktop</code>. Cada preset cae en una banda distinta, así que los tres se ven diferentes. Las media queries resuelven contra el viewport <strong>del frame</strong>, que es el ancho del preset: eso es lo que compra el <code>iframe</code> y no compraría una container query sobre un <code>div</code>.",
    "componentPreview.screenNote": "3 carriles libre · 2 en tablet · 1 en móvil",
    "componentPreview.screenBody4":
      "Con XL, Tablet o Móvil activo el stage conserva su alto automático y el resizer sigue disponible: el preset sólo cambia el ancho y centra el frame (XL además aplica zoom out). Arrastrar el resizer sigue haciendo que el alto sea del lector; doble clic o <kbd class=\"sk-kbd\">Home</kbd> lo devuelve al contenido.",
    "componentPreview.screenBody5":
      "Viene <strong>encendido en todos los previews</strong> del sitio. «¿Esto aguanta en un teléfono?» es una pregunta que se le puede hacer a cualquier componente, no sólo a los que son evidentemente un layout: la etiqueta de un botón envuelve, una tabla se desborda, un dialog no entra. Dejarlo a criterio de quien escribe cada página significaría tener la respuesta justamente en las demos que alguien ya pensó, que son las que ya estaban bien.",
    "componentPreview.screenBody6":
      'La elección es <strong>del documento, no del preview</strong>, y se comparte igual que la preferencia Vanilla | React: cambiarla en un ejemplo la cambia en todos, vive en <code>&lt;html data-sk-component-preview-screen-pref&gt;</code> y se guarda en <code>localStorage["sk"].screen</code>, así que sobrevive a recargas y a navegar entre páginas. Es la misma razón que en el binding: el lector le está haciendo la pregunta <em>a la página</em>, no a una demo suelta, y elegir de nuevo en cada ejemplo que pasa sería el trabajo que la preferencia compartida existe para evitar. <em>Libre</em> es la ausencia del atributo, no un tercer valor.',
    "componentPreview.screenBody7":
      "Los controles son iconos del vocabulario estable (<code>screen-desktop</code>, <code>screen-tablet</code>, <code>screen-mobile</code> y, si el preview lo pide, <code>zoom-out</code>), así que los tres sets homologados los dibujan. Sin texto visible, cada opción lleva su nombre en <code>aria-label</code> y en <code>title</code>: el glifo es decorativo, exactamente como en un Button icon-only.",
    "componentPreview.screenBody8":
      "Se apaga por preview con <code>screens={false}</code>, para los casos donde el preset engaña más de lo que informa. El desktop alejado se enciende por preview con <code>zoomedDesktop</code>.",
    "componentPreview.fullTitle": "El ejemplo completo",
    "componentPreview.fullBody":
      "La superficie entera, también anidada: cabecera con nota, recarga y tabs de binding, stage, resizer y un CodePreview por binding. Los tabs de adentro son independientes de los de afuera: la preferencia Vanilla | React se comparte por documento, y el frame es su propio documento.",
    "componentPreview.fullNote": "la superficie completa",
    "componentPreview.bareTitle": "La parte portable",
    "componentPreview.bareBody1":
      "Todo lo de arriba (el selector Vanilla/React, los presets de pantalla, el compilador de árboles que arma cada stage) es la maquinaria de ESTE sitio para comparar dos bindings de OTRO componente. Ninguna parte de eso es algo que un consumidor compondría en su producto.",
    "componentPreview.bareBody2":
      "Lo que sí es portable: un título con su nota, un stage con lo que se muestra, y su código debajo, compuesto desde <code>CodePreview</code>, no reimplementado. Eso es <code>ComponentPreview.bare</code>, la misma raíz y las mismas parts con menos anatomía, igual que <code>Popover.bare</code>.",
    "componentPreview.mountTitle": "Montar explícitamente",
    "componentPreview.mountBody":
      "ComponentPreview y CodePreview quedan fuera de <code>initComponents()</code>: una aplicación no descarga superficies de documentación por accidente. Ese montaje controla la superficie host; el contenido del <code>srcdoc</code> ejecuta su propio entry point.",
    "componentPreview.frameMountLabel": "runtime dentro del srcdoc",
    "componentPreview.test1": "Cambia el binding y monta el panel de fuente Vanilla anidado de forma idempotente.",
    "componentPreview.test2": "El toggle Vanilla | React se comparte entre todos los previews de la página.",
    "componentPreview.test3":
      "Recorre libre → tablet → mobile → libre al hacer click, marcando el stage y limpiándolo para libre.",
    "componentPreview.test4": "Recarga el stage del srcdoc desde el documento autorado.",

    "componentPreview.testReact1": "Renderiza el título, el stage y el código en orden.",
    "componentPreview.testReact2": "Muestra una nota al lado del título cuando se da.",
    "componentPreview.testReact3": "Omite el header por completo cuando no hay título ni nota.",
    "componentPreview.testReact4": "Conserva el header con solo una nota, sin texto de título.",
  },
  en: {
    "demo.componentPreview.title": "Primary button",
    "demo.componentPreview.button": "Save",
    "demo.componentPreview.saveChanges": "Save changes",
    "demo.componentPreview.billingTitle": "Billing",
    "demo.componentPreview.billingBody": "Plans, payments and receipts.",
    "demo.componentPreview.teamTitle": "Team",
    "demo.componentPreview.teamBody": "People, roles and permissions.",
    "demo.componentPreview.domainsTitle": "Domains",
    "demo.componentPreview.domainsBody": "DNS and certificates.",
    "demo.componentPreview.logsTitle": "Logs",
    "demo.componentPreview.logsBody": "Activity and audit.",
    "demo.componentPreview.integrationsTitle": "Integrations",
    "demo.componentPreview.integrationsBody": "Webhooks and API keys.",
    "demo.componentPreview.notificationsTitle": "Notifications",
    "demo.componentPreview.notificationsBody": "Mail and alerts.",

    "componentPreview.description":
      "Renders a component and its code on a documented surface, with optional bindings and sources.",
    "componentPreview.lede":
      "Joins the component's <strong>real render</strong> and its implementation on a single surface. The stage is a static <code>iframe srcdoc</code>: it creates no route, but it does get its own DOM, viewport and top layer. Below it, CodePreview shows the code.",
    "componentPreview.responsibilitiesTitle": "Responsibilities",
    "componentPreview.respItem1":
      "<strong>ComponentPreview</strong> owns the frame, the header, the rendered stage, and the binding or source panels.",
    "componentPreview.respItem2":
      "<strong>CodePreview</strong> owns every code surface: Shiki, copy, density, and long-block expansion.",
    "componentPreview.respItem3":
      "The frame lives at <code>about:srcdoc</code>. Toast, Dialog, Drawer, fixed styles and viewport queries resolve against the example, not against the documentation chrome.",
    "componentPreview.crossBody":
      "CSS and JavaScript do not cross the document boundary on their own. This site's adapter copies its stylesheets, syncs mode, contrast, radius and density, and runs the same Vanilla bootstrap inside the frame's realm. The content is authored and trusted; it is not used for arbitrary third-party HTML.",
    "componentPreview.minimalTitle": "Minimal anatomy",
    "componentPreview.minimalBody":
      "This example's stage is another ComponentPreview: the same <code>srcdoc</code>, one level deeper. The nested frame clones its parent's styles and mounts its own runtime, so reloading, dragging the edge, or switching color mode work at both levels at once.",
    "componentPreview.minimalNote": "inside a ComponentPreview",
    "componentPreview.flushBody":
      'Add <code>data-sk-component-preview-flush</code> to the iframe and its body when the component is a layout. Use <code>data-sk-component-preview-viewport="menu"</code> for listboxes and popovers, or <code>overlay</code> for dialogs, drawers and toasts. The reload button remounts the <code>srcdoc</code> (useful for count-ups and loaders). The tabs are regular <code>SegmentedControl</code>s.',
    "componentPreview.resizerBody":
      "The <code>resizer</code> is the stage's bottom edge, styled after a <code>textarea</code>'s handle: dragging it (or pressing <kbd class=\"sk-kbd\">↑</kbd> / <kbd class=\"sk-kbd\">↓</kbd> while it has focus) sets the height in <code>data-sk-component-preview-resized</code>. From then on the height belongs to the reader: the frame runtime stops auto-sizing it and switches its document to <code>overflow: auto</code>, so shrinking it shows a scrollbar instead of clipping the example. Double-clicking (or pressing <kbd class=\"sk-kbd\">Home</kbd>) returns the height to the content.",
    "componentPreview.screenTitle": "Screen size",
    "componentPreview.screenBody1":
      "<code>screens</code> adds a <strong>Free · Tablet · Mobile</strong> segmented control to the header. <em>Free</em> is the usual stage: full width, height fit to content. <em>Tablet</em> and <em>Mobile</em> only change width: height continues to fit content or follow the reader's resizer, so the presets show reflow without changing it. <em>Desktop zoomed out</em> (1440 px, zoomed to fit) is not on every preview: it is opted in with <code>zoomedDesktop</code> on layouts that need a viewport wider than the column, such as Navbar or Layout Grid, and never appears in full screen.",
    "componentPreview.screenBody2":
      "The measurements deliberately fall on either side of the system's own breakpoints (<code>compact</code> at 36rem, <code>desktop</code> at 52rem): mobile at 390 px sits below both, tablet at 768 px sits between them, XL at 1440 px sits above both (and above the layout-grid 72rem band). That way the presets exercise the bands where the layout actually changes, instead of being arbitrary widths. They are in <code>px</code>, not <code>rem</code>, because a device's viewport is a physical measurement: someone who bumps the root font size wants to see <em>that</em> reflow on a phone screen, not a phone that grew.",
    "componentPreview.screenBody3":
      "The example below is a multicol <code>Grid</code> whose lanes are tied to exactly those breakpoints: one below <code>compact</code>, two from there on, three from <code>desktop</code>. Each preset lands in a different band, so all three look different. The media queries resolve against the <strong>frame's</strong> viewport, which is the preset's width: that is what the <code>iframe</code> buys that a container query on a plain <code>div</code> would not.",
    "componentPreview.screenNote": "3 free lanes · 2 on tablet · 1 on mobile",
    "componentPreview.screenBody4":
      "With XL, Tablet or Mobile active, the stage keeps its automatic height and the resizer remains available: the preset only changes width and centres the frame (XL also zooms out). Dragging the resizer still makes height reader-owned; double-clicking or pressing <kbd class=\"sk-kbd\">Home</kbd> returns it to content.",
    "componentPreview.screenBody5":
      'It ships <strong>on by default in every preview</strong> on the site. "Does this hold up on a phone?" is a question worth asking of any component, not only the ones that are obviously a layout: a button label wraps, a table overflows, a dialog does not fit. Leaving it to each page author\'s judgment would mean the answer lands exactly in the demos someone already thought hard about, the ones that were already fine.',
    "componentPreview.screenBody6":
      'The choice belongs <strong>to the document, not the preview</strong>, and is shared the same way the Vanilla | React preference is: changing it in one example changes it everywhere. It lives on <code>&lt;html data-sk-component-preview-screen-pref&gt;</code> and is saved in <code>localStorage["sk"].screen</code>, so it survives reloads and navigating between pages. The reason is the same as for the binding preference: the reader is asking the question <em>of the page</em>, not of one loose demo, and choosing again in every example that goes by would be exactly the work the shared preference exists to avoid. <em>Free</em> is the absence of the attribute, not a third value.',
    "componentPreview.screenBody7":
      "The controls are icons from the stable vocabulary (<code>screen-desktop</code>, <code>screen-tablet</code>, <code>screen-mobile</code> and, when the preview asks for it, <code>zoom-out</code>), so every homologated set draws them. With no visible text, each option carries its name in <code>aria-label</code> and <code>title</code>: the glyph is decorative, exactly as in an icon-only Button.",
    "componentPreview.screenBody8":
      "It turns off per preview with <code>screens={false}</code>, for the cases where the preset misleads more than it informs. Zoomed-out desktop turns on per preview with <code>zoomedDesktop</code>.",
    "componentPreview.fullTitle": "The full example",
    "componentPreview.fullBody":
      "The whole surface, also nested: a header with a note, reload and binding tabs, the stage, the resizer, and a CodePreview per binding. The inner tabs are independent of the outer ones: the Vanilla | React preference is shared per document, and the frame is its own document.",
    "componentPreview.fullNote": "the full surface",
    "componentPreview.bareTitle": "The portable part",
    "componentPreview.bareBody1":
      "Everything above (the Vanilla/React switch, the screen presets, the tree compiler that builds each stage) is THIS site's own machinery for comparing two bindings of ANOTHER component. None of it is something a consumer would compose into their product.",
    "componentPreview.bareBody2":
      "What is portable: a title with its note, a stage showing what is being demonstrated, and its code underneath, composed from <code>CodePreview</code> rather than reimplemented. That is <code>ComponentPreview.bare</code>: the same root and the same parts with less anatomy, just like <code>Popover.bare</code>.",
    "componentPreview.mountTitle": "Mounting explicitly",
    "componentPreview.mountBody":
      "ComponentPreview and CodePreview stay outside <code>initComponents()</code>: an application does not download documentation surfaces by accident. That mount controls the host surface; the <code>srcdoc</code> content runs its own entry point.",
    "componentPreview.frameMountLabel": "runtime inside the srcdoc",
    "componentPreview.test1": "Switches binding and mounts the nested Vanilla source panel idempotently.",
    "componentPreview.test2": "Shares the Vanilla | React toggle across every preview on the page.",
    "componentPreview.test3":
      "Cycles free → tablet → mobile → free on click, marking the stage and clearing it for free.",
    "componentPreview.test4": "Reloads the srcdoc stage from the authored document.",

    "componentPreview.testReact1": "Renders the title, stage and code in order.",
    "componentPreview.testReact2": "Renders a note beside the title when given.",
    "componentPreview.testReact3": "Omits the header entirely when there is neither a title nor a note.",
    "componentPreview.testReact4": "Keeps the header when only a note is given, with no title text.",
  },
} as const;
