export const stackMessages = {
  es: {
    "demo.stack.title": "Resumen",
    "demo.stack.body": "La solicitud está lista para revisar.",
    "demo.stack.action": "Ver detalles",

    "stackPage.description": "Stack: primitive de layout vertical con separación y alineación transversal.",
    "stackPage.anatomyBody":
      "Las dos franjas entre los anillos de los hijos son <code>data-gap</code>: el dibujo muestra el número en vez de nombrarlo. Son tres hijos y no dos porque dos hacen un solo hueco, y un hueco solo se lee como casualidad; el segundo es el que lo vuelve un ritmo. La etiqueta de adentro dice <code>sk-stack &gt; *</code> porque los hijos no llevan clase propia.",
    "stackPage.anatomyLabel": "Anatomía de Stack",
    "stackPage.anatomyPreviewLabel": "Stack, parte por parte",
    "stackPage.lede":
      "Stack apila contenido en el eje vertical. Es un pattern estructural: el elemento que lo lleva conserva la semántica del contenido, y el gap expresa la separación entre sus hijos.",
    "stackPage.htmlTitle": "HTML escrito a mano",
    "stackPage.htmlBody": "Elige directamente el elemento semántico; Stack no requiere inicialización vanilla.",
    "stackPage.reactBody": "Usa <code>as</code> para elegir el elemento que renderiza el adapter sin perder el contrato de layout.",
    "stackPage.contractItem1": "<code>sk-stack</code> crea una grilla de una columna y apila sus hijos verticalmente.",
    "stackPage.contractItem2":
      "<code>data-gap</code> acepta <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; al omitirlo usa <code>md</code>.",
    "stackPage.contractItem3":
      "<code>data-align</code> alinea en el eje transversal: <code>start</code>, <code>center</code>, <code>end</code> o <code>stretch</code>. Al omitirlo, la grilla estira los hijos.",
    "stackPage.contractItem4": "En React, <code>as</code> es opcional y renderiza <code>div</code> si no se indica.",
    "stackPage.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
  },
  en: {
    "demo.stack.title": "Summary",
    "demo.stack.body": "The request is ready for review.",
    "demo.stack.action": "See details",

    "stackPage.description": "Stack: a vertical layout primitive with gap and cross-axis alignment.",
    "stackPage.anatomyBody":
      "The two bands between the children’s rings are <code>data-gap</code>: the drawing shows the number instead of naming it. Three children rather than two, because two make one gap and one gap reads as a coincidence; the second is what makes it a rhythm. The inner label reads <code>sk-stack &gt; *</code> because the children carry no class of their own.",
    "stackPage.anatomyLabel": "Stack anatomy",
    "stackPage.anatomyPreviewLabel": "Stack, part by part",
    "stackPage.lede":
      "Stack stacks content along the vertical axis. It is a structural pattern: the element carrying it keeps the content's own semantics, and the gap expresses the separation between its children.",
    "stackPage.htmlTitle": "Authored HTML",
    "stackPage.htmlBody": "Choose the semantic element directly; Stack needs no vanilla initialization.",
    "stackPage.reactBody": "Use <code>as</code> to choose the element the adapter renders, without losing the layout contract.",
    "stackPage.contractItem1": "<code>sk-stack</code> creates a one-column grid and stacks its children vertically.",
    "stackPage.contractItem2":
      "<code>data-gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; omitting it uses <code>md</code>.",
    "stackPage.contractItem3":
      "<code>data-align</code> aligns on the cross axis: <code>start</code>, <code>center</code>, <code>end</code>, or <code>stretch</code>. Omitting it stretches the children.",
    "stackPage.contractItem4": "In React, <code>as</code> is optional and renders a <code>div</code> if not given.",
    "stackPage.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
  },
} as const;
