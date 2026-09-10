import { hasTranslation, localizePath, navLabel, useTranslations, type Locale } from "../i18n";

/** Maturity of a component's contract. Only meaningful within `componentItems`. */
export type ComponentStatus = "wip" | "stable";

export type NavigationItem = {
  href: string;
  label: string;
  aliases?: readonly string[];
  todo?: boolean;
  /**
   * Maturity of the component this entry documents. Omitted defaults to "wip" (the honest state
   * of every entry in this catalog today) via {@link componentStatus}. Flip an entry to "stable"
   * once its contract has actually settled; never the reverse, an entry does not go back to "wip"
   * once it has shipped as settled.
   */
  status?: ComponentStatus;
  /**
   * Short trailing text next to the label, the same word `nav-list.ts`'s own `trailing` slot uses
   * ("a count, a badge"). Not `status`: that field is a maturity axis nothing downstream renders
   * yet, and wiring it up now would light up every "wip" entry in the catalog at once, not just the
   * one page asking for a callout. This is deliberately per-entry and opt-in instead.
   */
  trailing?: string;
};

/** `item.status`, defaulted: every catalog entry reads "wip" until deliberately marked "stable". */
export function componentStatus(item: NavigationItem): ComponentStatus {
  return item.status ?? "wip";
}

export type NavigationGroup = {
  group: string;
  /** Short task-oriented explanation used by catalog section headers. */
  blurb?: string;
  /** A platform-native fallback: discoverable, but visually and structurally below the enhanced route. */
  secondary?: boolean;
  items: readonly NavigationItem[];
};

export type NavigationSection = {
  /**
   * Stable identity, independent of language. The layout picks sections out of this list to decide
   * which rail a page belongs to; matching on the visible title would have made that lookup fail the
   * moment the title was translated.
   */
  id: NavigationSectionId;
  section: string;
  href?: string;
  blurb: string;
  groups: readonly NavigationGroup[];
};

export type NavigationSectionId = "start" | "foundations" | "components";

