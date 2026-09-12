export const linkMessages = {
  es: {
    "demo.link.before": "Un párrafo con un ",
    "demo.link.neutral": "enlace del color del texto",
    "demo.link.middle": " y otro ",
    "demo.link.accent": "de color acento",
    "demo.link.after": ", los dos con subrayado permanente.",

    "linkPage.description": "Link: un enlace de texto, siempre subrayado, el único tratamiento que WCAG 1.4.1 permite.",
    "linkPage.lede":
      'Link conserva la semántica nativa de <code>&lt;a&gt;</code>: úsalo para navegar y proporciona un <code>href</code> válido. Es un <strong>enlace de texto</strong> con subrayado permanente, el único tratamiento que WCAG 1.4.1 permite en prosa. El hover usa el state layer (<code>sk-interactive</code>), no un color inventado por el componente.',
    "linkPage.tileTitle": "Link de superficie: TileLink",
    "linkPage.tileBody1":
      "Cuando toda una superficie es un único destino, usa <code>TileLink</code>. También renderiza un <code>&lt;a&gt;</code>, pero no es <code>sk-link</code>: conserva la geometría Tile y su state layer porque el contexto, no un subrayado en prosa, comunica que la superficie es navegable.",
    "linkPage.tileBody2": "El HTML escrito a mano funciona sin inicialización. <code>createTileLink</code> solo crea el ancla cuando el árbol se genera desde JavaScript.",
    "linkPage.whyTitle": "Por qué un solo tipo, y no tres",
    "linkPage.whyBody1":
      'Un enlace dentro de un bloque de texto <strong>no se puede distinguir por color solo</strong>: es <a class="sk-link sk-interactive" href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html">WCAG 1.4.1 (Use of Color)</a>, nivel A. Solo hay dos formas de cumplir: un indicador que no sea color <em>en reposo</em>, un subrayado permanente, o un contraste de ≥3:1 entre el color del enlace y el del texto <em>más</em> una señal no-color en hover <em>y</em> foco.',
    "linkPage.whyBody2":
      "La segunda vía es frágil: hay que re-medir ese 3:1 en cada marca y cada modo, y quien lee la página quieta, o no puede hacer hover, no recibe ninguna señal hasta tocar el enlace. Un subrayado que aparece solo en hover deja el texto en reposo sin pista, y sin subrayado se falla el criterio de plano. Así que <code>sk-link</code> tiene <strong>una</strong> forma, subrayado siempre, y no un hook para apagarlo: ofrecer <code>hover</code> o <code>none</code> sería ofrecer una manera de fallar 1.4.1.",
    "linkPage.calloutBody":
      "<strong>¿Y los enlaces que no van subrayados?</strong> Un ítem de navegación, un breadcrumb, el prev/next del pie, esos se distinguen por <em>ubicación</em>, no por color, así que 1.4.1 no les pide subrayado. Pero no son <code>sk-link</code>: usan el pattern <code>nav-list</code> o un botón <code>ghost</code>. <code>sk-link</code> es, por definición, el enlace <em>dentro del texto</em>.",
    "linkPage.toneTitle": "El tono no cambia la regla",
    "linkPage.toneBody":
      'Por defecto el enlace toma el <strong>mismo color que el texto</strong> y se apoya enteramente en el subrayado. <code>data-tone="accent"</code> lo pinta del color de acento de marca. En ambos casos el subrayado es obligatorio: sin él, el tono accent solo se distinguiría por color (falla WCAG 1.4.1), y el default no se distinguiría de la prosa.',
    "linkPage.contractItem1": "Renderiza un ancla nativa: <code>href</code> define el destino.",
    "linkPage.contractItem2": "<code>data-tone</code> es opcional: sin él, el color del texto; <code>accent</code> usa el color de acento de marca.",
    "linkPage.contractItem3":
      "<strong>El subrayado no es configurable</strong>: siempre está, porque un enlace de texto sin señal no-color permanente falla WCAG 1.4.1.",
    "linkPage.contractItem4": "No establece <code>target</code>, <code>rel</code> ni ningún comportamiento para enlaces externos.",
    "linkPage.contractItem5":
      "Lleva <code>sk-interactive</code>: hover, press y foco vienen del state layer. El <code>::before</code> se abre un poco más que la tinta para que el wash no se lea como una mancha sobre los glifos; el subrayado permanente sigue siendo la señal en reposo.",
    "linkPage.test1": "Renderiza un enlace nativo con el state layer compartido para hover/press/foco.",
  },
  en: {
    "demo.link.before": "A paragraph with a ",
    "demo.link.neutral": "text-coloured link",
    "demo.link.middle": " and another ",
    "demo.link.accent": "accent-coloured one",
    "demo.link.after": ", both with a permanent underline.",

    "linkPage.description": "Link: a text link, always underlined, the only treatment WCAG 1.4.1 allows.",
    "linkPage.lede":
      "Link keeps <code>&lt;a&gt;</code>'s native semantics: use it to navigate, and give it a valid <code>href</code>. It is a <strong>text link</strong> with a permanent underline, the only treatment WCAG 1.4.1 allows in prose. Hover uses the state layer (<code>sk-interactive</code>), not a color the component invents.",
    "linkPage.tileTitle": "A surface link: TileLink",
    "linkPage.tileBody1":
      "When a whole surface is a single destination, use <code>TileLink</code>. It also renders an <code>&lt;a&gt;</code>, but it is not <code>sk-link</code>: it keeps Tile's geometry and state layer, because the context: not a prose underline: communicates that the surface is navigable.",
    "linkPage.tileBody2": "The authored HTML works with no initialization. <code>createTileLink</code> only creates the anchor when the tree is generated from JavaScript.",
    "linkPage.whyTitle": "Why one shape, not three",
    "linkPage.whyBody1":
      "A link inside a block of text <strong>cannot be told apart by color alone</strong>: that is <a class=\"sk-link sk-interactive\" href=\"https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html\">WCAG 1.4.1 (Use of Color)</a>, level A. There are only two ways to comply: a non-color indicator <em>at rest</em>, a permanent underline, or a ≥3:1 contrast between the link's color and the text's <em>plus</em> a non-color signal on hover <em>and</em> focus.",
    "linkPage.whyBody2":
      "The second path is fragile: that 3:1 has to be re-measured for every brand and every mode, and whoever is reading a still page, or cannot hover, gets no signal until they touch the link. An underline that only appears on hover leaves resting text with no clue, and with no underline the flat criterion fails. So <code>sk-link</code> has <strong>one</strong> shape, always underlined, and no hook to turn it off: offering <code>hover</code> or <code>none</code> would be offering a way to fail 1.4.1.",
    "linkPage.calloutBody":
      "<strong>What about links that are not underlined?</strong> A nav item, a breadcrumb, the prev/next in a footer: those are told apart by <em>location</em>, not color, so 1.4.1 does not ask them for an underline. But they are not <code>sk-link</code>: they use the <code>nav-list</code> pattern or a <code>ghost</code> button. <code>sk-link</code> is, by definition, the link <em>inside the text</em>.",
    "linkPage.toneTitle": "Tone does not change the rule",
    "linkPage.toneBody":
      'By default the link takes the <strong>same color as the text</strong> and relies entirely on the underline. <code>data-tone="accent"</code> paints it in the brand\'s accent color. Either way the underline stays mandatory: without it, the accent tone would be told apart by color alone (a WCAG 1.4.1 failure), and the default would not be told apart from the prose at all.',
    "linkPage.contractItem1": "Renders a native anchor: <code>href</code> sets the destination.",
    "linkPage.contractItem2": "<code>data-tone</code> is optional: without it, the text's own color; <code>accent</code> uses the brand's accent color.",
    "linkPage.contractItem3":
      "<strong>The underline is not configurable</strong>: it is always there, because a text link with no permanent non-color signal fails WCAG 1.4.1.",
    "linkPage.contractItem4": "It sets no <code>target</code>, <code>rel</code>, or any behavior for external links.",
    "linkPage.contractItem5":
      "It carries <code>sk-interactive</code>: hover, press, and focus come from the state layer. The <code>::before</code> opens a bit wider than the ink, so the wash does not read as a smear over the glyphs; the permanent underline stays the resting signal.",
    "linkPage.test1": "Renders a native link with the shared state layer for hover/press/focus.",
  },
} as const;
