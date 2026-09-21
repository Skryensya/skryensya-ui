export const quoteMessages = {
  es: {
    "demo.quote.main.body":
      "Escribir el componente es la parte fácil. Lo difícil es que quien lo lea después entienda por qué quedó así.",
    "demo.quote.main.attribution": "Camila Rojas,",
    "demo.quote.main.source": "Cuadernos de un sistema de diseño",
    "demo.quote.anonymous.body":
      "El sistema no se defiende solo: se defiende cada vez que alguien decide no hacer una excepción.",
    "demo.quote.pull.body":
      "Un contrato no existe para describir el componente. Existe para que dos implementaciones no puedan discrepar en silencio.",
    "demo.quote.pull.attribution": "CONTEXT.md",
    "demo.quote.testimonial.body":
      "Migramos las seis pantallas del trámite en una tarde y no tuvimos que discutir ni un espaciado.",
    "demo.quote.testimonial.attribution": "Equipo de Postulaciones,",
    "demo.quote.testimonial.source": "Informe de adopción, marzo 2026",

    "quotePage.description":
      "Quote: palabras de otro, con quién las dijo y en qué obra aparecieron, en la anatomía que pide el propio HTML.",
    "quotePage.lede":
      "Palabras que son <em>de otro</em>. La raíz es un <code>&lt;figure&gt;</code> y la atribución va fuera del <code>&lt;blockquote&gt;</code>: no es una preferencia de layout, es la regla del propio HTML, que reserva ese elemento para el material citado y nada más.",
    "quotePage.anatomyBody":
      "El diagrama nombra las cuatro partes. Fíjate dónde queda el caption: afuera de la cita, que es lo que esta anatomía existe para hacer bien.",
    "quotePage.anatomyLabel": "Anatomía de Quote",
    "quotePage.anatomyPreviewLabel": "Quote, parte por parte",
    "quotePage.citeTitle": "Quién lo dijo y dónde apareció son dos campos",
    "quotePage.citeBody":
      "<code>attribution</code> es <strong>quién</strong> lo dijo y es texto del caption. <code>source</code> es <strong>en qué obra</strong> apareció, y ese sí es el <code>&lt;cite&gt;</code>: el elemento nombra el título de un trabajo, nunca a una persona. Escribir «Camila Rojas» dentro de un <code>&lt;cite&gt;</code> es el error más común de este markup, y tenerlos separados es lo que lo vuelve difícil de cometer por accidente. La puntuación entre los dos (la coma, un guion, «en») es copia y la escribes tú, porque cambia con el idioma; el espacio que sigue no, ese lo pone el caption, que es una fila flex. Esa fila existe por una razón concreta: sin ella el markup emitido dejaría un espacio colapsado entre las dos partes que React no deja, y las dos bindings diferirían en un carácter invisible.",
    "quotePage.bareTitle": "Sin nadie a quién citar",
    "quotePage.bareBody":
      "Sin <code>attribution</code> ni <code>source</code> el caption no se emite: no queda un elemento vacío ocupando espacio bajo la cita.",
    "quotePage.barePreviewLabel": "Quote sin atribución",
    "quotePage.pullTitle": "Pull: la cita levantada del texto",
    "quotePage.pullBody":
      "<code>variant=\"pull\"</code> no es la misma cita más grande: es otra función. Está <em>fuera</em> del párrafo, así que pierde el filete (ya no está dentro de nada de lo que colgarlo), toma tipografía de display y aprieta la medida, porque un display a 60ch es una línea en la que el ojo se pierde al volver.",
    "quotePage.pullPreviewLabel": "Quote, variante pull",
    "quotePage.testimonialTitle": "Testimonio",
    "quotePage.testimonialBody":
      "Un testimonio es una cita con superficie propia. La caja es un <code>Box</code>: la cita no cambia, cambia dónde está puesta.",
    "quotePage.testimonialPreviewLabel": "Quote como testimonio",
    "quotePage.whenTitle": "Cuándo usarlo",
    "quotePage.whenItem1":
      "Las palabras son de otro y se muestran como suyas: una cita, un testimonio, un extracto.",
    "quotePage.whenItem2":
      "Una frase corta citada <em>dentro</em> de una oración no es esto: es el <code>&lt;q&gt;</code> nativo, en línea, sin bloque.",
    "quotePage.whenItem3":
      "Si el texto es la voz de la página y no la de alguien más, es <a href=\"/es/componentes/callout\">Callout</a>: un aviso con estado, no una cita.",
    "quotePage.whenItem4":
      "Código, comandos o salida de consola van en <code>Code</code> o en <a href=\"/es/componentes/code-preview\">CodePreview</a>.",
    "quotePage.contractItem1":
      "La raíz es siempre <code>&lt;figure&gt;</code>, con o sin atribución: una raíz que cambiara de elemento según un slot sería una segunda estructura que el CSS de quien la consume tendría que conocer.",
    "quotePage.contractItem2":
      "<code>cite</code> (el atributo) es la URL de procedencia y va en el <code>&lt;blockquote&gt;</code>. No lo pinta ningún navegador y este componente tampoco: si hay un enlace que seguir, va escrito dentro de <code>source</code>.",
    "quotePage.contractItem3":
      "No agrega comillas. El glifo es de la copia: quien escribe sabe si el pasaje ya viene puntuado, qué marcas usa su idioma («», „“, “”) y si es un fragmento.",
    "quotePage.contractItem4":
      "<code>--sk-quote-font-style</code> existe para la marca que cita en cursiva. El default es redonda: la cursiva a largo de párrafo se lee más lento, y el filete ya dice que es una cita.",
    "quotePage.contractItem5":
      "No tiene enhancer: el markup está completo por sí solo, así que las dos bindings son el mismo markup dos veces.",
  },
  en: {
    "demo.quote.main.body":
      "Writing the component is the easy part. The hard part is the next person reading it and seeing why it ended up like that.",
    "demo.quote.main.attribution": "Camila Rojas,",
    "demo.quote.main.source": "Notebooks on a design system",
    "demo.quote.anonymous.body":
      "A system does not defend itself: it is defended every time somebody decides not to make an exception.",
    "demo.quote.pull.body":
      "A contract does not exist to describe the component. It exists so two implementations cannot disagree in silence.",
    "demo.quote.pull.attribution": "CONTEXT.md",
    "demo.quote.testimonial.body":
      "We migrated the six screens of the form in one afternoon, and never had to argue about a single spacing value.",
    "demo.quote.testimonial.attribution": "Applications team,",
    "demo.quote.testimonial.source": "Adoption report, March 2026",

    "quotePage.description":
      "Quote: somebody else's words, who said them and the work they appeared in, in the anatomy HTML itself asks for.",
    "quotePage.lede":
      "Words that are <em>somebody else's</em>. The root is a <code>&lt;figure&gt;</code> and the attribution sits outside the <code>&lt;blockquote&gt;</code>: not a layout preference, but HTML's own rule, which reserves that element for the quoted material and nothing else.",
    "quotePage.anatomyBody":
      "The diagram names the four parts. Watch where the caption lands: outside the quotation, which is what this anatomy exists to get right.",
    "quotePage.anatomyLabel": "Quote anatomy",
    "quotePage.anatomyPreviewLabel": "Quote, part by part",
    "quotePage.citeTitle": "Who said it and where it appeared are two fields",
    "quotePage.citeBody":
      "<code>attribution</code> is <strong>who</strong> said it, and it is plain caption text. <code>source</code> is <strong>the work</strong> it appeared in, and that one IS the <code>&lt;cite&gt;</code>: the element names the title of a work, never a person. Putting “Camila Rojas” inside a <code>&lt;cite&gt;</code> is the most common mistake in this markup, and keeping the two apart is what makes it hard to fall into by accident. The punctuation between them (a comma, a dash, “in”) is copy, and you write it, because it changes with the language; the space after it is not - the caption is a flex row and supplies it. That row exists for a concrete reason: without it the emitted markup would leave one collapsed space between the halves that React does not, and the two bindings would differ by an invisible character.",
    "quotePage.bareTitle": "With nobody to credit",
    "quotePage.bareBody":
      "With neither <code>attribution</code> nor <code>source</code> the caption is not emitted: no empty element is left holding space under the quotation.",
    "quotePage.barePreviewLabel": "Quote with no attribution",
    "quotePage.pullTitle": "Pull: the quotation lifted out of the text",
    "quotePage.pullBody":
      "<code>variant=\"pull\"</code> is not the same quotation, larger: it is a different job. It sits <em>outside</em> the paragraph, so it loses the rule (there is nothing left to hang it off), takes display type, and tightens its measure, because display type at 60ch is a line the eye loses on the way back.",
    "quotePage.pullPreviewLabel": "Quote, pull variant",
    "quotePage.testimonialTitle": "Testimonial",
    "quotePage.testimonialBody":
      "A testimonial is a quotation with a surface of its own. The card is a <code>Box</code>: the quotation does not change, only where it is put.",
    "quotePage.testimonialPreviewLabel": "Quote as a testimonial",
    "quotePage.whenTitle": "When to use it",
    "quotePage.whenItem1":
      "The words are somebody else's and are shown as theirs: a quotation, a testimonial, an excerpt.",
    "quotePage.whenItem2":
      "A short phrase quoted <em>inside</em> a sentence is not this: that is the native <code>&lt;q&gt;</code>, inline, with no block.",
    "quotePage.whenItem3":
      "When the text is the page's own voice rather than somebody else's, it is a <a href=\"/components/callout\">Callout</a>: a notice with a status, not a quotation.",
    "quotePage.whenItem4":
      "Code, commands and console output belong in <code>Code</code> or a <a href=\"/components/code-preview\">CodePreview</a>.",
    "quotePage.contractItem1":
      "The root is always a <code>&lt;figure&gt;</code>, with or without attribution: a root that changed element depending on a slot would be a second structure for a consumer's CSS to know about.",
    "quotePage.contractItem2":
      "<code>cite</code> (the attribute) is the provenance URL and lives on the <code>&lt;blockquote&gt;</code>. No browser renders it and neither does this component: a link a reader can follow is written inside <code>source</code>.",
    "quotePage.contractItem3":
      "It adds no quotation marks. The glyph belongs to the copy: whoever writes it knows whether the passage is already punctuated, which marks their language takes («», „“, “”) and whether it is a fragment.",
    "quotePage.contractItem4":
      "<code>--sk-quote-font-style</code> is there for the brand that quotes in italic. The default is upright: italic at paragraph length reads measurably slower, and the rule already says it is a quotation.",
    "quotePage.contractItem5":
      "There is no enhancer: the markup is complete on its own, so both bindings are the same markup twice.",
  },
} as const;
