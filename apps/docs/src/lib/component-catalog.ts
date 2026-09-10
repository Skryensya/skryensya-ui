import { canonicalPath, type Locale } from "../i18n";

type ComponentDescription = Readonly<Record<Locale, string>>;

/*
 * Short, task-first summaries for the component explorer. They are keyed by canonical Spanish href
 * because that identity survives translated route segments; both locale pages therefore read the
 * same inventory instead of maintaining parallel catalogs.
 */
const componentDescriptions = {
  "/components/accordion": {
    es: "Agrupa secciones extensas que se abren una a la vez.",
    en: "Groups long sections that open one at a time.",
  },
  "/components/avatar": {
    es: "Representa la identidad de una persona con foto o iniciales.",
    en: "Represents a person's identity with a photo or initials.",
  },
  "/components/badge": {
    es: "Señala estados, conteos o etiquetas breves junto a otro elemento.",
    en: "Marks short statuses, counts, or labels next to another element.",
  },
  "/components/back-to-top": {
    es: "Devuelve al inicio de una página larga con un control flotante.",
    en: "Returns to the top of a long page with a floating control.",
  },
  "/components/box": {
    es: "Añade superficie, borde y espacio interior alrededor de un grupo.",
    en: "Adds surface, border, and inner spacing around a group.",
  },
  "/components/breadcrumb": {
    es: "Muestra la ruta jerárquica y permite volver a niveles superiores.",
    en: "Shows the hierarchical path and links back to higher levels.",
  },
  "/components/button": {
    es: "Ejecuta acciones o lleva a un destino con énfasis visual.",
    en: "Runs actions or emphasizes navigation to a destination.",
  },
  "/components/calendar": {
    es: "Permite explorar y elegir fechas en una cuadrícula siempre visible.",
    en: "Explores and selects dates in an always-visible grid.",
  },
  "/components/callout": {
    es: "Destaca un mensaje inline -error, confirmación, advertencia o nota- que permanece visible.",
    en: "Highlights an inline message. Error, confirmation, warning, or note. That stays visible.",
  },
  "/components/card": {
    es: "Compone contenido relacionado en una superficie flexible y reutilizable.",
    en: "Composes related content into a flexible, reusable surface.",
  },
  "/components/carousel": {
    es: "Recorre colecciones visuales horizontales mediante pasos definidos.",
    en: "Browses visual collections horizontally in discrete steps.",
  },
  "/components/charts": {
    es: "Visualiza una serie de valores con nombre. Las barras están en Core; línea y área son opcionales.",
    en: "Visualizes a series of labelled values. Bars live in Core; line and area are optional.",
  },
  "/components/checkbox": {
    es: "Permite marcar una o varias opciones independientes en un formulario.",
    en: "Lets people select one or more independent form choices.",
  },
  "/components/code-preview": {
    es: "Presenta bloques de código legibles, resaltados y copiables.",
    en: "Displays readable, highlighted, and copyable code blocks.",
  },
  "/components/color-picker": {
    es: "Elige un color con área, rieles, canales editables y presets, o el picker nativo.",
    en: "Picks a color with an area, rails, editable channels and presets, or the native picker.",
  },
  "/components/combobox": {
    es: "Busca y selecciona una opción mediante una entrada editable.",
    en: "Searches and selects an option through editable input.",
  },
  "/components/comment-thread": {
    es: "Hilo de comentarios anidados: respuestas, voto y borrado, data-driven y sin backend.",
    en: "Threaded, nested comments: replies, voting and delete, data-driven with no backend.",
  },
  "/components/command-palette": {
    es: "Encuentra destinos y ejecuta comandos desde el teclado.",
    en: "Finds destinations and runs commands from the keyboard.",
  },
  "/components/component-preview": {
    es: "Aísla demos interactivas para documentar componentes y estados.",
    en: "Isolates interactive demos to document components and states.",
  },
  "/components/data-grid": {
    es: "Navegación 2D por celdas: datos tabulares o widgets agrupados.",
    en: "2D cell navigation: tabular data or grouped widgets.",
  },
  "/components/date-picker": {
    es: "Captura una fecha con un campo y un calendario emergente.",
    en: "Captures a date with a field and a popup calendar.",
  },
  "/components/dialog": {
    es: "Interrumpe la tarea actual para pedir atención o una decisión.",
    en: "Interrupts the current task to request attention or a decision.",
  },
  "/components/drawer": {
    es: "Abre un panel lateral para navegación o tareas complementarias.",
    en: "Opens a side panel for navigation or supporting tasks.",
  },
  "/components/empty-state": {
    es: "Explica por qué no hay contenido y orienta el siguiente paso.",
    en: "Explains why content is absent and points to the next step.",
  },
  "/components/editor": {
    es: "Texto enriquecido con una barra de formato, construido sobre ProseMirror.",
    en: "Rich text with a formatting bar, built on ProseMirror.",
  },
  "/components/folder": {
    es: "Una superficie con pestaña, dibujada como una silueta sola; puede aparecer sólo al interactuar.",
    en: "A surface with a tab, drawn as one silhouette; it can appear only on interaction.",
  },
  "/components/fade-edge": {
    es: "Desvanece el contenido suavemente en un borde para ocultar overflow sin cortes duros.",
    en: "Smoothly fades content at an edge to hide overflow without hard clipping.",
  },
  "/components/feed": {
    es: "Stream de publicaciones independientes, cada una con su posición anunciada.",
    en: "A stream of independent posts, each announced with its own position.",
  },
  "/components/file-upload": {
    es: "Selecciona o arrastra archivos y muestra su progreso.",
    en: "Selects or drops files and reports their progress.",
  },
  "/components/footer": {
    es: "Cierra la página con una banda propia: navegación secundaria, aviso legal o crédito.",
    en: "Closes the page with a band of its own: secondary navigation, a legal line, or a credit.",
  },
  "/components/form-field": {
    es: "Rotula un control y le adjunta ayuda y mensaje de validación.",
    en: "Labels a control and attaches its guidance and validation message.",
  },
  "/components/grid": {
    es: "Distribuye contenido en columnas y filas responsivas.",
    en: "Arranges content in responsive rows and columns.",
  },
  "/components/heading": {
    es: "Define títulos y niveles que estructuran el documento.",
    en: "Defines titles and levels that structure a document.",
  },
  "/components/hero": {
    es: "Abre una página con superficie propia y espacio generoso.",
    en: "Opens a page with a surface of its own and generous room.",
  },
  "/components/icon": {
    es: "Representa acciones y conceptos con iconografía consistente.",
    en: "Represents actions and concepts with consistent iconography.",
  },
  "/components/image-frame": {
    es: "Recorta y posiciona imágenes con una proporción controlada.",
    en: "Crops and positions images at a controlled aspect ratio.",
  },
  "/components/inline": {
    es: "Alinea elementos relacionados en una fila que puede envolver.",
    en: "Aligns related elements in a wrapping row.",
  },
  "/components/input": {
    es: "Captura una línea de texto con el control nativo del navegador.",
    en: "Captures a line of text with the browser's native control.",
  },
  "/components/kbd": {
    es: "Representa teclas y combinaciones de teclado dentro del contenido.",
    en: "Represents keys and keyboard combinations inside content.",
  },
  "/components/layout-grid": {
    es: "Organiza una página con anchos de lectura, breakout y borde a borde.",
    en: "Organizes a page with reading, breakout, and edge-to-edge widths.",
  },
  "/components/link": {
    es: "Navega a otro destino desde texto en línea.",
    en: "Navigates to another destination from inline text.",
  },
  "/components/list": {
    es: "Organiza elementos relacionados en filas claras y escaneables.",
    en: "Organizes related items into clear, scannable rows.",
  },
  "/components/loader": {
    es: "Indica que una operación breve sigue en curso.",
    en: "Indicates that a short operation is still running.",
  },
  "/components/megamenu": {
    es: "Despliega un panel borde a borde con varias columnas de enlaces de navegación.",
    en: "Opens an edge-to-edge panel with several columns of navigation links.",
  },
  "/components/marquee": {
    es: "Repite una franja inerte con movimiento pedido o autoplay siempre pausable.",
    en: "Repeats an inert strip with requested motion or always-pausable autoplay.",
  },
  "/components/menu": {
    es: "Presenta una lista compacta de acciones contextuales.",
    en: "Presents a compact list of contextual actions.",
  },
  "/components/menubar": {
    es: "Barra horizontal persistente de comandos, algunos con desplegable.",
    en: "A persistent horizontal bar of commands, some opening a dropdown.",
  },
  "/components/meter": {
    es: "Muestra una medición dentro de un rango conocido, no el avance de una tarea.",
    en: "Shows a measurement within a known range, not a task's progress.",
  },
  "/components/navbar": {
    es: "Reúne marca, navegación y acciones globales en la cabecera.",
    en: "Collects brand, global navigation, and actions in the header.",
  },
  "/components/number-field": {
    es: "Captura cantidades con límites y controles incrementales.",
    en: "Captures quantities with limits and step controls.",
  },
  "/components/pagination": {
    es: "Divide colecciones extensas en páginas navegables.",
    en: "Splits long collections into navigable pages.",
  },
  "/components/placeholder": {
    es: "Reserva la estructura mientras el contenido termina de cargar.",
    en: "Preserves layout while content finishes loading.",
  },
  "/components/popover": {
    es: "Muestra contenido contextual rico sin bloquear la página.",
    en: "Shows rich contextual content without blocking the page.",
  },
  "/components/popup": {
    es: "Proporciona la superficie flotante base para contenido anclado.",
    en: "Provides the base floating surface for anchored content.",
  },
  "/components/changelog": {
    es: "Cuenta qué cambió y cuándo, en un riel fechado.",
    en: "Tells what changed and when, on a dated rail.",
  },
  "/components/process-list": {
    es: "Explica procedimientos ordenados con pasos y detalles.",
    en: "Explains ordered procedures with steps and supporting details.",
  },
  "/components/progress": {
    es: "Muestra cuánto avanzó una tarea con duración conocida.",
    en: "Shows how much of a task with known duration is complete.",
  },
  "/components/qr-code": {
    es: "Convierte un texto corto en un símbolo escaneable, dibujado como un solo path SVG.",
    en: "Turns a short string into a scannable symbol, drawn as a single SVG path.",
  },
  "/components/radio-group": {
    es: "Permite elegir una sola opción dentro de un conjunto.",
    en: "Lets people choose exactly one option from a set.",
  },
  "/components/segmented": {
    es: "Cambia entre pocas vistas u opciones equivalentes.",
    en: "Switches between a few equivalent views or options.",
  },
  "/components/select": {
    es: "Elige un valor de una lista compacta de opciones.",
    en: "Chooses one value from a compact list of options.",
  },
  "/components/sidebar": {
    es: "Aloja navegación o herramientas persistentes junto al contenido.",
    en: "Holds persistent navigation or tools beside the content.",
  },
  "/components/skip-link": {
    es: "Saltea el chrome repetido: el primer enlace, invisible hasta que recibe el foco.",
    en: "Bypasses the repeated chrome: the first link, invisible until it is focused.",
  },
  "/components/slider": {
    es: "Ajusta un valor continuo dentro de un rango.",
    en: "Adjusts a continuous value within a range.",
  },
  "/components/split-button": {
    es: "Combina una acción principal con alternativas relacionadas.",
    en: "Pairs one accent action with related alternatives.",
  },
  "/components/stack": {
    es: "Separa elementos verticalmente con un ritmo consistente.",
    en: "Spaces elements vertically with a consistent rhythm.",
  },
  "/components/stat": {
    es: "Destaca una métrica con su etiqueta y contexto.",
    en: "Highlights a metric with its label and context.",
  },
  "/components/steps": {
    es: "Orienta al usuario dentro de un proceso de varias etapas.",
    en: "Orients people within a multi-stage process.",
  },
  "/components/switch": {
    es: "Activa o desactiva una preferencia con efecto inmediato.",
    en: "Turns a preference on or off with immediate effect.",
  },
  "/components/table": {
    es: "Compara datos estructurados en filas y columnas.",
    en: "Compares structured data across rows and columns.",
  },
  "/components/treegrid": {
    es: "Combina jerarquía y columnas: filas expandibles con varios valores cada una.",
    en: "Combines hierarchy and columns: expandable rows, each with several values.",
  },
  "/components/tabs": {
    es: "Alterna vistas relacionadas dentro del mismo espacio.",
    en: "Switches related views within the same space.",
  },
  "/components/tag": {
    es: "Etiqueta contenido y puede admitir selección o eliminación.",
    en: "Labels content and may support selection or removal.",
  },
  "/components/text": {
    es: "Aplica jerarquía, tono y medida consistente a la prosa.",
    en: "Applies consistent hierarchy, tone, and measure to prose.",
  },
  "/components/time-field": {
    es: "Captura horas por segmentos según el formato local.",
    en: "Captures time in locale-aware editable segments.",
  },
  "/components/toast": {
    es: "Confirma resultados breves sin interrumpir la tarea.",
    en: "Confirms brief outcomes without interrupting the task.",
  },
  "/components/toc": {
    es: "Navega un documento largo y señala la sección actual.",
    en: "Navigates a long document and marks the current section.",
  },
  "/components/toolbar": {
    es: "Agrupa muchos controles y optimiza su navegación por teclado.",
    en: "Groups many controls and optimizes keyboard navigation.",
  },
  "/components/tooltip": {
    es: "Añade una explicación corta al hover o foco de un control.",
    en: "Adds a short explanation on hover or keyboard focus.",
  },
  "/components/tree-view": {
    es: "Explora jerarquías anidadas mediante ramas expandibles.",
    en: "Explores nested hierarchies through expandable branches.",
  },
  "/components/wrapper": {
    es: "Centra el contenido y limita su ancho de lectura.",
    en: "Centers content and caps its readable width.",
  },
  "/hotkey": {
    es: "Declara atajos de teclado sin duplicar la lógica de eventos.",
    en: "Declares keyboard shortcuts without duplicating event logic.",
  },
  "/nav-list": {
    es: "Agrupa enlaces de navegación planos o por secciones.",
    en: "Groups flat or sectioned navigation links.",
  },
  "/scrollbar": {
    es: "Hace visible y controlable el desplazamiento en regiones largas.",
    en: "Makes scrolling visible and controllable in long regions.",
  },
  "/vaul": {
    es: "Presenta una hoja arrastrable anclada a un borde.",
    en: "Presents a draggable sheet anchored to an edge.",
  },
} as const satisfies Readonly<Record<string, ComponentDescription>>;

type ComponentDescriptionHref = keyof typeof componentDescriptions;

/** Resolve a localized route back to its canonical catalog summary. Missing copy is a build error. */
export function getComponentDescription(href: string, locale: Locale): string {
  const canonical = canonicalPath(href) as ComponentDescriptionHref;
  const description = componentDescriptions[canonical];

  if (!description) {
    throw new Error(`Missing component catalog description for ${canonical}`);
  }

  return description[locale];
}
