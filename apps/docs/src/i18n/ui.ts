/*
 * EVERY TRANSLATABLE STRING IN THE SITE CHROME, in one place.
 *
 * Two dictionaries, because they are keyed by different things and drift for different reasons:
 *
 *   - `ui`      keyed by a dotted STRING KEY. The chrome's own copy: buttons, aria-labels, the
 *               command palette, the footer.
 *   - `navLabel` keyed by the item's SPANISH HREF, which is the stable identity of a page in
 *               `lib/navigation.ts`. Only pages whose label is actually a Spanish word appear here:
 *               a component's name ("Avatar", "Button", "SegmentedControl") is a proper noun and is
 *               the same string in both languages, so it falls through untranslated by DEFAULT
 *               rather than by 60 hand-copied identity entries that could rot.
 *
 * The Spanish dictionary is the source: `es` is the default locale, and every key here already
 * existed as a literal in a component. Adding a locale means adding a column, never touching the
 * markup again.
 */

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale = "es" satisfies Locale;

/** What the language switcher shows. Endonyms: a reader looking for English scans for "English". */
export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

export const ui = {
  es: {
    "nav.openMenu": "Abrir navegación",
    "nav.global": "Navegación global",
    "nav.drawer": "Navegación",
    "nav.closeDrawer": "Cerrar navegación",
    "nav.between": "Navegación entre documentos",
    "nav.notWritten": "Todavía no escrita",
    "nav.docs": "Docs",
    "nav.customize": "Personalizar",

    "search.label": "Buscar",
    "search.dialog": "Buscar en la documentación",
    "search.placeholder": "Buscar componentes y páginas…",
    "search.results": "Resultados",
    "search.empty": "Sin resultados.",
    "search.hintNavigate": "navegar",
    "search.hintOpen": "abrir",
    "search.hintClose": "cerrar",
    "search.exploreComponents": "Explorar componentes",
    "search.layoutGuide": "Guía de layout y lectura",

    "action.close": "Cerrar",

    "prefs.palette": "Paleta de color",
    "prefs.paletteNamed": "Paleta: {name}",
    "prefs.contrastNormal": "Contraste: normal",
    "prefs.contrastHigh": "Contraste: alto",
    "prefs.language": "Idioma",
    "prefs.modeSystem": "Modo: sistema",
    "prefs.modeLight": "Modo: claro",
    "prefs.modeDark": "Modo: oscuro",

    "toc.title": "En esta página",

    "code.condensed": "Condensado",
    "code.full": "Completo",
    "code.showFull": "Mostrar código completo",
    "code.showLines": "Mostrar las {count} líneas de código",
    "code.showLess": "Mostrar menos",
    "code.showFirstLines": "Mostrar sólo las primeras {count} líneas de código",
    "code.showMore": "Mostrar más",
    "code.lines": "{count} líneas",

    "copy.code": "Copiar código",
    "copy.copied": "Copiado",
    "copy.error": "Error al copiar",
    "copy.codeCopied": "Código copiado",
    "copy.failed": "No se pudo copiar el código",
    "copy.action": "Copiar",

    "preview.reload": "Recargar preview: {name}",
    "preview.reloadHint": "Recargar · vuelve a montar el demo desde cero",
    "preview.screenGroup": "Tamaño de pantalla del preview: {name}",
    "preview.screenFree": "Ancho libre",
    "preview.screenFreeHint": "Ancho libre · el preview ocupa la columna entera y crece hasta el alto de su contenido",
    "preview.screenTablet": "Tablet",
    "preview.screenTabletHint": "Tablet · 768 × 1024 px, la franja donde los layouts de dos columnas empiezan a ceder",
    "preview.screenMobile": "Móvil",
    "preview.screenMobileHint": "Móvil · 390 × 844 px, el ancho donde todo termina apilado",

    "hooks.intro": "Los valores autorales salen del CSS publicado. Los valores usados se resuelven en vivo contra el elemento real del componente y cambian con las dimensiones elegidas arriba.",
    "hooks.authored": "Valor autoral",
    "hooks.used": "Valor usado",

    "tokens.primitive": "Primitivos",
    "tokens.semantic": "Semánticos",
    "tokens.component": "Por componente",
    "tokens.search": "Buscar",
    "tokens.searchPlaceholder": "Nombre o valor…",
    "tokens.all": "Todos",
    "tokens.group": "Grupo",
    "tokens.groups": "{count} grupos",
    "tokens.groupCount": "{count} grupo",

    "vanilla.title": "Vanilla: instalar y montar",
    "vanilla.intro": "Esta ruta no necesita React. Instala Core para los estilos y Vanilla para el enhancer; después elige una estrategia de montaje para cada raíz. Ambas son idempotentes.",
    "vanilla.autoTitle": "Auto, sólo los enhancers presentes",
    "vanilla.autoBody": "Úsalo cuando la página contiene varios componentes del sistema. Escanea los roots data-sk-* y hace import() únicamente de los tipos presentes; un selector ausente no descarga ni ejecuta su módulo.",
    "vanilla.onlyTitle": "Sólo {name}",
    "vanilla.onlyBody": "Este entry point importa sólo el enhancer de {name}. Sin argumento monta sus instancias en el documento; al pasar una raíz, monta exclusivamente esa instancia.",
    "vanilla.instance": "una instancia",
    "vanilla.autoComment": "Cada selector presente dispara sólo el import dinámico de su enhancer.",
    "vanilla.componentComment": "Monta sólo {name}; no carga ni recorre otros enhancers.",

    "section.start": "Empezar",
    "section.start.blurb": "Pon el sistema en una pantalla.",
    "section.system": "Sistema",
    "section.system.blurb": "Las reglas que mantienen todo consistente.",
    "section.components": "Componentes",
    "section.components.blurb": "Catálogo A–Z de piezas del sistema.",
    "group.firstSteps": "Primeros pasos",
    "group.foundations": "Fundamentos",
    "group.explore": "Explorar",
    "group.layout": "Layout",
    "group.global": "Global",

    "footer.body":
      "Este sitio consume {core} y los paquetes de componentes por sus exports maps, con bundler, el mismo camino que documenta. Cada píxel sale de un token.",
  },

  en: {
    "nav.openMenu": "Open navigation",
    "nav.global": "Global navigation",
    "nav.drawer": "Navigation",
    "nav.closeDrawer": "Close navigation",
    "nav.between": "Document navigation",
    "nav.notWritten": "Not written yet",
    "nav.docs": "Docs",
    "nav.customize": "Customize",

    "search.label": "Search",
    "search.dialog": "Search the documentation",
    "search.placeholder": "Search components and pages…",
    "search.results": "Results",
    "search.empty": "No results.",
    "search.hintNavigate": "navigate",
    "search.hintOpen": "open",
    "search.hintClose": "close",
    "search.exploreComponents": "Browse components",
    "search.layoutGuide": "Layout and reading guide",

    "action.close": "Close",

    "prefs.palette": "Color palette",
    "prefs.paletteNamed": "Palette: {name}",
    "prefs.contrastNormal": "Contrast: normal",
    "prefs.contrastHigh": "Contrast: high",
    "prefs.language": "Language",
    "prefs.modeSystem": "Mode: system",
    "prefs.modeLight": "Mode: light",
    "prefs.modeDark": "Mode: dark",

    "toc.title": "On this page",

    "code.condensed": "Condensed",
    "code.full": "Full",
    "code.showFull": "Show full code",
    "code.showLines": "Show all {count} lines of code",
    "code.showLess": "Show less",
    "code.showFirstLines": "Show only the first {count} lines of code",
    "code.showMore": "Show more",
    "code.lines": "{count} lines",

    "copy.code": "Copy code",
    "copy.copied": "Copied",
    "copy.error": "Copy failed",
    "copy.codeCopied": "Code copied",
    "copy.failed": "Could not copy the code",
    "copy.action": "Copy",

    "preview.reload": "Reload preview: {name}",
    "preview.reloadHint": "Reload · remount the demo from scratch",
    "preview.screenGroup": "Preview screen size: {name}",
    "preview.screenFree": "Free width",
    "preview.screenFreeHint": "Free width · the preview fills the column and grows to its content height",
    "preview.screenTablet": "Tablet",
    "preview.screenTabletHint": "Tablet · 768 × 1024 px, where two-column layouts begin to yield",
    "preview.screenMobile": "Mobile",
    "preview.screenMobileHint": "Mobile · 390 × 844 px, where every layout finishes stacking",

    "hooks.intro": "Authored values come from the published CSS. Used values resolve live against the real component element and change with the dimensions selected above.",
    "hooks.authored": "Authored value",
    "hooks.used": "Used value",

    "tokens.primitive": "Primitives",
    "tokens.semantic": "Semantic",
    "tokens.component": "By component",
    "tokens.search": "Search",
    "tokens.searchPlaceholder": "Name or value…",
    "tokens.all": "All",
    "tokens.group": "Group",
    "tokens.groups": "{count} groups",
    "tokens.groupCount": "{count} group",

    "vanilla.title": "Vanilla: install and mount",
    "vanilla.intro": "This route does not need React. Install Core for styles and Vanilla for the enhancer, then choose one mounting strategy for each root. Both are idempotent.",
    "vanilla.autoTitle": "Auto, only the enhancers present",
    "vanilla.autoBody": "Use this when the page contains several system components. It scans data-sk-* roots and import()s only the types present; a missing selector neither downloads nor runs its module.",
    "vanilla.onlyTitle": "Only {name}",
    "vanilla.onlyBody": "This entry point imports only the {name} enhancer. With no argument it mounts every instance in the document; pass a root to mount only that instance.",
    "vanilla.instance": "one instance",
    "vanilla.autoComment": "Each selector present triggers only its enhancer's dynamic import.",
    "vanilla.componentComment": "Mounts only {name}; it neither loads nor scans other enhancers.",

    "section.start": "Get started",
    "section.start.blurb": "Put the system on a screen.",
    "section.system": "System",
    "section.system.blurb": "The rules that keep everything consistent.",
    "section.components": "Components",
    "section.components.blurb": "A–Z catalog of the system's pieces.",
    "group.firstSteps": "First steps",
    "group.foundations": "Foundations",
    "group.explore": "Browse",
    "group.layout": "Layout",
    "group.global": "Global",

    "footer.body":
      "This site consumes {core} and the component packages through their exports maps, with a bundler — the same path it documents. Every pixel comes from a token.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["es"];

/*
 * Nav labels that are Spanish PROSE, keyed by the item's Spanish href.
 *
 * Anything absent keeps the label authored in `lib/navigation.ts`, which is the right answer for the
 * ~60 component entries: "Avatar", "Combobox" and "SegmentedControl" are names, not words, and a
 * translation table full of `"Avatar": "Avatar"` is a table that will eventually disagree with itself.
 */
export const navLabel: Record<Locale, Partial<Record<string, string>>> = {
  es: {},
  en: {
    "/": "Installation",
    "/prerrequisitos": "Prerequisites",
    "/primer-componente": "Your first component",
    "/referencia": "Tokens",
    "/dimensiones": "Dimensions",
    "/zoom": "Zoom and reflow",
    "/densidad": "Component density",
    "/gradientes": "Gradients",
    "/transparencias": "Transparency",
    "/iconos": "Iconography",
    "/almacenamiento": "Storage",
    "/anclaje": "Anchoring",
    "/componentes/date-picker": "DatePicker",
    "/componentes/calendar": "Calendar",
  },
};
