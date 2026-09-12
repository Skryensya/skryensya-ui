export const wrapperMessages = {
  es: {

    "demo.wrapper.title": "Columna",
    "demo.wrapper.body": "El contenido se centra y deja de crecer al llegar al techo.",

    "wrapperPage.description": "Wrapper: columna de página con un techo de ancho de una escala.",
    "wrapperPage.anatomyBody":
      "De afuera hacia adentro: el aire a los costados es lo que <code>data-size</code> devolvió, el anillo de afuera es la columna a su medida, y la franja de adentro es el <code>padding-inline</code> propio del Wrapper, que es la parte que todo el mundo olvida que tiene. Es el único espécimen de esta serie que ocupa todo el ancho del marco, porque una columna dimensionada a su contenido esconde justo lo único que hace.",
    "wrapperPage.anatomyLabel": "Anatomía de Wrapper",
    "wrapperPage.anatomyPreviewLabel": "Wrapper, parte por parte",
    "wrapperPage.lede":
      "Wrapper es la columna de página: un máximo de ancho centrado, con padding inline. Es lo que otros llaman <em>container</em>, pero ese nombre ya es de las <em>container queries</em>, así que aquí el rol se llama <strong>wrapper</strong>. El tamaño es una <strong>escala</strong> (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>), no un nombre de uso: el techo dice qué tan ancha puede crecer la columna; el trabajo que hace lo decide quien la escribe.",
    "wrapperPage.ceilingTitle": "Un techo de ancho",
    "wrapperPage.ceilingBody":
      'Cada tamaño es un <strong>techo de ancho</strong> distinto: la columna se centra y deja de crecer al llegar a él. Abajo, un Wrapper con <code>data-size="sm"</code>: el margen a los costados es el techo haciendo su trabajo.',
    "wrapperPage.belowBody":
      "Debajo de su techo, cualquier wrapper es simplemente <code>100%</code>, por eso en una pantalla angosta los cuatro tamaños se ven iguales, y sólo se separan cuando hay lugar. Los techos son estables: la densidad cambia el espaciado y los controles, nunca el ancho máximo de la columna.",
    "wrapperPage.tableTitle": "Los cuatro techos",
    "wrapperPage.tableHeadSize": "Tamaño",
    "wrapperPage.tableHeadCeiling": "Techo",
    "wrapperPage.tableRow1": "42rem",
    "wrapperPage.tableRow2": "64rem · por defecto",
    "wrapperPage.tableRow3": "90rem",
    "wrapperPage.tableRow4": "sin techo, el viewport entero",
    "wrapperPage.siteTitle": "En este sitio",
    "wrapperPage.siteBody":
      'Esta documentación se envuelve a sí misma, con dos pasos. El header y el shell de tres columnas llevan ambos <code>data-size="lg"</code> (y el sitio afina el techo a un valor propio), así que un solo número mantiene sus bordes alineados. La columna que estás leyendo es <code>md</code>: el <code>&lt;main&gt;</code> lleva <code>data-size="md"</code> y su techo es el token, no un número copiado. Y una herramienta a pantalla completa, como el configurador, suelta el wrapper del todo.',
    "wrapperPage.contractItem1": 'En HTML, añade <code>sk-wrapper</code> al elemento que delimita la columna.',
    "wrapperPage.contractItem2":
      '<code>data-size</code> acepta <code>sm</code>, <code>md</code> (por defecto), <code>lg</code> o <code>full</code> (sin techo).',
    "wrapperPage.contractItem3": 'Los techos son tokens de tier 2: <code>--size-wrapper-sm</code>, <code>--size-wrapper-md</code>, <code>--size-wrapper-lg</code>.',
    "wrapperPage.contractItem4":
      'El único hook que un consumidor afina es <code>--sk-wrapper-max</code>, para un ancho que la escala todavía no nombra, sin reimplementar el centrado ni el padding.',
    "wrapperPage.test1": "Renderiza Wrapper como una columna de página sobre la escala de tamaños.",
  },
  en: {

    "demo.wrapper.title": "Column",
    "demo.wrapper.body": "Content centres and stops growing once it reaches the ceiling.",

    "wrapperPage.description": "Wrapper: a page column with a width ceiling from a scale.",
    "wrapperPage.anatomyBody":
      "Outside in: the air on either side is what <code>data-size</code> gave back, the outer ring is the column at its measure, and the band inside it is the Wrapper’s own <code>padding-inline</code>, the part people forget it has. It is the one specimen in this series that fills the frame, because a column sized to its contents hides the only thing it does.",
    "wrapperPage.anatomyLabel": "Wrapper anatomy",
    "wrapperPage.anatomyPreviewLabel": "Wrapper, part by part",
    "wrapperPage.lede":
      "Wrapper is the page column: a centered max width, with inline padding. It is what others call a <em>container</em>, but that name already belongs to <em>container queries</em>, so here the role is called <strong>wrapper</strong>. Size is a <strong>scale</strong> (<code>sm</code>, <code>md</code>, <code>lg</code>, <code>full</code>), not a usage name: the ceiling says how wide the column can grow; whoever writes it decides what job it does.",
    "wrapperPage.ceilingTitle": "A width ceiling",
    "wrapperPage.ceilingBody":
      'Every size is a distinct <strong>width ceiling</strong>: the column centers and stops growing once it reaches it. Below, a Wrapper with <code>data-size="sm"</code>: the margin on both sides is the ceiling doing its job.',
    "wrapperPage.belowBody":
      "Below its ceiling, any wrapper is simply <code>100%</code>, which is why on a narrow screen all four sizes look the same, and they only diverge once there is room. The ceilings are stable: density changes spacing and controls, never the column's own maximum width.",
    "wrapperPage.tableTitle": "The four ceilings",
    "wrapperPage.tableHeadSize": "Size",
    "wrapperPage.tableHeadCeiling": "Ceiling",
    "wrapperPage.tableRow1": "42rem",
    "wrapperPage.tableRow2": "64rem · default",
    "wrapperPage.tableRow3": "90rem",
    "wrapperPage.tableRow4": "no ceiling, the full viewport",
    "wrapperPage.siteTitle": "On this site",
    "wrapperPage.siteBody":
      'This documentation wraps itself, in two steps. The header and the three-column shell both carry <code>data-size="lg"</code> (and the site tunes the ceiling to its own value), so one single number keeps their edges aligned. The column you are reading is <code>md</code>: the <code>&lt;main&gt;</code> carries <code>data-size="md"</code> and its ceiling is the token, not a copied number. And a full-screen tool, like the configurator, drops the wrapper entirely.',
    "wrapperPage.contractItem1": 'In HTML, add <code>sk-wrapper</code> to the element bounding the column.',
    "wrapperPage.contractItem2":
      '<code>data-size</code> accepts <code>sm</code>, <code>md</code> (default), <code>lg</code>, or <code>full</code> (no ceiling).',
    "wrapperPage.contractItem3": 'The ceilings are tier-2 tokens: <code>--size-wrapper-sm</code>, <code>--size-wrapper-md</code>, <code>--size-wrapper-lg</code>.',
    "wrapperPage.contractItem4":
      'The only hook a consumer tunes is <code>--sk-wrapper-max</code>, for a width the scale does not yet name, without reimplementing the centering or the padding.',
    "wrapperPage.test1": "Renders Wrapper as a page column on the size scale.",
  },
} as const;
