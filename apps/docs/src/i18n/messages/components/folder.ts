export const folderMessages = {
  es: {
    "demo.folder.radioTitle": "Radio",
    "demo.folder.radioBody":
      "Una radio personal: estaciones curadas a mano y la misma canción sonando para todos a la misma hora, sin botón de siguiente ni servidor coordinando nada. Sólo el reloj de cada quien, que resulta ser el mismo reloj.",
    "demo.folder.printerTitle": "Printer",
    "demo.folder.printerBody":
      "Un sitio donde cualquiera puede mandar un mensaje corto que sale impreso al instante en la impresora térmica de mi escritorio. Nació de una pregunta que no me dejaba en paz: ¿y si cualquier cosa en internet pudiera imprimir en ella?",
    "demo.folder.wadaTitle": "Wada.ink",
    "demo.folder.wadaBody":
      "Un catálogo interactivo de las combinaciones de color de Sanzo Wada, pensado para navegar y descubrir, no sólo para mirar láminas. Ya existían otras versiones, pero ninguna dejaba comparar dos paletas de un vistazo.",

    "folderPage.description": "Folder: una superficie con pestaña, dibujada como una sola silueta que el binding mide.",
    "folderPage.lede":
      "Una carpeta no es una caja con otra caja encima: la pestaña sale del cuerpo en una curva, y esa curva es la razón de que este componente tenga geometría. La silueta es un solo <code>&lt;path&gt;</code>, y el único número que no se puede escribir de antemano es dónde termina la pestaña, porque termina donde termina su rótulo.",
    "folderPage.anatomyBody":
      "Forma, pestaña, contenido y previews. El espécimen está en <code>active</code> para que la silueta se vea: en reposo una carpeta se pinta del color de su fondo. Congelado.",
    "folderPage.anatomyLabel": "Anatomía de Folder",
    "folderPage.anatomyPreviewLabel": "Folder, parte por parte",
    "folderPage.shapeTitle": "Cómo se dibuja",
    "folderPage.shapeBody":
      "La geometría es una función pura de core, <code>folderPath</code>, y las dos bindings la llaman con los mismos números: miden la caja de la carpeta y el ancho de la pestaña, y escriben el <code>d</code> resultante. Los cinco números de la forma (alto de pestaña, barrido de entrada, hombro, esquina superior y radio inferior) son hooks CSS, así que una marca reafina la silueta en su propia hoja sin tocar una binding.",
    "folderPage.revealTitle": "Nunca se ve en reposo",
    "folderPage.revealBody":
      "Una carpeta nunca se ve en reposo, y no hay opción para que se vea: es lo que el componente ES. Una página de carpetas se lee como texto limpio hasta que el puntero, o el foco del teclado, llega a una, y recién ahí la forma se resuelve bajo su propio rótulo. Responde a <code>:hover</code> y a <code>:focus-within</code>, nunca sólo a hover; en punteros gruesos, que no tienen hover con qué responder, se pinta siempre. Si querés la forma visible siempre, eso es un <code>Box</code> con un encabezado adentro, y el catálogo ya tiene uno.",
    "folderPage.revealLabel": "FolderStack que aparece al interactuar",
    "folderPage.previewsTitle": "Previews",
    "folderPage.previewsBody":
      "El slot opcional <code>previews</code> abre en abanico lo que la carpeta contenga sobre los mismos estados que revelan la silueta. Cada hijo directo es una preview y lo coloca la hoja, así que quien compone elige qué son (unos <code>ImageFrame</code>, casi siempre) en vez de pasar una lista que este contrato tendría que aprender a leer. Son decorativas por construcción: la capa va <code>aria-hidden</code> y no toma el puntero, así una preview que tapa la carpeta de adelante no le roba el clic. Una imagen que signifique algo por sí sola va en el cuerpo, donde se la puede alcanzar.",
    "folderPage.plainLabel": "FolderStack sin previews",
    "folderPage.touchTitle": "En táctil no hay hover",
    "folderPage.touchBody":
      "Una carpeta se revela con <code>:hover</code> y <code>:focus-within</code>, y un teléfono no tiene ninguno de los dos: hover no existe, y tocar un enlace navega en vez de dejarle el foco. Sin nada más, el abanico no aparecía nunca en un teléfono: las imágenes se renderizaban y se quedaban en <code>opacity: 0</code> para siempre. La opción <code>active</code> es la tercera entrada: dice que esta carpeta está siendo alcanzada por algo que no es el puntero ni el teclado, y la carpeta responde igual que al hover, abanico incluido. Quién la pone es de quien compone: en una página que scrollea suele ser la carpeta más cercana al centro de la pantalla, pero podría ser la que un carrusel dejó al frente o la que apunta una ruta, y esas preguntas las sabe la página, no el componente. Pintar el abanico siempre en táctil sería más simple y es peor: las previews suben hacia la carpeta de arriba, así que en una pila taparían su texto de forma permanente.",
    "folderPage.touchLabel": "La segunda carpeta con active puesto",
    "folderPage.groundTitle": "Se esconde contra su fondo",
    "folderPage.groundBody":
      "Una carpeta en reposo se pinta del color de lo que tiene detrás, no transparente: transparente no pinta nada, y una carpeta revelada se vería a través de las que van adelante. El binding copia lo que el primer ancestro que pinta algo tiene puesto (color y capas, el degradado de elevación incluido), así que la misma composición desaparece contra un panel hundido y contra uno elevado sin que nadie configure nada. Leer sólo el color de fondo no alcanzaba: las superficies de este sistema son un color con un wash encima, y ese wash delataba la forma. <code>--sk-folder-ground</code> queda como salida para lo que la heurística no cubre: una carpeta sobre una imagen o un degradado.",
    "folderPage.groundSunkenLabel": "Sobre una superficie hundida",
    "folderPage.groundRaisedLabel": "Sobre una superficie elevada",
    "folderPage.stackTitle": "El solape",
    "folderPage.stackBody":
      "<code>FolderStack</code> solapa las carpetas como están en un cajón: cada una muestra su pestaña y una franja de cuerpo. El solape es una sola regla entre hermanos, sin elemento envoltorio ni índice por ítem, y sin <code>z-index</code> en ninguna parte: la carpeta que tocás sigue estando detrás de las que van adelante, igual que en un cajón de verdad. <code>overlap</code> es cuánto se esconde cada una detrás de la anterior.",
    "folderPage.stackLabel": "FolderStack",
    "folderPage.contractItem1":
      "<code>label</code> es un slot, no un string: la pestaña de una carpeta casi siempre lleva un encabezado, y un encabezado es markup.",
    "folderPage.contractItem2":
      "Todas las carpetas son del mismo color, como en un cajón real: una pila con cada carpeta de un tono distinto se lee como cinco tarjetas sueltas que comparten forma, y la forma es todo el punto. Tampoco tiene borde: lo que la separa del fondo es la sombra.",
    "folderPage.contractItem3":
      "<code>Folder.link</code> es un <code>&lt;a&gt;</code> de verdad, no una caja con handler: es lo mismo que hace <code>TileLink</code>, y es lo que le da teclado a <code>reveal=\"interaction\"</code>.",
    "folderPage.contractItem4":
      "La sombra es un <code>drop-shadow</code>, no un <code>box-shadow</code>: una sombra de caja sigue el rectángulo, y todo el punto de este componente es que su borde no es un rectángulo.",
    "folderPage.a11yBody":
      "La silueta es decorativa por construcción: el <code>&lt;svg&gt;</code> va <code>aria-hidden</code>, sin rol y sin nombre. Lo que nombra a una carpeta es el contenido de su pestaña.",
    "folderPage.a11yItem1":
      "El revelado responde a <code>:focus-within</code> además de <code>:hover</code>: una forma que sólo aparece bajo el mouse es una forma que nadie que navegue con teclado ve nunca.",
    "folderPage.a11yItem2":
      "En punteros gruesos <code>interaction</code> se pinta como <code>always</code>: invisible para siempre es peor respuesta que revelado de entrada.",
    "folderPage.a11yItem3":
      "Con <code>prefers-reduced-motion</code> sobrevive el revelado, que es información, y se van el levante y los fundidos, que no lo son.",
    "folderPage.testCore1": "Gira la esquina de entrada con el mismo radio en los dos ejes, como todas las demás.",
    "folderPage.testCore2": "Lleva el filo de la pestaña hasta donde termina la pestaña y ahí dobla por el hombro.",
    "folderPage.testCore3": "Mantiene las proporciones de la curva en S cuando la pestaña es más alta.",
    "folderPage.testCore4": "Nunca dibuja fuera de la caja de la que se midió.",
    "folderPage.testCore5": "Recorta una pestaña demasiado ancha en vez de plegar el path sobre sí mismo.",
    "folderPage.testCore6": "Recorta el barrido de entrada a una pestaña que no lo puede contener, en vez de ensanchar la pestaña.",
    "folderPage.testCore7": "Espeja la silueta completa para una carpeta en RTL.",
    "folderPage.testCore8": "No dibuja nada para una caja sin área.",
    "folderPage.testCore9": "Lee cada perilla de la forma desde una custom property.",
    "folderPage.testCore10": "Cae al default por propiedad, así un hook redeclarado no se lleva el resto de la silueta.",
    "folderPage.testReact1": "Renderiza la pestaña, el contenido y una silueta decorativa detrás.",
    "folderPage.testReact2": "Dibuja la silueta a partir de la caja de la carpeta y del ancho de su pestaña.",
    "folderPage.testReact3": "Marca la raíz como lista recién cuando escribió un path real.",
    "folderPage.testReactScheme":
      "Vuelve a leer el fondo cuando se da vuelta el esquema de color, que no mueve ninguna caja.",
    "folderPage.testReact4": "No escribe atributo de reveal: una carpeta nunca se ve en reposo.",
    "folderPage.testReact5": "Escribe el <code>reveal</code> por defecto del contrato cuando no se pide.",
    "folderPage.testReact6": "Espeja la silueta dentro de un subárbol RTL.",
    "folderPage.testReact7": "<code>Folder.link</code> es un ancla real con la anatomía de la carpeta.",
    "folderPage.testReact8": "La pila contiene carpetas directamente, sin elemento envoltorio entre medio.",
    "folderPage.testReact9": "Pasa <code>overlap</code> como la custom property que lee la hoja.",
    "folderPage.testVanilla1": "Dibuja la silueta a partir de la caja de la carpeta y del ancho de su pestaña.",
    "folderPage.testVanilla2": "Marca la raíz como lista recién cuando escribió un path real.",
    "folderPage.testVanilla3": "No dibuja nada, y no queda lista, si la caja no se puede medir.",
    "folderPage.testVanilla4": "Vuelve a medir cuando cambia cualquiera de las dos cajas, y observa las dos.",
    "folderPage.testVanillaScheme":
      "Vuelve a leer el fondo cuando se da vuelta el esquema de color, que no mueve ninguna caja.",
    "folderPage.testVanillaSchemeCleanup": "Deja de escuchar el esquema cuando la carpeta se destruye.",
    "folderPage.testVanilla5": "Rechaza una raíz a la que le faltan los nodos donde tiene que dibujar.",
    "folderPage.testVanilla6": "Monta una vez por raíz y deja en paz una carpeta ya enhanceada.",
    "folderPage.testCore11": "Mide hasta el borde lejano de la pestaña, no sólo su ancho.",
    "folderPage.testCore12": "En RTL mide desde el borde inline-start, que es el derecho.",
    "folderPage.testCore13": "Toma el primer ancestro que efectivamente pinta algo.",
    "folderPage.testCore14": "Se saltea todas las formas de escribir un fondo totalmente transparente.",
    "folderPage.testCore15": "Responde <code>null</code> cuando nada en el árbol pinta.",
    "folderPage.testCore16": "Responde <code>null</code> para una carpeta sin padre.",
    "folderPage.testCore17": "Pone el pliegue a la altura medida de la pestaña, sin importar el default.",
    "folderPage.testCore18": "Levanta el canto superior del cuerpo sin mover la esquina de la pestaña.",
    "folderPage.testCore19": "Nunca levanta ese canto por encima del techo de la pestaña.",
    "folderPage.testCore20": "Copia las capas de imagen sobre el color, en el orden en que CSS las pinta.",
    "folderPage.testCore21": "Toma una imagen aunque no haya color debajo.",
    "folderPage.testCore22": "Esconde la parte vacía debajo de la última línea, y nada por encima.",
    "folderPage.testCore23": "Una carpeta cuyo texto la llena no esconde nada, en vez de un valor negativo.",
    "folderPage.testCore24": "Paga la inclinación, que una medición en espacio de layout no ve.",
    "folderPage.testReact10": "Publica la silueta como clip para que el state layer la siga.",
    "folderPage.testReact11": "Abre las previews en una capa <code>aria-hidden</code>, y no renderiza ninguna sin el slot.",
    "folderPage.testVanilla7": "Publica la silueta como clip para que el state layer la siga.",
  },
  en: {
    "demo.folder.radioTitle": "Radio",
    "demo.folder.radioBody":
      "A personal radio: hand-picked stations, and the same song playing for everyone at the same time, with no skip button and no server keeping anyone in sync. Only each listener's own clock, which turns out to be the same clock.",
    "demo.folder.printerTitle": "Printer",
    "demo.folder.printerBody":
      "A site where anyone can send a short message that prints instantly on the thermal printer on my desk. It grew out of a question that would not leave me alone: what if anything on the internet could print on it?",
    "demo.folder.wadaTitle": "Wada.ink",
    "demo.folder.wadaBody":
      "An interactive catalogue of Sanzo Wada's colour combinations, built to browse and discover rather than only to look at. Other versions existed, but none let you hold two palettes side by side.",

    "folderPage.description": "Folder: a surface with a tab, drawn as one silhouette the binding measures.",
    "folderPage.lede":
      "A folder is not a box with another box stuck on top: the tab flows out of the body through a curve, and that curve is the whole reason this component needs geometry. The silhouette is a single <code>&lt;path&gt;</code>, and the only number that cannot be written ahead of time is where the tab ends, because it ends wherever its label ends.",
    "folderPage.anatomyBody":
      "Shape, tab, content, and previews. The specimen is held <code>active</code> so the silhouette is visible: at rest a folder paints itself the colour of its ground. Frozen.",
    "folderPage.anatomyLabel": "Folder anatomy",
    "folderPage.anatomyPreviewLabel": "Folder, part by part",
    "folderPage.shapeTitle": "How it is drawn",
    "folderPage.shapeBody":
      "The geometry is a pure function in core, <code>folderPath</code>, and both bindings call it with the same numbers: they measure the folder's box and the tab's width, and write the resulting <code>d</code>. The shape's five numbers (tab height, leading sweep, shoulder, top corner and bottom radius) are CSS hooks, so a brand retunes the silhouette in its own stylesheet without touching a binding.",
    "folderPage.revealTitle": "Never visible at rest",
    "folderPage.revealBody":
      "A folder is never visible at rest, and there is no option to make it so: that is what the component IS. A page of folders reads as plain text until the pointer, or the keyboard's focus, reaches one, and only then does the shape resolve under its own label. It answers <code>:hover</code> and <code>:focus-within</code>, never hover alone; on coarse pointers, which have no hover to answer with, it is simply painted. If you want the shape always visible, that is a <code>Box</code> with a heading in it, and the catalogue already has one.",
    "folderPage.revealLabel": "A FolderStack that appears on interaction",
    "folderPage.previewsTitle": "Previews",
    "folderPage.previewsBody":
      "The optional <code>previews</code> slot fans out whatever the folder holds, on the same states that reveal the silhouette. Each direct child is one preview and the stylesheet places it, so the author picks what they are (a few <code>ImageFrame</code>s, usually) rather than handing over a list this contract would have to learn to read. They are decorative by construction: the layer is <code>aria-hidden</code> and takes no pointer, so a preview covering the folder in front never steals its click. A picture that means something on its own belongs in the body, where a reader can reach it.",
    "folderPage.plainLabel": "FolderStack with no previews",
    "folderPage.touchTitle": "Touch has no hover",
    "folderPage.touchBody":
      "A folder reveals on <code>:hover</code> and <code>:focus-within</code>, and a phone has neither: hover does not exist, and a tap on a link navigates rather than settling focus on it. With nothing else, the fan never appeared on a phone at all: the pictures rendered and sat at <code>opacity: 0</code> forever. The <code>active</code> option is the third way in: it says this folder is being reached for by something that is neither pointer nor keyboard, and the folder answers exactly as it does to hover, fan included. Who sets it is the composition's business: on a scrolling page it is usually whichever folder is nearest the middle of the screen, but it could be the one a carousel stopped at or the one a route points at, and those questions belong to the page rather than to the component. Painting the fan permanently on touch would be simpler and is worse: previews rise into the folder above them, so in a stack they would cover its copy for good.",
    "folderPage.touchLabel": "The second folder with active held on",
    "folderPage.groundTitle": "It hides against its ground",
    "folderPage.groundBody":
      "A folder at rest is painted the colour of whatever is behind it, not transparent: transparent paints nothing, and a revealed folder would show straight through the ones in front. The binding copies whatever the first painting ancestor has on it (colour and layers, the elevation wash included), so the same composition disappears into a sunken panel and into a raised one with nothing configured. Reading the background colour alone was not enough: this system's surfaces are a colour with a wash over it, and that wash gave the shape away. <code>--sk-folder-ground</code> is the way out for what the heuristic cannot see: a folder over an image or a gradient.",
    "folderPage.groundSunkenLabel": "On a sunken surface",
    "folderPage.groundRaisedLabel": "On a raised surface",
    "folderPage.stackTitle": "The overlap",
    "folderPage.stackBody":
      "<code>FolderStack</code> overlaps folders the way they sit in a drawer: each shows its tab and a strip of body. The overlap is one rule between siblings, with no wrapper element, no per-item index, and no <code>z-index</code> anywhere: the folder you reach for still sits behind the ones in front of it, exactly as it would in a real drawer. <code>overlap</code> is how deeply each one hides behind the one before it.",
    "folderPage.stackLabel": "FolderStack",
    "folderPage.contractItem1":
      "<code>label</code> is a slot, not a string: a folder's tab almost always holds a heading, and a heading is markup.",
    "folderPage.contractItem2":
      "Every folder is the same colour, the way a real drawer is: a pile tinted one shade each reads as five unrelated cards that share a shape, and the shape is the whole point. Nor is there a border: what separates a folder from its ground is the shadow.",
    "folderPage.contractItem3":
      "<code>Folder.link</code> is a real <code>&lt;a&gt;</code>, not a box with a handler - the same move <code>TileLink</code> makes, and what gives <code>reveal=\"interaction\"</code> a keyboard.",
    "folderPage.contractItem4":
      "The shadow is a <code>drop-shadow</code>, not a <code>box-shadow</code>: a box shadow follows the rectangle, and the whole point of this component is that its edge is not one.",
    "folderPage.a11yBody":
      "The silhouette is decorative by construction: the <code>&lt;svg&gt;</code> is <code>aria-hidden</code>, with no role and no name. What names a folder is whatever its tab holds.",
    "folderPage.a11yItem1":
      "The reveal answers <code>:focus-within</code> as well as <code>:hover</code>: a shape that only ever appears under a mouse is a shape no keyboard reader ever sees.",
    "folderPage.a11yItem2":
      "On coarse pointers <code>interaction</code> paints as <code>always</code>: invisible forever is a worse answer than revealed early.",
    "folderPage.a11yItem3":
      "Under <code>prefers-reduced-motion</code> the reveal survives, because it is information, and the lift and the fades go, because they are not.",
    "folderPage.testCore1": "Turns the leading corner on the same radius both ways, like every other corner.",
    "folderPage.testCore2": "Runs the tab's top edge to where the tab ends, then folds down over the shoulder.",
    "folderPage.testCore3": "Keeps the S-curve's proportions when the tab is taller.",
    "folderPage.testCore4": "Never draws outside the box it was measured from.",
    "folderPage.testCore5": "Clamps a tab too wide for its shoulder instead of folding the path back on itself.",
    "folderPage.testCore6": "Clamps the leading sweep to a tab too narrow to hold it, instead of widening the tab.",
    "folderPage.testCore7": "Mirrors the whole silhouette for an RTL folder.",
    "folderPage.testCore8": "Draws nothing at all for a box with no area.",
    "folderPage.testCore9": "Reads every knob off custom properties.",
    "folderPage.testCore10": "Falls back per property, so one redeclared hook keeps the rest of the silhouette.",
    "folderPage.testReact1": "Renders the tab, the content and a decorative silhouette behind them.",
    "folderPage.testReact2": "Draws the silhouette from the folder's own box and its tab's width.",
    "folderPage.testReact3": "Marks the root ready only once a real path has been written.",
    "folderPage.testReactScheme":
      "Re-samples the ground when the colour scheme flips, which moves no box at all.",
    "folderPage.testReact4": "Writes no reveal attribute, because a folder is never visible at rest.",
    "folderPage.testReact5": "Writes the contract's default reveal when none is given.",
    "folderPage.testReact6": "Mirrors the silhouette inside an RTL subtree.",
    "folderPage.testReact7": "<code>Folder.link</code> is a real anchor carrying the folder's own anatomy.",
    "folderPage.testReact8": "The stack holds folders directly, with no wrapper element between them.",
    "folderPage.testReact9": "Passes <code>overlap</code> through as the custom property the stylesheet reads.",
    "folderPage.testVanilla1": "Draws the silhouette from the folder's own box and its tab's width.",
    "folderPage.testVanilla2": "Marks the root ready only once a real path has been written.",
    "folderPage.testVanilla3": "Draws nothing, and stays unready, when the box cannot be measured.",
    "folderPage.testVanilla4": "Re-measures when either box changes, and observes both.",
    "folderPage.testVanillaScheme":
      "Re-samples the ground when the colour scheme flips, which moves no box at all.",
    "folderPage.testVanillaSchemeCleanup": "Stops watching the scheme once the folder is destroyed.",
    "folderPage.testVanilla5": "Refuses a root missing the nodes it has to draw into.",
    "folderPage.testVanilla6": "Mounts once per root and leaves an already-enhanced folder alone.",
    "folderPage.testCore11": "Measures to the tab's far edge, not merely its width.",
    "folderPage.testCore12": "In RTL it measures from the inline-start edge, which is the right-hand one.",
    "folderPage.testCore13": "Takes the first ancestor that actually paints something.",
    "folderPage.testCore14": "Skips every spelling of a fully transparent background.",
    "folderPage.testCore15": "Answers <code>null</code> when nothing up the tree paints at all.",
    "folderPage.testCore16": "Answers <code>null</code> for a folder with no parent.",
    "folderPage.testCore17": "Puts the fold at the measured tab height, whatever the default says.",
    "folderPage.testCore18": "Lifts the body's top edge without moving the tab's own corner.",
    "folderPage.testCore19": "Never lifts that edge above the tab's own top.",
    "folderPage.testCore20": "Copies the image layers over the colour, in the order CSS paints them.",
    "folderPage.testCore21": "Takes an image with no colour under it.",
    "folderPage.testCore22": "Hides the empty card below the last line, and nothing above it.",
    "folderPage.testCore23": "A folder whose copy fills it gets no tail, rather than a negative one.",
    "folderPage.testCore24": "Pays for the forward lean, which a layout-space measurement cannot see.",
    "folderPage.testReact10": "Publishes the silhouette as a clip for the state layer to follow.",
    "folderPage.testReact11": "Fans previews into an <code>aria-hidden</code> layer, and renders none without the slot.",
    "folderPage.testVanilla7": "Publishes the silhouette as a clip for the state layer to follow.",
  },
} as const;
