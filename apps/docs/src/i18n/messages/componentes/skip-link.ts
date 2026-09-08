export const skipLinkMessages = {
  es: {

    "skipLink.description":
      "SkipLink: el primer enlace del documento, invisible hasta que recibe el foco, para saltear el chrome que se repite.",
    "skipLink.lede":
      'SkipLink es el <strong>primer enlace del documento</strong> y el único componente cuyo éxito se ve como ausencia: quien navega con mouse no se entera nunca de que está. Toda página abre con el mismo chrome -la marca, la navegación global, el buscador-, y quien lee con teclado lo recorre entero antes de llegar a lo que vino a buscar, en cada página. Eso es lo que la <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.4.1 llama un bloque que hay que poder saltear. Este enlace es el salto, y es el de la plataforma: un <code>href</code> a un id de la misma página, así que funciona antes de que corra un solo script.',
    "skipLink.demoContentLabel": "Ir al contenido",
    "skipLink.demoNavLabel": "Ir a la navegación",
    "skipLink.tryItBody":
      'Este sitio usa dos: apretá <kbd class="sk-kbd">Tab</kbd> con el foco al principio de esta página y va a aparecer arriba a la izquierda “Ir al contenido”; otro Tab más y aparece “Ir a la navegación”. En la vista de abajo pasa lo mismo, pero adentro del marco: el enlace está ahí desde el primer render, sólo que mide un píxel hasta que lo enfocás.',
    "skipLink.severalTitle": "Puede haber más de uno, y el orden es la decisión",
    "skipLink.severalBody1":
      'Una página con un índice permanente razonablemente ofrece dos: uno al contenido y otro a la navegación. No son un grupo ni una lista: son dos enlaces sueltos que resultan ser las dos primeras cosas del documento, y por eso la signature toma <em>un</em> destino en vez de una colección. Con una colección, el caso común -exactamente uno- tendría que escribirse como arreglo, y el orden quedaría adentro de una opción, donde nadie lo mira.',
    "skipLink.severalBody2":
      'El primero es el que recibe todo el mundo, así que tiene que contestar la pregunta con la que llegó la mayoría, y esa pregunta casi siempre es “dejame leer esta página”, no “llevame a otra”. Por eso el contenido va primero. Quien sí quería el índice está a un Tab más; al revés, quien quería la página pagaría varios.',
    "skipLink.severalLabel": "Los dos, en orden",
    "skipLink.severalBody3":
      'Sólo se ve el que tiene el foco: los dos ocupan la misma esquina del marco y se turnan, así que en la vista de arriba hay que apretar <kbd class="sk-kbd">Tab</kbd> dos veces para verlos a los dos. El Stack que los envuelve es de la demo, no del patrón: un árbol de uso tiene una sola raíz y estos son hermanos. En un documento real van sueltos arriba del <code>&lt;body&gt;</code>, como muestra el HTML.',
    "skipLink.targetTitle": "El destino tiene que poder recibir el foco",
    "skipLink.targetBody1":
      'Es la mitad que nadie recuerda y la que decide si el enlace sirve. Seguir un enlace interno hace scroll en todos los navegadores, pero mueve el <em>foco</em> sólo en algunos. Donde no lo mueve, el Tab siguiente sigue desde el enlace y devuelve a quien lee al chrome que acababa de pedir saltear: un enlace de salto que en silencio no hace nada es peor que no tener ninguno, porque ya le dijimos que funcionaba.',
    "skipLink.targetBody2":
      '<code>tabindex="-1"</code> en el destino cierra ese hueco. Lo saca del <em>orden</em> de tabulación -no agrega una parada nueva- y lo vuelve un blanco válido para el foco. En React viene como valor, <code>skipLinkTarget</code>, y no como una frase en la documentación: una regla escrita en prosa es una regla que alguien copia mal una vez.',
    "skipLink.hiddenTitle": "Escondido quiere decir recortado, nunca borrado",
    "skipLink.hiddenBody1":
      'Ni <code>display: none</code> ni <code>visibility: hidden</code>: los dos sacan al elemento del árbol de accesibilidad, y lo que está fuera de ese árbol tampoco lo alcanza el Tab, que es lo único que este componente tiene que ser. En reposo es una caja de un píxel recortada con <code>clip-path</code>, exactamente como el patrón <a href="/styling-hooks">visually-hidden</a>.',
    "skipLink.hiddenBody2":
      'Lo que sí lo separa de ese patrón es una declaración con consecuencia: <code>visually-hidden</code> vuelve a <code>position: static</code> al recibir el foco, así que el enlace entra al layout y todo lo de abajo se mueve, justo cuando quien lee está tratando de entender dónde cayó. Acá la posición es <code>fixed</code> en los dos estados -escondido y visible son la misma caja fuera de flujo-, así que enfocarlo cambia lo que se pinta y nada más. La página no se mueve nunca.',
    "skipLink.firstTitle": "Va primero, o no es un salto",
    "skipLink.firstBody":
      'Cualquier cosa enfocable antes del enlace es, por definición, un bloque que nadie puede saltear. Por eso el lugar es el principio del <code>&lt;body&gt;</code> y no “arriba de todo visualmente”: las dos cosas coinciden acá porque es <code>fixed</code>, pero la que importa es el orden del documento.',
    "skipLink.contractBody":
      'Una sola signature y una sola opción, <code>href</code>, requerida: un enlace de salto sin destino no es nada. El contrato no declara reglas <code>a11y</code> y esa ausencia es deliberada -las que tiene (que el destino sea enfocable, que no haya nada enfocable antes, y que el contenido se ofrezca antes que la navegación cuando hay dos) hablan de elementos y de hermanos que el árbol de uso no contiene, y una regla que ninguna máquina puede decidir no debería figurar como si alguien la chequeara.',
    "skipLink.a11yIntro": "Lo que este componente resuelve y lo que sigue siendo tuyo:",
    "skipLink.a11yItem1":
      "<strong>WCAG 2.4.1 (Bypass Blocks), nivel A.</strong> Es el criterio que pide una forma de saltear el contenido que se repite en todas las páginas.",
    "skipLink.a11yItem2":
      'Poné <code>tabindex="-1"</code> en el destino. Sin eso, en varios navegadores el enlace hace scroll y deja el foco donde estaba.',
    "skipLink.a11yItem3":
      "Que sea lo primero enfocable del documento. Si hay algo antes, ese algo es el bloque que no se puede saltear.",
    "skipLink.a11yItem4":
      'Nombralo por el <em>destino</em>, no por la acción: “Ir al contenido” dice adónde lleva, “Saltar” no. Es lo primero que escucha quien entra a la página.',
    "skipLink.a11yItem5":
      "Si hay dos, el contenido va primero. El primero es el único que muchos van a usar, y tiene que ser el que la mayoría necesita.",
    "skipLink.test1":
      "Es un <code>&lt;a&gt;</code> con href, no un botón con onClick: el salto, el foco y el botón Atrás son de la plataforma.",
    "skipLink.test2":
      "En reposo sigue en el árbol de accesibilidad: si estuviera con display none, este test no lo encontraría, y el Tab tampoco.",
    "skipLink.test3":
      "El destino recibe su requisito como valor (<code>skipLinkTarget</code>), y el href apunta al id que lo lleva.",
  },
  en: {

    "skipLink.description":
      "SkipLink: the first link in the document, invisible until it is focused, for bypassing the chrome that repeats.",
    "skipLink.lede":
      'SkipLink is the <strong>first link in the document</strong> and the one component whose success looks like absence: someone reading with a pointer never learns it is there. Every page opens with the same chrome: the brand, the global navigation, the search trigger: and someone reading with a keyboard walks through all of it before reaching what they came for, on every page. That is what <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.4.1 calls a block to bypass. This link is the bypass, and it is the platform\'s own: an <code>href</code> to an id on the same page, so it works before a single script has run.',
    "skipLink.demoContentLabel": "Go to content",
    "skipLink.demoNavLabel": "Go to navigation",
    "skipLink.tryItBody":
      'This site uses two: press <kbd class="sk-kbd">Tab</kbd> with focus at the top of this page and “Go to content” appears in the upper-left corner; one more Tab and “Go to navigation” takes its place. The same happens in the preview below, inside its frame: the link has been there since the first render, it is just one pixel wide until you focus it.',
    "skipLink.severalTitle": "There may be more than one, and the order is the decision",
    "skipLink.severalBody1":
      "A page with a persistent index reasonably offers two: one to the content and one to the navigation. They are not a group and not a list: they are two loose links that happen to be the first two things in the document, which is why the signature takes <em>one</em> destination rather than a collection. With a collection, the common case. Exactly one. Would have to be written as an array, and the order would live inside an option where nobody looks.",
    "skipLink.severalBody2":
      "The first one is what everybody gets, so it has to answer the question most readers arrived with, and that question is almost always “let me read this page”, not “take me somewhere else”. That is why content comes first. A reader who did want the index is one more Tab away; the other way round, a reader who wanted the page would pay several.",
    "skipLink.severalLabel": "Both, in order",
    "skipLink.severalBody3":
      'Only the focused one is visible: they share the frame\'s corner and take turns, so the preview above needs two presses of <kbd class="sk-kbd">Tab</kbd> to show both. The Stack around them is the demo\'s, not the pattern\'s: a usage tree has one root and these are siblings. In a real document they sit loose at the top of the <code>&lt;body&gt;</code>, as the HTML shows.',
    "skipLink.targetTitle": "The destination has to be focusable",
    "skipLink.targetBody1":
      "It is the half nobody remembers and the half that decides whether the link works at all. Following an in-page link scrolls in every browser, but it moves <em>focus</em> in only some of them. Where it does not, the next Tab resumes from the link and returns the reader to the chrome they just asked to skip: a skip link that silently does nothing is worse than none, because the reader was told it worked.",
    "skipLink.targetBody2":
      '<code>tabindex="-1"</code> on the destination closes that gap. It takes the element out of the tab <em>order</em>: it adds no new stop: while making it a valid focus target. In React it arrives as a value, <code>skipLinkTarget</code>, rather than as a sentence in the docs: a rule written in prose is a rule someone copies wrong once.',
    "skipLink.hiddenTitle": "Hidden means clipped, never removed",
    "skipLink.hiddenBody1":
      'Not <code>display: none</code> and not <code>visibility: hidden</code>: both remove the element from the accessibility tree, and what is outside that tree cannot be reached by Tab either, which is the one thing this component has to be. At rest it is a one-pixel box clipped with <code>clip-path</code>, exactly like the <a href="/en/styling-hooks">visually-hidden</a> pattern.',
    "skipLink.hiddenBody2":
      "What separates it from that pattern is one declaration with a real consequence: <code>visually-hidden</code> returns to <code>position: static</code> when focused, so the element enters the layout and everything below it moves, at the exact moment the reader is trying to work out where they landed. Here the position is <code>fixed</code> in both states: hidden and revealed are the same out-of-flow box: so focusing it changes what is painted and nothing else. The page never moves.",
    "skipLink.firstTitle": "It goes first, or it is not a bypass",
    "skipLink.firstBody":
      "Anything focusable before the link is, by definition, a block nobody can bypass. That is why its place is the start of the <code>&lt;body&gt;</code> rather than “visually at the top”: the two coincide here because it is <code>fixed</code>, but the one that matters is document order.",
    "skipLink.contractBody":
      "One signature and one option, <code>href</code>, required: a skip link with no destination is nothing. The contract declares no <code>a11y</code> rules, and that absence is deliberate: its rules (the destination is focusable, nothing focusable comes before it, and content is offered before navigation when there are two) are about elements and siblings the usage tree does not contain, and a rule no machine can settle should not appear as though something checks it.",
    "skipLink.a11yIntro": "What this component settles, and what stays yours:",
    "skipLink.a11yItem1":
      "<strong>WCAG 2.4.1 (Bypass Blocks), level A.</strong> The criterion that asks for a way past content repeated across pages.",
    "skipLink.a11yItem2":
      'Put <code>tabindex="-1"</code> on the destination. Without it, several browsers scroll and leave focus where it was.',
    "skipLink.a11yItem3":
      "Make it the first focusable thing in the document. If something comes before it, that something is the block nobody can bypass.",
    "skipLink.a11yItem4":
      'Name it after the <em>destination</em>, not the action: “Go to content” says where it leads, “Skip” does not. It is the first thing a reader hears on the page.',
    "skipLink.a11yItem5":
      "If there are two, content goes first. The first one is the only one many readers will ever use, so it has to be the one most of them need.",
    "skipLink.test1":
      "It is an <code>&lt;a&gt;</code> with an href, not a button with onClick: the jump, the focus move and the Back button are the platform's.",
    "skipLink.test2":
      "At rest it is still in the accessibility tree: with display none this test would not find it, and neither would Tab.",
    "skipLink.test3":
      "The destination receives its own requirement as a value (<code>skipLinkTarget</code>), and the href points at the id that carries it.",
  },
} as const;
