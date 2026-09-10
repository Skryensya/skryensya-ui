export const qrCodeMessages = {
  es: {
    "qrCodePage.description": "Un texto corto hecho escaneable, dibujado como un solo path SVG.",
    "qrCodePage.betaBadge": "Beta",
    "qrCodePage.lede":
      "QRCode convierte un texto corto  -  casi siempre una URL  -  en un símbolo que una cámara puede leer. El contrato calcula la geometría y la emite como <strong>un solo <code>path</code></strong>, así que el binding Vanilla no necesita JavaScript para pintarlo y los dos bindings dibujan exactamente el mismo símbolo.",

    "qrCodePage.basicTitle": "Lo mínimo",
    "qrCodePage.basicBody":
      "Un <code>value</code> y un <code>label</code>. El resto tiene valores por defecto sensatos: corrección <code>Q</code>, módulos cuadrados y una zona de silencio de 4 módulos, que es la que pide el estándar.",
    "qrCodePage.basicLabel": "QRCode",
    "qrCodePage.basicNote": "value + label, todo lo demás por defecto",

    "qrCodePage.labelTitle": "El nombre accesible no es la URL",
    "qrCodePage.labelBody":
      "<code>label</code> es obligatorio y describe <strong>qué logra escanear el código</strong>, no qué dice. Un lector de pantalla que anuncia <code>h-t-t-p-s-dos-puntos-barra-barra…</code> es peor que no anunciar nada: por eso el contrato pide la intención (<em>Abrir el menú del día</em>) y nunca deriva el nombre del valor.",

    "qrCodePage.levelsTitle": "Corrección de errores",
    "qrCodePage.levelsBody":
      "Cuatro niveles, de <code>L</code> a <code>H</code>, que recuperan aproximadamente 7, 15, 25 y 30 por ciento del símbolo dañado. El default es <code>Q</code> y no el <code>M</code> habitual: este contrato trae logo, tinte y formas de módulo, que son justo las tres cosas que gastan el presupuesto de corrección, así que un default que sólo sirve para el caso sin decorar le tira el fallo encima a quien usa las funciones que el componente promociona. Más corrección significa más módulos, o sea un símbolo más denso para el mismo texto: se ve abajo. Subí el nivel cuando el código se va a imprimir, a doblar o a tapar en parte  -  y obligatoriamente si le vas a poner un logo.",
    "qrCodePage.levelsLabel": "Niveles de corrección",
    "qrCodePage.levelsNote": "el mismo texto, cuatro niveles",

    "qrCodePage.shapesTitle": "Forma de los módulos",
    "qrCodePage.shapesBody":
      "<code>moduleShape</code> cambia cómo se dibuja cada módulo, nunca qué codifica: los tres símbolos de abajo llevan el mismo texto y escanean igual. <code>square</code> es el de siempre y el que pinta más nítido en tamaños chicos; <code>dot</code> y <code>rounded</code> son decisiones de marca y piden un poco más de tamaño para leerse bien.",
    "qrCodePage.shapesLabel": "Formas de módulo",
    "qrCodePage.shapesNote": "mismo payload, tres dibujos",

    "qrCodePage.logoTitle": "Un logo en el centro",
    "qrCodePage.logoBody":
      "<code>logoRatio</code> hace dos cosas a la vez, y las dos hacen falta: <strong>vacía</strong> los módulos del centro y dimensiona la caja donde entra el contenido del slot <code>logo</code>. Vaciarlos importa  -  un logo apoyado encima de módulos vivos deja celdas a medio pintar que el escáner lee como ruido, mientras que un agujero limpio es exactamente lo que la corrección de errores sabe recuperar.",
    "qrCodePage.logoBody2":
      "El slot toma cualquier nodo publicado del kit: un <a href=\"/es/componentes/icon\">Icon</a>, un <a href=\"/es/componentes/avatar\">Avatar</a>, un <a href=\"/es/componentes/image-frame\">ImageFrame</a>. Y el agujero se paga en capacidad, así que un logo pide nivel <code>Q</code> o <code>H</code>: por debajo de eso el contrato avisa.",
    "qrCodePage.logoLabel": "Con logo",
    "qrCodePage.logoNote": "nivel H, logoRatio 0.22",

    "qrCodePage.compositionTitle": "El código no viaja solo",
    "qrCodePage.compositionBody":
      "El contrato no trae título, superficie, botón de descarga ni acción de compartir: eso es de lo que lo rodea. Abajo, la composición que sí conviene copiar  -  un <a href=\"/es/componentes/box\">Box</a>, un encabezado y <strong>el mismo enlace escrito</strong>. Ese enlace no es decoración: es lo que hace usable la tarjeta para quien no puede apuntar una cámara, y es el piso de accesibilidad que un QR solo nunca alcanza.",
    "qrCodePage.compositionLabel": "QR con su enlace escrito",
    "qrCodePage.compositionNote": "la composición, no una opción del contrato",

    "qrCodePage.sizesTitle": "Tamaños",
    "qrCodePage.sizesBody":
      "<code>size</code> cambia la huella y nada más: los cuatro símbolos de abajo llevan el mismo texto con la misma cantidad de módulos. Elegí por distancia de lectura, no por hueco en la maqueta  -  <code>sm</code> sirve en pantalla a un palmo, <code>xl</code> es para proyectar o imprimir. La densidad la fija el nivel de corrección, no esto.",
    "qrCodePage.sizesLabel": "Tamaños",
    "qrCodePage.sizesNote": "sm · md · lg · xl",

    "qrCodePage.masksTitle": "Máscaras",
    "qrCodePage.masksBody":
      "Antes de dibujarse, al símbolo se le aplica una de las ocho <strong>máscaras</strong> del estándar con un XOR. Los ocho de abajo llevan <strong>exactamente el mismo texto</strong> y escanean igual: el lector deshace la máscara leyéndola del campo de formato, sin que nadie se lo diga. Lo único que cambia es el dibujo.",
    "qrCodePage.masksBody2":
      "Existe porque una codificación cruda tiende a producir bloques uniformes grandes y rachas que parecen un patrón de posición, y eso es justo lo que una cámara lee mal. Por eso el codificador arma las ocho, las puntúa con las cuatro reglas de penalización de la norma y se queda con la más tranquila  -  eso es <code>auto</code>, el default. Nombrar una sirve para reproducir un símbolo exacto, o para una fila como esta.",
    "qrCodePage.masksLabel": "Las ocho máscaras",
    "qrCodePage.masksNote": "mismo payload, ocho dibujos",

    "qrCodePage.tonesTitle": "Tintes y polaridad",
    "qrCodePage.tonesBody":
      "<code>tone</code> pinta los módulos con la misma paleta que usa <a href=\"/es/componentes/charts\">Chart</a>, siempre en un paso oscuro. <code>polarity</code> decide de qué lado está el contraste, en tres valores: <code>auto</code> (por defecto) sigue el esquema de la página y se da vuelta con el tema; <code>light</code> fija módulos oscuros sobre papel claro  -  la polaridad que especifica la norma  -  y <code>dark</code> es la inversión fija, para un afiche o una superficie oscura.",
    "qrCodePage.tonesBody2":
      "El símbolo siempre se pinta con los mismos tokens  -  es un SVG inline con <code>fill=\"currentColor\"</code>  -  y lo único que cambia entre los tres valores es qué rama de <code>light-dark()</code> gana, vía <code>color-scheme</code> en la caja. Por eso <code>auto</code> se da vuelta solo y los otros dos no. <strong>Elegí <code>light</code> en cuanto el código se vaya de la pantalla</strong>: la norma sólo garantiza oscuro-sobre-claro, así que un símbolo invertido lo leen las cámaras de teléfono actuales  -  iOS y Android lo hacen  -  y no cualquier lector que exista. En pantalla eso alcanza; impreso o proyectado, no.",
    "qrCodePage.tonesLabel": "Tintes",
    "qrCodePage.tonesNote": "light, dark y auto",

    "qrCodePage.popoverTitle": "Pasar la página al teléfono",
    "qrCodePage.popoverBody":
      "El caso en el que un QR es de verdad la mejor herramienta: quien lee está en el escritorio y quiere llevarse esta página al bolsillo. Va en un <a href=\"/es/componentes/popover\">Popover</a> porque el código es un aparte  -  responde una pregunta que nadie se hizo hasta que se la hizo, y no debería ocupar la maqueta hasta entonces.",
    "qrCodePage.popoverLabel": "QR en un popover",
    "qrCodePage.popoverNote": "abrilo para ver el código",

    "qrCodePage.ticketTitle": "Cuando el código es el contenido",
    "qrCodePage.ticketBody":
      "En una entrada el QR no invita a nada: <em>es</em> lo que se escanea en la puerta. Por eso es lo más grande de la caja y el texto alrededor es la copia legible del mismo dato, incluido el código escrito abajo por si el lector falla. <code>tone</code> y un logo son las dos palancas de marca que una entrada real usa, mostradas juntas en el nivel que aguanta las dos.",
    "qrCodePage.ticketLabel": "Entrada",
    "qrCodePage.ticketNote": "nivel H, tone accent, logo",

    "qrCodePage.limitsTitle": "Qué no hace",
    "qrCodePage.limitsItem1":
      "<strong>No hay modo kanji.</strong> El modo byte lleva UTF-8, así que el japonés se codifica y se lee perfecto; el modo kanji sólo lo haría más compacto (13 bits por carácter contra 24). Soportarlo significa mantener una tabla Shift-JIS de 7.000 entradas a cambio de una optimización de tamaño que nadie pidió.",
    "qrCodePage.limitsItem2":
      "<strong>No decodifica.</strong> Leer un QR con la cámara es otro problema  -  binarización, detección de perspectiva  -  y no es lo que hace un design system.",
    "qrCodePage.limitsItem3":
      "<strong>No hay descarga como imagen.</strong> El símbolo ya es un SVG en el DOM: guardarlo o convertirlo a PNG es del consumidor, y meterlo acá sería agregarle un botón a un contrato que deliberadamente no tiene ninguno.",

    "qrCodePage.a11yP1":
      "La raíz es <code>role=\"img\"</code> con el <code>label</code> como nombre accesible, y el <code>&lt;svg&gt;</code> de adentro va <code>aria-hidden</code>: es un dibujo del payload, y exponerlo anunciaría una segunda imagen sin nombre.",
    "qrCodePage.a11yP2":
      "Nunca uses el valor como nombre. Un lector de pantalla deletrea una URL carácter por carácter, y quien escucha eso no puede escanear ni entender qué le ofrecen.",
    "qrCodePage.a11yP3":
      "Un QR no puede ser el único camino a una acción importante. Escribí el enlace al lado, como en la composición de arriba: hay gente sin cámara, sin una segunda pantalla, o leyendo desde el mismo dispositivo donde está el código.",
    "qrCodePage.a11yP4":
      "El contraste acá es una propiedad de <em>funcionamiento</em>, no de estilo: una cámara necesita módulos oscuros sobre fondo claro, en ese orden. Invertirlo está fuera de especificación y varios lectores lo rechazan, así que en <code>forced-colors</code> la hoja fija los dos colores del sistema en vez de heredar un tema invertido.",

    "qrCodePage.testRoundTrip":
      "Cada modo que el contrato promete vuelve a leerse: los tests decodifican el símbolo con un lector independiente, porque un QR con los bytes equivocados se ve idéntico a uno correcto.",
    "qrCodePage.testLogoScans":
      "El símbolo con el agujero del logo sigue decodificando: por eso los módulos se vacían en vez de taparse.",
    "qrCodePage.testShapes":
      "Las tres formas de módulo llevan el mismo payload; la forma es pintura y no puede cambiar lo que el código dice.",
    "qrCodePage.testSameGeometry":
      "El binding React pinta exactamente la geometría que emitiría el compilador: un solo codificador, llamado desde los dos lados.",
  },
  en: {
    "qrCodePage.description": "A short string made scannable, drawn as a single SVG path.",
    "qrCodePage.betaBadge": "Beta",
    "qrCodePage.lede":
      "QRCode turns a short string  -  almost always a URL  -  into a symbol a camera can read. The contract computes the geometry and emits it as <strong>one <code>path</code></strong>, so the Vanilla binding needs no JavaScript to paint it and both bindings draw exactly the same symbol.",

    "qrCodePage.basicTitle": "The floor",
    "qrCodePage.basicBody":
      "A <code>value</code> and a <code>label</code>. Everything else defaults sensibly: <code>Q</code> correction, square modules, and the 4 module quiet zone the standard asks for.",
    "qrCodePage.basicLabel": "QRCode",
    "qrCodePage.basicNote": "value + label, everything else defaulted",

    "qrCodePage.labelTitle": "The accessible name is not the URL",
    "qrCodePage.labelBody":
      "<code>label</code> is required, and it describes <strong>what scanning the code accomplishes</strong>, not what it says. A screen reader announcing <code>h-t-t-p-s-colon-slash-slash…</code> is worse than announcing nothing, so the contract asks for the intent (<em>Open the menu of the day</em>) and never derives a name from the value.",

    "qrCodePage.levelsTitle": "Error correction",
    "qrCodePage.levelsBody":
      "Four levels, <code>L</code> through <code>H</code>, recovering roughly 7, 15, 25 and 30 percent of a damaged symbol. The default is <code>Q</code> rather than the conventional <code>M</code>: this contract ships a logo, a tint and module shapes, which are precisely the three things that spend the error budget, so a default that only holds for the undecorated case pushes the failure onto whoever uses the features the component advertises. More correction means more modules, so a denser symbol for the same text: it is visible below. Raise the level when the code will be printed, folded, or partly covered  -  and always when it carries a logo.",
    "qrCodePage.levelsLabel": "Correction levels",
    "qrCodePage.levelsNote": "the same string, four levels",

    "qrCodePage.shapesTitle": "Module shape",
    "qrCodePage.shapesBody":
      "<code>moduleShape</code> changes how each module is drawn, never what it encodes: the three symbols below carry the same string and scan alike. <code>square</code> is the conventional one and the crispest at small sizes; <code>dot</code> and <code>rounded</code> are brand decisions and want a little more room to read well.",
    "qrCodePage.shapesLabel": "Module shapes",
    "qrCodePage.shapesNote": "same payload, three drawings",

    "qrCodePage.logoTitle": "A logo in the middle",
    "qrCodePage.logoBody":
      "<code>logoRatio</code> does two things at once, and both are needed: it <strong>clears</strong> the modules in the middle and it sizes the box the <code>logo</code> slot's content sits in. Clearing them matters  -  a logo laid over live modules leaves half-painted cells a scanner reads as noise, while a clean hole is exactly what error correction is designed to recover.",
    "qrCodePage.logoBody2":
      "The slot takes any published node in the kit: an <a href=\"/en/components/icon\">Icon</a>, an <a href=\"/en/components/avatar\">Avatar</a>, an <a href=\"/en/components/image-frame\">ImageFrame</a>. The hole is paid for in capacity, so a logo wants level <code>Q</code> or <code>H</code>; below that the contract says so.",
    "qrCodePage.logoLabel": "With a logo",
    "qrCodePage.logoNote": "level H, logoRatio 0.22",

    "qrCodePage.compositionTitle": "The code does not travel alone",
    "qrCodePage.compositionBody":
      "The contract carries no title, surface, download button or share affordance: those belong to whatever holds it. Below is the composition actually worth copying  -  a <a href=\"/en/components/box\">Box</a>, a heading, and <strong>the same link written out</strong>. That link is not decoration: it is what makes the card usable by someone who cannot point a camera at it, and it is the accessibility floor a QR alone never meets.",
    "qrCodePage.compositionLabel": "QR beside its written link",
    "qrCodePage.compositionNote": "a composition, not an option on the contract",

    "qrCodePage.sizesTitle": "Sizes",
    "qrCodePage.sizesBody":
      "<code>size</code> changes the footprint and nothing else: the four symbols below carry the same string with the same module count. Choose by reading distance, not by the hole in the layout  -  <code>sm</code> works on screen at arm's length, <code>xl</code> is for projecting or printing. Density is set by the correction level, not by this.",
    "qrCodePage.sizesLabel": "Sizes",
    "qrCodePage.sizesNote": "sm · md · lg · xl",

    "qrCodePage.masksTitle": "Masks",
    "qrCodePage.masksBody":
      "Before it is drawn, the symbol has one of the standard's eight <strong>masks</strong> XORed over it. All eight below carry <strong>exactly the same string</strong> and scan alike: a reader undoes the mask by reading it off the format field, without being told. Only the picture changes.",
    "qrCodePage.masksBody2":
      "It exists because a raw encoding tends to produce large uniform blocks and runs that look like a finder pattern, and those are what a camera misreads. So the encoder builds all eight, scores them with the standard's four penalty rules and keeps the quietest  -  that is <code>auto</code>, the default. Naming one is for reproducing an exact symbol, or for a row like this.",
    "qrCodePage.masksLabel": "The eight masks",
    "qrCodePage.masksNote": "same payload, eight drawings",

    "qrCodePage.tonesTitle": "Tints and polarity",
    "qrCodePage.tonesBody":
      "<code>tone</code> paints the modules from the same palette <a href=\"/en/components/charts\">Chart</a> uses, always at a dark step. <code>polarity</code> decides which way the contrast runs, across three values: <code>auto</code> (the default) follows the page's colour scheme and flips with the theme; <code>light</code> pins dark modules on light paper  -  the polarity the standard specifies  -  and <code>dark</code> is the pinned inversion, for a dark poster or a dark surface.",
    "qrCodePage.tonesBody2":
      "The symbol is always painted from the same tokens  -  it is an inline SVG drawing in <code>fill=\"currentColor\"</code>  -  and all three values do is decide which branch of <code>light-dark()</code> wins, through <code>color-scheme</code> on the box. That is why <code>auto</code> flips on its own and the other two do not. <strong>Reach for <code>light</code> the moment the code leaves the screen</strong>: the standard only guarantees dark-on-light, so an inverted symbol is read by current phone cameras  -  iOS and Android both handle it  -  and not by every reader that exists. On screen that is enough; printed or projected, it is not.",
    "qrCodePage.tonesLabel": "Tints",
    "qrCodePage.tonesNote": "light, dark and auto",

    "qrCodePage.popoverTitle": "Handing the page to a phone",
    "qrCodePage.popoverBody":
      "The case a QR is genuinely best at: the reader is at a desktop and wants to carry this page to the device in their pocket. It goes in a <a href=\"/en/components/popover\">Popover</a> because the code is an aside  -  it answers a question nobody asked until they asked it, and it should not occupy the layout until then.",
    "qrCodePage.popoverLabel": "QR in a popover",
    "qrCodePage.popoverNote": "open it to see the code",

    "qrCodePage.ticketTitle": "When the code is the content",
    "qrCodePage.ticketBody":
      "On a ticket the QR invites nothing: it <em>is</em> what gets scanned at the door. So it is the largest thing in the box, and the text around it is the human-readable copy of the same fact, including the code written out in case the reader fails. <code>tone</code> and a logo are the two branding levers a real ticket reaches for, shown together at the level that survives both.",
    "qrCodePage.ticketLabel": "Ticket",
    "qrCodePage.ticketNote": "level H, accent tone, logo",

    "qrCodePage.limitsTitle": "What it does not do",
    "qrCodePage.limitsItem1":
      "<strong>No kanji mode.</strong> Byte mode carries UTF-8, so Japanese encodes and reads back perfectly; kanji mode would only make it denser (13 bits per character against 24). Supporting it means owning a 7,000 entry Shift-JIS table in exchange for a size optimisation nobody asked for.",
    "qrCodePage.limitsItem2":
      "<strong>No decoding.</strong> Reading a QR through a camera is a different problem  -  binarisation, perspective detection  -  and not one a design system solves.",
    "qrCodePage.limitsItem3":
      "<strong>No image download.</strong> The symbol is already an SVG in the DOM: saving it or converting it to PNG is the consumer's, and putting it here would add a button to a contract that deliberately has none.",

    "qrCodePage.a11yP1":
      "The root is <code>role=\"img\"</code> named by <code>label</code>, and the inner <code>&lt;svg&gt;</code> is <code>aria-hidden</code>: it is a picture of the payload, and exposing it would announce a second, nameless image.",
    "qrCodePage.a11yP2":
      "Never use the value as the name. A screen reader spells a URL out character by character, and whoever hears that can neither scan it nor tell what is on offer.",
    "qrCodePage.a11yP3":
      "A QR must never be the only route to an important action. Write the link beside it, as in the composition above: some people have no camera, no second screen, or are reading on the very device showing the code.",
    "qrCodePage.a11yP4":
      "Contrast here is a <em>functional</em> property, not a stylistic one: a camera needs dark modules on a light ground, in that order. Inverting it is out of spec and several readers refuse it, so under <code>forced-colors</code> the stylesheet pins the two system colours rather than inheriting an inverted theme.",

    "qrCodePage.testRoundTrip":
      "Every mode the contract promises reads back: the tests decode the symbol with an independent reader, because a QR carrying the wrong bytes looks identical to a correct one.",
    "qrCodePage.testLogoScans":
      "The symbol still decodes with the logo hole punched through it, which is why the modules are cleared rather than covered.",
    "qrCodePage.testShapes":
      "All three module shapes carry the same payload; shape is paint and cannot change what the code says.",
    "qrCodePage.testSameGeometry":
      "The React binding paints exactly the geometry the compiler would emit: one encoder, called from both sides.",
  },
} as const;
