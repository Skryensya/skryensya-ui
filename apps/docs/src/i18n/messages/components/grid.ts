export const gridMessages = {
  es: {
    "demo.grid.label": "Proyectos recientes",


    "grid.description": "Grid: columnas iguales con gap nombrado y semántica elegida por quien lo usa.",
    "grid.betaBadge": "Beta",
    "grid.anatomyBody":
      "<code>data-columns</code> es una cuenta, así que el dibujo es contable: tres celdas en <code>columns=\"3\"</code> ponen un anillo en cada columna, y las dos franjas entre ellos son el mismo <code>data-gap</code> que Stack dibuja en horizontal.",
    "grid.anatomyLabel": "Anatomía de Grid",
    "grid.anatomyPreviewLabel": "Grid, parte por parte",
    "grid.lede":
      "Una grilla de columnas iguales para grupos de contenido. Cada columna usa <code>minmax(0, 1fr)</code>: evita que el tamaño mínimo intrínseco ensanche las columnas.",
    "grid.multicolTitle": "CSS Multi-column Layout",
    "grid.multicolBody1":
      '<a href="https://www.w3.org/TR/css-multicol-1/">CSS Multi-column Layout Module Level 1</a> llama <strong>multi-column layout</strong> a este flujo. <code>data-multicol</code> activa las columnas CSS: cada tarjeta termina antes de partirse y la siguiente continúa en el mismo carril.',
    "grid.multicolBody2":
      '<code>data-columns</code> marca el máximo de carriles. Con <code>data-columns="5"</code>, la colección usa 1 carril antes de <code>36rem</code>, 2 desde <code>36rem</code>, 3 desde <code>52rem</code>, 4 desde <code>72rem</code> y 5 desde <code>90rem</code>. Valores menores se detienen en ese máximo.',
    "grid.multicolLabel": "Multi-column layout",
    "grid.multicolBody3":
      "Las columnas llenan un carril de arriba hacia abajo antes de pasar al siguiente. Conserva un orden útil en el DOM y úsalo para tarjetas independientes; no para una secuencia cuyo orden visual de izquierda a derecha tenga significado.",
    "grid.htmlTitle": "HTML escrito a mano",
    "grid.htmlBody": "Elige el elemento semántico, como <code>section</code>, y aplica <code>sk-grid</code>. No requiere inicialización vanilla.",
    "grid.reactBody": "La prop <code>as</code> conserva esa elección semántica.",
    "grid.contractItem1":
      "<code>sk-grid</code> crea una grilla de columnas iguales; <code>data-columns</code> admite <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code> o <code>5</code>.",
    "grid.contractItem2":
      "<code>data-gap</code> admite <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code> o <code>xl</code>; el valor por defecto es <code>md</code>.",
    "grid.contractItem3":
      "<code>data-multicol</code> activa el muro de tarjetas por columnas. <code>data-columns</code> define su máximo de carriles: 1 → 2 → 3 → 4 → 5 en los breakpoints <code>36rem</code>, <code>52rem</code>, <code>72rem</code> y <code>90rem</code>. En React se pasa como <code>multicol</code>.",
    "grid.contractItem4": "En React, <code>Grid</code> recibe <code>as</code>, <code>columns</code>, <code>gap</code>, <code>multicol</code> y <code>responsive</code>; <code>columns</code> tiene por defecto <code>1</code>.",
    "grid.contractItem5":
      "<code>data-responsive</code> aplica esa misma progresión de carriles como un Grid CSS real en vez de columnas CSS: cada fila iguala su alto a la celda más alta, pero un hijo directo puede ensancharse con <code>data-span=\"2\"</code> (hasta <code>5</code>), algo que <code>column-span</code> no permite salvo abarcar todos los carriles a la vez. En React se pasa como <code>responsive</code>; <code>data-span</code> no es una opción del contrato, así que viaja como atributo directo del hijo (<code>&lt;Box data-span=\"2\"&gt;</code>).",
    "grid.responsiveTitle": "Grid responsivo",
    "grid.responsiveBody1":
      "<code>data-responsive</code> es la alternativa a <code>data-multicol</code> cuando algún hijo debe destacar. Usa un Grid CSS real: todas las celdas de una fila comparten el alto de la más alta, y un hijo directo puede pedir más de un carril con <code>data-span=\"2\"</code> (hasta <code>5</code>, acotado a los carriles que existan en cada breakpoint).",
    "grid.responsiveBody2":
      "A diferencia de <code>data-multicol</code>, cada tarjeta conserva su propio alto (<code>align-items: start</code>) en vez de estirarse para llenar la fila; solo la tarjeta con <code>data-span</code> ocupa más carriles.",
    "grid.responsiveLabel": "Grid responsivo",
    "grid.responsiveFeaturedLabel": "Destacado, ocupa dos carriles",
    "grid.test1": "Renderiza Stack, Inline y Grid según los contratos de layout documentados.",
    "grid.test2": "Cambia Grid a filas responsivas y deja que un hijo pida un carril más ancho con data-span.",
  },
  en: {
    "demo.grid.label": "Recent projects",


    "grid.description": "Grid: equal columns with a named gap and semantics chosen by whoever uses it.",
    "grid.betaBadge": "Beta",
    "grid.anatomyBody":
      "<code>data-columns</code> is a count, so the drawing is countable: three cells at <code>columns=\"3\"</code> put one ring in each column, and the two bands between them are the same <code>data-gap</code> Stack draws horizontally.",
    "grid.anatomyLabel": "Grid anatomy",
    "grid.anatomyPreviewLabel": "Grid, part by part",
    "grid.lede":
      "An equal-column grid for groups of content. Every column uses <code>minmax(0, 1fr)</code>: it keeps the intrinsic minimum size from widening the columns.",
    "grid.multicolTitle": "CSS Multi-column Layout",
    "grid.multicolBody1":
      '<a href="https://www.w3.org/TR/css-multicol-1/">CSS Multi-column Layout Module Level 1</a> calls this flow <strong>multi-column layout</strong>. <code>data-multicol</code> turns on CSS columns: every card finishes before breaking, and the next one continues in the same lane.',
    "grid.multicolBody2":
      '<code>data-columns</code> sets the maximum number of lanes. With <code>data-columns="5"</code>, the collection uses 1 lane below <code>36rem</code>, 2 from <code>36rem</code>, 3 from <code>52rem</code>, 4 from <code>72rem</code>, and 5 from <code>90rem</code>. Lower values stop at that ceiling.',
    "grid.multicolLabel": "Multi-column layout",
    "grid.multicolBody3":
      "Columns fill one lane top to bottom before moving to the next. It keeps a useful DOM order, so use it for independent cards, not for a sequence whose left-to-right visual order carries meaning.",
    "grid.htmlTitle": "Authored HTML",
    "grid.htmlBody": "Choose the semantic element, such as <code>section</code>, and apply <code>sk-grid</code>. No vanilla initialization needed.",
    "grid.reactBody": "The <code>as</code> prop keeps that semantic choice.",
    "grid.contractItem1":
      "<code>sk-grid</code> creates an equal-column grid; <code>data-columns</code> accepts <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code>, or <code>5</code>.",
    "grid.contractItem2":
      "<code>data-gap</code> accepts <code>none</code>, <code>xs</code>, <code>sm</code>, <code>md</code>, <code>lg</code>, or <code>xl</code>; the default is <code>md</code>.",
    "grid.contractItem3":
      "<code>data-multicol</code> turns on the column-flowing card wall. <code>data-columns</code> sets its lane ceiling: 1 → 2 → 3 → 4 → 5 at the <code>36rem</code>, <code>52rem</code>, <code>72rem</code>, and <code>90rem</code> breakpoints. In React it is passed as <code>multicol</code>.",
    "grid.contractItem4": "In React, <code>Grid</code> takes <code>as</code>, <code>columns</code>, <code>gap</code>, <code>multicol</code>, and <code>responsive</code>; <code>columns</code> defaults to <code>1</code>.",
    "grid.contractItem5":
      "<code>data-responsive</code> applies that same lane progression as a real CSS Grid instead of CSS columns: every row's height matches its tallest cell, but a direct child can widen itself with <code>data-span=\"2\"</code> (up to <code>5</code>), something <code>column-span</code> cannot do short of spanning every lane at once. In React it is passed as <code>responsive</code>; <code>data-span</code> is not a contract option, so it travels as a raw attribute on the child (<code>&lt;Box data-span=\"2\"&gt;</code>).",
    "grid.responsiveTitle": "Responsive Grid",
    "grid.responsiveBody1":
      "<code>data-responsive</code> is the alternative to <code>data-multicol</code> when one child should stand out. It uses a real CSS Grid: every cell in a row shares that row's tallest height, and a direct child can request more than one lane with <code>data-span=\"2\"</code> (up to <code>5</code>, capped to however many lanes exist at each breakpoint).",
    "grid.responsiveBody2":
      "Unlike <code>data-multicol</code>, each card keeps its own height (<code>align-items: start</code>) instead of stretching to fill the row; only the card carrying <code>data-span</code> takes up more lanes.",
    "grid.responsiveLabel": "Responsive grid",
    "grid.responsiveFeaturedLabel": "Featured, spans two lanes",
    "grid.test1": "Renders Stack, Inline and Grid as the documented layout contracts.",
    "grid.test2": "Switches Grid into responsive rows and lets a child request a wider span with data-span.",
  },
} as const;