/** Component inventory. The catalog groups this single source by task below. */
const componentItems = [
  {
    href: "/components/accordion",
    label: "Accordion",
    aliases: [
      "acordeón",
      "acordeon",
      "tarjeta expandible",
      "tarjeta desplegable",
      "expandable tile",
      "expansible tile",
      "expandabletile",
      "details",
      "summary",
      "details nativo",
      "acordeón nativo",
      "acordeon nativo",
      "disclosure",
    ],
  },
  { href: "/components/avatar", label: "Avatar", trailing: "Beta", aliases: ["perfil"] },
  { href: "/components/badge", label: "Badge", aliases: ["insignia"] },
  {
    href: "/components/back-to-top",
    label: "BackToTop",
    trailing: "Beta",
    aliases: [
      "volver arriba",
      "ir arriba",
      "subir",
      "scroll to top",
      "scroll top",
      "back to top",
      "return to top",
      "botón flotante",
      "boton flotante",
      "fab",
    ],
  },
  { href: "/components/box", label: "Box", aliases: ["caja"] },
  {
    href: "/components/footer",
    label: "Footer",
    trailing: "Beta",
    aliases: ["pie", "pie de pagina", "pie de página", "contentinfo", "colofón", "colofon"],
  },
  { href: "/components/hero", label: "Hero", trailing: "Beta", aliases: ["portada", "landing"] },
  {
    href: "/components/button",
    label: "Button",
    aliases: [
      "botón",
      "boton",
      "tile button",
      "botón de superficie",
      "boton de superficie",
      "tarjeta botón",
      "tarjeta boton",
    ],
  },
  { href: "/components/callout", label: "Callout", trailing: "Beta", aliases: ["alerta", "nota", "aviso"] },
  {
    href: "/components/card",
    label: "Card",
    aliases: [
      "tarjeta",
      "tarjetas",
      "card de contenido",
      "card de noticia",
      "card de producto",
      "card de enlace",
      "stat card",
      "tarjeta de contenido",
      "tarjeta de noticia",
      "tarjeta de producto",
      "tarjeta de enlace",
    ],
  },
  {
    href: "/components/carousel",
    label: "Carousel",
    trailing: "Beta",
    aliases: [
      "carrusel",
      "carousel",
      "slider de contenido",
      "scroll snap",
      "scroll-snap",
      "slides",
      "diapositivas",
      "galería",
      "galeria",
      "secciones desplazables",
      "scrollable sections",
      "scroll-button",
      "scroll-marker",
    ],
  },
  {
    href: "/components/charts",
    label: "Charts",
    trailing: "Beta",
    aliases: [
      "chart",
      "charts",
      "gráfico",
      "grafico",
      "gráficos",
      "graficos",
      "gráfica",
      "grafica",
      "visualización de datos",
      "visualizacion de datos",
      "data viz",
      "barras",
      "bar chart",
      "líneas",
      "lineas",
      "line chart",
      "área",
      "area chart",
      "tanstack charts",
    ],
  },
  {
    href: "/components/checkbox",
    label: "Checkbox",
    aliases: [
      "casilla",
      "casilla de verificación",
      "casilla de verificacion",
      "tile checkbox",
      "checkbox de superficie",
      "tarjeta seleccionable",
      "tarjeta casilla",
    ],
  },
  {
    href: "/components/changelog",
    label: "Changelog",
    trailing: "Beta",
    aliases: [
      "changelog",
      "historial",
      "cambios",
      "release notes",
      "notas de versión",
      "notas de version",
      "novedades",
      "timeline",
      "línea de tiempo",
      "linea de tiempo",
    ],
  },
  {
    href: "/components/code-preview",
    label: "CodePreview",
    aliases: ["shiki", "código", "codigo", "code block", "preview de código", "preview de codigo"],
  },
  {
    href: "/components/command-palette",
    label: "CommandPalette",
    aliases: [
      "cmdk",
      "command palette",
      "paleta de comandos",
      "buscar",
      "search",
      "⌘k",
      "ctrl+k",
    ],
  },
  {
    href: "/components/component-preview",
    label: "ComponentPreview",
    aliases: [
      "preview",
      "demo",
      "showcase",
      "srcdoc",
      "iframe",
      "stage",
      "preview de componente",
      "documentación de componente",
      "documentacion de componente",
    ],
  },
  {
    href: "/components/data-grid",
    label: "Data Grid",
    trailing: "Beta",
    aliases: ["grilla de datos", "layout grid", "grilla de layout", "navegación 2d", "navegacion 2d"],
  },
  {
    href: "/components/dialog",
    label: "Dialog",
    aliases: ["diálogo", "dialogo", "modal", "confirm", "dialog vaul", "dialog enhanced"],
  },
  {
    href: "/components/drawer",
    label: "Drawer",
    trailing: "Beta",
    aliases: ["panel lateral", "cajón", "cajon"],
  },
  {
    href: "/components/fade-edge",
    label: "FadeEdge",
    trailing: "Beta",
    aliases: ["fade out", "fade-out", "mask", "gradient fade", "fade effect", "fade visual"],
  },
  {
    href: "/components/feed",
    label: "Feed",
    aliases: ["stream", "feed de actividad", "publicaciones", "posts"],
  },
  {
    href: "/components/form-field",
    label: "FormField",
    aliases: [
      "form field",
      "field",
      "campo",
      "campo de formulario",
      "rótulo",
      "rotulo",
      "label",
      "hint",
      "ayuda",
      "error",
      "mensaje de error",
      "validación",
      "validacion",
      "required",
      "requerido",
    ],
  },
  {
    href: "/components/grid",
    label: "Grid",
    trailing: "Beta",
    aliases: ["grilla", "cuadrícula", "cuadricula"],
  },
  {
    href: "/components/layout-grid",
    label: "Layout Grid",
    aliases: [
      "layout grid",
      "ancho de contenido",
      "content width",
      "breakout",
      "full-width",
      "full bleed",
      "sangrado",
    ],
  },
  { href: "/components/heading", label: "Heading", aliases: ["encabezado", "título", "titulo"] },
  { href: "/hotkey", label: "Hotkey", aliases: ["atajo", "atajos", "keyboard shortcut"] },
  {
    href: "/components/icon",
    label: "Icon",
    aliases: ["icono", "ícono", "icono componente", "sk-icon", "mountIcons"],
  },
  {
    href: "/components/image-frame",
    label: "ImageFrame",
    aliases: [
      "img",
      "image",
      "images",
      "imagen",
      "imagenes",
      "imágenes",
      "foto",
      "fotos",
      "picture",
      "marco",
      "frame",
      "media",
      "object-fit",
      "object-position",
      "aspect-ratio",
      "ratio",
    ],
  },
  { href: "/components/inline", label: "Inline", aliases: ["en línea", "en linea"] },
  { href: "/components/input", label: "Input", aliases: ["entrada", "campo"] },
  { href: "/components/kbd", label: "Kbd", aliases: ["tecla", "teclado"] },
  {
    href: "/components/link",
    label: "Link",
    aliases: ["enlace", "vínculo", "vinculo", "tile link", "enlace de superficie", "tarjeta enlace"],
  },
  {
    href: "/components/list",
    label: "List",
    aliases: [
      "lista",
      "list",
      "listado",
      "lista de ajustes",
      "settings list",
      "list item",
      "row list",
      "filas",
    ],
  },
  {
    href: "/components/loader",
    label: "Loader",
    aliases: ["carga", "cargando", "spinner", "indicador de carga"],
  },
  {
    href: "/components/meter",
    label: "Meter",
    aliases: ["medidor", "medición", "medicion", "batería", "bateria", "uso de disco"],
  },
  {
    href: "/nav-list",
    label: "Nav list",
    aliases: ["lista de navegación", "lista de navegacion"],
  },
  { href: "/components/navbar", label: "Navbar", aliases: ["barra de navegación", "barra de navegacion"] },
  { href: "/components/pagination", label: "Pagination", aliases: ["paginación", "paginacion"] },
  {
    href: "/components/placeholder",
    label: "Placeholder",
    aliases: ["skeleton", "esqueleto", "contenido provisional", "cargando contenido"],
  },
  {
    href: "/components/process-list",
    label: "ProcessList",
    aliases: [
      "lista de instrucciones",
      "lista ordenada",
      "procedimiento",
      "how-to",
      "pasos estáticos",
      "pasos estaticos",
      "process list",
      "ol",
    ],
  },
  { href: "/components/progress", label: "Progress", aliases: ["progreso"] },
  {
    href: "/components/qr-code",
    label: "QRCode",
    trailing: "Beta",
    aliases: [
      "qr",
      "qr code",
      "código qr",
      "codigo qr",
      "quick response",
      "quick response code",
      "quick read code",
      "código de respuesta rápida",
      "codigo de respuesta rapida",
      "código bidi",
      "codigo bidi",
      "2d barcode",
      "código de barras 2d",
      "codigo de barras 2d",
      "escanear",
      "scan",
      "escaneable",
      "enlace escaneable",
    ],
  },
  {
    href: "/components/radio-group",
    label: "RadioGroup",
    aliases: [
      "grupo de opciones",
      "botones de radio",
      "tile radio group",
      "radio group de superficie",
      "grupo de tarjetas",
      "tarjetas de opción",
      "tarjetas de opcion",
    ],
  },
  {
    href: "/scrollbar",
    label: "Scrollbar",
    aliases: ["scroll", "rail", "thumb", "sk-scrollbar", "reveal scrollbar", "scrollbar custom"],
  },
  { href: "/components/segmented", label: "SegmentedControl", aliases: ["control segmentado"] },
  {
    href: "/components/select",
    label: "Select",
    aliases: [
      "selector",
      "select enhanced",
      "select nativo",
      "native select",
      "select de plataforma",
      "selector nativo",
    ],
  },
  { href: "/components/sidebar", label: "Sidebar", aliases: ["barra lateral"] },
  {
    href: "/components/skip-link",
    label: "SkipLink",
    aliases: [
      "saltar",
      "salto",
      "enlace de salto",
      "skip link",
      "skip to content",
      "skip navigation",
      "bypass blocks",
      "wcag 2.4.1",
      "accesibilidad teclado",
    ],
  },
  { href: "/components/slider", label: "Slider", aliases: ["deslizador"] },
  { href: "/components/stack", label: "Stack", aliases: ["pila"] },
  { href: "/components/stat", label: "Stat", aliases: ["estadística", "estadistica", "métrica", "metrica"] },
  { href: "/components/steps", label: "Steps", aliases: ["pasos"] },
  { href: "/components/switch", label: "Switch", aliases: ["interruptor"] },
  { href: "/components/table", label: "Table", aliases: ["tabla"] },
  {
    href: "/components/treegrid",
    label: "Treegrid",
    trailing: "Beta",
    aliases: ["grilla jerárquica", "grilla jerarquica", "tabla jerárquica", "tabla jerarquica", "explorador de archivos"],
  },
  { href: "/components/tabs", label: "Tabs", aliases: ["pestañas", "pestanas"] },
  { href: "/components/tag", label: "Tag", aliases: ["etiqueta"] },
  { href: "/components/text", label: "Text", aliases: ["texto"] },
  {
    href: "/components/toast",
    label: "Toast",
    aliases: ["notificación", "notificacion", "aviso transitorio"],
  },
  { href: "/components/tooltip", label: "Tooltip", aliases: ["globo", "ayuda contextual", "descripción", "descripcion", "hint"] },
  {
    href: "/components/toc",
    label: "Table of contents",
    aliases: [
      "toc",
      "tabla de contenidos",
      "table of contents",
      "en esta página",
      "en esta pagina",
      "on this page",
      "índice",
      "indice",
      "scroll spy",
      "rail derecho",
    ],
  },
  { href: "/vaul", label: "Vaul", aliases: ["drawer pattern", "sheet"] },
  { href: "/components/wrapper", label: "Wrapper", aliases: ["container", "contenedor", "envoltorio"] },
  {
    href: "/components/breadcrumb",
    label: "Breadcrumb",
    trailing: "Beta",
    aliases: ["migas de pan", "ruta jerárquica", "ruta jerarquica"],
  },
  {
    href: "/components/combobox",
    label: "Combobox",
    trailing: "Beta",
    aliases: ["autocompletar", "autocomplete", "selector editable"],
  },
  {
    href: "/components/comment-thread",
    label: "CommentThread",
    trailing: "Beta",
    aliases: ["hilo de comentarios", "comentarios", "respuestas anidadas", "comment thread"],
  },
  {
    href: "/components/date-picker",
    label: "DatePicker",
    aliases: ["fecha", "selector de fecha", "date range", "campo de fecha"],
  },
  {
    href: "/components/color-picker",
    label: "ColorPicker",
    trailing: "Beta",
    aliases: ["selector de color", "color picker", "swatch", "rgb", "hsl", "oklch", "presets de color"],
  },
  {
    href: "/components/calendar",
    label: "Calendar",
    trailing: "Beta",
    aliases: ["calendario", "grid de fecha", "mes", "vista de año", "década"],
  },
  {
    href: "/components/empty-state",
    label: "EmptyState",
    trailing: "Beta",
    aliases: ["estado vacío", "estado vacio", "sin resultados"],
  },
  {
    href: "/components/editor",
    label: "Editor",
    trailing: "Beta",
    aliases: ["editor de texto enriquecido", "wysiwyg", "rich text", "prosemirror", "editor de contenido"],
  },
  {
    href: "/components/folder",
    label: "Folder",
    aliases: ["carpeta", "folder", "pestaña", "pestana", "tab surface", "pila de carpetas"],
  },
  {
    href: "/components/file-upload",
    label: "FileUpload",
    aliases: ["subir archivo", "carga de archivos", "dropzone"],
  },
  {
    href: "/components/megamenu",
    label: "Megamenu",
    aliases: ["mega menu", "megamenú", "panel de navegación", "navegación borde a borde"],
  },
  {
    href: "/components/marquee",
    label: "Marquee",
    trailing: "Beta",
    aliases: ["marquesina", "ticker", "cinta continua", "scrolling text", "logo wall"],
  },
  {
    href: "/components/menu",
    label: "Menu",
    aliases: ["menú", "menu de acciones", "context menu"],
  },
  {
    href: "/components/menubar",
    label: "Menubar",
    aliases: ["barra de menú", "barra de menu", "menubar-editor"],
  },
  {
    href: "/components/number-field",
    label: "NumberField",
    aliases: ["campo numérico", "campo numerico", "stepper"],
  },
  {
    href: "/components/popover",
    label: "Popover",
    aliases: ["contenido flotante", "ayuda rica", "top layer"],
  },
  {
    href: "/components/popup",
    label: "Popup",
    trailing: "Beta",
    aliases: ["superficie flotante", "popup primitivo"],
  },
  {
    href: "/components/split-button",
    label: "SplitButton",
    aliases: ["botón dividido", "boton dividido", "acción con menú"],
  },
  {
    href: "/components/time-field",
    label: "TimeField",
    aliases: [
      "hora",
      "campo de hora",
      "time input",
      "selector de hora",
      "time picker",
      "campo segmentado",
      "segmented input",
    ],
  },
  {
    href: "/components/toolbar",
    label: "Toolbar",
    trailing: "Beta",
    aliases: ["barra de herramientas", "grupo de controles"],
  },
  {
    href: "/components/tree-view",
    label: "TreeView",
    trailing: "Beta",
    aliases: ["árbol", "arbol", "jerarquía", "jerarquia"],
  },
] as const satisfies readonly NavigationItem[];

