export const feedMessages = {
  es: {

    "feedPage.description":
      "Feed: un stream de publicaciones independientes, cada una anunciada con su posición.",
    "feedPage.lede":
      'Un stream desplazable de unidades de contenido independientes (posts, comentarios): el rol WAI-ARIA <code>feed</code>. Cada <code>FeedArticle</code> declara su propia posición (<code>aria-posinset</code>/<code>aria-setsize</code>), así un lector de pantalla anuncia "2 de 3" sin tener que leer el resto del stream primero.',
    "feedPage.body":
      "Un Feed es estático salvo que se le pida otra cosa: la posición, el total y el nombre son markup y no necesitan JavaScript. El modelo de teclado que el patrón recomienda es aparte y opcional, en <code>keyboard</code>, y está más abajo.",
    "feedPage.test1": "Aplica role=feed, lo nombra, y refleja aria-busy.",
    "feedPage.anatomyBody":
      "Este diagrama nombra el feed, el artículo y su etiqueta. El espécimen está congelado; los Feed vivos empiezan abajo.",
    "feedPage.anatomyLabel": "Anatomía de Feed",
    "feedPage.anatomyPreviewLabel": "Feed, parte por parte",
    "feedPage.test2":
      "Cada artículo recibe role=article con aria-posinset/aria-setsize y un nombre real enlazado.",
    "feedPage.test3":
      "Permite setSize=-1 para un total indeterminado, por la propia licencia de WAI.",
    "feedPage.a11yBody":
      'La raíz lleva <code>role="feed"</code> con <code>aria-label</code> (obligatorio, el rol no trae nombre implícito) y <code>aria-busy</code> mientras carga más contenido. Cada <code>FeedArticle</code> es un <code>role="article"</code> con <code>aria-posinset</code>/<code>aria-setsize</code>, nombrado por su propio slot de etiqueta vía <code>aria-labelledby</code>: nunca solo referenciado, siempre renderizado. Con <code>keyboard</code> activado el artículo además recibe foco, y lleva el mismo anillo de foco que una fila de Treegrid, porque lo enfocado es un bloque y no un control.',

    "feedPage.demoTitle": "Ejemplos",
    "feedPage.demoBody":
      "De lo más simple a lo que realmente se escribe: tres posts de texto plano, un feed de actividad compuesto, el estado de carga y un stream sin total conocido.",
    "feedPage.demoActivityTitle": "Feed de actividad",
    "feedPage.demoActivityBody":
      'El slot <code>label</code> acepta un nodo, no un string: acá es un <code>Avatar</code>, el nombre y la hora, y el cuerpo lleva un <code>Tag</code>. El nombre accesible del artículo sigue saliendo de lo que ese slot renderizó, porque <code>labelledBySlot</code> apunta al nodo real. Este demo trae <code>keyboard</code> activado: probá Page Down.',
    "feedPage.demoActivityLabel": "Feed de actividad con identidades compuestas",
    "feedPage.demoBusyTitle": "Cargando más",
    "feedPage.demoBusyBody":
      'Con <code>busy</code>, la raíz anuncia <code>aria-busy="true"</code> mientras llega el siguiente lote. Los esqueletos son <code>Placeholder</code> (decorativos por construcción) y que algo está cargando lo dice UNA sola vez un <code>Loader.status</code>: tres esqueletos narrando "cargando" lo dicen tres veces, que es peor que el silencio.',
    "feedPage.demoBusyLabel": "Feed con un lote en vuelo",
    "feedPage.demoInfiniteTitle": "Total desconocido",
    "feedPage.demoInfiniteBody":
      'Cada artículo declara <code>setSize: -1</code>, el valor que WAI reserva para un stream sin final conocido, así un lector de pantalla anuncia la posición sin inventar un total que nadie sabe. El botón agrega el siguiente lote; el enhancer observa el subárbol, así que los artículos nuevos entran en la secuencia de Tab sin que el foco tenga que volver a entrar al feed.',
    "feedPage.demoInfiniteLabel": "Stream con botón de cargar más",
    "feedPage.demoCommentsTitle": "Stream de comentarios",
    "feedPage.demoCommentsBody":
      "Comentarios planos, que sólo se leen: sin respuestas anidadas y sin controles de votar o responder. En cuanto aparece cualquiera de esas dos cosas la respuesta cambia y el componente es <code>CommentThread</code>. Esa frase vive en el contrato semántico; acá se ve.",
    "feedPage.demoCommentsLabel": "Feed de comentarios planos",
    "feedPage.keyboardTitle": "Teclado",
    "feedPage.keyboardBody1":
      'WAI-ARIA es explícito: el rol <code>feed</code> "no está asociado a ninguna convención de teclado bien establecida". Page Down, Page Up, Ctrl+Inicio y Ctrl+Fin son RECOMENDACIONES, no requisitos, a diferencia de todos los demás patrones de foco móvil de este catálogo. Por eso el modelo es opcional y viene apagado: <code>keyboard</code>.',
    "feedPage.keyboardBody2":
      "Con la opción activada, cada artículo entra en la secuencia de Tab (<code>tabindex=\"0\"</code> en todos, como en el propio ejemplo de WAI, y no un foco móvil 0/-1: un feed se lee, no se opera). En los extremos la tecla NO se consume, así Page Down en el último artículo conserva su significado nativo y la página sigue haciendo scroll.",
    "feedPage.keyboardBody3":
      "Ctrl+Inicio y Ctrl+Fin SALEN del feed, al primer elemento enfocable antes o después: no van al primer o último artículo. Es lo que dice el patrón, y también se acepta Cmd en macOS, que no tiene convención de Ctrl+Inicio.",
    "feedPage.keyboardTableCaption": "Teclas que atiende un feed con keyboard activado",
    "feedPage.keyboardKey": "Tecla",
    "feedPage.keyboardDoes": "Qué hace",
    "feedPage.keyboardPageDown": "Mueve el foco al artículo siguiente.",
    "feedPage.keyboardPageUp": "Mueve el foco al artículo anterior.",
    "feedPage.keyboardCtrlEnd": "Mueve el foco al primer elemento enfocable DESPUÉS del feed.",
    "feedPage.keyboardCtrlHome": "Mueve el foco al primer elemento enfocable ANTES del feed.",
    "feedPage.test4": "Resuelve Page Down y Page Up un artículo por vez, sin dar la vuelta.",

    "demo.feed.label": "Actividad reciente",
    "demo.feed.author1": "María. Hace 2 horas",
    "demo.feed.body1": "Publicó el resumen del sprint.",
    "demo.feed.author2": "Diego. Hace 5 horas",
    "demo.feed.body2": "Comentó en el issue #482.",
    "demo.feed.author3": "Lucía. Ayer",
    "demo.feed.body3": "Cerró tres tickets del backlog.",
    "demo.feed.when1": "Hace 2 horas",
    "demo.feed.when2": "Hace 5 horas",
    "demo.feed.when3": "Ayer",
    "demo.feed.activity1": "Publicó el resumen del sprint y etiquetó la versión.",
    "demo.feed.activity2": "Comentó en el issue #482 sobre el foco del combobox.",
    "demo.feed.activity3": "Cerró tres tickets del backlog de accesibilidad.",
    "demo.feed.tagRelease": "Versión 2.4",
    "demo.feed.tagClosed": "3 cerrados",
    "demo.feed.loadingLabel": "Cargando más publicaciones",
    "demo.feed.streamLabel": "Novedades",
    "demo.feed.loadMore": "Cargar más",
    "demo.feed.commentsLabel": "Comentarios",
    "demo.feed.commentAuthor1": "Paula",
    "demo.feed.commentAuthor2": "Tomás",
    "demo.feed.comment1": "Me pasó lo mismo con el lector de pantalla en Firefox.",
    "demo.feed.comment2": "Buenísimo el cambio, ahora el orden de lectura tiene sentido.",

  },
  en: {

    "feedPage.description":
      "Feed: a stream of independent posts, each announced with its own position.",
    "feedPage.lede":
      'A scrollable stream of independent content units (posts, comments): the WAI-ARIA <code>feed</code> role. Each <code>FeedArticle</code> states its own position (<code>aria-posinset</code>/<code>aria-setsize</code>), so a screen reader announces "2 of 3" without reading the rest of the stream first.',
    "feedPage.body":
      "A Feed is static unless you ask for more: the position, the total and the name are markup and need no JavaScript. The keyboard model the pattern recommends is separate and optional, behind <code>keyboard</code>, and it is below.",
    "feedPage.test1": "Sets role=feed, names it, and reflects aria-busy.",
    "feedPage.anatomyBody":
      "This diagram names the feed, the article and its label. The specimen is frozen; the live Feeds begin below.",
    "feedPage.anatomyLabel": "Feed anatomy",
    "feedPage.anatomyPreviewLabel": "Feed, part by part",
    "feedPage.test2":
      "Each article gets role=article with aria-posinset/aria-setsize and a real labelled name.",
    "feedPage.test3": "Allows setSize=-1 for an undetermined total, per WAI's own allowance.",
    "feedPage.a11yBody":
      'The root carries <code>role="feed"</code> with <code>aria-label</code> (required, the role has no implicit name) and <code>aria-busy</code> while more content loads. Each <code>FeedArticle</code> is a <code>role="article"</code> with <code>aria-posinset</code>/<code>aria-setsize</code>, named by its own label slot via <code>aria-labelledby</code>: never just referenced, always rendered. With <code>keyboard</code> on the article also takes focus, and carries the same focus ring a Treegrid row gets, because what is focused is a block rather than a control.',

    "feedPage.demoTitle": "Examples",
    "feedPage.demoBody":
      "Simplest first, then what actually gets written: three plain-text posts, a composed activity feed, the loading state, and a stream with no known total.",
    "feedPage.demoActivityTitle": "Activity feed",
    "feedPage.demoActivityBody":
      'The <code>label</code> slot accepts a node, not a string: here it is an <code>Avatar</code>, the name and the time, and the body carries a <code>Tag</code>. The article\'s accessible name still comes from whatever that slot rendered, because <code>labelledBySlot</code> points at the real node. This demo has <code>keyboard</code> on: try Page Down.',
    "feedPage.demoActivityLabel": "Activity feed with composed identities",
    "feedPage.demoBusyTitle": "Loading more",
    "feedPage.demoBusyBody":
      'With <code>busy</code>, the root announces <code>aria-busy="true"</code> while the next batch is in flight. The skeletons are <code>Placeholder</code>s (decorative by construction) and the fact that something is loading is announced ONCE by a <code>Loader.status</code>: three skeletons each narrating "loading" says it three times, which is worse than the silence.',
    "feedPage.demoBusyLabel": "Feed with a batch in flight",
    "feedPage.demoInfiniteTitle": "Unknown total",
    "feedPage.demoInfiniteBody":
      "Every article states <code>setSize: -1</code>, the value WAI reserves for a stream with no known end, so a screen reader announces the position without inventing a total nobody has. The button appends the next batch; the enhancer watches the subtree, so new articles join the Tab sequence without focus ever having to re-enter the feed.",
    "feedPage.demoInfiniteLabel": "Stream with a load-more button",
    "feedPage.demoCommentsTitle": "Comment stream",
    "feedPage.demoCommentsBody":
      "Flat comments, read only: no nested replies and no vote or reply controls. The moment either appears the answer changes and the component is <code>CommentThread</code>. That sentence lives in the semantic contract; here you can see it.",
    "feedPage.demoCommentsLabel": "Flat comment feed",
    "feedPage.keyboardTitle": "Keyboard",
    "feedPage.keyboardBody1":
      'WAI-ARIA is explicit: the <code>feed</code> role "is not associated with any well-established keyboard conventions". Page Down, Page Up, Ctrl+Home and Ctrl+End are RECOMMENDATIONS, not requirements, unlike every other roving-focus pattern in this catalogue. So the model is optional and ships off: <code>keyboard</code>.',
    "feedPage.keyboardBody2":
      'With the option on, every article joins the Tab sequence (<code>tabindex="0"</code> on each, as WAI\'s own example does, and not a roving 0/-1: a feed is read, not operated). At either end the key is NOT consumed, so Page Down on the last article keeps its native meaning and the page still scrolls.',
    "feedPage.keyboardBody3":
      "Ctrl+Home and Ctrl+End LEAVE the feed, to the first focusable element before or after it: they do not go to the first or last article. That is what the pattern says, and Cmd is accepted too on macOS, which has no Ctrl+Home convention.",
    "feedPage.keyboardTableCaption": "Keys a feed with keyboard on answers to",
    "feedPage.keyboardKey": "Key",
    "feedPage.keyboardDoes": "What it does",
    "feedPage.keyboardPageDown": "Move focus to the next article.",
    "feedPage.keyboardPageUp": "Move focus to the previous article.",
    "feedPage.keyboardCtrlEnd": "Move focus to the first focusable element AFTER the feed.",
    "feedPage.keyboardCtrlHome": "Move focus to the first focusable element BEFORE the feed.",
    "feedPage.test4": "Resolves Page Down and Page Up one article at a time, without wrapping.",

    "demo.feed.label": "Recent activity",
    "demo.feed.author1": "María. 2 hours ago",
    "demo.feed.body1": "Posted the sprint summary.",
    "demo.feed.author2": "Diego. 5 hours ago",
    "demo.feed.body2": "Commented on issue #482.",
    "demo.feed.author3": "Lucía. Yesterday",
    "demo.feed.body3": "Closed three backlog tickets.",
    "demo.feed.when1": "2 hours ago",
    "demo.feed.when2": "5 hours ago",
    "demo.feed.when3": "Yesterday",
    "demo.feed.activity1": "Posted the sprint summary and tagged the release.",
    "demo.feed.activity2": "Commented on issue #482 about combobox focus.",
    "demo.feed.activity3": "Closed three tickets from the accessibility backlog.",
    "demo.feed.tagRelease": "Release 2.4",
    "demo.feed.tagClosed": "3 closed",
    "demo.feed.loadingLabel": "Loading more posts",
    "demo.feed.streamLabel": "What's new",
    "demo.feed.loadMore": "Load more",
    "demo.feed.commentsLabel": "Comments",
    "demo.feed.commentAuthor1": "Paula",
    "demo.feed.commentAuthor2": "Tomás",
    "demo.feed.comment1": "Same thing happened to me with the screen reader on Firefox.",
    "demo.feed.comment2": "Great change, the reading order finally makes sense.",

  },
} as const;
