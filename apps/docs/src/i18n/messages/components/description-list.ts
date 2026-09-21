export const descriptionListMessages = {
  es: {
    "demo.descriptionList.order.term": "Pedido",
    "demo.descriptionList.order.value": "#4821",
    "demo.descriptionList.placed.term": "Fecha",
    "demo.descriptionList.placed.value": "10 de marzo de 2026",
    "demo.descriptionList.total.term": "Total",
    "demo.descriptionList.total.value": "$38.990",
    "demo.descriptionList.payment.term": "Medio de pago",
    "demo.descriptionList.payment.value": "Tarjeta terminada en 4417",
    "demo.descriptionList.status.term": "Estado",
    "demo.descriptionList.status.value": "Entregado",
    "demo.descriptionList.tracking.term": "Seguimiento",
    "demo.descriptionList.tracking.value": "4821-CL",
    "demo.descriptionList.spec.format.term": "Formato",
    "demo.descriptionList.spec.format.value": "PDF/A-2b",
    "demo.descriptionList.spec.size.term": "Tamaño",
    "demo.descriptionList.spec.size.value": "1,4 MB",
    "demo.descriptionList.spec.updated.term": "Actualizado",
    "demo.descriptionList.spec.updated.value": "14 de marzo de 2026",
    "demo.descriptionList.spec.licence.term": "Licencia",
    "demo.descriptionList.spec.licence.value": "CC BY 4.0",

    "descriptionListPage.description":
      "DescriptionList: pares de nombre y valor sobre un solo registro, en el <dl> nativo con su elemento de agrupación.",
    "descriptionListPage.lede":
      "Los datos de <em>un</em> registro, como nombre y valor. Cada fila es una afirmación completa por sí sola y nada se compara entre filas: eso último es lo que la separa de una <a href=\"/es/componentes/table\">Table</a>, donde una celda significa algo por su fila <em>y</em> su columna.",
    "descriptionListPage.anatomyBody":
      "El diagrama nombra las cuatro partes. El <code>&lt;div&gt;</code> alrededor de cada par no es un wrapper inventado acá: es el elemento de agrupación que el propio HTML admite dentro de <code>&lt;dl&gt;</code>.",
    "descriptionListPage.anatomyLabel": "Anatomía de DescriptionList",
    "descriptionListPage.anatomyPreviewLabel": "DescriptionList, parte por parte",
    "descriptionListPage.groupTitle": "Por qué cada par va envuelto",
    "descriptionListPage.groupBody":
      "El <code>&lt;div&gt;</code> es lo que vuelve <em>direccionable</em> la fila: de ahí cuelgan el divisor y el layout de dos columnas, y es lo que mantiene un nombre junto a su valor cuando la lista corta. Sin él el par existe sólo en el orden del documento, y cualquier layout hay que dibujarlo sobre una grilla compartida a la que las dos mitades tienen que entrar por separado.",
    "descriptionListPage.columnsTitle": "Columnas",
    "descriptionListPage.columnsBody":
      "<code>layout=\"columns\"</code> pone el valor al lado del nombre. Se dibuja <em>por fila</em>, no sobre una grilla compartida, y por eso la columna del nombre es un largo (<code>--sk-description-list-term-size</code>) y no <code>max-content</code>: la grilla compartida necesitaría que cada par fuera <code>display: contents</code>, que saca del árbol de cajas justo el elemento del que cuelga todo lo demás. Bajo 36rem vuelve a apilarse solo: una columna de nombre peleando por 320px no es un layout, son dos truncados.",
    "descriptionListPage.columnsPreviewLabel": "DescriptionList en columnas",
    "descriptionListPage.dividedTitle": "Divisores y densidad",
    "descriptionListPage.dividedBody":
      "<code>dividers</code> pone una línea entre filas, nunca sobre la primera (ese borde es de la caja que contiene la lista, no de la lista). <code>density=\"compact\"</code> acerca las filas sin tocar la tipografía: es material de referencia para escanear, no prosa para leer.",
    "descriptionListPage.dividedPreviewLabel": "DescriptionList con divisores, compacta",
    "descriptionListPage.richTitle": "El valor acepta markup; el nombre no",
    "descriptionListPage.richBody":
      "El valor es un nodo: un <a href=\"/es/componentes/tag\">Tag</a> de estado, un enlace, una fecha. El nombre es texto a propósito: un nombre que necesita markup propio es un encabezado, y esto no es una sección.",
    "descriptionListPage.richPreviewLabel": "DescriptionList con Tag y enlace",
    "descriptionListPage.whenTitle": "Cuándo usarlo",
    "descriptionListPage.whenItem1":
      "Se muestran los datos de <strong>un</strong> registro: el resumen de un pedido, los metadatos de un documento, las specs de un producto.",
    "descriptionListPage.whenItem2":
      "Si los mismos campos se muestran para <strong>varios</strong> registros, es una <a href=\"/es/componentes/table\">Table</a>: ahí una celda significa algo por su fila y su columna.",
    "descriptionListPage.whenItem3":
      "Si los pares son controles que alguien completa, es <a href=\"/es/componentes/form-field\">FormField</a>, no esto.",
    "descriptionListPage.whenItem4":
      "Si es una lista de cosas y no de hechos sobre una cosa, es <a href=\"/es/componentes/list\">List</a>.",
    "descriptionListPage.contractItem1":
      "El <code>&lt;dd&gt;</code> trae 40px de sangría del navegador y el <code>&lt;dl&gt;</code> un margen de bloque: la hoja los saca, porque los dos dibujan el glosario indentado que este componente no es.",
    "descriptionListPage.contractItem2":
      "<code>dividers</code> se escribe por presencia (<code>data-dividers</code> vacío) y no como <code>\"false\"</code>: decir que no es no decir nada.",
    "descriptionListPage.contractItem3":
      "<code>--sk-description-list-term-size</code> es el hook que mueve la columna del nombre cuando los tuyos son más largos. Es un largo, y el encabezado del contrato explica por qué.",
    "descriptionListPage.contractItem4":
      "No tiene enhancer: el markup está completo por sí solo, así que las dos bindings son el mismo markup dos veces.",
  },
  en: {
    "demo.descriptionList.order.term": "Order",
    "demo.descriptionList.order.value": "#4821",
    "demo.descriptionList.placed.term": "Placed",
    "demo.descriptionList.placed.value": "10 March 2026",
    "demo.descriptionList.total.term": "Total",
    "demo.descriptionList.total.value": "$38,990",
    "demo.descriptionList.payment.term": "Payment",
    "demo.descriptionList.payment.value": "Card ending 4417",
    "demo.descriptionList.status.term": "Status",
    "demo.descriptionList.status.value": "Delivered",
    "demo.descriptionList.tracking.term": "Tracking",
    "demo.descriptionList.tracking.value": "4821-CL",
    "demo.descriptionList.spec.format.term": "Format",
    "demo.descriptionList.spec.format.value": "PDF/A-2b",
    "demo.descriptionList.spec.size.term": "Size",
    "demo.descriptionList.spec.size.value": "1.4 MB",
    "demo.descriptionList.spec.updated.term": "Updated",
    "demo.descriptionList.spec.updated.value": "14 March 2026",
    "demo.descriptionList.spec.licence.term": "Licence",
    "demo.descriptionList.spec.licence.value": "CC BY 4.0",

    "descriptionListPage.description":
      "DescriptionList: name-and-value pairs about a single record, on the native <dl> with its grouping element.",
    "descriptionListPage.lede":
      "The details of <em>one</em> record, as name and value. Each row is a complete statement on its own and nothing is compared across rows: that last part is what separates it from a <a href=\"/components/table\">Table</a>, where a cell means something because of its row <em>and</em> its column.",
    "descriptionListPage.anatomyBody":
      "The diagram names the four parts. The <code>&lt;div&gt;</code> around each pair is not a wrapper invented here: it is the grouping element HTML itself allows inside <code>&lt;dl&gt;</code>.",
    "descriptionListPage.anatomyLabel": "DescriptionList anatomy",
    "descriptionListPage.anatomyPreviewLabel": "DescriptionList, part by part",
    "descriptionListPage.groupTitle": "Why each pair is wrapped",
    "descriptionListPage.groupBody":
      "The <code>&lt;div&gt;</code> is what makes the row <em>addressable</em>: the divider and the two-column layout both hang off it, and it is what keeps a name beside its own value when the list wraps. Without it the pair exists only in document order, and every layout has to be drawn on a shared grid that both halves opt into separately.",
    "descriptionListPage.columnsTitle": "Columns",
    "descriptionListPage.columnsBody":
      "<code>layout=\"columns\"</code> puts the value beside its name. It is drawn <em>per row</em> rather than on one shared grid, which is why the name column is a length (<code>--sk-description-list-term-size</code>) instead of <code>max-content</code>: a shared grid would need each pair to be <code>display: contents</code>, which takes the very element everything else hangs off back out of the box tree. Below 36rem it stacks again on its own: a name column fighting for 320px is not a layout, it is two truncations.",
    "descriptionListPage.columnsPreviewLabel": "DescriptionList in columns",
    "descriptionListPage.dividedTitle": "Dividers and density",
    "descriptionListPage.dividedBody":
      "<code>dividers</code> puts a rule between rows and never above the first (that edge belongs to the box holding the list, not to the list). <code>density=\"compact\"</code> brings the rows closer without touching the type: it is reference material to scan, not prose to read.",
    "descriptionListPage.dividedPreviewLabel": "DescriptionList, ruled and compact",
    "descriptionListPage.richTitle": "The value takes markup; the name does not",
    "descriptionListPage.richBody":
      "The value is a node: a status <a href=\"/components/tag\">Tag</a>, a link, a date. The name is text on purpose: a name that needs markup of its own is a heading, and this is not a section.",
    "descriptionListPage.richPreviewLabel": "DescriptionList with a Tag and a link",
    "descriptionListPage.whenTitle": "When to use it",
    "descriptionListPage.whenItem1":
      "The details of <strong>one</strong> record are shown: an order's summary, a document's metadata, a product's specs.",
    "descriptionListPage.whenItem2":
      "When the same fields are shown for <strong>several</strong> records it is a <a href=\"/components/table\">Table</a>: there a cell means something because of its row and its column.",
    "descriptionListPage.whenItem3":
      "When the pairs are controls somebody fills in, it is <a href=\"/components/form-field\">FormField</a>, not this.",
    "descriptionListPage.whenItem4":
      "When it is a list of things rather than of facts about one thing, it is <a href=\"/components/list\">List</a>.",
    "descriptionListPage.contractItem1":
      "The browser gives <code>&lt;dd&gt;</code> a 40px indent and <code>&lt;dl&gt;</code> a block margin: the stylesheet removes both, because they draw the indented glossary this component is not.",
    "descriptionListPage.contractItem2":
      "<code>dividers</code> is written by presence (an empty <code>data-dividers</code>) rather than as <code>\"false\"</code>: saying no is saying nothing.",
    "descriptionListPage.contractItem3":
      "<code>--sk-description-list-term-size</code> is the hook that moves the name column when yours are longer. It is a length, and the contract's header says why.",
    "descriptionListPage.contractItem4":
      "There is no enhancer: the markup is complete on its own, so both bindings are the same markup twice.",
  },
} as const;
