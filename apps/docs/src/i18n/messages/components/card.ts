export const cardMessages = {
  es: {
    "demo.card.title": "Lámpara de mesa",
    "demo.card.description": "Luz cálida y regulable, con base de latón y pantalla de tela.",
    "demo.card.alt": "Una lámpara de mesa de latón con pantalla de tela",
    "demo.card.cta": "Ver producto",

    "cardPage.description": "Card no es un componente: guía para componer tarjetas semánticas con Box, Tile y componentes de contenido.",
    "cardPage.lede":
      'Card es un <strong>resultado de composición</strong>, no un componente del sistema. El contenido decide su estructura; la interacción decide si la superficie nace de <a href="/components/box">Box</a> o de <a href="/components/tile">Tile</a>.',
    "cardPage.calloutBody":
      'No existen <code>sk-card</code>, <code>@skryensya/react/card</code> ni <code>components/card.css</code>. Importa las piezas que la card realmente usa.',
    "cardPage.chooseTitle": "Elige por comportamiento",
    "cardPage.chooseBody":
      "«Card» describe la forma visual, pero no dice qué hace. Empieza por la semántica y la interacción; después compón el contenido con Stack, Inline, Heading, Text, Badge, Stat u otras piezas.",
    "cardPage.tableHeadSurface": "La superficie…",
    "cardPage.tableHeadUses": "Usa",
    "cardPage.tableHeadElement": "Elemento real",
    "cardPage.tableRow1Surface": "presenta contenido o contiene varios controles",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code> o <code>div</code>",
    "cardPage.tableRow2Surface": "navega completa a un destino",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "ejecuta completa una acción",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "activa una opción independiente",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "elige una opción exclusiva",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "revela contenido",
    "cardPage.tableRow6Element": "<code>button</code> o <code>details</code>",
    "cardPage.geometryBody":
      "Box y Tile parten aquí de la misma superficie, borde sutil, radio y padding <code>lg</code>. Tile conserva ese contenido y añade el state layer de <code>sk-interactive</code>; la diferencia visible aparece al hacer hover, foco o press, no en una segunda receta de card.",
    "cardPage.plainMediaTitle": "Contenido puro, sin contenedor",
    "cardPage.plainMediaBody":
      'El piso real de la escalera: ni <a href="/components/box">Box</a> ni ninguna otra superficie, sólo un <a href="/components/primitives">Stack</a> sobre un <code>article</code>, con una foto arriba del texto. No hay borde, fondo ni sombra que agrupe la card. Sin un Box que recorte sus esquinas, <a href="/components/image-frame">ImageFrame</a> pide su propio radio en vez de <code>none</code>: la imagen sostiene su propia geometría porque no hay nada más de donde tomarla prestada.',
    "cardPage.plainMediaNote": "Stack + ImageFrame + Heading + Text",
    "cardPage.basicTitle": "Card básica",
    "cardPage.basicBody":
      'Un escalón sobre el contenido puro: la misma pareja de título y párrafo, ahora dentro de una superficie. Nada aquí es interactivo, así que la raíz es <a href="/components/box">Box</a> sobre un <code>article</code>. No hay ninguna clase <code>card</code> en juego, sólo la superficie, el borde sutil y el padding <code>lg</code>.',
    "cardPage.basicNote": "Box + Stack + Heading + Text",
    "cardPage.metaTitle": "Estado y fecha",
    "cardPage.metaBody":
      'El mismo Box, ahora con jerarquía: <a href="/components/badge">Badge</a> dice el estado y un Text en <code>caption</code> la fecha. La card no creció una API, creció contenido.',
    "cardPage.metaNote": "Box + Inline + Badge + Text",
    "cardPage.statTitle": "Card de métrica",
    "cardPage.statBody":
      '<a href="/components/stat">Stat</a> pone la métrica y Box pone la card. La colección entra en una grilla sin que Stat se convierta en superficie ni gane una variante <code>card</code> en su API.',
    "cardPage.statNote": "Box + Stat + Icon",
    "cardPage.chartTitle": "Card con chart opcional",
    "cardPage.chartBody":
      'El chart vive en el contrato <code>Chart</code>: una lista de puntos, no la API de una librería. La card sigue siendo una composición: Box lleva la superficie, Badge y Button el resto, y el área sólo la tendencia. <code>flush</code> llega al borde. Más formas, en <a href="/components/charts">Charts</a>.',
    "cardPage.chartLabel": "Visitas de las últimas ocho semanas",
    "cardPage.chartNote": "Box + Badge + Button + Chart area · paquete opcional para el área",
    "cardPage.chartMore":
      'Este peldaño es la card, no el chart. Las tres composiciones, las formas y el renderer opcional están en <a href="/components/charts">Charts</a>.',
    "cardPage.linkTitle": "Card que navega",
    "cardPage.linkBody":
      "Primer peldaño interactivo. Toda la superficie lleva a <strong>un</strong> destino, así que la raíz es el propio <code>a[href]</code>: un TileLink. No hay enlace estirado por CSS ni un <code>onClick</code> sobre un <code>div</code>, y el título es lo que nombra al enlace.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "Card que actúa",
    "cardPage.actionBody":
      "Misma geometría, otro elemento de plataforma: esto <em>hace</em> algo, así que es un <code>button</code>. La forma no decide el elemento; la intención sí.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "Card que se elige",
    "cardPage.selectBody":
      "Y una preferencia es un checkbox. La superficie vuelve a ser la misma, pero el estado lo lleva la plataforma: se marca con la barra espaciadora, entra en un formulario y un lector de pantalla la anuncia como casilla.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.mediaTitle": "Card con imagen",
    "cardPage.mediaBody":
      'Entra el medio. El Box no lleva padding: ya recorta por <code>overflow</code>, así que un <a href="/components/image-frame">ImageFrame</a> con <code>data-radius="none"</code> llega al borde y hereda la esquina redondeada. El inset del texto lo repone <code>.sk-card-body</code>, porque un padding en la raíz también habría metido para adentro a la foto.',
    "cardPage.mediaNote": "Box + ImageFrame + Badge",
    "cardPage.gradientTitle": "Card con gradiente",
    "cardPage.gradientBody":
      "El lavado que mantiene legible el texto sobre la foto. Se dimensiona según el <strong>tipo</strong> que protege y no según un porcentaje de la imagen: el caption es la caja y el gradiente la rellena, desvaneciéndose hacia la foto. Las tres cards muestran los tres valores de <code>data-strength</code> (<code>sm</code>, <code>md</code> y <code>lg</code>) sobre el mismo panel claro, porque es opacidad y tinte y nunca cuánta imagen se tapa. Las imágenes son claras a propósito: sobre un fondo ya oscuro el lavado no se vería y el ejemplo diría lo contrario de lo que enseña.",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.mediaLinkTitle": "Card con imagen que navega",
    "cardPage.mediaLinkBody":
      'Los tres a la vez: medio, gradiente y navegación. Es un TileLink con <code>data-padding="none"</code> para que la foto llegue al borde, y todo lo de adentro es un <code>span</code>, porque un <code>a</code> no puede contener contenido interactivo de bloque.',
    "cardPage.mediaLinkNote": "TileLink + ImageFrame + MediaGradient",
    "cardPage.productTitle": "Card de producto",
    "cardPage.productBody":
      "El techo de la escalera, y el ejemplo que prueba la regla. Acá viven <strong>dos</strong> decisiones independientes (ver detalle y añadir), así que la raíz no puede ser un Tile: un enlace y un botón anidados dentro de un <code>a</code> son HTML inválido, y un click de superficie completa sólo podría significar una de las dos. Para esto existe Box.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.doTitle": "Do · Haz",
    "cardPage.doHeading": "Deja que el comportamiento elija la raíz",
    "cardPage.doItem1": "Usa Box para contenido y para varios controles independientes.",
    "cardPage.doItem2": "Usa un Tile semántico cuando toda la superficie tiene una sola intención.",
    "cardPage.doItem3": "Conserva headings, listas, precios y estados como componentes de contenido.",
    "cardPage.doItem4": "Haz que el foco visible alcance la superficie interactiva completa.",
    "cardPage.doItem5": "Deja que el contenido determine la altura; agrupa sólo cards comparables.",
    "cardPage.dontTitle": "Don't · Evita",
    "cardPage.dontHeading": "No conviertas la apariencia en una API",
    "cardPage.dontItem1": "No crees un componente Card con variantes <code>news</code>, <code>product</code> o <code>stat</code>.",
    "cardPage.dontItem2": "No pongas <code>onClick</code> ni <code>tabindex</code> en un Box o <code>div</code>.",
    "cardPage.dontItem3": "No anides botones, enlaces o inputs dentro de TileLink o TileButton.",
    "cardPage.dontItem4": "No dupliques el mismo destino en la superficie y en un enlace interior.",
    "cardPage.dontItem5": "No recortes contenido importante sólo para igualar alturas.",
    "cardPage.implTitle": "Implementación",
    "cardPage.implBody":
      "No hay un import de Card. Importa Box o el Tile semántico elegido, sus estilos y únicamente las piezas de contenido presentes. Esto mantiene cada dependencia y cada contrato visibles en el call site.",
    "cardPage.a11yP1":
      'La raíz decide su propia semántica, no la card: <code>article</code>/<code>section</code>/<code>div</code> para Box, <code>a[href]</code>/<code>button</code>/<code>input[type=checkbox]</code> para cada Tile: la tabla de la sección "Elige por comportamiento" arriba resume las seis.',
    "cardPage.a11yP2":
      "El título de cada card usa <code>h3</code> en estos ejemplos porque viven bajo el <code>h2</code> oculto de esta pestaña; en tu página, ajusta el nivel al lugar real que ocupa la card en el esquema de encabezados, no lo copies literal.",
    "cardPage.a11yP3":
      'El foco visible de <a href="/components/tile">Tile</a> cubre toda la superficie interactiva, nunca solo un ícono o un enlace interior; Box jamás recibe <code>tabindex</code> ni un <code>onClick</code> propio: ver Do &amp; Don\'t arriba.',
    "cardPage.a11yP4":
      "Una imagen de contenido (guías, casos de estudio, artículos) lleva <code>alt</code> real; el lavado que protege el texto sobre una foto es puramente decorativo y va <code>aria-hidden</code>.",
    "cardPage.a11yP5":
      'La preferencia que se marca en la card que se elige es un <code>input[type=checkbox]</code> nativo: la barra espaciadora la activa y un lector de pantalla la anuncia como casilla, sin un rol ARIA a medida.',
    "cardPage.testGridOfThree":
      "Cada ejemplo mantiene exactamente tres cards: la invariante que compara alturas, medios y pies entre sí.",
    "cardPage.testSelectDefaultChecked":
      'El estado inicial de la card que se elige vive en <code>data-default-checked</code> de la raíz, no en el atributo <code>checked</code> del input.',
    "cardPage.testImportsTile":
      "La página importa <code>tile.css</code>, la hoja que TileLink, TileButton y TileCheckbox necesitan y que Base.astro nunca carga de forma global.",
    "cardPage.testImportsCheckbox":
      "La página importa <code>checkbox.css</code>: sin ella cada indicador pinta el visto y el guion a la vez, sin importar el estado.",
  },
  en: {
    "demo.card.title": "Desk lamp",
    "demo.card.description": "Warm dimmable light with a brass base and fabric shade.",
    "demo.card.alt": "A brass desk lamp with a fabric shade",
    "demo.card.cta": "View product",

    "cardPage.description": "Card is not a component: a guide for composing semantic cards with Box, Tile, and content components.",
    "cardPage.lede":
      'Card is a <strong>composition result</strong>, not a system component. Content decides its structure; interaction decides whether the surface is born from <a href="/en/components/box">Box</a> or from <a href="/en/components/tile">Tile</a>.',
    "cardPage.calloutBody":
      "There is no <code>sk-card</code>, <code>@skryensya/react/card</code>, or <code>components/card.css</code>. Import whichever pieces the card actually uses.",
    "cardPage.chooseTitle": "Choose by behavior",
    "cardPage.chooseBody":
      "\"Card\" describes the visual shape, but says nothing about what it does. Start from semantics and interaction; then compose the content with Stack, Inline, Heading, Text, Badge, Stat, or other pieces.",
    "cardPage.tableHeadSurface": "The surface…",
    "cardPage.tableHeadUses": "Use",
    "cardPage.tableHeadElement": "Real element",
    "cardPage.tableRow1Surface": "presents content or holds several controls",
    "cardPage.tableRow1Element": "<code>article</code>, <code>section</code>, or <code>div</code>",
    "cardPage.tableRow2Surface": "navigates entirely to a destination",
    "cardPage.tableRow2Element": "<code>a[href]</code>",
    "cardPage.tableRow3Surface": "runs an action entirely",
    "cardPage.tableRow3Element": "<code>button</code>",
    "cardPage.tableRow4Surface": "toggles an independent option",
    "cardPage.tableRow4Element": '<code>input[type=checkbox]</code>',
    "cardPage.tableRow5Surface": "chooses an exclusive option",
    "cardPage.tableRow5Element": '<code>input[type=radio]</code>',
    "cardPage.tableRow6Surface": "reveals content",
    "cardPage.tableRow6Element": "<code>button</code> or <code>details</code>",
    "cardPage.geometryBody":
      "Box and Tile both start from the same surface, subtle border, radius, and <code>lg</code> padding here. Tile keeps that content and adds <code>sk-interactive</code>'s state layer; the visible difference shows up on hover, focus, or press, not in a second card recipe.",
    "cardPage.plainMediaTitle": "Plain content, no container",
    "cardPage.plainMediaBody":
      'The actual floor of the ladder: no <a href="/en/components/box">Box</a>, no surface of any kind, just a <a href="/en/components/primitives">Stack</a> on an <code>article</code>, with a photo above the text. There is no border, background, or shadow grouping the card. With no Box to clip its corners, <a href="/en/components/image-frame">ImageFrame</a> asks for its own radius instead of <code>none</code>: the image carries its own geometry because there is nothing left to borrow it from.',
    "cardPage.plainMediaNote": "Stack + ImageFrame + Heading + Text",
    "cardPage.basicTitle": "Basic card",
    "cardPage.basicBody":
      'One step up from plain content: the same title-and-paragraph pair, now inside a surface. Nothing here is interactive, so the root is <a href="/en/components/box">Box</a> on an <code>article</code>. No <code>card</code> class is in play, just the surface, the subtle border, and <code>lg</code> padding.',
    "cardPage.basicNote": "Box + Stack + Heading + Text",
    "cardPage.metaTitle": "Status and date",
    "cardPage.metaBody":
      'The same Box, now with hierarchy: <a href="/en/components/badge">Badge</a> states the status and a <code>caption</code>-sized Text states the date. The card grew no API, it grew content.',
    "cardPage.metaNote": "Box + Inline + Badge + Text",
    "cardPage.statTitle": "Metric card",
    "cardPage.statBody":
      '<a href="/en/components/stat">Stat</a> supplies the metric and Box supplies the card. The collection drops into a grid without Stat turning into a surface or growing a <code>card</code> variant in its API.',
    "cardPage.statNote": "Box + Stat + Icon",
    "cardPage.chartTitle": "Card with an optional chart",
    "cardPage.chartBody":
      'The chart lives in the <code>Chart</code> contract: a list of points, not a library API. The card remains a composition: Box owns the surface, Badge and Button the rest, and the area owns only the trend. <code>flush</code> reaches the edge. More shapes live on <a href="/en/components/charts">Charts</a>.',
    "cardPage.chartLabel": "Visits over the last eight weeks",
    "cardPage.chartNote": "Box + Badge + Button + Chart area · optional package for the area",
    "cardPage.chartMore":
      'This rung is the card, not the chart. The three compositions, the shapes, and the optional renderer live on <a href="/en/components/charts">Charts</a>.',
    "cardPage.linkTitle": "Card that navigates",
    "cardPage.linkBody":
      "First interactive rung. The whole surface leads to <strong>one</strong> destination, so the root is the <code>a[href]</code> itself: a TileLink. There is no CSS-stretched link and no <code>onClick</code> on a <code>div</code>, and the title is what names the link.",
    "cardPage.linkNote": "TileLink + Icon",
    "cardPage.actionTitle": "Card that acts",
    "cardPage.actionBody":
      "Same geometry, a different platform element: this one <em>does</em> something, so it is a <code>button</code>. The shape does not decide the element; the intent does.",
    "cardPage.actionNote": "TileButton + Icon",
    "cardPage.selectTitle": "Card that gets chosen",
    "cardPage.selectBody":
      "And a preference is a checkbox. The surface is the same again, but the state belongs to the platform: it toggles with the space bar, it enters a form, and a screen reader announces it as a checkbox.",
    "cardPage.selectNote": "TileCheckbox",
    "cardPage.mediaTitle": "Card with an image",
    "cardPage.mediaBody":
      'Media arrives. The Box carries no padding: it already clips through <code>overflow</code>, so an <a href="/en/components/image-frame">ImageFrame</a> at <code>data-radius="none"</code> reaches the edge and inherits the rounded corner. The text inset gets restored by <code>.sk-card-body</code>, because padding on the root would have inset the photo too.',
    "cardPage.mediaNote": "Box + ImageFrame + Badge",
    "cardPage.gradientTitle": "Card with a gradient",
    "cardPage.gradientBody":
      "The wash that keeps text readable over a photo. It sizes itself to the <strong>type</strong> it protects, not to a percentage of the image: the caption is the box and the gradient fills it, fading toward the photo. The three cards show the three <code>data-strength</code> values (<code>sm</code>, <code>md</code>, and <code>lg</code>) over the same pale panel, because strength is opacity and tint, never how much of the image gets covered. The images are deliberately light: over an already-dark background the wash would not show and the example would argue against itself.",
    "cardPage.gradientNote": "ImageFrame + MediaCaption + MediaGradient (sm · md · lg)",
    "cardPage.mediaLinkTitle": "Card with a navigating image",
    "cardPage.mediaLinkBody":
      'All three at once: media, gradient, and navigation. It is a TileLink at <code>data-padding="none"</code> so the photo reaches the edge, and everything inside is a <code>span</code>, because an <code>a</code> cannot hold block-level interactive content.',
    "cardPage.mediaLinkNote": "TileLink + ImageFrame + MediaGradient",
    "cardPage.productTitle": "Product card",
    "cardPage.productBody":
      "The top of the ladder, and the example that proves the rule. <strong>Two</strong> independent decisions live here (view detail and add), so the root cannot be a Tile: a link and a button nested inside an <code>a</code> is invalid HTML, and a whole-surface click could only ever mean one of the two. This is exactly what Box exists for.",
    "cardPage.productNote": "Box + Badge + Link + Button",
    "cardPage.doTitle": "Do",
    "cardPage.doHeading": "Let behavior choose the root",
    "cardPage.doItem1": "Use Box for content and for several independent controls.",
    "cardPage.doItem2": "Use a semantic Tile when the whole surface has a single intent.",
    "cardPage.doItem3": "Keep headings, lists, prices, and statuses as content components.",
    "cardPage.doItem4": "Let visible focus reach the whole interactive surface.",
    "cardPage.doItem5": "Let content determine height; group only comparable cards.",
    "cardPage.dontTitle": "Don't",
    "cardPage.dontHeading": "Don't turn appearance into an API",
    "cardPage.dontItem1": "Don't create a Card component with <code>news</code>, <code>product</code>, or <code>stat</code> variants.",
    "cardPage.dontItem2": "Don't put <code>onClick</code> or <code>tabindex</code> on a Box or <code>div</code>.",
    "cardPage.dontItem3": "Don't nest buttons, links, or inputs inside TileLink or TileButton.",
    "cardPage.dontItem4": "Don't duplicate the same destination on the surface and on an inner link.",
    "cardPage.dontItem5": "Don't crop important content just to match heights.",
    "cardPage.implTitle": "Implementation",
    "cardPage.implBody":
      "There is no Card import. Import Box or the chosen semantic Tile, its styles, and only the content pieces present. This keeps every dependency and every contract visible at the call site.",
    "cardPage.a11yP1":
      'The root decides its own semantics, not the card: <code>article</code>/<code>section</code>/<code>div</code> for Box, <code>a[href]</code>/<code>button</code>/<code>input[type=checkbox]</code> for each Tile: the table under "Choose by behavior" above summarizes all six.',
    "cardPage.a11yP2":
      "Each card's title uses <code>h3</code> in these examples because they live under this tab's own hidden <code>h2</code>; on your page, match the level to the card's real place in the heading outline instead of copying it literally.",
    "cardPage.a11yP3":
      'A <a href="/en/components/tile">Tile</a>\'s visible focus covers the whole interactive surface, never just an icon or an inner link; Box never receives <code>tabindex</code> or an <code>onClick</code> of its own: see Do &amp; Don\'t above.',
    "cardPage.a11yP4":
      "A content image (guides, case studies, articles) carries a real <code>alt</code>; the wash that protects text over a photo is purely decorative and gets <code>aria-hidden</code>.",
    "cardPage.a11yP5":
      'The preference toggled in the card-that-gets-chosen example is a native <code>input[type=checkbox]</code>: the space bar activates it and a screen reader announces it as a checkbox, with no custom ARIA role.',
    "cardPage.testGridOfThree":
      "Every example keeps exactly three cards: the invariant that lines up height, media and footer across siblings.",
    "cardPage.testSelectDefaultChecked":
      'The initial state of the card-that-gets-chosen example lives in the root\'s <code>data-default-checked</code>, not in the input\'s <code>checked</code> attribute.',
    "cardPage.testImportsTile":
      "The page imports <code>tile.css</code>, the sheet TileLink, TileButton and TileCheckbox need and that Base.astro never loads globally.",
    "cardPage.testImportsCheckbox":
      "The page imports <code>checkbox.css</code>: without it every indicator paints the check and the dash at once, regardless of state.",
  },
} as const;
