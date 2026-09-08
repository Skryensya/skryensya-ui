export const changelogMessages = {
  es: {
    /* The dates are written here, not formatted in the demo: the tree has a `Translate` and not a
       locale, and `Intl` needs the locale. Each language writes the date the way that language does. */
    "demo.changelog.label": "Cambios de Accordion",
    /* Untranslated, same as in the real changelog. See the note in `changelog.kind.*`. */
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* A single date: the one of the release that actually shipped. The other has none, and that is
       precisely how the contract says it has not been published yet. */
    "demo.changelog.date": "29 de julio de 2026",
    /* Each entry is a headline and its explanation: the first is what gets scanned, the second what
       gets read once someone stopped there. */
    "demo.changelog.breaking.title": "El evento cambió de nombre",
    "demo.changelog.breaking.body": "Pasó a llamarse sk:accordionvaluechange. El anterior ya no se emite.",
    "demo.changelog.bugfix.title": "La parte se busca sólo como hija directa",
    "demo.changelog.bugfix.body": "El enhancer la buscaba en cualquier descendiente, así que una sección anidada ataba su propio título como panel.",
    "demo.changelog.rework.title": "collapsible pasa a ser false por defecto",
    "demo.changelog.rework.body": "Es como se comportaba el acordeón de una sola sección desde siempre.",
    "demo.changelog.feature.title": "Primera publicación del contrato",
    "demo.changelog.feature.body": "Sale con sus tres firmas y las opciones que las componen.",
    "demo.changelog.chore.title": "El enhancer se publica con el resto del paquete",
    "demo.changelog.chore.body": "Antes salía como módulo aparte. Ni el markup ni las opciones se mueven.",

    /* "Changelog" and not "Cambios": it is the name of the component and of the section, and it stays
       the same in both languages. The word is already used that way here; translating it on only one
       side made the same section be called something different depending on the URL. */
    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nada todavía. El contrato no se movió desde su primera publicación.",
    /* The five kinds are NOT translated, and it is the same decision as "Changelog" above: they are the
       vocabulary a commit is written with and the one people already read a release of any other
       package with. Translated on only one side, the same entry would be called something different
       depending on the URL, and "rehecho" means nothing "rework" does not say better. */
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "changelogPage.description":
      "Changelog: historial fechado con riel, donde la fecha es lo que se busca y el punto dice qué tipo de cambio fue.",
    "changelogPage.betaBadge": "Beta",
    "changelogPage.lede":
      "Un historial fechado, lo más nuevo arriba. La fecha encabeza cada entrada porque es lo que el lector viene a buscar, y el punto del riel es una marca neutra que dice <em>cuándo</em>: el <em>qué</em> lo dice la palabra al lado. Es estático: no hay enhancer ni estado.",
    "changelogPage.previewNote": "cuatro tipos",
    "changelogPage.whenTitle": "Cuándo usarlo",
    "changelogPage.whenItem1":
      "Usa Changelog para release notes y para el historial de un contrato: cosas que pasaron, cada una con su día.",
    "changelogPage.whenItem2":
      'Usa <a href="/components/process-list">ProcessList</a> para instrucciones en orden. Numera sus marcadores con un <code>counter()</code> de CSS, así que una lista con lo más nuevo arriba se numeraría al revés del tiempo.',
    "changelogPage.whenItem3":
      'Usa <a href="/components/steps">Steps</a> cuando haya progreso: <code>complete</code>, <code>current</code>, <code>upcoming</code>. Su conector dice cuánto trabajo queda atrás, que de un cambio ya publicado no es una afirmación que nadie pueda hacer.',
    "changelogPage.contractItem1":
      'La raíz es <code>&lt;ol class="sk-changelog" reversed&gt;</code>. El <code>reversed</code> es fijo, no una opción: lo más nuevo arriba es lo que un changelog <em>es</em>. Nadie dibuja los números, pero el árbol de accesibilidad los lee, y ahí tienen que contar hacia atrás.',
    "changelogPage.contractItem2":
      "<strong>La fecha son dos campos.</strong> La opción <code>date</code> es el día legible por una máquina (<code>YYYY-MM-DD</code>) y aterriza en <code>&lt;time datetime&gt;</code>; el texto visible es un slot, porque una fecha formateada es copy en un idioma y Core no envía ninguno. Formatea con <code>Intl.DateTimeFormat</code> y llena el slot.",
    "changelogPage.contractItem3":
      "<strong>El tipo también son dos.</strong> La opción <code>kind</code> marca la entrada (<code>added</code>, <code>changed</code>, <code>fixed</code>, <code>removed</code>, <code>breaking</code>); el slot es la palabra, y es obligatorio, así que el tipo nunca queda sólo en el color.",
    "changelogPage.contractItem4":
      "<code>target</code> es opcional: la opción, parte o firma a la que le pegó el cambio. Una entrada sobre el contrato entero no lleva ninguno.",
    "changelogPage.contractItem5":
      "<strong>Un solo color.</strong> Pintar cada tipo con su color de estado dejaba un riel verde, azul y ámbar al costado de una página que es prosa, y el verde ganaba por cantidad: casi toda entrada de casi todo changelog es una alta. El punto es una marca neutra; el tipo ya está escrito al lado. <code>breaking</code> es la única excepción, porque es el único tipo cuyo costo de pasar desapercibido es el build de quien te consume: se lleva el punto y la palabra. Si querés la paleta de estado de vuelta, es una declaración de <code>--sk-changelog-marker-color</code> por tipo.",
    "changelogPage.datesTitle": "Fechas, no versiones",
    "changelogPage.datesBody":
      "Este contrato no tiene campo de versión y es a propósito. Un número de versión sólo dice algo si quien lee sabe qué releases existen; una fecha se lee sola. Cuando haya versiones publicadas, el lugar para ponerlas es el slot de la fecha, junto al día, no en vez de él.",
    "changelogPage.test1": "Renderiza una lista ordenada de releases en orden inverso (el más reciente primero).",
    "changelogPage.test2": "Un release sin fecha se marca «sin publicar» y no renderiza hora alguna.",
    "changelogPage.test3": "El tipo de cambio se dibuja como un Badge.",
    "changelogPage.test4": "Título y descripción se renderizan como partes separadas.",
  },
  en: {
    /* The dates are written here rather than formatted in the demo: the tree has a `Translate` and
       not a locale, and `Intl` needs the locale. Each language writes a date the way it writes dates. */
    "demo.changelog.label": "Accordion changes",
    "demo.changelog.kind.breaking": "breaking",
    "demo.changelog.kind.feature": "feature",
    "demo.changelog.kind.bugfix": "bugfix",
    "demo.changelog.kind.rework": "rework",
    /* One date: the release that actually shipped. The other has none, and that absence is exactly
       how the contract says a version has not been published. */
    "demo.changelog.date": "29 July 2026",
    /* Every entry is a headline and its explanation: the first is what gets scanned, the second is
       what gets read once someone has stopped on it. */
    "demo.changelog.breaking.title": "The event was renamed",
    "demo.changelog.breaking.body": "It is now called sk:accordionvaluechange. The old one is no longer emitted.",
    "demo.changelog.bugfix.title": "The part is scoped to a direct child",
    "demo.changelog.bugfix.body": "The enhancer looked for it on any descendant, so a nested section bound its own title as the panel.",
    "demo.changelog.rework.title": "collapsible now defaults to false",
    "demo.changelog.rework.body": "Which is how a single-section accordion had always behaved anyway.",
    "demo.changelog.feature.title": "First published contract",
    "demo.changelog.feature.body": "It ships with its three signatures and the options that compose them.",
    "demo.changelog.chore.title": "The enhancer ships with the rest of the package",
    "demo.changelog.chore.body": "It used to be a separate module. Neither the markup nor the options move.",

    "changelog.tab": "Changelog",
    "changelog.title": "Changelog",
    "changelog.empty": "Nothing yet. The contract has not moved since it was first published.",
    "changelog.kind.breaking": "breaking",
    "changelog.kind.feature": "feature",
    "changelog.kind.bugfix": "bugfix",
    "changelog.kind.rework": "rework",
    "changelog.kind.chore": "chore",

    "changelogPage.description":
      "Changelog: a dated history with a rail, where the date is what a reader is looking for and the marker says what kind of change it was.",
    "changelogPage.betaBadge": "Beta",
    "changelogPage.lede":
      "A dated history, newest on top. The date heads every entry because that is what the reader came looking for, and the rail's marker is a neutral mark that says <em>when</em>: the <em>what</em> is the word beside it. It is static: no enhancer, no state.",
    "changelogPage.previewNote": "four kinds",
    "changelogPage.whenTitle": "When to use it",
    "changelogPage.whenItem1":
      "Use Changelog for release notes and for a contract's history: things that happened, each with its own day.",
    "changelogPage.whenItem2":
      'Use <a href="/en/components/process-list">ProcessList</a> for instructions in order. It numbers its markers with a CSS <code>counter()</code>, so a list with the newest on top would count backward through time.',
    "changelogPage.whenItem3":
      'Use <a href="/en/components/steps">Steps</a> when there is progress: <code>complete</code>, <code>current</code>, <code>upcoming</code>. Its connector says how much work is left behind, which is not a claim anyone can make about a change that already shipped.',
    "changelogPage.contractItem1":
      'The root is <code>&lt;ol class="sk-changelog" reversed&gt;</code>. <code>reversed</code> is fixed, not an option: newest on top is what a changelog <em>is</em>. Nobody draws the numbers, but the accessibility tree reads them, and there they have to count backward.',
    "changelogPage.contractItem2":
      "<strong>The date is two fields.</strong> The <code>date</code> option is the machine-readable day (<code>YYYY-MM-DD</code>) and lands in <code>&lt;time datetime&gt;</code>; the visible text is a slot, because a formatted date is copy in a language and Core ships none. Format it with <code>Intl.DateTimeFormat</code> and fill the slot.",
    "changelogPage.contractItem3":
      "<strong>The kind is also two things.</strong> The <code>kind</code> option marks the entry (<code>added</code>, <code>changed</code>, <code>fixed</code>, <code>removed</code>, <code>breaking</code>); the slot is the word, and it is required, so the kind never lives in color alone.",
    "changelogPage.contractItem4":
      "<code>target</code> is optional: the option, part or signature the change touched. An entry about the whole contract carries none.",
    "changelogPage.contractItem5":
      "<strong>One color.</strong> Painting every kind with its status color left a green, blue and amber rail beside a page that is prose, and green won by sheer volume: almost every entry in almost every changelog is an addition. The marker is a neutral mark; the kind is already spelled out beside it. <code>breaking</code> is the one exception, because it is the only kind whose cost of going unnoticed is the build of whoever consumes you: it keeps the marker and the word. If you want the status palette back, that is a <code>--sk-changelog-marker-color</code> declaration per kind.",
    "changelogPage.datesTitle": "Dates, not versions",
    "changelogPage.datesBody":
      "This contract has no version field, and that is on purpose. A version number only says something if the reader knows which releases exist; a date reads on its own. Once there are published versions, the place for them is the date's own slot, next to the day, not instead of it.",
    "changelogPage.test1": "Renders a reversed ordered list of releases (most recent first).",
    "changelogPage.test2": "A release with no date is marked unreleased and renders no time at all.",
    "changelogPage.test3": "The kind of change is drawn as a Badge.",
    "changelogPage.test4": "Title and description render as separate parts.",
  },
} as const;
