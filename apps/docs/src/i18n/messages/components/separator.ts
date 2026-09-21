export const separatorMessages = {
  es: {
    "demo.separator.or": "o",
    "demo.separator.before": "Los datos de tu cuenta y cómo prefieres que te contactemos.",
    "demo.separator.after": "Los trámites que iniciaste y en qué estado está cada uno.",
    "demo.separator.tone.subtle": "Un borde interno de una tarjeta: la línea es cromo.",
    "demo.separator.tone.default": "Dos bloques de contenido distintos.",
    "demo.separator.tone.strong": "Dos secciones que tienen poco que ver entre sí.",
    "demo.separator.tone.end": "Y lo que venga después.",
    "demo.separator.meta.author": "Camila Rojas",
    "demo.separator.meta.date": "14 de marzo de 2026",
    "demo.separator.meta.reading": "6 min de lectura",
    "demo.separator.signInWithKey": "Entrar con ClaveÚnica",
    "demo.separator.signInWithEmail": "Entrar con correo",

    "separatorPage.description":
      "Separator: la regla entre dos cosas, con o sin una palabra al medio, publicada una vez para todo el kit.",
    "separatorPage.lede":
      "Una línea entre dos cosas. Existe porque cuatro familias ya dibujaban la suya en privado - Toolbar, Sidebar, <code>menu.css</code> y la hoja del footer - y fuera de ellas una página que quería una regla entre dos bloques no tenía nada que usar y escribía un <code>&lt;div&gt;</code> con borde.",
    "separatorPage.anatomyBody":
      "La variante con palabra es la que tiene anatomía que nombrar: dos reglas y la etiqueta entre ellas. La regla desnuda es un <code>&lt;hr&gt;</code> y no tiene partes.",
    "separatorPage.anatomyLabel": "Anatomía de LabelledSeparator",
    "separatorPage.anatomyPreviewLabel": "LabelledSeparator, parte por parte",
    "separatorPage.meaningTitle": "Por defecto la línea significa algo",
    "separatorPage.meaningBody":
      "Un <code>&lt;hr&gt;</code> es un quiebre temático con rol <code>separator</code>: dice que lo de arriba y lo de abajo son sobre cosas distintas. <code>decorative</code> es la salida para la línea que sólo pinta -el borde interno de una tarjeta- y la saca entera del árbol de accesibilidad, porque anunciar «separador» sobre contenido que no está separado es ruido. Las dos formas son reales; lo incorrecto es tener sólo una.",
    "separatorPage.tonesTitle": "Los tonos",
    "separatorPage.tonesBody":
      "Nombrados por rol, como todos los tonos del sistema: <code>subtle</code> es cromo dentro de una superficie, <code>default</code> divide contenido, <code>strong</code> separa secciones que tienen poco que ver.",
    "separatorPage.tonesPreviewLabel": "Los tres tonos",
    "separatorPage.verticalTitle": "Vertical",
    "separatorPage.verticalBody":
      "Un separador no tiene contenido, así que no tiene de qué sacar su altura: la vertical la toma de lo que la contiene (<code>align-self: stretch</code>). Por eso la fila de abajo es un <code>Inline</code> y no tres elementos sueltos. Una sola opción escribe <code>data-orientation</code> y <code>aria-orientation</code>, así que la hoja y el lector de pantalla no pueden discrepar.",
    "separatorPage.verticalPreviewLabel": "Separadores verticales en una línea de metadatos",
    "separatorPage.labelledTitle": "La que lleva una palabra",
    "separatorPage.labelledBody":
      "«o», «desde 2019», «más antiguos». Es un <code>&lt;div&gt;</code> con <code>role=\"separator\"</code> explícito, porque un <code>&lt;hr&gt;</code> no puede contener nada. El nombre sale de la etiqueta por <code>aria-labelledby</code> y no del contenido: <code>separator</code> no es un rol que tome el nombre de lo que tiene dentro, así que sin ese cable un lector de pantalla llega y dice «separador», que es justo la palabra que la etiqueta visible venía a reemplazar.",
    "separatorPage.labelledPreviewLabel": "LabelledSeparator entre dos formas de entrar",
    "separatorPage.whenTitle": "Cuándo usarlo",
    "separatorPage.whenItem1":
      "Una regla divide dos bloques que son sobre cosas distintas, o una hairline vertical separa dos cosas puestas lado a lado.",
    "separatorPage.whenItem2":
      "Si la regla se <strong>arrastra</strong> para redimensionar lo que divide, no es esto: es un <a href=\"/es/splitter\">Splitter</a>, que es focusable y tiene teclado propio.",
    "separatorPage.whenItem3":
      "Entre filas de una lista, un menú o un toolbar no va acá: esas familias dibujan la suya, con la densidad de su propia anatomía.",
    "separatorPage.whenItem4":
      "Si lo que falta es <em>aire</em> y no una línea, eso es el <code>gap</code> de lo que contiene los dos bloques.",
    "separatorPage.contractItem1":
      "La línea se pinta como <code>background</code> y no como <code>border</code>: un <code>&lt;hr&gt;</code> ya trae un borde <code>inset</code> del navegador, así que media hairline venía del elemento y media de la idea que el navegador tiene de un surco.",
    "separatorPage.contractItem2":
      "<code>decorative</code> escribe <code>role=\"presentation\"</code> y no <code>aria-hidden</code>: el elemento no tiene contenido que esconder, y presentation es la forma de decir «esta caja es pintura» sin tocar el DOM.",
    "separatorPage.contractItem3":
      "<code>LabelledSeparator</code> no toma <code>orientation</code>: una etiqueta dentro de una regla vertical es texto rotado, que es otro componente y no una variante de este.",
    "separatorPage.contractItem4":
      "No tiene enhancer: el markup está completo por sí solo, así que las dos bindings son el mismo markup dos veces.",
  },
  en: {
    "demo.separator.or": "or",
    "demo.separator.before": "Your account details and how you would rather be contacted.",
    "demo.separator.after": "The requests you have opened and where each of them stands.",
    "demo.separator.tone.subtle": "A card's internal edge: the line is chrome.",
    "demo.separator.tone.default": "Two different blocks of content.",
    "demo.separator.tone.strong": "Two sections with little to do with each other.",
    "demo.separator.tone.end": "And whatever comes after that.",
    "demo.separator.meta.author": "Camila Rojas",
    "demo.separator.meta.date": "14 March 2026",
    "demo.separator.meta.reading": "6 min read",
    "demo.separator.signInWithKey": "Sign in with a passkey",
    "demo.separator.signInWithEmail": "Sign in with email",

    "separatorPage.description":
      "Separator: the rule between two things, with or without a word in the middle, published once for the whole kit.",
    "separatorPage.lede":
      "A line between two things. It exists because four families were already drawing their own in private - Toolbar, Sidebar, <code>menu.css</code> and the footer sheet - and outside them a page that wanted a rule between two blocks had nothing to reach for and wrote a <code>&lt;div&gt;</code> with a border.",
    "separatorPage.anatomyBody":
      "The labelled variant is the one with anatomy to name: two rules and the label between them. The bare rule is an <code>&lt;hr&gt;</code> and has no parts.",
    "separatorPage.anatomyLabel": "LabelledSeparator anatomy",
    "separatorPage.anatomyPreviewLabel": "LabelledSeparator, part by part",
    "separatorPage.meaningTitle": "By default the line means something",
    "separatorPage.meaningBody":
      "An <code>&lt;hr&gt;</code> is a thematic break with the <code>separator</code> role: it says that what is above and what is below are about different things. <code>decorative</code> is the way out for a line that only draws - a card's internal edge - and it leaves the accessibility tree entirely, because announcing “separator” over content that is not separated is noise. Both spellings are real; what is wrong is having only one.",
    "separatorPage.tonesTitle": "The tones",
    "separatorPage.tonesBody":
      "Named by role, like every tone in the system: <code>subtle</code> is chrome inside a surface, <code>default</code> divides content, <code>strong</code> separates sections with little to do with each other.",
    "separatorPage.tonesPreviewLabel": "The three tones",
    "separatorPage.verticalTitle": "Vertical",
    "separatorPage.verticalBody":
      "A separator has no content, so it has nothing to take its height from: the vertical one takes it from whatever holds it (<code>align-self: stretch</code>). That is why the row below is an <code>Inline</code> and not three loose elements. One option writes both <code>data-orientation</code> and <code>aria-orientation</code>, so the stylesheet and the screen reader cannot disagree.",
    "separatorPage.verticalPreviewLabel": "Vertical separators in a line of metadata",
    "separatorPage.labelledTitle": "The one with a word in it",
    "separatorPage.labelledBody":
      "“or”, “since 2019”, “older”. It is a <code>&lt;div&gt;</code> with an explicit <code>role=\"separator\"</code>, because an <code>&lt;hr&gt;</code> may hold no content. The name comes from the label through <code>aria-labelledby</code> rather than from the content: <code>separator</code> is not a name-from-content role, so without that wiring a screen reader arrives and says “separator”, which is exactly the word the visible label was written to replace.",
    "separatorPage.labelledPreviewLabel": "LabelledSeparator between two ways to sign in",
    "separatorPage.whenTitle": "When to use it",
    "separatorPage.whenItem1":
      "A rule divides two blocks about different things, or a vertical hairline separates two things placed side by side.",
    "separatorPage.whenItem2":
      "When the rule can be <strong>dragged</strong> to resize what it divides, it is not this: it is a <a href=\"/splitter\">Splitter</a>, which is focusable and has a keyboard contract of its own.",
    "separatorPage.whenItem3":
      "Between the rows of a list, a menu or a toolbar it does not belong here: those families draw their own, at the density of their own anatomy.",
    "separatorPage.whenItem4":
      "When what is missing is <em>air</em> rather than a line, that is the <code>gap</code> of whatever holds the two blocks.",
    "separatorPage.contractItem1":
      "The line is painted as a <code>background</code> and not as a <code>border</code>: an <code>&lt;hr&gt;</code> already carries an <code>inset</code> border from the browser, so half the hairline came from the element and half from the browser's idea of a groove.",
    "separatorPage.contractItem2":
      "<code>decorative</code> writes <code>role=\"presentation\"</code> rather than <code>aria-hidden</code>: the element has no content to hide, and presentation is the spelling that says “this box is paint” while leaving the DOM alone.",
    "separatorPage.contractItem3":
      "<code>LabelledSeparator</code> takes no <code>orientation</code>: a label inside a vertical rule is rotated text, which is a different component and not a variant of this one.",
    "separatorPage.contractItem4":
      "There is no enhancer: the markup is complete on its own, so both bindings are the same markup twice.",
  },
} as const;
