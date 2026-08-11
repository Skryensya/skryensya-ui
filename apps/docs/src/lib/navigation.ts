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

export type NavigationSectionId = "start" | "system" | "components";

/** Component inventory. The catalog groups this single source by task below. */
const componentItems = [
  {
    href: "/componentes/accordion",
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
  { href: "/componentes/avatar", label: "Avatar", aliases: ["perfil"] },
  { href: "/componentes/badge", label: "Badge", aliases: ["insignia"] },
  { href: "/componentes/box", label: "Box", aliases: ["caja"] },
  {
    href: "/componentes/button",
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
  { href: "/componentes/callout", label: "Callout", aliases: ["alerta", "nota", "aviso"] },
  {
    href: "/componentes/card",
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
    href: "/componentes/carousel",
    label: "Carousel",
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
    href: "/componentes/checkbox",
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
    href: "/componentes/changelog",
    label: "Changelog",
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
    href: "/componentes/code-preview",
    label: "CodePreview",
    aliases: ["shiki", "código", "codigo", "code block", "preview de código", "preview de codigo"],
  },
  {
    href: "/componentes/command-palette",
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
    href: "/componentes/component-preview",
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
  { href: "/componentes/copy-button", label: "CopyButton", aliases: ["copiar", "copy", "portapapeles"] },
  {
    href: "/componentes/dialog",
    label: "Dialog",
    aliases: ["diálogo", "dialogo", "modal", "confirm", "dialog vaul", "dialog enhanced"],
  },
  { href: "/componentes/drawer", label: "Drawer", aliases: ["panel lateral", "cajón", "cajon"] },
  {
    href: "/componentes/flyout",
    label: "Flyout",
    aliases: ["flyout", "picker lateral", "panel al lado"],
  },
  { href: "/componentes/grid", label: "Grid", aliases: ["grilla", "cuadrícula", "cuadricula"] },
  {
    href: "/componentes/layout-grid",
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
  { href: "/componentes/heading", label: "Heading", aliases: ["encabezado", "título", "titulo"] },
  { href: "/hotkey", label: "Hotkey", aliases: ["atajo", "atajos", "keyboard shortcut"] },
  {
    href: "/componentes/icon",
    label: "Icon",
    aliases: ["icono", "ícono", "icono componente", "sk-icon", "mountIcons"],
  },
  {
    href: "/componentes/image-frame",
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
  { href: "/componentes/inline", label: "Inline", aliases: ["en línea", "en linea"] },
  { href: "/componentes/input", label: "Input", aliases: ["entrada", "campo"] },
  { href: "/componentes/kbd", label: "Kbd", aliases: ["tecla", "teclado"] },
  {
    href: "/componentes/link",
    label: "Link",
    aliases: ["enlace", "vínculo", "vinculo", "tile link", "enlace de superficie", "tarjeta enlace"],
  },
  {
    href: "/componentes/list",
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
    href: "/componentes/loader",
    label: "Loader",
    aliases: ["carga", "cargando", "spinner", "indicador de carga"],
  },
  { href: "/nav-list", label: "Nav list", aliases: ["lista de navegación", "lista de navegacion"] },
  { href: "/componentes/navbar", label: "Navbar", aliases: ["barra de navegación", "barra de navegacion"] },
  { href: "/componentes/pagination", label: "Pagination", aliases: ["paginación", "paginacion"] },
  {
    href: "/componentes/placeholder",
    label: "Placeholder",
    aliases: ["skeleton", "esqueleto", "contenido provisional", "cargando contenido"],
  },
  {
    href: "/componentes/process-list",
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
  { href: "/componentes/progress", label: "Progress", aliases: ["progreso"] },
  {
    href: "/componentes/radio-group",
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
  { href: "/componentes/segmented", label: "SegmentedControl", aliases: ["control segmentado"] },
  {
    href: "/componentes/select",
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
  { href: "/componentes/sidebar", label: "Sidebar", aliases: ["barra lateral"] },
  {
    href: "/componentes/skip-link",
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
  { href: "/componentes/slider", label: "Slider", aliases: ["deslizador"] },
  { href: "/componentes/stack", label: "Stack", aliases: ["pila"] },
  { href: "/componentes/stat", label: "Stat", aliases: ["estadística", "estadistica", "métrica", "metrica"] },
  { href: "/componentes/steps", label: "Steps", aliases: ["pasos"] },
  { href: "/componentes/switch", label: "Switch", aliases: ["interruptor"] },
  { href: "/componentes/table", label: "Table", aliases: ["tabla"] },
  { href: "/componentes/tabs", label: "Tabs", aliases: ["pestañas", "pestanas"] },
  { href: "/componentes/tag", label: "Tag", aliases: ["etiqueta"] },
  { href: "/componentes/text", label: "Text", aliases: ["texto"] },
  {
    href: "/componentes/theme-toggle",
    label: "Theme Toggle",
    aliases: [
      "ThemeToggle",
      "modo",
      "modo de color",
      "tema",
      "dark mode",
      "light mode",
      "color-scheme",
      "theme",
    ],
  },
  { href: "/componentes/toast", label: "Toast", aliases: ["notificación", "notificacion", "aviso transitorio"] },
  { href: "/componentes/tooltip", label: "Tooltip", aliases: ["globo", "ayuda contextual", "descripción", "descripcion", "hint"] },
  {
    href: "/componentes/toc",
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
  { href: "/componentes/wrapper", label: "Wrapper", aliases: ["container", "contenedor", "envoltorio"] },
  {
    href: "/componentes/breadcrumb",
    label: "Breadcrumb",
    aliases: ["migas de pan", "ruta jerárquica", "ruta jerarquica"],
  },
  {
    href: "/componentes/combobox",
    label: "Combobox",
    aliases: ["autocompletar", "autocomplete", "selector editable"],
  },
  {
    href: "/componentes/date-picker",
    label: "DatePicker",
    aliases: ["fecha", "selector de fecha", "date range", "campo de fecha"],
  },
  {
    href: "/componentes/calendar",
    label: "Calendar",
    aliases: ["calendario", "grid de fecha", "mes", "vista de año", "década"],
  },
  {
    href: "/componentes/empty-state",
    label: "EmptyState",
    aliases: ["estado vacío", "estado vacio", "sin resultados"],
  },
  {
    href: "/componentes/file-upload",
    label: "FileUpload",
    aliases: ["subir archivo", "carga de archivos", "dropzone"],
  },
  {
    href: "/componentes/menu",
    label: "Menu",
    aliases: ["menú", "menu de acciones", "context menu"],
  },
  {
    href: "/componentes/number-field",
    label: "NumberField",
    aliases: ["campo numérico", "campo numerico", "stepper"],
  },
  {
    href: "/componentes/popover",
    label: "Popover",
    aliases: ["contenido flotante", "ayuda rica", "top layer"],
  },
  {
    href: "/componentes/popup",
    label: "Popup",
    aliases: ["superficie flotante", "popup primitivo"],
  },
  {
    href: "/componentes/split-button",
    label: "SplitButton",
    aliases: ["botón dividido", "boton dividido", "acción con menú"],
  },
  {
    href: "/componentes/time-field",
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
    href: "/componentes/toolbar",
    label: "Toolbar",
    aliases: ["barra de herramientas", "grupo de controles"],
  },
  {
    href: "/componentes/tree-view",
    label: "TreeView",
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
      "/componentes/button",
      "/componentes/calendar",
      "/componentes/checkbox",
      "/componentes/combobox",
      "/componentes/copy-button",
      "/componentes/date-picker",
      "/componentes/file-upload",
      "/componentes/input",
      "/componentes/number-field",
      "/componentes/radio-group",
      "/componentes/segmented",
      "/componentes/select",
      "/componentes/slider",
      "/componentes/split-button",
      "/componentes/switch",
      "/componentes/time-field",
      "/componentes/toolbar",
    ),
  },
  {
    group: "group.componentNavigation",
    blurb: "group.componentNavigation.blurb",
    items: componentGroupItems(
      "/componentes/breadcrumb",
      "/componentes/command-palette",
      "/componentes/link",
      "/componentes/menu",
      "/nav-list",
      "/componentes/navbar",
      "/componentes/pagination",
      "/componentes/sidebar",
      "/componentes/skip-link",
      "/componentes/tabs",
      "/componentes/toc",
      "/componentes/tree-view",
    ),
  },
  {
    group: "group.componentContent",
    blurb: "group.componentContent.blurb",
    items: componentGroupItems(
      "/componentes/avatar",
      "/componentes/badge",
      "/componentes/card",
      "/componentes/carousel",
      "/componentes/changelog",
      "/componentes/code-preview",
      "/componentes/component-preview",
      "/componentes/heading",
      "/componentes/icon",
      "/componentes/image-frame",
      "/componentes/kbd",
      "/componentes/list",
      "/componentes/process-list",
      "/componentes/stat",
      "/componentes/table",
      "/componentes/tag",
      "/componentes/text",
    ),
  },
  {
    group: "group.componentFeedback",
    blurb: "group.componentFeedback.blurb",
    items: componentGroupItems(
      "/componentes/callout",
      "/componentes/empty-state",
      "/componentes/loader",
      "/componentes/placeholder",
      "/componentes/progress",
      "/componentes/steps",
      "/componentes/toast",
      "/componentes/tooltip",
    ),
  },
  {
    group: "group.componentLayers",
    blurb: "group.componentLayers.blurb",
    items: componentGroupItems(
      "/componentes/accordion",
      "/componentes/dialog",
      "/componentes/drawer",
      "/componentes/flyout",
      "/componentes/popover",
      "/componentes/popup",
      "/vaul",
    ),
  },
  {
    group: "group.componentLayout",
    blurb: "group.componentLayout.blurb",
    items: componentGroupItems(
      "/componentes/box",
      "/componentes/grid",
      "/componentes/layout-grid",
      "/hotkey",
      "/componentes/inline",
      "/scrollbar",
      "/componentes/stack",
      "/componentes/theme-toggle",
      "/componentes/wrapper",
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
  { href: "/", label: "nav.docs" },
  { href: "/playground", label: "nav.playground" },
  { href: "/personalizar", label: "nav.customize" },
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
            href: "/prerrequisitos",
            label: "Prerrequisitos",
            aliases: ["conceptos", "fundamentos externos", "css variables", "custom properties", "antes de empezar"],
          },
          { href: "/", label: "Instalación", aliases: ["installation", "instalar"] },
          {
            href: "/primer-componente",
            label: "Tu primer componente",
            aliases: ["first component", "primer componente"],
          },
          {
            href: "/montaje-automatico",
            label: "Montaje automático",
            aliases: ["auto mount", "initComponents", "auto-mounting", "automatic mounting", "vanilla mount"],
          },
        ],
      },
    ],
  },
  {
    id: "system",
    section: "section.system",
    blurb: "section.system.blurb",
    groups: [
      {
        group: "group.foundations",
        // Orden de lectura, no alfabético: se lee de arriba abajo y cada ítem supone el anterior.
        // Tokens abre porque todo lo demás resuelve a tokens; los patterns van al final, ya con
        // vocabulario para explicarse. Al agregar una página, insértala donde se entienda, no por letra.
        items: [
          { href: "/referencia", label: "Tokens" },
          { href: "/dimensiones", label: "Dimensiones" },
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
            href: "/densidad",
            label: "Densidad de componente",
            aliases: ["density", "densidad local", "scope de densidad", "custom density", "compactar componente"],
          },
          {
            href: "/acento",
            label: "Alcance del acento",
            aliases: [
              "accent",
              "accent reach",
              "alcance",
              "acento",
              "data-accent",
              "marca",
              "brand",
              "cuánta marca",
              "cuanta marca",
              "quitar color",
              "bajar la marca",
              "decoración",
              "decoracion",
            ],
          },
          { href: "/tiers", label: "Tiers" },
          {
            href: "/arquitectura",
            label: "Arquitectura",
            aliases: ["contrato", "binding", "capas", "cómo se construye un componente", "machine"],
          },
          { href: "/styling-hooks", label: "Styling hooks" },
          { href: "/motion", label: "Motion" },
          {
            href: "/gradientes",
            label: "Gradientes",
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
            href: "/transparencias",
            label: "Transparencias",
            aliases: [
              "transparency",
              "reduced transparency",
              "prefers-reduced-transparency",
              "blur",
              "glassmorphism",
              "fondos translúcidos",
            ],
          },
          {
            href: "/iconos",
            label: "Iconografía",
            aliases: ["iconos", "icon set", "roles de icono", "vocabulario de iconos", "adr-15"],
          },
          { href: "/state-layer", label: "State layer" },
          {
            href: "/almacenamiento",
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
          {
            href: "/anclaje",
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
            href: "/componentes/tile",
            label: "Tile",
            aliases: ["tarjeta", "patrón de tarjeta", "patron de tarjeta"],
          },
          {
            href: "/scroll-lock",
            label: "Scroll lock",
            aliases: ["scrollbar gutter", "cls", "overflow hidden", "congelar scroll", "reserva scrollbar"],
          },
        ],
      },
    ],
  },
  {
    id: "components",
    section: "section.components",
    href: "/componentes",
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
