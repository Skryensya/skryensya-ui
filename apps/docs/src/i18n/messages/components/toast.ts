export const toastMessages = {
  es: {
    "demo.toast.dismiss": "Descartar",
    "demo.toast.linkCopied": "Enlace copiado al portapapeles.",
    "demo.toast.documentArchived": "Documento archivado",
    "demo.toast.movedToArchived": "Se movió a Archivados.",
    "demo.toast.undo": "Deshacer",
    "demo.toast.emit": "Emitir toast",
    "demo.toast.dynamic": "La exportación terminó.",
    "demo.toast.syncing": "Sincronizando",
    "demo.toast.syncingBody": "Esto puede tardar unos segundos.",
    "demo.toast.deploymentCreated": "Despliegue creado",
    "demo.toast.deploymentCreatedBody": "La versión ya está disponible.",
    "demo.toast.connectionFailed": "No se pudo conectar",
    "demo.toast.connectionFailedBody": "Revisa tu conexión y vuelve a intentarlo.",
    "demo.toast.status.saved": "Cambios guardados",
    "demo.toast.status.copied": "Enlace copiado",
    "demo.toast.status.failed": "No se pudo guardar",
    "demo.toast.stack.first": "Exportación preparada.",
    "demo.toast.stack.second": "Informe enviado.",
    "demo.toast.stack.third": "Permisos actualizados.",

    "toastPage.description": "Toast: feedback transitorio en una región flotante. Misma anatomía que Callout, con ciclo de vida de la app.",
    "toastPage.lede":
      'Toast comunica feedback transitorio en una región flotante. El ítem es un <a href="/components/callout">Callout</a>, mismo markup, mismos tonos, envuelto en <code>sk-toast-region</code> y en el ciclo de vida del toast (montaje, dismiss, timeout opcional).',
    "toastPage.anatomyBody":
      "La región y un toast completo: ícono, contenido, título, descripción, acciones y dismiss. El ítem reutiliza las partes de Callout; sólo el cierre es propio de Toast. Congelado.",
    "toastPage.anatomyLabel": "Anatomía de Toast",
    "toastPage.anatomyPreviewLabel": "Toast, parte por parte",
    "toastPage.emitTitle": "Después de una acción",
    "toastPage.emitBody":
      "Es el caso real: un toast no se escribe ya visible, aparece porque algo pasó. Lo que sí es estable en el HTML son tres piezas: el control que dispara la acción, una <code>sk-toast-region</code> <strong>vacía</strong>, y un <code>&lt;template&gt;</code> con el ítem. La app clona, inserta y vuelve a montar; <code>initComponents</code> es idempotente, así que sólo toca lo recién insertado.",
    "toastPage.emitLabel": "Toast después de una acción",
    "toastPage.emitNote": "Pulsa el botón",
    "toastPage.simpleTitle": "Simple",
    "toastPage.simpleBody":
      'tone="neutral" (el default). En un toast el color casi nunca debería ser la señal principal: ya flota y se retira. Neutral deja que el texto diga el aviso sin pintar urgencia de más, y flota sobre una superficie <strong>raised</strong> (<code>--color-bg-surface-raised</code> + <code>--elevation-raised</code>) para leerse como chrome elevado, no como panel de página. Ver el mismo criterio en <a href="/components/callout">Callout</a>.',
    "toastPage.simpleLabel": "Toast simple",
    "toastPage.statusTitle": "Con estado",
    "toastPage.statusBody1": 'Los tonos de estado colorean el panel. <code>danger</code> se anuncia como <code>role="alert"</code> (assertive); el resto como <code>role="status"</code> (polite).',
    "toastPage.statusBody2":
      "El primero no lleva ✕: tiene <code>data-timeout</code>, así que se retira solo. Los otros dos piden algo de la persona, un despliegue que confirmar y un error que leer, y por eso se quedan hasta que se cierren. La regla práctica: <strong>si el toast puede cerrarse solo, no necesita ✕; si no puede, el ✕ es obligatorio</strong>.",
    "toastPage.statusLabel": "Toast con estado",
    "toastPage.actionTitle": "Con acción",
    "toastPage.actionBody":
      "<code>sk-callout__actions</code> es una sola columna: la acción de recuperación y el cierre viven ahí, en ese orden. Un toast con acción no lleva <code>data-timeout</code>, desaparecer antes de que alguien alcance a pulsar “Deshacer” convierte la acción en decorado.",
    "toastPage.actionLabel": "Toast con acción",
    "toastPage.stackTitle": "Apilado",
    "toastPage.stackBody1":
      "Es el <strong>comportamiento por defecto</strong>, no una opción que se prende: cuatro toasts sueltos se comen un cuarto de la pantalla, y nadie pide eso a propósito, una región con varios toasts es el resultado normal de una app que cuenta lo que hizo. Los toasts se solapan sobre la huella de <strong>uno</strong>, el más nuevo al frente y los anteriores asomando por detrás; al pasar el puntero (o al entrar el foco con el teclado) la pila se abre y vuelve a ser la lista normal.",
    "toastPage.stackBody2":
      "La salida es <code>data-stack=\"off\"</code>, para la región rara cuyo objetivo <em>es</em> mostrar varios mensajes a la vez. El ejemplo de tonos de más arriba lo usa: son tres toasts que hay que ver juntos, no una pila.",
    "toastPage.stackBody3":
      "Agrupa sobre la caja del <strong>más nuevo</strong>: es el único que queda en flujo, así que la región mide lo que mide él, y los de atrás salen de flujo estirados a esa misma caja. Por eso la pila se lee como un objeto y no como cartas descuadradas: si cada uno midiera su propio contenido, un toast de dos líneas detrás de uno de una sobresaldría por arriba y ningún borde de la pila calzaría con el siguiente.",
    "toastPage.stackBody4":
      "El único número del efecto es la <strong>profundidad</strong>, y sale del DOM: <code>sibling-count() - sibling-index()</code> da 0 para el más nuevo y uno más por cada uno detrás. La app apendea y remueve nodos, nunca lleva un índice. La opacidad se apaga sola en el cuarto (<code>calc(3 - depth)</code> se clampea), y donde el navegador no soporta leer el índice en CSS la región queda como la lista normal de arriba, que es la degradación honesta.",
    "toastPage.stackBody5":
      "Esa misma profundidad es el <strong>retardo</strong> de cada paso al abrir (<code>--sk-toast-cascade</code>): el de adelante sale primero y cada uno detrás lo sigue un beat después, así la pila se despliega en vez de inflarse toda junta. Volver al flujo es un cambio de <em>layout</em>, y el layout no transiciona, en el instante en que dejan de estar absolutos ya están varias filas más arriba; eso no se puede interpolar, así que en vez de animar el salto se lo tapa: cada toast entra con un fade y unos pixeles de subida hasta el lugar que acaba de tomar, en la misma cascada. El más nuevo no participa, nunca se movió y no debe parpadear.",
    "toastPage.stackLabel": "Pila de toasts",
    "toastPage.stackNote": "Pasa el puntero para abrirla",
    "toastPage.stackBody6":
      "El JavaScript es el mismo del primer ejemplo, y el HTML también: clonar, insertar, montar y remover en <code>sk-dismiss</code>. No hay nada que agregar para apilar. Los hooks son de la región: <code>--sk-toast-peek</code> (cuánto asoma cada uno), <code>--sk-toast-shrink</code> (cuánto encoge cada paso hacia atrás) y <code>--sk-toast-cascade</code> (cuánto se separan en el tiempo al abrir). Ningún toast sabe que está en una pila.",
    "toastPage.closeTitle": "El cierre es un Button",
    "toastPage.closeBody1":
      'El ✕ se construye como <a href="/components/button">Button</a> icon-only en tamaño <code>sm</code> (<code>data-size="sm" data-icon-only data-variant="ghost"</code>), no como un control ad hoc. Con eso hereda lo que ya resuelve Button: la cara de 32px, el hit target de 44px que <code>::after</code> expande más allá de esa cara, el state layer de hover y presión, y el foco. Sin texto visible, <code>aria-label</code> es obligatorio.',
    "toastPage.closeBody2":
      "Conserva además la clase de parte <code>sk-toast__dismiss</code>; propia de Toast, no prestada de Callout: es el gancho que busca el enhancer para cablear el dismiss, la que hace que el glifo lea el color del tono (<code>currentColor</code>) en vez del acento que pintaría un ghost normal, y la que corrige la <strong>posición óptica</strong>. Un icon-only ghost es casi todo aire: 16px de glifo en una caja de 32px, más el inset del panel, dejan el ✕ flotando en un hueco. La parte lo tira de vuelta media unidad de inset, así el <em>glifo</em> cae donde el padding dice que está el borde del contenido, sin que el área de click pierda un pixel.",
    "toastPage.lifecycleTitle": "El ciclo de vida es de la app",
    "toastPage.lifecycleBody1":
      'Toast no gestiona colas ni persistencia: esos ciclos pertenecen a la aplicación. El componente aporta la región, reutiliza la anatomía de <a href="/components/callout">Callout</a>; icono, título, descripción, acciones; más su propio dismiss, anuncia el tono y avisa cuándo se quiere ir.',
    "toastPage.lifecycleBody2":
      'En Vanilla, <code>data-sk-toast</code> sobre un <code>sk-callout</code> registra el dismiss nativo y anuncia el tono. <code>data-timeout</code> es opcional; al vencer emite <code>sk-dismiss</code> (igual que el ✕) con <code>detail.reason</code>, <code>"timeout"</code> o <code>"dismiss"</code>, por si la app distingue “se fue solo” de “lo cerraron”. El componente nunca retira el nodo: eso lo hace quien lo puso.',
    "toastPage.reactBody":
      'El código está en la pestaña <strong>React</strong> de cada preview. La API refleja Callout (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) más <code>timeout</code> y <code>onDismiss</code> con razón. Sin <code>tone</code>, es neutral.',
    "toastPage.vanillaComment": "Los iconos se escriben como placeholders <span data-sk-icon>;\nmountIcons los reemplaza por el <svg> del set enlazado.",
    "toastPage.test1": "Aplica la semántica compartida de región viva y reporta el cierre por botón nativo.",
    "toastPage.test2": "Solo agenda los timeouts escritos a mano y los limpia durante el cleanup.",
    "toastPage.test3": "Monta el markup de toast escrito a mano a través del enhancer del registro.",
  },
  en: {
    "demo.toast.dismiss": "Dismiss",
    "demo.toast.linkCopied": "Link copied to clipboard.",
    "demo.toast.documentArchived": "Document archived",
    "demo.toast.movedToArchived": "Moved to Archived.",
    "demo.toast.undo": "Undo",
    "demo.toast.emit": "Emit toast",
    "demo.toast.dynamic": "The export finished.",
    "demo.toast.syncing": "Syncing",
    "demo.toast.syncingBody": "This may take a few seconds.",
    "demo.toast.deploymentCreated": "Deployment created",
    "demo.toast.deploymentCreatedBody": "The version is now available.",
    "demo.toast.connectionFailed": "Could not connect",
    "demo.toast.connectionFailedBody": "Check your connection and try again.",
    "demo.toast.status.saved": "Changes saved",
    "demo.toast.status.copied": "Link copied",
    "demo.toast.status.failed": "Could not save",
    "demo.toast.stack.first": "Export prepared.",
    "demo.toast.stack.second": "Report sent.",
    "demo.toast.stack.third": "Permissions updated.",

    "toastPage.description": "Toast: transient feedback in a floating region. Same anatomy as Callout, with the app's own lifecycle.",
    "toastPage.lede":
      'Toast communicates transient feedback in a floating region. The item is a <a href="/en/components/callout">Callout</a>, same markup, same tones, wrapped in <code>sk-toast-region</code> and in the toast\'s own lifecycle (mount, dismiss, optional timeout).',
    "toastPage.anatomyBody":
      "The region and one full toast: icon, content, title, description, actions, and dismiss. The item reuses Callout parts; only the close control is Toast's own. Frozen.",
    "toastPage.anatomyLabel": "Toast anatomy",
    "toastPage.anatomyPreviewLabel": "Toast, part by part",
    "toastPage.emitTitle": "After an action",
    "toastPage.emitBody":
      "This is the real case: a toast is never authored already visible, it appears because something happened. What stays stable in the HTML are three pieces: the control that fires the action, an <strong>empty</strong> <code>sk-toast-region</code>, and a <code>&lt;template&gt;</code> holding the item. The app clones, inserts, and mounts again; <code>initComponents</code> is idempotent, so it only touches what was just inserted.",
    "toastPage.emitLabel": "Toast after an action",
    "toastPage.emitNote": "Press the button",
    "toastPage.simpleTitle": "Simple",
    "toastPage.simpleBody":
      'tone="neutral" (the default). In a toast, color should almost never be the action signal: it already floats and retires. Neutral lets the text carry the notice without painting extra urgency, and it floats over a <strong>raised</strong> surface (<code>--color-bg-surface-raised</code> + <code>--elevation-raised</code>) to read as elevated chrome, not a page panel. See the same rule in <a href="/en/components/callout">Callout</a>.',
    "toastPage.simpleLabel": "Simple toast",
    "toastPage.statusTitle": "With state",
    "toastPage.statusBody1": 'Status tones color the panel. <code>danger</code> announces as <code>role="alert"</code> (assertive); the rest as <code>role="status"</code> (polite).',
    "toastPage.statusBody2":
      "The first carries no ✕: it has <code>data-timeout</code>, so it retires on its own. The other two ask something of the person: a rollout to confirm, an error to read: and so they stay until dismissed. The practical rule: <strong>if a toast can close itself, it needs no ✕; if it cannot, the ✕ is mandatory</strong>.",
    "toastPage.statusLabel": "Toast with state",
    "toastPage.actionTitle": "With an action",
    "toastPage.actionBody":
      "<code>sk-callout__actions</code> is a single column: the recovery action and the close control live there, in that order. A toast with an action carries no <code>data-timeout</code>: disappearing before someone can reach \"Undo\" turns the action into decoration.",
    "toastPage.actionLabel": "Toast with an action",
    "toastPage.stackTitle": "Stacked",
    "toastPage.stackBody1":
      "It is the <strong>default behavior</strong>, not an opt-in setting: four loose toasts eat a quarter of the screen, and nobody asks for that on purpose. A region with several toasts is the normal result of an app reporting what it did. Toasts overlap on the footprint of <strong>one</strong>, the newest in front and the earlier ones peeking out behind; hovering the pointer (or entering focus by keyboard) opens the stack back into a normal list.",
    "toastPage.stackBody2":
      "The escape hatch is <code>data-stack=\"off\"</code>, for the rare region whose <em>goal</em> is showing several messages at once. The tones example above uses it: those are three toasts meant to be seen together, not a stack.",
    "toastPage.stackBody3":
      "It groups on the box of the <strong>newest</strong> one: it is the only one that stays in flow, so the region measures whatever it measures, and the ones behind leave flow stretched to that same box. That is why the stack reads as one object instead of a fan of uneven cards: if each measured its own content, a two-line toast sitting behind a one-line one would poke out above, and no stack edge would line up with the next.",
    "toastPage.stackBody4":
      "The only number driving the effect is <strong>depth</strong>, and it comes straight from the DOM: <code>sibling-count() - sibling-index()</code> gives 0 for the newest and one more per toast behind it. The app appends and removes nodes, never keeps an index. Opacity fades out on its own by the fourth (<code>calc(3 - depth)</code> clamps), and where the browser cannot read the sibling index in CSS, the region falls back to the plain list above, which is the honest degradation.",
    "toastPage.stackBody5":
      "That same depth is the <strong>delay</strong> for each step on open (<code>--sk-toast-cascade</code>): the front one leaves first and each one behind follows a beat later, so the stack unfurls instead of inflating all at once. Returning to flow is a <em>layout</em> change, and layout does not transition: the instant they stop being absolute they are already several rows higher; that cannot be interpolated, so instead of animating the jump, it gets covered: every toast enters with a fade and a few pixels of rise into the spot it just took, on the same cascade. The newest one never participates: it never moved, and it must not flicker.",
    "toastPage.stackLabel": "Toast stack",
    "toastPage.stackNote": "Hover to open it",
    "toastPage.stackBody6":
      "The JavaScript is the same as the first example, and so is the HTML: clone, insert, mount, and remove on <code>sk-dismiss</code>. There is nothing extra to add for stacking. The hooks belong to the region: <code>--sk-toast-peek</code> (how much each one peeks out), <code>--sk-toast-shrink</code> (how much each step back shrinks), and <code>--sk-toast-cascade</code> (how far apart they open in time). No toast knows it is in a stack.",
    "toastPage.closeTitle": "The close control is a Button",
    "toastPage.closeBody1":
      'The ✕ is built as an icon-only <a href="/en/components/button">Button</a> at <code>sm</code> size (<code>data-size="sm" data-icon-only data-variant="ghost"</code>), not an ad hoc control. That way it inherits what Button already solved: the 32px face, the 44px hit target <code>::after</code> expands past that face, the hover/press state layer, and focus. With no visible text, <code>aria-label</code> is mandatory.',
    "toastPage.closeBody2":
      "It also carries the <code>sk-toast__dismiss</code> part class: Toast's own, not borrowed from Callout: it is the hook the enhancer looks for to wire up the dismiss, the one that makes the glyph read the tone's own color (<code>currentColor</code>) instead of the accent a normal ghost would paint, and the one that fixes the <strong>optical position</strong>. An icon-only ghost is almost all air: a 16px glyph inside a 32px box, plus the panel's own inset, leaves the ✕ floating in a gap. The part pulls it back half an inset unit, so the <em>glyph</em> lands where the padding says the content's edge is, without the click area losing a single pixel.",
    "toastPage.lifecycleTitle": "The lifecycle belongs to the app",
    "toastPage.lifecycleBody1":
      'Toast manages no queues and no persistence: those lifecycles belong to the application. The component supplies the region, reuses <a href="/en/components/callout">Callout</a>\'s anatomy. Icon, title, description, actions. Plus its own dismiss, announces the tone, and signals when it wants to leave.',
    "toastPage.lifecycleBody2":
      '\nIn Vanilla, <code>data-sk-toast</code> on a <code>sk-callout</code> registers the native dismiss and announces the tone. <code>data-timeout</code> is optional; on expiry it fires <code>sk-dismiss</code> (same as the ✕) with <code>detail.reason</code>, <code>"timeout"</code> or <code>"dismiss"</code>, in case the app distinguishes "it left on its own" from "someone closed it." The component never removes the node: whoever placed it does that.',
    "toastPage.reactBody":
      'The code is in each preview\'s <strong>React</strong> tab. The API mirrors Callout\'s (<code>title</code>, <code>icon</code>, <code>actions</code>, <code>tone</code>) plus <code>timeout</code> and <code>onDismiss</code> with a reason. With no <code>tone</code>, it is neutral.',
    "toastPage.vanillaComment": "Icons are written as <span data-sk-icon> placeholders;\nmountIcons replaces them with the <svg> of the linked set.",
    "toastPage.test1": "Applies the shared live-region semantics and reports native button dismissal.",
    "toastPage.test2": "Only schedules authored timeouts and clears them during cleanup.",
    "toastPage.test3": "Mounts authored toast markup through the registry enhancer.",
  },
} as const;
