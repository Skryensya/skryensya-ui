export const typographyMessages = {
  es: {
    "demo.typography.text.body":
      "El párrafo es la unidad de una idea. Un texto sin párrafo es sólo una línea. Un párrafo sin contexto es sólo palabras.",
    "demo.typography.textSecondary.body":
      "El tono secondary es para lo accesorio: una nota, una fecha, un estado que no es lo principal de la pantalla.",
    "demo.typography.heading.text": "Un encabezado abre una sección",
    "demo.typography.linkContext":
      "Un <a href=\"#\">enlace dentro de un párrafo</a> se lee como parte del texto y se subraya.",
    "demo.typography.strong.body":
      "Una <strong>palabra importante</strong> tiene una relación semántica, no sólo un peso distinto.",
    "demo.typography.code.body":
      "Un literal como <code>data-role</code> o <code>--color-surface</code> se lee distinto para no confundirse con prosa.",
    "demo.typography.output.value": "El resultado es 42",

    "typographyPage.description":
      "Tipografía: los elementos de texto semántico (párrafos, títulos, enlaces, énfasis, código) con su rol y anatomía claros.",
    "typographyPage.lede":
      "No existe un <code>Text</code> genérico. Cada línea de texto es un rol: un párrafo es una idea, un título es una sección, un código es un literal. Elegir bien qué es cada una permite que el layout, el color y la redacción trabajen juntos.",
    "typographyPage.textTitle": "Text: un párrafo, una bajada, una nota",
    "typographyPage.textBody":
      "El componente <code>Text</code> es un párrafo: una unidad de ideas en prose. El <code>textRole</code> le dice la función: <strong>secondary</strong> es lo accesorio (fecha, estado), <strong>eyebrow</strong> es la línea chica sobre un título, <strong>subtitle</strong> es la bajada bajo el título.",
    "typographyPage.headingTitle": "Heading: una sección y su nivel",
    "typographyPage.headingBody":
      "Un <code>Heading</code> abre una sección. El <code>headingElement</code> (h1–h6) es el nivel del documento, el <code>headingSize</code> (sm, md, lg, display) es el aspecto. Pueden no coincidir: un h2 puede verse como un h4 si la sección está anidada dentro de un container pequeño.",
    "typographyPage.linkTitle": "Link: un enlace dentro del texto",
    "typographyPage.linkBody":
      "Un <code>Link</code> es un enlace subrayado dentro de una frase. Si se ve y se usa como botón, es <code>Button.navigation</code>, no un Link.",
    "typographyPage.strongTitle": "Strong: énfasis con significado",
    "typographyPage.strongBody":
      "<code>Strong</code> dice que una frase tiene importancia <em>semántica</em>, no sólo un peso visual distinto. Si buscas peso, usa <code>Text</code> con <code>weight</code>.",
    "typographyPage.codeTitle": "Code: un literal dentro del texto",
    "typographyPage.codeBody":
      "<code>Code</code> es para literales: una ruta, un flag, el nombre de una propiedad. Se ve distinto para no confundirlo con prosa. Si es un bloque de código entero, usa <code>CodePreview</code> con su scroll y botón de copiar.",
    "typographyPage.outputTitle": "Output: el resultado de un cálculo",
    "typographyPage.outputBody":
      "<code>Output</code> muestra el resultado de una entrada o interacción. El <code>outputFor</code> nombra los ids de esas entradas para que un lector de pantalla entienda la relación.",
    "typographyPage.whenTitle": "Cuándo usarlo",
    "typographyPage.whenItem1":
      "Necesitas un texto con rol semántico claro: párrafo, título, enlace, énfasis, código.",
    "typographyPage.whenItem2":
      "Un título no es sólo grande, es una sección del documento y necesita un headingElement.",
    "typographyPage.whenItem3":
      "Un enlace está dentro de una frase, no es un botón de acción.",
    "typographyPage.contractItem1":
      "Cada rol tiene una etiqueta HTML distinta: <code>&lt;p&gt;</code> para Text, <code>&lt;h1&gt;–&lt;h6&gt;</code> para Heading, <code>&lt;a&gt;</code> para Link, <code>&lt;strong&gt;</code> para Strong, <code>&lt;code&gt;</code> para Code, <code>&lt;output&gt;</code> para Output.",
    "typographyPage.contractItem2":
      "El <code>textRole</code> cambia el aspecto, no la etiqueta. Un Text con role eyebrow sigue siendo un <code>&lt;p&gt;</code>.",
    "typographyPage.contractItem3":
      "El <code>headingSize</code> es un alias del nivel (display = h1, lg = h2, md = h3, sm = h4), no al revés.",
  },
  en: {
    "demo.typography.text.body":
      "A paragraph is a unit of ideas. Text without a paragraph is just a line. A paragraph without context is just words.",
    "demo.typography.textSecondary.body":
      "The secondary tone is for supporting content: a note, a date, a status that is not the main point.",
    "demo.typography.heading.text": "A heading opens a section",
    "demo.typography.linkContext":
      "A <a href=\"#\">link inside a paragraph</a> reads as part of the text and is underlined.",
    "demo.typography.strong.body":
      "An <strong>important word</strong> has semantic importance, not just a different weight.",
    "demo.typography.code.body":
      "A literal like <code>data-role</code> or <code>--color-surface</code> looks different so it does not get confused with prose.",
    "demo.typography.output.value": "The result is 42",

    "typographyPage.description":
      "Typography: semantic text elements (paragraphs, headings, links, emphasis, code) with clear role and anatomy.",
    "typographyPage.lede":
      "There is no generic <code>Text</code>. Every line of text is a role: a paragraph is an idea, a heading is a section, code is a literal. Choosing well what each one is lets layout, color, and writing work together.",
    "typographyPage.textTitle": "Text: a paragraph, a lead, a note",
    "typographyPage.textBody":
      "The <code>Text</code> component is a paragraph: a unit of ideas in prose. The <code>textRole</code> tells its function: <strong>secondary</strong> is supporting (date, status), <strong>eyebrow</strong> is the small line above a heading, <strong>subtitle</strong> is the lead below the heading.",
    "typographyPage.headingTitle": "Heading: a section and its level",
    "typographyPage.headingBody":
      "A <code>Heading</code> opens a section. The <code>headingElement</code> (h1–h6) is the document level, the <code>headingSize</code> (sm, md, lg, display) is the appearance. They can differ: an h2 can look like an h4 if the section is nested inside a small container.",
    "typographyPage.linkTitle": "Link: a link inside text",
    "typographyPage.linkBody":
      "A <code>Link</code> is an underlined link inside a sentence. If it looks and acts like a button, it is <code>Button.navigation</code>, not a Link.",
    "typographyPage.strongTitle": "Strong: emphasis with meaning",
    "typographyPage.strongBody":
      "<code>Strong</code> says a phrase has <em>semantic</em> importance, not just a different weight. If you want weight, use <code>Text</code> with <code>weight</code>.",
    "typographyPage.codeTitle": "Code: a literal inside text",
    "typographyPage.codeBody":
      "<code>Code</code> is for literals: a path, a flag, a property name. It looks different so it is not confused with prose. If it is a whole code block, use <code>CodePreview</code> with scroll and copy button.",
    "typographyPage.outputTitle": "Output: the result of a calculation",
    "typographyPage.outputBody":
      "<code>Output</code> shows the result of an input or interaction. The <code>outputFor</code> names the ids of those inputs so a screen reader understands the relationship.",
    "typographyPage.whenTitle": "When to use it",
    "typographyPage.whenItem1":
      "You need text with clear semantic role: paragraph, heading, link, emphasis, code.",
    "typographyPage.whenItem2":
      "A heading is not just big, it is a section of the document and needs a headingElement.",
    "typographyPage.whenItem3":
      "A link is inside a sentence, not an action button.",
    "typographyPage.contractItem1":
      "Each role has a different HTML tag: <code>&lt;p&gt;</code> for Text, <code>&lt;h1&gt;–&lt;h6&gt;</code> for Heading, <code>&lt;a&gt;</code> for Link, <code>&lt;strong&gt;</code> for Strong, <code>&lt;code&gt;</code> for Code, <code>&lt;output&gt;</code> for Output.",
    "typographyPage.contractItem2":
      "The <code>textRole</code> changes the appearance, not the tag. A Text with eyebrow role is still a <code>&lt;p&gt;</code>.",
    "typographyPage.contractItem3":
      "The <code>headingSize</code> is an alias of the level (display = h1, lg = h2, md = h3, sm = h4), not the other way around.",
  },
};
