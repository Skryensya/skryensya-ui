export type NavigationItem = {
  href: string;
  label: string;
  aliases?: readonly string[];
  todo?: boolean;
};

export type NavigationGroup = {
  group: string;
  /** A platform-native fallback: discoverable, but visually and structurally below the enhanced route. */
  secondary?: boolean;
  items: readonly NavigationItem[];
};

export type NavigationSection = {
  section: string;
  href?: string;
  blurb: string;
  groups: readonly NavigationGroup[];
};

export const componentNavigation = [
  {
    group: "Layout",
    items: [
      { href: "/componentes/box", label: "Box", aliases: ["caja"] },
      { href: "/componentes/wrapper", label: "Wrapper", aliases: ["contenedor", "envoltorio"] },
      { href: "/componentes/stack", label: "Stack", aliases: ["pila"] },
      { href: "/componentes/inline", label: "Inline", aliases: ["en línea", "en linea"] },
      { href: "/componentes/grid", label: "Grid", aliases: ["grilla", "cuadrícula", "cuadricula"] },
    ],
  },
  {
    group: "Contenido",
    items: [
      { href: "/componentes/text", label: "Text", aliases: ["texto"] },
      { href: "/componentes/heading", label: "Heading", aliases: ["encabezado", "título", "titulo"] },
      { href: "/componentes/link", label: "Link", aliases: ["enlace", "vínculo", "vinculo", "tile link", "enlace de superficie", "tarjeta enlace"] },
      { href: "/componentes/toast", label: "Toast", aliases: ["notificación", "notificacion", "aviso transitorio"] },
      { href: "/componentes/table", label: "Table", aliases: ["tabla"] },
      { href: "/componentes/avatar", label: "Avatar", aliases: ["perfil"] },
      { href: "/componentes/tag", label: "Tag", aliases: ["etiqueta"] },
      { href: "/componentes/badge", label: "Badge", aliases: ["insignia"] },
      { href: "/componentes/stat", label: "Stat", aliases: ["estadística", "estadistica", "métrica", "metrica"] },
      { href: "/componentes/kbd", label: "Kbd", aliases: ["tecla", "teclado"] },
    ],
  },
  {
    group: "Entradas y selección",
    items: [
      { href: "/componentes/input", label: "Input", aliases: ["entrada", "campo"] },
      { href: "/componentes/select", label: "Select", aliases: ["selector", "select enhanced", "select nativo", "native select", "select de plataforma", "selector nativo"] },
      { href: "/componentes/checkbox", label: "Checkbox", aliases: ["casilla", "casilla de verificación", "casilla de verificacion", "tile checkbox", "checkbox de superficie", "tarjeta seleccionable", "tarjeta casilla"] },
      { href: "/componentes/radio-group", label: "RadioGroup", aliases: ["grupo de opciones", "botones de radio", "tile radio group", "radio group de superficie", "grupo de tarjetas", "tarjetas de opción", "tarjetas de opcion"] },
      { href: "/componentes/switch", label: "Switch", aliases: ["interruptor"] },
      { href: "/componentes/slider", label: "Slider", aliases: ["deslizador"] },
      { href: "/componentes/segmented", label: "SegmentedControl", aliases: ["control segmentado"] },
    ],
  },
  {
    group: "Acciones y estado",
    items: [
      { href: "/componentes/button", label: "Button", aliases: ["botón", "boton", "tile button", "botón de superficie", "boton de superficie", "tarjeta botón", "tarjeta boton"] },
      { href: "/componentes/copy-button", label: "CopyButton", aliases: ["copiar", "copy", "portapapeles"] },
      { href: "/componentes/tile", label: "Tile", aliases: ["tarjeta", "patrón de tarjeta", "patron de tarjeta"] },
      { href: "/componentes/accordion", label: "Accordion", aliases: ["acordeón", "acordeon", "tarjeta expandible", "tarjeta desplegable"] },
      { href: "/componentes/alert", label: "Alert", aliases: ["alerta"] },
      { href: "/componentes/progress", label: "Progress", aliases: ["progreso"] },
      { href: "/componentes/steps", label: "Steps", aliases: ["pasos"] },
    ],
  },
  {
    group: "Navegación y capas",
    items: [
      { href: "/componentes/navbar", label: "Navbar", aliases: ["barra de navegación", "barra de navegacion"] },
      { href: "/componentes/sidebar", label: "Sidebar", aliases: ["barra lateral"] },
      { href: "/nav-list", label: "Nav list" },
      { href: "/componentes/tabs", label: "Tabs", aliases: ["pestañas", "pestanas"] },
      { href: "/componentes/pagination", label: "Pagination", aliases: ["paginación", "paginacion"] },
      { href: "/componentes/drawer", label: "Drawer", aliases: ["panel lateral", "cajón", "cajon"] },
      {
        href: "/componentes/dialog",
        label: "Dialog",
        aliases: ["diálogo", "dialogo", "modal", "confirm", "dialog vaul", "dialog enhanced"],
      },
      { href: "/vaul", label: "Vaul" },
      { href: "/hotkey", label: "Hotkey" },
    ],
  },
  {
    group: "Alternativas nativas",
    secondary: true,
    items: [
      { href: "/componentes/details", label: "Details nativo", aliases: ["details", "summary", "acordeón nativo", "acordeon nativo", "disclosure"] },
    ],
  },
] satisfies readonly NavigationGroup[];

export const globalNavigation = [
  { href: "/", label: "Docs" },
  { href: "/personalizar", label: "Personalizar" },
] satisfies readonly NavigationItem[];

export const documentationNavigation = [
  {
    section: "Empezar",
    blurb: "Pon el sistema en una pantalla.",
    groups: [
      {
        group: "Primeros pasos",
        items: [
          { href: "/prerrequisitos", label: "Prerrequisitos", aliases: ["conceptos", "fundamentos externos", "css variables", "custom properties", "antes de empezar"] },
          { href: "/", label: "Instalación", aliases: ["installation", "instalar"] },
          { href: "/primer-componente", label: "Tu primer componente", aliases: ["first component", "primer componente"] },
        ],
      },
    ],
  },
  {
    section: "Sistema",
    blurb: "Las reglas que mantienen todo consistente.",
    groups: [
      {
        group: "Fundamentos",
        items: [
          { href: "/referencia", label: "Tokens" },
          { href: "/dimensiones", label: "Dimensiones" },
          { href: "/densidad", label: "Densidad de componente", aliases: ["density", "densidad local", "scope de densidad", "custom density", "compactar componente"] },
          { href: "/tiers", label: "Tiers" },
          { href: "/styling-hooks", label: "Styling hooks" },
          { href: "/motion", label: "Motion" },
          { href: "/state-layer", label: "State layer" },
          {
            href: "/scrollbar",
            label: "Scrollbar",
            aliases: ["scroll", "rail", "thumb", "ds-scrollbar", "reveal scrollbar", "scrollbar custom"],
          },
          { href: "/scroll-lock", label: "Scroll lock", aliases: ["scrollbar gutter", "cls", "overflow hidden", "congelar scroll", "reserva scrollbar"] },
          { href: "/iconos", label: "Iconos" },
        ],
      },
    ],
  },
  {
    section: "Componentes",
    href: "/componentes",
    blurb: "Elige por la tarea que necesitas resolver.",
    groups: componentNavigation,
  },
] satisfies readonly NavigationSection[];
