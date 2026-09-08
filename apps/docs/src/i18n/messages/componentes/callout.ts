export const calloutMessages = {
  es: {

    "demo.callout.neutral.title": "Mantenimiento programado",
    "demo.callout.neutral.body":
      "El domingo de 02:00 a 04:00 UTC el panel estará en solo lectura.",
    "demo.callout.info.title": "Nueva versión",
    "demo.callout.info.body": "Una actualización está disponible.",
    "demo.callout.warning.title": "Tu plan expira en 3 días",
    "demo.callout.warning.body":
      "Elige un plan para no interrumpir los despliegues.",
    "demo.callout.warning.action": "Ver planes",
    "demo.callout.success.body": "Tus cambios se guardaron.",
    "demo.callout.success.action": "Ver detalle",

    "callout.description":
      "Callout: mensaje inline persistente con tono (incluido neutral), anuncio accesible y componente React.",
    "callout.betaBadge": "Beta",
    "callout.lede1":
      "Callout es un mensaje inline que permanece en el layout mientras dure su condición. A diferencia de Toast, transitorio y montado en una región flotante, Callout vive en el flujo del contenido. Un solo peso visual, el panel con borde: el tono es la única variable, así que dos Callouts nunca compiten por cuál se ve más urgente.",
    "callout.lede2":
      "Es puramente informativo: muestra algo, no ejecuta nada. No tiene cierre; a diferencia de Toast, Callout no se puede descartar, porque nada en la página depende de que desaparezca. La única pieza interactiva que puede llevar es una acción de recuperación, y el contrato la limita a <code>translucent</code> o <code>danger</code> para que nunca compita con la acción primaria real de la página.",
    "callout.tonesTitle": "Tonos",
    "callout.tonesBody1":
      'El tono decide si el panel se pinta con color semántico. <code>info</code>, <code>success</code>, <code>warning</code> y <code>danger</code> colorean el mensaje. Solo <code>danger</code> se anuncia como <code>role="alert"</code> (assertive); el resto usa <code>role="status"</code> (polite); es la minoría de casos que de verdad interrumpe, no el nombre del componente, el que decide eso.',
    "callout.tonesBody2":
      "Los cuatro leen un <strong>rol de feedback</strong>, nunca el acento: el tono dice qué pasó, así que no puede cambiar cuando cambia la marca. <code>info</code> tuvo su propia rampa recién en la decisión 26 (<code>docs/decisiones/0019-paletas-publicas-y-semanticos-constantes.md</code>); antes leía <code>accent</code>, y una marca magenta pintaba de magenta cada aviso informativo.",
    "callout.neutralTitle": "Neutral",
    "callout.neutralBody":
      "El default: superficie y borde, sin pintura semántica. Existe para cuando el color no debería ser la señal prominente, el texto ya carga el mensaje. Úsalo en avisos ordinarios, confirmaciones breves o cualquier caso donde pintar el panel de “éxito” o “info” añadiría urgencia que el contenido no tiene.",
    "callout.neutralLabel": "Callout neutral",
    "callout.infoTitle": "Info, con título",
    "callout.infoBody": "Un título junto al icono nombra la condición en vez de solo describirla en la primera línea.",
    "callout.infoLabel": "Callout info",
    "callout.warningTitle": "Warning, con un Link de recuperación",
    "callout.warningBody": "La acción de recuperación es un <code>Link</code> simple: un destino, no un comando.",
    "callout.warningLabel": "Callout warning",
    "callout.successTitle": "Success, con un Button translucent",
    "callout.successBody":
      'Cuando la acción es un <a href="/componentes/button">Button</a>, el slot solo acepta <code>variant="translucent"</code> o <code>variant="danger"</code>; nunca <code>accent</code> ni el default <code>neutral</code>: un Callout no es el lugar de la llamada a la acción accent de la página. Usa <code>translucent</code> para botones que se mezclan con el fondo coloreado del callout, y <code>danger</code> cuando necesites una acción destructiva que destaque visualmente.',
    "callout.successLabel": "Callout success",
    "callout.anatomyTitle": "Anatomía",
    "callout.anatomyItem1": "<code>sk-callout__icon</code> es decorativo y solo aparece cuando aporta una señal visual.",
    "callout.anatomyItem2": "<code>sk-callout__content</code> agrupa título opcional y descripción.",
    "callout.anatomyItem3":
      "<code>sk-callout__actions</code> aloja la acción de recuperación opcional que pertenece al consumidor; nunca un cierre: Callout no tiene ninguno.",
    "callout.anatomyItem4":
      "<code>data-tone</code> acepta <code>neutral</code> (default), <code>info</code>, <code>success</code>, <code>warning</code> o <code>danger</code>.",
    "callout.reactBody":
      'El código está en la pestaña <strong>React</strong> de cada ejemplo. <code>actions</code> es el único punto de interactividad: un <code>ReactNode</code> que el consumidor arma con el <code>Link</code> o el <code>Button</code> (<code>translucent</code>/<code>danger</code>) que necesite. No hay <code>dismissible</code> ni <code>onDismiss</code>; si necesitas que el mensaje se pueda cerrar, es un <a href="/componentes/toast">Toast</a>, no un Callout.',
    "callout.test1": "El tono danger se anuncia asertivo (<code>role=\"alert\"</code>); los demás, con cortesía.",
    "callout.test2": "Nunca renderiza un control para cerrarlo: no es dismissible.",
    "callout.test3": "El icono y las acciones opcionales se renderizan como partes explícitas.",
  },
  en: {

    "demo.callout.neutral.title": "Scheduled maintenance",
    "demo.callout.neutral.body":
      "On Sunday from 02:00 to 04:00 UTC the panel will be read-only.",
    "demo.callout.info.title": "New version",
    "demo.callout.info.body": "An update is available.",
    "demo.callout.warning.title": "Your plan expires in 3 days",
    "demo.callout.warning.body":
      "Choose a plan so your deployments are not interrupted.",
    "demo.callout.warning.action": "View plans",
    "demo.callout.success.body": "Your changes have been saved.",
    "demo.callout.success.action": "View details",

    "callout.description":
      "Callout: persistent inline message with tone (including neutral), an accessible announcement and a React component.",
    "callout.betaBadge": "Beta",
    "callout.lede1":
      "Callout is an inline message that stays in the layout for as long as its condition holds. Unlike Toast, transient and mounted in a floating region, Callout lives in the flow of content. One visual weight, the bordered panel: tone is the only variable, so two Callouts never compete over which looks more urgent.",
    "callout.lede2":
      "It is purely informational: it shows something, it runs nothing. It has no dismiss; unlike Toast, a Callout cannot be dismissed, because nothing on the page depends on it going away. The one interactive piece it can carry is a recovery action, and the contract narrows it to <code>translucent</code> or <code>danger</code> so it never competes with the page's real accent action.",
    "callout.tonesTitle": "Tones",
    "callout.tonesBody1":
      'The tone decides whether the panel paints with semantic color. <code>info</code>, <code>success</code>, <code>warning</code> and <code>danger</code> color the message. Only <code>danger</code> announces as <code>role="alert"</code> (assertive); the rest use <code>role="status"</code> (polite); it is the minority of cases that truly interrupt, not the component\'s name, that decides that.',
    "callout.tonesBody2":
      "All four read a <strong>feedback role</strong>, never the accent: tone says what happened, so it cannot change when the brand changes. <code>info</code> only got its own ramp in decision 26 (<code>docs/decisiones/0019-paletas-publicas-y-semanticos-constantes.md</code>); before, it read <code>accent</code>, and a magenta brand painted every informational notice magenta.",
    "callout.neutralTitle": "Neutral",
    "callout.neutralBody":
      "The default: surface and border, no semantic paint. It exists for when color should not be the prominent signal, because the text already carries the message. Use it for ordinary notices, short confirmations, or any case where painting the panel \"success\" or \"info\" would add urgency the content doesn't have.",
    "callout.neutralLabel": "Neutral callout",
    "callout.infoTitle": "Info, with a title",
    "callout.infoBody": "A title next to the icon names the condition instead of only describing it in the first line.",
    "callout.infoLabel": "Info callout",
    "callout.warningTitle": "Warning, with a recovery Link",
    "callout.warningBody": "The recovery action is a plain <code>Link</code>: a destination, not a command.",
    "callout.warningLabel": "Warning callout",
    "callout.successTitle": "Success, with a translucent Button",
    "callout.successBody":
      'When the action is a <a href="/en/components/button">Button</a>, the slot only accepts <code>variant="translucent"</code> or <code>variant="danger"</code>; never <code>accent</code> nor the default <code>neutral</code>: a Callout is not the place for the page\'s main call to action. Use <code>translucent</code> for buttons that blend with the callout\'s colored background, and <code>danger</code> when you need a destructive action to stand out visually.',
    "callout.successLabel": "Success callout",
    "callout.anatomyTitle": "Anatomy",
    "callout.anatomyItem1": "<code>sk-callout__icon</code> is decorative and only appears when it carries a visual signal.",
    "callout.anatomyItem2": "<code>sk-callout__content</code> groups the optional title and description.",
    "callout.anatomyItem3":
      "<code>sk-callout__actions</code> hosts the optional recovery action that belongs to the consumer; never a dismiss control: Callout has none.",
    "callout.anatomyItem4":
      "<code>data-tone</code> accepts <code>neutral</code> (default), <code>info</code>, <code>success</code>, <code>warning</code> or <code>danger</code>.",
    "callout.reactBody":
      'The code is in the <strong>React</strong> tab of each example. <code>actions</code> is the only point of interactivity: a <code>ReactNode</code> the consumer assembles from whichever <code>Link</code> or <code>Button</code> (<code>translucent</code>/<code>danger</code>) it needs. There is no <code>dismissible</code> or <code>onDismiss</code>; if you need the message to be closable, that\'s a <a href="/en/components/toast">Toast</a>, not a Callout.',
    "callout.test1": 'The danger tone announces assertively (<code>role="alert"</code>); every other tone, politely.',
    "callout.test2": "Never renders a dismiss control: it is not dismissible.",
    "callout.test3": "The icon and optional actions render as explicit parts.",
  },
} as const;
