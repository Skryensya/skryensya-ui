export const tocMessages = {
  es: {

    "toc.title": "En esta página",
    "demo.toc.title": "En esta página",
    "demo.toc.summary": "Resumen",
    "demo.toc.installation": "Instalación",
    "demo.toc.configuration": "Configuración",
    "demo.toc.configuration.env": "Variables de entorno",
    "demo.toc.configuration.flags": "Flags opcionales",
    "demo.toc.reference": "Referencia",

    "tocPage.description": "Toc: el índice de un documento largo. Lista sus secciones (h2/h3) y marca la actual con scroll-spy.",
    "tocPage.lede":
      'El índice de un documento: una lista de enlaces a sus secciones (<code>h2</code>/<code>h3</code>), con la actual marcada por un scroll-spy. Cada fila es un enlace con <a href="/state-layer"><code>sk-interactive</code></a> (state layer) en tamaño caption: un índice se escanea, no se lee, y a tamaño de prosa competía con el documento que indexa. El icono es opcional.',
    "tocPage.anatomyBody":
      "Este diagrama nombra el aside, el nav, el título y cada parte del enlace con icono. El espécimen está congelado; los índices vivos empiezan abajo.",
    "tocPage.anatomyLabel": "Anatomía de Toc",
    "tocPage.anatomyPreviewLabel": "Toc, parte por parte",
    "tocPage.plainTitle": "Lista",
    "tocPage.plainBody": "Raíz <code>&lt;aside&gt;</code> y dentro un <code>&lt;nav&gt;</code> con el título y la lista de enlaces. No hay shell que abrir: el índice se ve desde el primer paint.",
    "tocPage.plainLabel": "Texto",
    "tocPage.levelsTitle": "Niveles",
    "tocPage.levelsBody":
      'Un <code>h3</code> marca <code>data-level="h3"</code> y se sangra bajo su <code>h2</code>. La sangría la lleva el enlace, nunca el ítem: en el ítem movería el borde inicial de la fila y con él la columna donde se pinta la marca de la sección actual, que dejaría de ser una sola línea vertical.',
    "tocPage.levelsLabel": "h2 y h3",
    "tocPage.iconsTitle": "Iconos",
    "tocPage.iconsBody": "El enlace admite un ícono decorativo delante de la etiqueta: la etiqueta ya nombra el destino, así que el ícono no lleva accesible name propio.",
    "tocPage.iconsLabel": "Con iconos",
    "tocPage.iconsCodeLabel": "enlace con icono",
    "tocPage.railTitle": "Una sola forma",
    "tocPage.railBody1":
      'El contrato publica UNA forma y no tiene variantes: un índice compacto, siempre abierto. Antes publicaba dos -un <code>&lt;details&gt;</code> cerrado, más un <strong>rail</strong> que un consumidor pedía declarando <code>data-sk-toc-rail</code>- y la costura se veía en el peor lugar posible: toda la apariencia del rail vivía detrás de ese atributo <em>y</em> de un <code>min-width: 72rem</code>, así que esta misma página no podía mostrar la forma sobre la que corre el sitio. Un frame de preview mide 1022px y la compuerta pedía 1152px.',
    "tocPage.railBody2":
      'Lo único que sigue detrás de <code>wide</code> son las dos declaraciones que de verdad necesitan una columna de sobra: <code>position: sticky</code> y el ancho fijo. Un host angosto recibe el mismo índice en flujo normal -una diferencia de layout, no una segunda forma del componente-. Las filas llevan el gutter ellas mismas en vez del contenedor: el destino táctil llega a los dos bordes de la pantalla mientras el texto se queda en el margen del documento.',
    "tocPage.spaceTitle": "Espacio reservado",
    "tocPage.spaceBody":
      "En este sitio el track del grid es el ancho del TOC (<code>--docs-toc-inline-size</code>). El <code>&lt;aside&gt;</code> está siempre en flujo: antes de <code>data-ready</code> la lista queda invisible con altura mínima, así los enlaces no empujan el layout al aparecer.",
    "tocPage.clsTitle": "Sin CLS",
    "tocPage.clsBody":
      "Un árbol ya conoce sus ítems al componerse: es el caso de arriba. El shell real de este sitio tampoco los descubre en el navegador: los encabezados de una página estática son los mismos para todos los lectores, así que calcularlos en cada carga es pagar todas las veces por un dato que ya era cierto al compilar. El layout renderiza el cuerpo de la página a HTML (<code>Astro.slots.render</code>), lee ahí sus propias secciones y las entrega como <code>items</code>: la lista viaja en el HTML, con los <code>id</code> ya puestos en los encabezados. Sin secciones, marca <code>data-empty</code>.",
    "tocPage.clsCodeLabel": "en el layout",
    "tocPage.clsBody2":
      "Lo único que queda en el navegador es lo que no se puede saber antes de que haya un lector: el scroll-spy, y las páginas cuyo índice depende del estado (la de Accordion arma uno por tab, así que el layout la marca <code>pending</code> y deja la lista a su propio script).",
    "tocPage.clsBody3":
      "Montado, el mismo enhancer conecta el switch rail/disclosure y el scroll-spy que marca <code>aria-current</code> según la sección que cruza la banda superior del viewport: <code>connectToc</code>, detrás de <code>data-sk-toc</code>.",
    "tocPage.contractItem1":
      'Raíz: <code>&lt;aside class="sk-toc" data-sk-toc&gt;</code> con un <code>&lt;details class="sk-toc__inner" data-sk-toc-disclosure&gt;</code> dentro: <code>&lt;summary class="sk-toc__summary"&gt;</code> y <code>&lt;ul class="sk-toc__list"&gt;</code>.',
    "tocPage.contractItem2": "Forma: una sola, un <code>&lt;details&gt;</code> cerrado. Rail sticky es una decisión del consumidor, no del contrato (ver arriba).",
    "tocPage.contractItem3":
      "Cada ítem: <code>sk-toc__item</code> con su <code>data-level</code>. El enlace es <code>sk-toc__link sk-interactive</code>, con la etiqueta en <code>sk-toc__label</code> y un gutter inicial (<code>--sk-toc-gutter</code>) donde vive la marca de la sección actual.",
    "tocPage.contractItem4": 'Icono opcional: <code>&lt;span class="sk-toc__icon"&gt;</code> como primer hijo del enlace.',
    "tocPage.contractItem5": 'Estado activo: <code>aria-current="true"</code> en el enlace, escrito por el scroll-spy en tiempo de ejecución.',
    "tocPage.test1": "Nombra el nav a partir del caption y da nivel a cada ítem.",
    "tocPage.test2": "Siembra <code>aria-current</code> desde la composición antes de que el spy reporte.",
    "tocPage.test3": "Mueve <code>aria-current</code> a medida que los encabezados entran a la banda.",
  },
  en: {

    "toc.title": "On this page",
    "demo.toc.title": "On this page",
    "demo.toc.summary": "Summary",
    "demo.toc.installation": "Installation",
    "demo.toc.configuration": "Configuration",
    "demo.toc.configuration.env": "Environment variables",
    "demo.toc.configuration.flags": "Optional flags",
    "demo.toc.reference": "Reference",

    "tocPage.description": "Toc: the index of a long document. Lists its sections (h2/h3) and marks the current one with a scroll-spy.",
    "tocPage.lede":
      'A document\'s index: a list of links to its sections (<code>h2</code>/<code>h3</code>), with the current one marked by a scroll-spy. Every row is a link carrying <a href="/en/state-layer"><code>sk-interactive</code></a> (state layer) at caption size: an index gets scanned, not read, and at prose size it competed with the document it indexes. The icon is optional.',
    "tocPage.anatomyBody":
      "This diagram names the aside, the nav, the title, and each part of an icon link. The specimen is frozen; the live indexes start below.",
    "tocPage.anatomyLabel": "Toc anatomy",
    "tocPage.anatomyPreviewLabel": "Toc, part by part",
    "tocPage.plainTitle": "List",
    "tocPage.plainBody": "Root <code>&lt;aside&gt;</code> and, inside it, a <code>&lt;nav&gt;</code> holding the caption and the link list. There is no shell to open: the index is readable from first paint.",
    "tocPage.plainLabel": "Text",
    "tocPage.levelsTitle": "Levels",
    "tocPage.levelsBody":
      "An <code>h3</code> is marked <code>data-level=\"h3\"</code> and indents under its <code>h2</code>. The link carries the indent, never the item: on the item it would shift the row's own leading edge and, with it, the column where the current-section mark is painted, which would stop being one straight vertical line.",
    "tocPage.levelsLabel": "h2 and h3",
    "tocPage.iconsTitle": "Icons",
    "tocPage.iconsBody": "The link accepts a decorative icon ahead of the label: the label already names the destination, so the icon carries no accessible name of its own.",
    "tocPage.iconsLabel": "With icons",
    "tocPage.iconsCodeLabel": "link with an icon",
    "tocPage.railTitle": "One shape",
    "tocPage.railBody1":
      "The contract publishes ONE shape and has no variants: a compact index, always open. It used to publish two: a closed <code>&lt;details&gt;</code>, plus a <strong>rail</strong> a consumer asked for by declaring <code>data-sk-toc-rail</code>: and the seam showed in the worst possible place: the rail's entire appearance sat behind that attribute <em>and</em> a <code>min-width: 72rem</code> query, so this very page could not render the form the site itself runs on. A preview frame is 1022px wide and the gate asked for 1152px.",
    "tocPage.railBody2":
      "All that stays behind <code>wide</code> are the two declarations that genuinely need a spare column: <code>position: sticky</code> and the fixed inline size. A narrow host gets the same index in normal flow: a layout difference, not a second shape of the component. The rows carry their own gutter instead of the container: the touch target reaches both edges of the screen while the text stays in the document's own margin.",
    "tocPage.spaceTitle": "Reserved space",
    "tocPage.spaceBody":
      "On this site the grid's track is the TOC's own width (<code>--docs-toc-inline-size</code>). The <code>&lt;aside&gt;</code> always stays in flow: before <code>data-ready</code> the list stays invisible at a minimum height, so the links never push the layout around when they appear.",
    "tocPage.clsTitle": "No CLS",
    "tocPage.clsBody":
      "A tree already knows its items when it is composed: that is the case above. This site's real shell does not discover them in the browser either: a static page's headings are the same for every reader, so computing them on every load means paying every time for a fact that was already true at build time. The layout renders the page's body to HTML (<code>Astro.slots.render</code>), reads its own sections there, and hands them over as <code>items</code>: the list travels in the HTML, with the <code>id</code>s already set on the headings. With no sections, it marks <code>data-empty</code>.",
    "tocPage.clsCodeLabel": "in the layout",
    "tocPage.clsBody2":
      "The only thing left in the browser is what cannot be known before there is a reader: the scroll-spy, and pages whose index depends on state (Accordion's own page builds one per tab, so the layout marks it <code>pending</code> and leaves the list to its own script).",
    "tocPage.clsBody3":
      "Once mounted, the same enhancer wires up the rail/disclosure switch and the scroll-spy that marks <code>aria-current</code> based on which section crosses the viewport's top band: <code>connectToc</code>, behind <code>data-sk-toc</code>.",
    "tocPage.contractItem1":
      'Root: <code>&lt;aside class="sk-toc" data-sk-toc&gt;</code> with a <code>&lt;details class="sk-toc__inner" data-sk-toc-disclosure&gt;</code> inside: <code>&lt;summary class="sk-toc__summary"&gt;</code> and <code>&lt;ul class="sk-toc__list"&gt;</code>.',
    "tocPage.contractItem2": "Shape: one only, a closed <code>&lt;details&gt;</code>. A sticky rail is a consumer decision, not the contract's (see above).",
    "tocPage.contractItem3":
      "Every item: <code>sk-toc__item</code> with its own <code>data-level</code>. The link is <code>sk-toc__link sk-interactive</code>, with the label in <code>sk-toc__label</code> and a leading gutter (<code>--sk-toc-gutter</code>) where the current-section mark lives.",
    "tocPage.contractItem4": 'Optional icon: <code>&lt;span class="sk-toc__icon"&gt;</code> as the link\'s first child.',
    "tocPage.contractItem5": 'Active state: <code>aria-current="true"</code> on the link, written by the scroll-spy at runtime.',
    "tocPage.test1": "Names the nav after the caption and levels each item.",
    "tocPage.test2": "Seeds aria-current from the composition before the spy reports.",
    "tocPage.test3": "Moves aria-current as headings enter the band.",
  },
} as const;
