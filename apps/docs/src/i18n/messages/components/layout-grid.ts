export const layoutGridMessages = {
  es: {
    "demo.layoutGrid.narrow": "narrow. Resúmenes, formularios de lectura concentrada.",
    "demo.layoutGrid.content": "content. La medida por defecto para el flujo principal.",
    "demo.layoutGrid.breakout": "breakout. Figuras, tablas o grupos que necesitan más aire lateral.",
    "demo.layoutGrid.fullWidth": "full-width. Fondos o medios que llegan al borde de la grilla.",
    "demo.layoutGridRail.content": "contenido. Main.sk-layout-grid, el flujo principal de la página.",
    "demo.layoutGridRail.rail": "rail. Después del contenido, p. ej. un TOC.",
    "demo.layoutGridRail.railStart": "rail-start. Antes del contenido, p. ej. un índice.",
    "layoutGridPage.description":
      "Layout Grid: un flujo de página con medidas narrow, content, breakout y full-width.",
    "layoutGridPage.anatomyBody":
      "Es el único primitivo de layout cuyos hijos <em>sí</em> están marcados, y eso es su anatomía: un hijo directo pide una medida con <code>data-width</code>. Por eso el dibujo nombra el atributo y no el elemento; el hijo del medio no lleva ninguno y muestra la pista que recibe por no decir nada.",
    "layoutGridPage.anatomyLabel": "Anatomía de Layout Grid",
    "layoutGridPage.anatomyPreviewLabel": "Layout Grid, parte por parte",
    "layoutGridPage.lede":
      "Layout Grid da cuatro anchos nombrados a un único flujo de contenido. El elemento raíz conserva su semántica -puede ser <code>main</code>, <code>article</code> o una sección- y cada hijo directo decide si necesita otra medida con <code>data-width</code>.",
    "layoutGridPage.exampleKicker": "Guía de publicación",
    "layoutGridPage.exampleTitle": "Una guía que se lee de principio a fin",
    "layoutGridPage.exampleIntro":
      "Una página clara convierte una decisión compleja en un recorrido que se puede seguir.",
    "layoutGridPage.exampleFirstSectionTitle": "Primero, define la historia",
    "layoutGridPage.exampleFirstSectionBody":
      "La jerarquía y el ritmo hacen que cada sección llegue en el momento indicado.",
    "layoutGridPage.exampleHeroKicker": "Actualización de producto",
    "layoutGridPage.exampleHeroTitle": "Una decisión necesita espacio para respirar",
    "layoutGridPage.exampleHeroBody":
      "El fondo cambia el contexto sin soltar el hilo de lectura.",
    "layoutGridPage.exampleSecondSectionTitle": "Después, acompaña la decisión",
    "layoutGridPage.exampleSecondSectionBody":
      "La misma medida mantiene la lectura estable mientras el contenido gana importancia.",
    "layoutGridPage.exampleFooter":
      "Skryensya UI · Un sistema para interfaces cuidadas.",
    "layoutGridPage.levelsTitle": "Cuatro anchos, un flujo",
    "layoutGridPage.levelsBody":
      "Sin atributo, cada hijo directo vive en <code>content</code>. Sólo agrega <code>data-width</code> cuando el elemento necesita una medida distinta; no hace falta un wrapper por nivel.",
    "layoutGridPage.levelNarrow": "Prosa, resúmenes o formularios de lectura concentrada.",
    "layoutGridPage.levelContent": "La medida por defecto para el contenido principal.",
    "layoutGridPage.levelBreakout": "Figuras, tablas o grupos que necesitan más aire lateral.",
    "layoutGridPage.levelFullWidth": "Fondos, bordes o medios que llegan al borde de la grilla.",
    "layoutGridPage.fullWidthTitle": "Full-width sin soltar el contenido",
    "layoutGridPage.fullWidthBody":
      "Un hijo directo <code>full-width</code> se vuelve una grilla con las mismas columnas. Sus hijos directos vuelven a <code>content</code> por defecto, y pueden usar <code>narrow</code>, <code>breakout</code> o <code>full-width</code> otra vez.",
    "layoutGridPage.railTitle": "Rail y contenido centrados juntos",
    "layoutGridPage.railBody":
      "Un rail de apoyo -TOC, navegación contextual o metadatos- es un hijo directo de la misma <code>sk-layout-grid</code>. <code>data-width=\"rail\"</code> lo sienta después del contenido; <code>data-width=\"rail-start\"</code>, antes; los dos a la vez, uno a cada lado. No es un span de contenido como <code>narrow</code> o <code>breakout</code>: es una columna aparte, fija en ancho (<code>--sk-layout-rail-inline-size</code>), pegada al flujo por <code>--sk-layout-rail-gap</code>: un paso de <code>space-inline</code>, no el track de breakout. Por debajo de <code>72rem</code> no hay espacio para una columna lateral, así que cada rail pasa a ser una fila propia sobre el contenido.",
    "layoutGridPage.railEndTitle": "Después del contenido",
    "layoutGridPage.railStartTitle": "Antes del contenido",
    "layoutGridPage.railBothTitle": "Ambos lados",
    "layoutGridPage.htmlTitle": "HTML semántico",
    "layoutGridPage.htmlBody":
      "La clase sólo define la geometría. Elige <code>main</code>, <code>section</code>, <code>figure</code> y los demás elementos por lo que significan; <code>data-width</code> acepta <code>narrow</code>, <code>content</code>, <code>breakout</code>, <code>full-width</code>, <code>rail</code> o <code>rail-start</code>.",
    "layoutGridPage.reactBody":
      "En React, <code>LayoutGrid</code> sólo imprime <code>sk-layout-grid</code>; los hijos conservan sus elementos y el mismo <code>data-width</code>.",
    "layoutGridPage.configTitle": "Configuración pública",
    "layoutGridPage.configBody1":
      "Los custom properties públicos viven en el root y se pueden sobrescribir por página o sección. El gap entre un rail y el contenido es <code>--sk-layout-rail-gap</code>.",
    "layoutGridPage.configBody2":
      "Conserva <code>narrow ≤ content ≤ breakout</code>. Los tracks intermedios se calculan a partir de esas diferencias; invertir el orden no describe una medida válida.",
    "layoutGridPage.test1":
      "Renderiza LayoutGrid sin apropiarse de la semántica ni de data-width de sus hijos.",
  },
  en: {
    "demo.layoutGrid.narrow": "narrow. Summaries, focused-reading forms.",
    "demo.layoutGrid.content": "content. The default measure for the main flow.",
    "demo.layoutGrid.breakout": "breakout. Figures, tables or groups that need more room to breathe.",
    "demo.layoutGrid.fullWidth": "full-width. Backgrounds or media that reach the grid's edge.",
    "demo.layoutGridRail.content": "content. Main.sk-layout-grid, the page's main flow.",
    "demo.layoutGridRail.rail": "rail. After the content, e.g. a TOC.",
    "demo.layoutGridRail.railStart": "rail-start. Before the content, e.g. an index.",
    "layoutGridPage.description":
      "Layout Grid: one page flow with narrow, content, breakout, and full-width measures.",
    "layoutGridPage.anatomyBody":
      "It is the one layout primitive whose children <em>are</em> marked, and that is its anatomy: a direct child opts into a measure with <code>data-width</code>. So the drawing names the attribute rather than the element; the middle child carries none, and shows the track it gets by saying nothing at all.",
    "layoutGridPage.anatomyLabel": "Layout Grid anatomy",
    "layoutGridPage.anatomyPreviewLabel": "Layout Grid, part by part",
    "layoutGridPage.lede":
      "Layout Grid gives one content flow four named widths. The root keeps its semantics -it can be <code>main</code>, <code>article</code>, or a section- and each direct child chooses another measure only when it needs one with <code>data-width</code>.",
    "layoutGridPage.exampleKicker": "Publishing guide",
    "layoutGridPage.exampleTitle": "A guide that reads from start to finish",
    "layoutGridPage.exampleIntro":
      "A clear page turns a complex decision into a path readers can follow.",
    "layoutGridPage.exampleFirstSectionTitle": "First, define the story",
    "layoutGridPage.exampleFirstSectionBody":
      "Hierarchy and rhythm bring each section forward at the right moment.",
    "layoutGridPage.exampleHeroKicker": "Product update",
    "layoutGridPage.exampleHeroTitle": "A decision needs room to breathe",
    "layoutGridPage.exampleHeroBody":
      "The background changes context without releasing the reading flow.",
    "layoutGridPage.exampleSecondSectionTitle": "Then, support the decision",
    "layoutGridPage.exampleSecondSectionBody":
      "The same measure keeps reading steady while the content gains importance.",
    "layoutGridPage.exampleFooter":
      "Skryensya UI · A system for thoughtful interfaces.",
    "layoutGridPage.levelsTitle": "Four widths, one flow",
    "layoutGridPage.levelsBody":
      "Without an attribute, every direct child lives in <code>content</code>. Add <code>data-width</code> only when an element needs another measure; there is no wrapper per level.",
    "layoutGridPage.levelNarrow": "Prose, summaries, or forms with a concentrated reading measure.",
    "layoutGridPage.levelContent": "The default measure for main content.",
    "layoutGridPage.levelBreakout": "Figures, tables, or groups that need more inline room.",
    "layoutGridPage.levelFullWidth": "Backgrounds, borders, or media that reach the grid edge.",
    "layoutGridPage.fullWidthTitle": "Full width without releasing content",
    "layoutGridPage.fullWidthBody":
      "A direct <code>full-width</code> child becomes a grid with the same columns. Its direct children return to <code>content</code> by default and may use <code>narrow</code>, <code>breakout</code>, or <code>full-width</code> again.",
    "layoutGridPage.railTitle": "Rail and content centered together",
    "layoutGridPage.railBody":
      "A supporting rail -TOC, contextual navigation, or metadata- is a direct child of the same <code>sk-layout-grid</code>. <code>data-width=\"rail\"</code> sits it after the content; <code>data-width=\"rail-start\"</code>, before; both at once, one on each side. It is not a content span like <code>narrow</code> or <code>breakout</code>: it is a separate column, fixed in width (<code>--sk-layout-rail-inline-size</code>), held to the flow by <code>--sk-layout-rail-gap</code>: one <code>space-inline</code> step, not the breakout track. Below <code>72rem</code> there's no room for a side column, so each rail becomes its own row above the content instead.",
    "layoutGridPage.railEndTitle": "After the content",
    "layoutGridPage.railStartTitle": "Before the content",
    "layoutGridPage.railBothTitle": "Both sides",
    "layoutGridPage.htmlTitle": "Semantic HTML",
    "layoutGridPage.htmlBody":
      "The class defines geometry only. Choose <code>main</code>, <code>section</code>, <code>figure</code>, and every other element for its meaning; <code>data-width</code> accepts <code>narrow</code>, <code>content</code>, <code>breakout</code>, <code>full-width</code>, <code>rail</code>, or <code>rail-start</code>.",
    "layoutGridPage.reactBody":
      "In React, <code>LayoutGrid</code> only renders <code>sk-layout-grid</code>; children keep their elements and the same <code>data-width</code>.",
    "layoutGridPage.configTitle": "Public configuration",
    "layoutGridPage.configBody1":
      "The public custom properties live on the root and can be overridden per page or section. The gap between a rail and the content is <code>--sk-layout-rail-gap</code>.",
    "layoutGridPage.configBody2":
      "Keep <code>narrow ≤ content ≤ breakout</code>. Intermediate tracks are calculated from those differences; reversing their order does not describe a valid measure.",
    "layoutGridPage.test1":
      "Renders LayoutGrid without taking over its children's semantics or data-width.",
  },
} as const;