type ComponentHref = (typeof componentItems)[number]["href"];

const componentItemByHref = Object.fromEntries(
  componentItems.map((item) => [item.href, item] as const),
) satisfies Record<string, NavigationItem>;

const componentGroupItems = (...hrefs: readonly ComponentHref[]): readonly NavigationItem[] =>
  hrefs
    .map((href) => {
      const item = componentItemByHref[href];
      if (!item) throw new Error(`Unknown component catalog entry: ${href}`);
      return item;
    })
    .sort((a, b) => a.label.localeCompare(b.label, "es"));

export const componentNavigation = [
  {
    group: "group.componentActions",
    blurb: "group.componentActions.blurb",
    items: componentGroupItems(
      "/components/button",
      "/components/calendar",
      "/components/checkbox",
      "/components/color-picker",
      "/components/combobox",
      "/components/date-picker",
      "/components/editor",
      "/components/file-upload",
      "/components/form-field",
      "/components/input",
      "/components/number-field",
      "/components/radio-group",
      "/components/segmented",
      "/components/select",
      "/components/slider",
      "/components/split-button",
      "/components/switch",
      "/components/time-field",
      "/components/toolbar",
    ),
  },
  {
    group: "group.componentNavigation",
    blurb: "group.componentNavigation.blurb",
    items: componentGroupItems(
      "/components/back-to-top",
      "/components/breadcrumb",
      "/components/command-palette",
      "/components/link",
      "/components/megamenu",
      "/components/menu",
      "/components/menubar",
      "/nav-list",
      "/components/navbar",
      "/components/pagination",
      "/components/sidebar",
      "/components/skip-link",
      "/components/tabs",
      "/components/toc",
      "/components/tree-view",
    ),
  },
  {
    group: "group.componentContent",
    blurb: "group.componentContent.blurb",
    items: componentGroupItems(
      "/components/avatar",
      "/components/badge",
      "/components/card",
      "/components/carousel",
      "/components/changelog",
      "/components/charts",
      "/components/code-preview",
      "/components/comment-thread",
      "/components/component-preview",
      "/components/data-grid",
      "/components/feed",
      "/components/heading",
      "/components/icon",
      "/components/image-frame",
      "/components/kbd",
      "/components/list",
      "/components/process-list",
      "/components/qr-code",
      "/components/stat",
      "/components/table",
      "/components/treegrid",
      "/components/tag",
      "/components/text",
    ),
  },
  {
    group: "group.componentFeedback",
    blurb: "group.componentFeedback.blurb",
    items: componentGroupItems(
      "/components/callout",
      "/components/empty-state",
      "/components/loader",
      "/components/meter",
      "/components/placeholder",
      "/components/progress",
      "/components/steps",
      "/components/toast",
      "/components/tooltip",
    ),
  },
  {
    group: "group.componentLayers",
    blurb: "group.componentLayers.blurb",
    items: componentGroupItems(
      "/components/accordion",
      "/components/dialog",
      "/components/drawer",
      "/components/popover",
      "/components/popup",
      "/vaul",
    ),
  },
  /*
   * EXPRESSIVE: pieces with a shape of their own, whose point is the drawing as much as the job.
   * They fit none of the five groups above and putting them in one anyway is how a catalogue starts
   * lying about what it holds. Deliberately not called "misc": a drawer with that name is the one
   * nobody ever reviews.
   */
  {
    group: "group.componentExpressive",
    blurb: "group.componentExpressive.blurb",
    items: componentGroupItems("/components/folder", "/components/marquee"),
  },
  {
    group: "group.componentLayout",
    blurb: "group.componentLayout.blurb",
    items: componentGroupItems(
      "/components/box",
      "/components/fade-edge",
      "/components/footer",
      "/components/grid",
      "/components/hero",
      "/components/layout-grid",
      "/hotkey",
      "/components/inline",
      "/scrollbar",
      "/components/stack",
      "/components/wrapper",
    ),
  },
] satisfies readonly NavigationGroup[];

