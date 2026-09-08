export const dialogMessages = {
  es: {
    "demo.dialog.open": "Borrar proyecto",
    "demo.dialog.title": "¿Borrar este proyecto?",
    "demo.dialog.body": "Se elimina el proyecto y todo su historial. Esta acción no se puede deshacer.",
    "demo.dialog.cancel": "Cancelar",
    "demo.dialog.confirm": "Borrar",
    "demo.dialogVaul.open": "Abrir dialog",
    "demo.dialogVaul.title": "Caja centrada, Vaul en móvil",
    "demo.dialogVaul.body": "Angosta la ventana debajo de 52rem y este mismo dialog gana un Vaul block-end. El markup del dialog no cambia.",
    "demo.dialogVaul.whatChanges": "Qué cambia",
    "demo.dialogVaul.edgeTitle": "Llega desde el borde",
    "demo.dialogVaul.edgeBody": "Slide block-end en vez de escala centrada.",
    "demo.dialogVaul.dragTitle": "Se arrastra para cerrar",
    "demo.dialogVaul.dragBody": "Con handle, y sólo abajo del breakpoint.",
    "demo.dialogVaul.sameTitle": "Sigue siendo el dialog",
    "demo.dialogVaul.sameBody": "Foco, Escape y página inerte son de la plataforma.",
    "demo.dialogVaul.later": "Ahora no",
    "demo.dialogVaul.understood": "Entendido",

    /*
     * The Dialog page, migrated onto `ComponentPageShell` as the second proof of the shape
     * `AccordionPage` piloted: `dialog.*` for the exact same reason `accordion.*` exists above.
     */
    "dialog.description":
      "El dialog centrado de la plataforma. Opcional: Dialog Vaul cuando el contenido pide una superficie desde el borde en móvil.",
    "dialog.lede":
      'Un <code>&lt;dialog class="sk-dialog"&gt;</code> centrado. <code>showModal()</code> entrega foco, Escape, página inerte y backdrop; el sistema pinta la superficie. Sin enhancer: el único JavaScript es abrir.',
    "dialog.confirmTitle": "Confirm",
    "dialog.confirmJsComment": "Opcional: leer qué botón cerró el form.",
    "dialog.confirmAnatomy":
      'Anatomía: <code>sk-dialog__header</code> (título con <code>Heading</code> + <code>sk-dialog__title</code>, y cierre), <code>sk-dialog__body</code> y <code>sk-dialog__footer</code> (controles). El cierre y el footer son <code>&lt;form method="dialog"&gt;</code>: cierran sin handler y dejan el <code>value</code> en <code>dialog.returnValue</code>.',
    "dialog.openingTitle": "Abrirlo",
    "dialog.contractTitle": "Contrato",
    "dialog.contractItem1":
      'Abre un <code>&lt;dialog class="sk-dialog"&gt;</code> con <code>showModal()</code>, no un <code>div</code> con roles imitadas.',
    "dialog.contractItem2":
      'Anatomía: <code>sk-dialog__header</code> (<code>sk-heading sk-dialog__title</code> + <code>sk-dialog__close</code>), <code>sk-dialog__body</code>, <code>sk-dialog__footer</code> (controles, opcional). El título es <a class="sk-link sk-interactive" href="/components/heading">Heading</a> (casi siempre con <code>data-flush</code>).',
    "dialog.contractItem3":
      'Asocia el título con <code>aria-labelledby</code> apuntando al <code>id</code> del Heading (o un nombre accesible equivalente).',
    "dialog.contractItem4":
      'Cierre y acciones usan <code>&lt;form method="dialog"&gt;</code>; <code>value</code> en cada botón si necesitas saber cuál se eligió.',
    "dialog.contractItem5":
      'No añadas un focus trap propio: <code>showModal()</code> ya contiene el foco y restaura al cerrar.',
    "dialog.contractItem6":
      'Importa <a class="sk-link sk-interactive" href="/scroll-lock">scroll lock</a> si quieres congelar la página detrás sin CLS al desaparecer la scrollbar.',
    "dialog.contractItem7":
      'Con <a class="sk-link sk-interactive" href="/transparency"><code>prefers-reduced-transparency</code></a>, el backdrop deja la mezcla translúcida y pasa a un fondo opaco; la modalidad no cambia.',
    "dialog.vaulTitle": "Opción: Dialog Vaul",
    "dialog.vaulIntro":
      "Cuando el contenido pide una superficie desde el borde en móvil, el mismo <code>&lt;dialog&gt;</code> puede optar en <strong>Dialog Vaul</strong>: añade slide, light-dismiss y drag-to-dismiss. La modalidad (foco, Escape, inert) sigue siendo de <code>showModal()</code>.",
    "dialog.vaulAddsTitle": "Qué añade",
    "dialog.vaulAddsItem1":
      'Abre y cierra con triggers y closers autorados (<code>data-sk-dialog-vaul-open</code> / <code>-close</code>).',
    "dialog.vaulAddsItem2": "Por debajo de <code>52rem</code>, deja arrastrar el handle hacia <code>block-end</code>.",
    "dialog.vaulAddsItem3": "Light-dismiss al pulsar fuera del rectángulo del panel.",
    "dialog.vaulAddsItem4":
      '<code>data-sk-dialog-vaul</code> opta en la mejora; <code>data-edge="block-end"</code> nombra el borde. El handle es opcional.',
    "dialog.vaulInstallTitle": "Instalar Dialog Vaul",
    "dialog.a11yIntro":
      "Con <code>showModal()</code> la plataforma ya hace el trabajo. No reimplementes un focus trap en JavaScript (decisión 11 / técnica WCAG H102).",
    "dialog.a11yItem1":
      '<strong>Al abrir</strong> el foco entra al dialog. Sin <code>autofocus</code>, aterriza en el primer control enfocable. En un confirm destructivo pon <code>autofocus</code> en <strong>Cancelar</strong> (la opción segura), no en Borrar ni en el cierre.',
    "dialog.a11yItem2":
      '<strong>Orden en el DOM</strong>: el título va <em>antes</em> del botón de cerrar. Si el cierre fuera el primer nodo enfocable y el contenido largo, <code>showModal()</code> podría abrir el panel ya scrolleado hacia ese control.',
    "dialog.a11yItem3":
      '<strong>Tab / Shift+Tab</strong> ciclan entre controles del dialog. La página detrás queda <code>inert</code>: no recibe foco. Sí se puede llegar al chrome del navegador (barra de direcciones); eso es intencional, no un bug.',
    "dialog.a11yItem4":
      '<strong>Escape</strong> cierra el dialog (evento <code>cancel</code>) y restaura el foco al trigger. Equivale a descartar, no a confirmar: mismo <code>returnValue</code> vacío / cancel que el botón de cerrar con <code>value="cancel"</code>.',
    "dialog.a11yItem5":
      '<strong>Al cerrar</strong> el foco vuelve al elemento que abrió el dialog, si sigue en la página. No hace falta guardarlo a mano.',
    "dialog.a11yItem6":
      'El botón de cerrar es un <code>sk-button</code> con <code>data-icon-only</code> y <code>aria-label="Cerrar"</code>. El icono es decorativo (<code>&lt;span data-sk-icon="close"&gt;</code>); el nombre es del botón.',
    "dialog.borderTitle": "El borde siempre encendido no es estético",
    "dialog.borderBody":
      "En alto contraste el panel y la página resuelven al mismo color: suavizar <code>--sk-dialog-border-width</code> deja el dialog invisible sin que falle un solo test. Por eso llega en <code>1px</code> y no en <code>0</code>.",
    "dialog.test1": "Cierra a través del <code>&lt;form method=\"dialog\"&gt;</code> de la plataforma, no de un handler.",
    "dialog.test2": "Renderiza la anatomía contra la que la hoja de estilos escribe su contrato.",
    "dialog.test3": "Omite el form del pie cuando no hay nada que poner en él.",
  },
  en: {
    "demo.dialog.open": "Delete project",
    "demo.dialog.title": "Delete this project?",
    "demo.dialog.body": "The project and all its history are removed. This cannot be undone.",
    "demo.dialog.cancel": "Cancel",
    "demo.dialog.confirm": "Delete",
    "demo.dialogVaul.open": "Open dialog",
    "demo.dialogVaul.title": "Centred box, Vaul on mobile",
    "demo.dialogVaul.body": "Narrow the window below 52rem and this same dialog gains a block-end Vaul. The dialog's markup does not change.",
    "demo.dialogVaul.whatChanges": "What changes",
    "demo.dialogVaul.edgeTitle": "Arrives from the edge",
    "demo.dialogVaul.edgeBody": "Block-end slide instead of a centred scale.",
    "demo.dialogVaul.dragTitle": "Drags to dismiss",
    "demo.dialogVaul.dragBody": "With a handle, only below the breakpoint.",
    "demo.dialogVaul.sameTitle": "Still the same dialog",
    "demo.dialogVaul.sameBody": "Focus, Escape and an inert page are the platform's.",
    "demo.dialogVaul.later": "Not now",
    "demo.dialogVaul.understood": "Got it",

    "dialog.description":
      "The platform's centered dialog. Optional: Dialog Vaul when content asks for an edge-anchored surface on mobile.",
    "dialog.lede":
      'A centered <code>&lt;dialog class="sk-dialog"&gt;</code>. <code>showModal()</code> hands you focus, Escape, an inert page and a backdrop; the system paints the surface. No enhancer: the only JavaScript is opening it.',
    "dialog.confirmTitle": "Confirm",
    "dialog.confirmJsComment": "Optional: read which button closed the form.",
    "dialog.confirmAnatomy":
      'Anatomy: <code>sk-dialog__header</code> (a title with <code>Heading</code> + <code>sk-dialog__title</code>, and a close button), <code>sk-dialog__body</code> and <code>sk-dialog__footer</code> (controls). The close button and the footer are a <code>&lt;form method="dialog"&gt;</code>: they close with no handler and leave the <code>value</code> in <code>dialog.returnValue</code>.',
    "dialog.openingTitle": "Opening it",
    "dialog.contractTitle": "Contract",
    "dialog.contractItem1":
      'Opens a <code>&lt;dialog class="sk-dialog"&gt;</code> with <code>showModal()</code>, not a <code>div</code> imitating the roles.',
    "dialog.contractItem2":
      'Anatomy: <code>sk-dialog__header</code> (<code>sk-heading sk-dialog__title</code> + <code>sk-dialog__close</code>), <code>sk-dialog__body</code>, <code>sk-dialog__footer</code> (controls, optional). The title is a <a class="sk-link sk-interactive" href="/en/components/heading">Heading</a> (almost always with <code>data-flush</code>).',
    "dialog.contractItem3":
      'Associates the title with <code>aria-labelledby</code> pointing at the Heading\'s <code>id</code> (or an equivalent accessible name).',
    "dialog.contractItem4":
      'Close and action controls use <code>&lt;form method="dialog"&gt;</code>; give each button a <code>value</code> if you need to know which one was chosen.',
    "dialog.contractItem5":
      "Don't add a focus trap of your own: <code>showModal()</code> already contains focus and restores it on close.",
    "dialog.contractItem6":
      'Import <a class="sk-link sk-interactive" href="/en/scroll-lock">scroll lock</a> if you want to freeze the page behind it with no CLS when the scrollbar disappears.',
    "dialog.contractItem7":
      'With <a class="sk-link sk-interactive" href="/en/transparency"><code>prefers-reduced-transparency</code></a>, the backdrop drops the translucent blend for an opaque one; modality does not change.',
    "dialog.vaulTitle": "Option: Dialog Vaul",
    "dialog.vaulIntro":
      "When content asks for an edge-anchored surface on mobile, the same <code>&lt;dialog&gt;</code> can opt into <strong>Dialog Vaul</strong>: it adds slide, light-dismiss and drag-to-dismiss. Modality (focus, Escape, inert) still comes from <code>showModal()</code>.",
    "dialog.vaulAddsTitle": "What it adds",
    "dialog.vaulAddsItem1":
      'Opens and closes with authored triggers and closers (<code>data-sk-dialog-vaul-open</code> / <code>-close</code>).',
    "dialog.vaulAddsItem2": "Below <code>52rem</code>, lets you drag the handle toward <code>block-end</code>.",
    "dialog.vaulAddsItem3": "Light-dismiss when the pointer lands outside the panel's rectangle.",
    "dialog.vaulAddsItem4":
      '<code>data-sk-dialog-vaul</code> opts into the enhancement; <code>data-edge="block-end"</code> names the edge. The handle is optional.',
    "dialog.vaulInstallTitle": "Installing Dialog Vaul",
    "dialog.a11yIntro":
      "With <code>showModal()</code>, the platform already does the work. Do not reimplement a focus trap in JavaScript (decision 11 / WCAG technique H102).",
    "dialog.a11yItem1":
      '<strong>On open</strong>, focus enters the dialog. With no <code>autofocus</code>, it lands on the first focusable control. In a destructive confirm, put <code>autofocus</code> on <strong>Cancel</strong> (the safe option), not on Delete or the close button.',
    "dialog.a11yItem2":
      '<strong>DOM order</strong>: the title comes <em>before</em> the close button. If the close button were the first focusable node and the content were long, <code>showModal()</code> could open the panel already scrolled to that control.',
    "dialog.a11yItem3":
      '<strong>Tab / Shift+Tab</strong> cycle between the dialog\'s controls. The page behind it is <code>inert</code>: it receives no focus. The browser chrome (address bar) is still reachable; that is intentional, not a bug.',
    "dialog.a11yItem4":
      '<strong>Escape</strong> closes the dialog (a <code>cancel</code> event) and restores focus to the trigger. It counts as dismissing, not confirming: the same empty/cancel <code>returnValue</code> as the close button with <code>value="cancel"</code>.',
    "dialog.a11yItem5":
      '<strong>On close</strong>, focus returns to whatever element opened the dialog, if it is still on the page. Nothing to save by hand.',
    "dialog.a11yItem6":
      'The close button is an <code>sk-button</code> with <code>data-icon-only</code> and <code>aria-label="Close"</code>. Its icon is decorative (<code>&lt;span data-sk-icon="close"&gt;</code>); the accessible name belongs to the button.',
    "dialog.borderTitle": "Always-on borders aren't just aesthetic",
    "dialog.borderBody":
      "In high contrast, the panel and the page resolve to the same color: softening <code>--sk-dialog-border-width</code> would leave the dialog invisible without a single test failing. That is why it ships at <code>1px</code> rather than <code>0</code>.",
    "dialog.test1": "Closes through the platform's own <code>&lt;form method=\"dialog\"&gt;</code>, not a handler.",
    "dialog.test2": "Renders the anatomy the stylesheet contracts against.",
    "dialog.test3": "Omits the footer form when there is nothing to put in it.",
  },
} as const;
