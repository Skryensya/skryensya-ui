export const feedMessages = {
  es: {

    "feedPage.description":
      "Feed: un stream de publicaciones independientes, cada una anunciada con su posición.",
    "feedPage.lede":
      'Un stream desplazable de unidades de contenido independientes (posts, comentarios): el rol WAI-ARIA <code>feed</code>. Cada <code>FeedArticle</code> declara su propia posición (<code>aria-posinset</code>/<code>aria-setsize</code>), así un lector de pantalla anuncia "2 de 3" sin tener que leer el resto del stream primero.',
    "feedPage.body":
      'WAI-ARIA es explícito: el rol <code>feed</code> "no está asociado a ninguna convención de teclado bien establecida": Page Up/Page Down/Ctrl+Home/Ctrl+End son recomendaciones, no requisitos. Esta versión se queda puramente estática: sin máquina, sin manejo de teclado propio.',
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
      'La raíz lleva <code>role="feed"</code> con <code>aria-label</code> (obligatorio, el rol no trae nombre implícito) y <code>aria-busy</code> mientras carga más contenido. Cada <code>FeedArticle</code> es un <code>role="article"</code> con <code>aria-posinset</code>/<code>aria-setsize</code>, nombrado por su propio slot de etiqueta vía <code>aria-labelledby</code>: nunca solo referenciado, siempre renderizado.',

    "demo.feed.label": "Actividad reciente",
    "demo.feed.author1": "María. Hace 2 horas",
    "demo.feed.body1": "Publicó el resumen del sprint.",
    "demo.feed.author2": "Diego. Hace 5 horas",
    "demo.feed.body2": "Comentó en el issue #482.",
    "demo.feed.author3": "Lucía. Ayer",
    "demo.feed.body3": "Cerró tres tickets del backlog.",
  },
  en: {

    "feedPage.description":
      "Feed: a stream of independent posts, each announced with its own position.",
    "feedPage.lede":
      'A scrollable stream of independent content units (posts, comments): the WAI-ARIA <code>feed</code> role. Each <code>FeedArticle</code> states its own position (<code>aria-posinset</code>/<code>aria-setsize</code>), so a screen reader announces "2 of 3" without reading the rest of the stream first.',
    "feedPage.body":
      'WAI-ARIA is explicit: the <code>feed</code> role "is not associated with any well-established keyboard conventions": Page Up/Page Down/Ctrl+Home/Ctrl+End are recommendations, not requirements. This version stays purely static: no machine, no keyboard handling of its own.',
    "feedPage.test1": "Sets role=feed, names it, and reflects aria-busy.",
    "feedPage.anatomyBody":
      "This diagram names the feed, the article and its label. The specimen is frozen; the live Feeds begin below.",
    "feedPage.anatomyLabel": "Feed anatomy",
    "feedPage.anatomyPreviewLabel": "Feed, part by part",
    "feedPage.test2":
      "Each article gets role=article with aria-posinset/aria-setsize and a real labelled name.",
    "feedPage.test3": "Allows setSize=-1 for an undetermined total, per WAI's own allowance.",
    "feedPage.a11yBody":
      'The root carries <code>role="feed"</code> with <code>aria-label</code> (required, the role has no implicit name) and <code>aria-busy</code> while more content loads. Each <code>FeedArticle</code> is a <code>role="article"</code> with <code>aria-posinset</code>/<code>aria-setsize</code>, named by its own label slot via <code>aria-labelledby</code>: never just referenced, always rendered.',

    "demo.feed.label": "Recent activity",
    "demo.feed.author1": "María. 2 hours ago",
    "demo.feed.body1": "Posted the sprint summary.",
    "demo.feed.author2": "Diego. 5 hours ago",
    "demo.feed.body2": "Commented on issue #482.",
    "demo.feed.author3": "Lucía. Yesterday",
    "demo.feed.body3": "Closed three backlog tickets.",
  },
} as const;
