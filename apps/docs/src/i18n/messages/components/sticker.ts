export const stickerMessages = {
  es: {
    "demo.sticker.groupLabel": "Tres stickers, uno por estado",
    "demo.sticker.starAlt": "Estrella dorada",
    "demo.sticker.bubbleAlt": "Globo de diálogo morado",
    "demo.sticker.statesLabel": "Los tres estados de Sticker",
    "demo.sticker.originsLabel": "Las cuatro esquinas desde las que se despega",
    "demo.sticker.hooksLabel": "Sticker ajustado con styling hooks",
    "demo.sticker.hooksDefault": "por defecto",
    "demo.sticker.hooksThick": "borde ancho y de color",
    "demo.sticker.hooksDeep": "despegue profundo",
    "demo.sticker.peel": "Despegar",
    "demo.sticker.apply": "Pegar",
    "demo.sticker.reset": "Soltar",

    "sticker.description":
      "Sticker: una ilustración convertida en sticker troquelado, con un borde que sigue su silueta y estados de despegue y adhesión.",
    "sticker.betaBadge": "Beta",
    "sticker.lede":
      "Sticker convierte una ilustración en un <strong>sticker troquelado</strong>. La silueta del arte es el sticker: los píxeles transparentes quedan fuera y los visibles dentro, así que el borde blanco rodea la forma y nunca la caja. Sirve igual para un PNG transparente, un SVG cargado como imagen o arte escrito a mano. Además tiene tres estados que decide quien lo usa: suelto, despegado y pegado.",
    "sticker.whenTitle": "Cuándo usarlo",
    "sticker.whenItem1": "Un gráfico tiene que leerse como un objeto físico y adhesivo: una insignia ganada, una marca puesta, una calcomanía.",
    "sticker.whenItem2":
      "El producto tiene un estado para dónde está ese gráfico (sin pegar, despegándose, pegado) y conviene que se vea.",
    "sticker.whenItem3":
      'No lo uses para recortar media a una proporción (eso es <a href="/es/componentes/image-frame">ImageFrame</a>), para mostrar una imagen sin más, ni para llamar la atención con movimiento: eso es un efecto.',
    "sticker.anatomyBody":
      "Tres partes. La raíz no pinta nada: da espacio al borde y sostiene la inclinación. <code>sk-sticker__art</code> es el arte con su borde y su sombra, y aparece dos veces: la segunda, dentro de <code>sk-sticker__flap</code>, es la esquina que se levanta al despegar, oculta para las tecnologías de asistencia. El diagrama está congelado y despegado para que la solapa tenga algo adentro.",
    "sticker.anatomyLabel": "Anatomía de Sticker",
    "sticker.anatomyPreviewLabel": "Sticker, parte por parte",
    "sticker.statesHeading": "Estados",
    "sticker.statesIntro":
      "<code>state</code> se escribe en <code>data-state</code>. <code>idle</code> es un sticker suelto, un poco por encima de la página. <code>peeled</code> tiene una esquina doblada hacia atrás, con el reverso a la vista. <code>applied</code> está aplastado contra la superficie. Cada estado es un valor, no una animación: una página que empieza en <code>applied</code> se pinta pegada, sin moverse.",
    "sticker.statesLabel": "Estados de Sticker",
    "sticker.placementHeading": "Quien lo usa decide",
    "sticker.placementIntro":
      "El sticker no cambia de estado solo, ni al hacer clic. El producto sabe si la insignia se ganó o si el objeto se colocó, y escribe el estado. Cambiarlo reproduce la transición: al despegar, la intención <code>drag</code>; al pegar, <code>release</code>, que baja la esquina, apoya el sticker, lo aprieta un instante y lo deja plano.",
    "sticker.placementLabel": "Despegar y pegar desde fuera",
    "sticker.originsHeading": "Desde qué esquina",
    "sticker.originsIntro":
      "<code>peelOrigin</code> elige la esquina que se levanta, en términos lógicos: <code>block-end-inline-end</code> es abajo a la derecha en una página de izquierda a derecha y abajo a la izquierda en una de derecha a izquierda. Es una decisión real: el pliegue empieza en una esquina de la caja del arte, y una silueta irregular suele dejar alguna vacía.",
    "sticker.originsLabel": "Esquinas de despegue",
    "sticker.hooksHeading": "Styling hooks",
    "sticker.hooksIntro":
      "<code>--sk-sticker-edge-width</code> y <code>--sk-sticker-edge-color</code> ajustan el borde troquelado; <code>--sk-sticker-peel-size</code>, qué fracción de la caja se dobla; <code>--sk-sticker-rotate</code>, la inclinación en reposo, igual en todos los estados.",
    "sticker.hooksLabel": "Styling hooks de Sticker",
    "sticker.reactTitle": "React",
    "sticker.reactBody":
      "<code>state</code> y <code>peelOrigin</code> son props derivadas del contrato. El arte entra por <code>src</code>, que exige un <code>alt</code>, o como hijos, nunca las dos: el tipo no deja pasar ambas.",
    "sticker.vanillaTitle": "HTML",
    "sticker.vanillaBody":
      "No hay enhancer. El markup completo es la raíz, el arte y la solapa con su copia; para cambiar de estado, escribe <code>data-state</code>.",
    "sticker.notesTitle": "Notas",
    "sticker.notesItem1":
      "El borde es un filtro sobre el canal alfa, no un <code>border</code> ni una caja: ningún píxel se lee, así que una imagen de otro origen no necesita CORS.",
    "sticker.notesItem2":
      "Un <code>alt</code> es obligatorio con <code>src</code>, vacío si el sticker es decoración. El arte escrito a mano conserva su propia semántica, y el estado no se anuncia.",
    "sticker.notesItem3":
      "Con <code>prefers-reduced-motion</code> los estados se mantienen y el recorrido entre ellos desaparece: el cambio ocurre de inmediato.",
    "sticker.notesItem4":
      "Los huecos más angostos que el doble del borde se rellenan, igual que con un troquel real.",
  },
  en: {
    "demo.sticker.groupLabel": "Three stickers, one per state",
    "demo.sticker.starAlt": "Golden star",
    "demo.sticker.bubbleAlt": "Purple speech bubble",
    "demo.sticker.statesLabel": "Sticker's three states",
    "demo.sticker.originsLabel": "The four corners it can peel from",
    "demo.sticker.hooksLabel": "Sticker tuned with styling hooks",
    "demo.sticker.hooksDefault": "default",
    "demo.sticker.hooksThick": "wide, coloured edge",
    "demo.sticker.hooksDeep": "deep peel",
    "demo.sticker.peel": "Peel",
    "demo.sticker.apply": "Apply",
    "demo.sticker.reset": "Release",

    "sticker.description":
      "Sticker: artwork turned into a die-cut sticker, with an edge that follows its silhouette and peeled and applied states.",
    "sticker.betaBadge": "Beta",
    "sticker.lede":
      "Sticker turns artwork into a <strong>die-cut sticker</strong>. The artwork's silhouette is the sticker: transparent pixels are outside it and visible ones inside, so the white edge goes around the shape and never around the box. It works the same for a transparent PNG, an SVG loaded as an image, or authored artwork. It also has three states the consumer decides: loose, peeled and applied.",
    "sticker.whenTitle": "When to use it",
    "sticker.whenItem1": "A graphic has to read as a physical, adhesive object: a badge earned, a mark placed, a decal.",
    "sticker.whenItem2":
      "The product has a state for where that graphic is (not applied yet, coming off, stuck down) and it should be seen.",
    "sticker.whenItem3":
      'Do not use it to crop media to a ratio (that is <a href="/components/image-frame">ImageFrame</a>), to just show an image, or to draw attention with motion: that is an effect.',
    "sticker.anatomyBody":
      "Three parts. The root paints nothing: it makes room for the edge and carries the tilt. <code>sk-sticker__art</code> is the artwork with its edge and shadow, and it appears twice: the second copy, inside <code>sk-sticker__flap</code>, is the corner that lifts when it peels, hidden from assistive tech. The diagram is frozen and peeled so the flap has something in it.",
    "sticker.anatomyLabel": "Sticker anatomy",
    "sticker.anatomyPreviewLabel": "Sticker, part by part",
    "sticker.statesHeading": "States",
    "sticker.statesIntro":
      "<code>state</code> is written as <code>data-state</code>. <code>idle</code> is a loose sticker, slightly above the page. <code>peeled</code> has one corner folded back, its underside showing. <code>applied</code> is pressed flat against the surface. Each state is a value, not an animation: a page that starts at <code>applied</code> paints stuck down, without moving.",
    "sticker.statesLabel": "Sticker states",
    "sticker.placementHeading": "The consumer decides",
    "sticker.placementIntro":
      "The sticker never changes state by itself, and not on click. The product knows whether the badge was earned or the item placed, and writes the state. Changing it plays the transition: peeling uses the <code>drag</code> intent; applying uses <code>release</code>, which brings the corner down, lands the sticker, presses it for an instant and leaves it flat.",
    "sticker.placementLabel": "Peel and apply from outside",
    "sticker.originsHeading": "Which corner",
    "sticker.originsIntro":
      "<code>peelOrigin</code> picks the corner that lifts, in logical terms: <code>block-end-inline-end</code> is the bottom right in a left-to-right page and the bottom left in a right-to-left one. It is a real choice: the fold starts at a corner of the artwork's box, and an irregular silhouette often leaves one of them empty.",
    "sticker.originsLabel": "Peel corners",
    "sticker.hooksHeading": "Styling hooks",
    "sticker.hooksIntro":
      "<code>--sk-sticker-edge-width</code> and <code>--sk-sticker-edge-color</code> tune the die-cut edge; <code>--sk-sticker-peel-size</code>, what fraction of the box folds over; <code>--sk-sticker-rotate</code>, the resting tilt, the same in every state.",
    "sticker.hooksLabel": "Sticker styling hooks",
    "sticker.reactTitle": "React",
    "sticker.reactBody":
      "<code>state</code> and <code>peelOrigin</code> are props derived from the contract. The artwork comes in through <code>src</code>, which requires an <code>alt</code>, or as children, never both: the type lets neither combination through.",
    "sticker.vanillaTitle": "HTML",
    "sticker.vanillaBody":
      "There is no enhancer. The complete markup is the root, the artwork and the flap with its copy; to change state, write <code>data-state</code>.",
    "sticker.notesTitle": "Notes",
    "sticker.notesItem1":
      "The edge is a filter over the alpha channel, not a <code>border</code> or a box: no pixel is read, so an image from another origin needs no CORS.",
    "sticker.notesItem2":
      "An <code>alt</code> is required with <code>src</code>, empty when the sticker is decoration. Authored artwork keeps its own semantics, and the state is not announced.",
    "sticker.notesItem3":
      "Under <code>prefers-reduced-motion</code> the states stay and the travel between them goes: the change happens at once.",
    "sticker.notesItem4": "Holes narrower than twice the edge fill in, as they would with a real cutting die.",
  },
} as const;
