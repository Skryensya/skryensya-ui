export const timelineMessages = {
  es: {
    "demo.timeline.label": "Historial del pedido",
    "demo.timeline.tonesLabel": "Los cinco tonos",
    "demo.timeline.delivered.time": "14 mar 2026, 14:20",
    "demo.timeline.delivered.heading": "Pedido entregado",
    "demo.timeline.delivered.body": "Firmado por L. Ortiz en la portería del edificio.",
    "demo.timeline.outForDelivery.time": "13 mar 2026, 08:05",
    "demo.timeline.outForDelivery.heading": "En reparto",
    "demo.timeline.outForDelivery.body": "Salió del centro de distribución de Quilicura.",
    "demo.timeline.delayed.time": "11 mar 2026, 17:40",
    "demo.timeline.delayed.heading": "Retrasado por el temporal",
    "demo.timeline.delayed.body": "La ruta a la región quedó cortada durante la tarde.",
    "demo.timeline.placed.time": "10 mar 2026, 09:12",
    "demo.timeline.placed.heading": "Pedido recibido",
    "demo.timeline.tone.accent.time": "Tono accent",
    "demo.timeline.tone.accent.heading": "Marca el evento que importa ahora",
    "demo.timeline.tone.success.time": "Tono success",
    "demo.timeline.tone.success.heading": "Algo terminó bien",
    "demo.timeline.tone.warning.time": "Tono warning",
    "demo.timeline.tone.warning.heading": "Algo se salió de lo esperado",
    "demo.timeline.tone.danger.time": "Tono danger",
    "demo.timeline.tone.danger.heading": "Algo falló",
    "demo.timeline.tone.neutral.time": "Sin tono",
    "demo.timeline.tone.neutral.heading": "Un evento cualquiera, que es la mayoría",

    "timelinePage.description":
      "Timeline: eventos que ya ocurrieron, leídos por un riel, con el tiempo como primer peldaño de la jerarquía.",
    "timelinePage.lede":
      "Una secuencia de cosas que <em>ya pasaron</em>. El tiempo no es un pie de página: es el primer peldaño de tres (cuándo, qué, y el detalle), y esa escala es toda la diferencia con <a href=\"/es/componentes/changelog\">Changelog</a>, que es un documento denso de versiones.",
    "timelinePage.anatomyBody":
      "Este diagrama nombra el riel, el evento y los tres peldaños de dentro. El espécimen está congelado; los Timeline vivos empiezan abajo.",
    "timelinePage.anatomyLabel": "Anatomía de Timeline",
    "timelinePage.anatomyPreviewLabel": "Timeline, parte por parte",
    "timelinePage.tonesTitle": "Los tonos",
    "timelinePage.tonesBody":
      "El tono pinta el punto para que el ojo se detenga al escanear, y nunca es lo único que lo dice: el punto es <code>aria-hidden</code> y el heading de al lado lleva el significado en palabras. Lee esta lista sin color y sigue reportando lo mismo.",
    "timelinePage.tonesPreviewLabel": "Timeline, los cinco tonos",
    "timelinePage.whenTitle": "Cuándo usarlo",
    "timelinePage.whenItem1":
      "Usa Timeline para historiales, seguimientos y registros de actividad: eventos que ya ocurrieron y cuyo cuándo importa tanto como el qué.",
    "timelinePage.whenItem2":
      'Usa <a href="/es/componentes/steps">Steps</a> cuando el lector esté <em>dentro</em> del proceso y haya que decirle en qué etapa va.',
    "timelinePage.whenItem3":
      'Usa <a href="/es/componentes/process-list">ProcessList</a> para instrucciones que hay que seguir, donde no hay tiempo.',
    "timelinePage.whenItem4":
      'Usa <a href="/es/componentes/changelog">Changelog</a> para versiones publicadas: tiene su propio vocabulario y una escala de documento.',
    "timelinePage.contractItem1": 'La raíz siempre es <code>&lt;ol class="sk-timeline"&gt;</code> con <code>role="list"</code>.',
    "timelinePage.contractItem2":
      "El tiempo son <strong>dos campos</strong>: la opción <code>time</code> es la máquina (ISO, va a <code>&lt;time datetime&gt;</code>) y el slot visible es el texto, que en React se llama <code>timeLabel</code>.",
    "timelinePage.contractItem3":
      "<code>heading</code> es lo único obligatorio de una entrada. Sin tiempo y sin detalle sigue siendo un Timeline válido.",
    "timelinePage.contractItem4":
      "No hay opción de orden: el autor la expresa escribiendo las entradas en el orden que quiere leerlas.",
    "timelinePage.contractItem5":
      "No hay estados <code>complete</code> / <code>current</code> / <code>upcoming</code>. Todo esto ya ocurrió; esos estados son de Steps.",
    "timelinePage.contractItem6":
      'El punto acepta el <a href="/es/componentes/icon">Icon</a> del kit, no un nodo cualquiera: así el nombre se valida contra el vocabulario estable y el dibujo sigue al set que use la página. <code>success</code>, <code>warning</code>, <code>danger</code> e <code>info</code> son roles que el sistema ya nombra, y por eso cada tono tiene un icono esperándolo.',
  },
  en: {
    "demo.timeline.label": "Order history",
    "demo.timeline.tonesLabel": "The five tones",
    "demo.timeline.delivered.time": "14 Mar 2026, 14:20",
    "demo.timeline.delivered.heading": "Order delivered",
    "demo.timeline.delivered.body": "Signed for by L. Ortiz at the building's front desk.",
    "demo.timeline.outForDelivery.time": "13 Mar 2026, 08:05",
    "demo.timeline.outForDelivery.heading": "Out for delivery",
    "demo.timeline.outForDelivery.body": "Left the Quilicura distribution centre.",
    "demo.timeline.delayed.time": "11 Mar 2026, 17:40",
    "demo.timeline.delayed.heading": "Delayed by the storm",
    "demo.timeline.delayed.body": "The route into the region was closed through the afternoon.",
    "demo.timeline.placed.time": "10 Mar 2026, 09:12",
    "demo.timeline.placed.heading": "Order received",
    "demo.timeline.tone.accent.time": "Accent tone",
    "demo.timeline.tone.accent.heading": "Marks the event that matters right now",
    "demo.timeline.tone.success.time": "Success tone",
    "demo.timeline.tone.success.heading": "Something finished well",
    "demo.timeline.tone.warning.time": "Warning tone",
    "demo.timeline.tone.warning.heading": "Something went off the expected path",
    "demo.timeline.tone.danger.time": "Danger tone",
    "demo.timeline.tone.danger.heading": "Something failed",
    "demo.timeline.tone.neutral.time": "No tone",
    "demo.timeline.tone.neutral.heading": "An ordinary event, which is most of them",

    "timelinePage.description":
      "Timeline: events that already happened, read down a rail, with the time as the first rung of the hierarchy.",
    "timelinePage.lede":
      "A sequence of things that <em>already happened</em>. The time is not a footnote: it is the first of three rungs (when, what, and the detail), and that scale is the whole difference from <a href=\"/components/changelog\">Changelog</a>, which is a dense document of releases.",
    "timelinePage.anatomyBody":
      "This diagram names the rail, the event and the three rungs inside it. The specimen is frozen; live Timelines start below.",
    "timelinePage.anatomyLabel": "Timeline anatomy",
    "timelinePage.anatomyPreviewLabel": "Timeline, part by part",
    "timelinePage.tonesTitle": "The tones",
    "timelinePage.tonesBody":
      "A tone paints the mark a reader's eye stops at while scanning, and it is never the only thing saying so: the dot is <code>aria-hidden</code> and the heading beside it carries the meaning in words. Read this list with the colour removed and it still reports the same thing.",
    "timelinePage.tonesPreviewLabel": "Timeline, the five tones",
    "timelinePage.whenTitle": "When to use it",
    "timelinePage.whenItem1":
      "Use Timeline for histories, tracking and activity logs: events that already happened, where the when matters as much as the what.",
    "timelinePage.whenItem2":
      'Use <a href="/components/steps">Steps</a> when the reader is <em>inside</em> the process and needs to be told which stage they are at.',
    "timelinePage.whenItem3":
      'Use <a href="/components/process-list">ProcessList</a> for instructions to follow, where there is no time at all.',
    "timelinePage.whenItem4":
      'Use <a href="/components/changelog">Changelog</a> for shipped releases: it has its own vocabulary and a document scale.',
    "timelinePage.contractItem1": 'The root is always <code>&lt;ol class="sk-timeline"&gt;</code> with <code>role="list"</code>.',
    "timelinePage.contractItem2":
      "The time is <strong>two fields</strong>: the <code>time</code> option is the machine one (ISO, written to <code>&lt;time datetime&gt;</code>) and the visible slot is the copy, which the React binding calls <code>timeLabel</code>.",
    "timelinePage.contractItem3":
      "<code>heading</code> is the only required part of an entry. With no time and no detail it is still a valid Timeline.",
    "timelinePage.contractItem4":
      "There is no order option: the author expresses it by writing the entries in the order they want them read.",
    "timelinePage.contractItem5":
      "There are no <code>complete</code> / <code>current</code> / <code>upcoming</code> states. All of this already happened; those states belong to Steps.",
    "timelinePage.contractItem6":
      'The dot takes the kit\'s <a href="/components/icon">Icon</a>, not any node, so the name is checked against the stable vocabulary and the drawing follows the set the page binds. <code>success</code>, <code>warning</code>, <code>danger</code> and <code>info</code> are roles the system already names, which is why a tone has an icon waiting for it.',
  },
} as const;