const categorizedComponentHrefs = componentNavigation.flatMap((group) =>
  group.items.map((item) => item.href),
);
if (
  categorizedComponentHrefs.length !== componentItems.length ||
  new Set(categorizedComponentHrefs).size !== componentItems.length
) {
  throw new Error("Every component catalog entry must belong to exactly one usage group");
}

/*
 * The authored table below carries UI KEYS in `section`, `blurb` and `group`, not Spanish prose:
 * `getNavigation(locale)` resolves them. Item labels stay as authored, because most of them are
 * component names and identical in every language; the ones that are actually Spanish words are
 * overridden per locale in `i18n/ui.ts` (`navLabel`), keyed by href.
 */
export const globalNavigation = [
  { href: "/", label: "nav.home" },
  { href: "/foundations", label: "nav.foundations" },
  { href: "/components", label: "nav.components" },
  { href: "/templates", label: "nav.templates" },
  { href: "/presets", label: "nav.presets" },
] satisfies readonly NavigationItem[];

export const documentationNavigation = [
  {
    id: "start",
    section: "section.start",
    blurb: "section.start.blurb",
    groups: [
      {
        group: "group.firstSteps",
        items: [
          {
            href: "/prerequisites",
            label: "Prerrequisitos",
            aliases: ["conceptos", "fundamentos externos", "css variables", "custom properties", "antes de empezar"],
          },
          {
            href: "/installation",
            label: "Instalación",
            aliases: ["installation", "instalar", "install"],
          },
          {
            href: "/first-component",
            label: "Tu primer componente",
            aliases: ["first component", "primer componente"],
          },
          {
            href: "/automatic-mounting",
            label: "Montaje automático",
            aliases: ["auto mount", "initComponents", "auto-mounting", "automatic mounting", "vanilla mount"],
          },
        ],
      },
    ],
  },
  {
    id: "foundations",
    section: "section.foundations",
    href: "/foundations",
    blurb: "section.foundations.blurb",
    groups: [
      {
        group: "group.foundationModel",
        blurb: "group.foundationModel.blurb",
        items: [
          {
            href: "/architecture",
            label: "Arquitectura",
            aliases: ["contrato", "binding", "capas", "cómo se construye un componente", "machine"],
          },
          { href: "/tiers", label: "Tiers" },
          { href: "/reference", label: "Tokens" },
        ],
      },
      {
        group: "group.visualDimensions",
        blurb: "group.visualDimensions.blurb",
        items: [
          { href: "/dimensions", label: "Dimensiones" },
          {
            href: "/density",
            label: "Densidad de componente",
            aliases: ["density", "densidad local", "scope de densidad", "custom density", "compactar componente"],
          },
          {
            href: "/elevation",
            label: "Elevación",
            aliases: [
              "elevation",
              "sombra",
              "sombras",
              "shadow",
              "shadows",
              "box-shadow",
              "depth",
              "profundidad",
              "material elevation",
              "z-depth",
            ],
          },
          {
            href: "/icons",
            label: "Iconografía",
            aliases: ["iconos", "icon set", "roles de icono", "vocabulario de iconos", "adr-15"],
          },
        ],
      },
      {
        group: "group.publicSurfaces",
        blurb: "group.publicSurfaces.blurb",
        items: [
          { href: "/styling-hooks", label: "Styling hooks" },
          { href: "/state-layer", label: "State layer" },
          { href: "/motion", label: "Motion" },
          {
            href: "/effects",
            label: "Efectos",
            trailing: "Demo",
            aliases: [
              "effects",
              "scroll reveal",
              "reveal on scroll",
              "animation-timeline",
              "collapse header",
              "header colapsable",
              "pulse",
              "pulso",
              "adr-20",
            ],
          },
        ],
      },
      {
        group: "group.platformAccessibility",
        blurb: "group.platformAccessibility.blurb",
        items: [
          {
            href: "/zoom",
            label: "Zoom y reflow",
            aliases: [
              "zoom 200%",
              "zoom 400%",
              "reflow",
              "resize text",
              "wcag 1.4.4",
              "wcag 1.4.10",
            ],
          },
          {
            href: "/keyboard",
            label: "Navegación por teclado",
            aliases: [
              "keyboard",
              "keyboard navigation",
              "teclado",
              "arrow keys",
              "flechas",
              "tab",
              "escape",
              "focus trap",
              "roving tabindex",
              "wcag 2.1.1",
              "aria-activedescendant",
            ],
          },
          {
            href: "/storage",
            label: "Almacenamiento",
            aliases: [
              "storage",
              "localstorage",
              "local storage",
              "preferencias",
              "preferences",
              "persistencia",
              "persistence",
              "usestoredpreference",
              "definepreference",
            ],
          },
        ],
      },
      {
        group: "group.sharedPatterns",
        blurb: "group.sharedPatterns.blurb",
        items: [
          {
            href: "/anchoring",
            label: "Anclaje",
            aliases: [
              "anchored",
              "anchor",
              "anchor positioning",
              "posicionamiento",
              "colocación",
              "colocacion",
              "placement",
              "floating",
              "popper",
              "flecha",
              "arrow",
              "positioner",
            ],
          },
          {
            href: "/splitter",
            label: "Splitter",
            aliases: [
              "window splitter",
              "separador",
              "resize handle",
              "redimensionar",
              "resizable columns",
              "columnas redimensionables",
              "sk-splitter",
            ],
          },
          {
            href: "/scroll-lock",
            label: "Scroll lock",
            aliases: ["scrollbar gutter", "cls", "overflow hidden", "congelar scroll", "reserva scrollbar"],
          },
          {
            href: "/gradients",
            label: "Media gradient",
            aliases: [
              "gradient",
              "gradients",
              "media gradient",
              "media-gradient",
              "contraste sobre imagen",
              "text on image",
              "wash",
              "velo",
            ],
          },
          {
            href: "/transparency",
            label: "Transparencia",
            aliases: [
              "transparency",
              "reduced transparency",
              "prefers-reduced-transparency",
              "blur",
              "glassmorphism",
              "fondos translúcidos",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "components",
    section: "section.components",
    href: "/components",
    blurb: "section.components.blurb",
    groups: componentNavigation,
  },
] satisfies readonly NavigationSection[];

/**
 * The navigation as a given locale renders it: titles and blurbs translated, item labels overridden
 * where they are Spanish prose, and every `href` rewritten into that locale's route vocabulary.
 *
 * The whole table is derived per request rather than duplicated per language, so adding a page is
 * still one entry, and adding a language cannot leave the two rails out of sync.
 */
/*
 * The site is translated a page at a time, so most entries in a non-default locale's rail have no
 * page behind them yet. Those link to the DEFAULT locale's version instead of to a 404: a reader on
 * an English page can still reach every document, and the ones already translated take them to the
 * English copy. `hasTranslation` reads the page directory at build, so an entry starts pointing at
 * its own language the moment the file lands, with no list to update here.
 */
const resolveHref = (href: string, locale: Locale): string =>
  hasTranslation(href, locale) ? localizePath(href, locale) : href;

export function getNavigation(locale: Locale): readonly NavigationSection[] {
  const t = useTranslations(locale);
  const labels = navLabel[locale] ?? {};
  const item = (entry: NavigationItem): NavigationItem => ({
    ...entry,
    href: resolveHref(entry.href, locale),
    label: labels[entry.href] ?? entry.label,
  });

  return documentationNavigation.map((section) => ({
    ...section,
    section: t(section.section as Parameters<typeof t>[0]),
    blurb: t(section.blurb as Parameters<typeof t>[0]),
    href: section.href ? resolveHref(section.href, locale) : undefined,
    groups: section.groups.map((group: NavigationGroup) => ({
      ...group,
      group: group.group ? t(group.group as Parameters<typeof t>[0]) : "",
      blurb: group.blurb ? t(group.blurb as Parameters<typeof t>[0]) : undefined,
      items: group.items.map(item),
    })),
  }));
}

/** The header's two global links, same treatment. */
export function getGlobalNavigation(locale: Locale): readonly NavigationItem[] {
  const t = useTranslations(locale);
  return globalNavigation.map((entry) => ({
    ...entry,
    href: resolveHref(entry.href, locale),
    label: t(entry.label as Parameters<typeof t>[0]),
  }));
}
