import type { UsageTree } from "@skryensya/ai-compiler/usage-tree";
import { recipes } from "@skryensya/recipes";

/*
 * The canonical usage trees: one per signature, plus one per state that is materially different.
 *
 * They are fixtures for the gates and, once the site takes trees instead of strings, the same data
 * the docs render. A tree that no gate runs is not evidence of anything, which is why this list and
 * the published catalogue grow together.
 */

/*
 * Media as a data URI, not a file path.
 *
 * The first version of this fixture pointed at `/media/plaza.jpg`, which does not exist: the browser
 * drew a broken-image box that stretched the visual baseline to 4500px and made it evidence of
 * nothing. A gate's fixture cannot depend on an asset that may or may not be served — inline it, and
 * the image is the same pixels on every machine.
 */
const SAMPLE_MEDIA =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 18">' +
      '<rect width="32" height="18" fill="#4a5568"/>' +
      '<circle cx="24" cy="5" r="3" fill="#f6e05e"/>' +
      '<path d="M0 18 L10 8 L18 18 Z" fill="#2d3748"/>' +
      "</svg>",
  );

export type Canonical = {
  readonly name: string;
  readonly tree: UsageTree;
  /** Signatures with no enhancer need no `initComponents`; saying so keeps the harness honest. */
  readonly enhanced: boolean;
};

const signatureTrees: readonly Canonical[] = [
  {
    name: "button/action",
    enhanced: true,
    tree: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "primary" },
      children: "Guardar",
    },
  },
  {
    name: "button/action-danger-sm",
    enhanced: true,
    tree: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "danger", size: "sm" },
      children: "Borrar",
    },
  },
  {
    name: "button/action-icon-only",
    enhanced: true,
    tree: {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true },
      attrs: { "aria-label": "Descargar" },
      children: "↓",
    },
  },
  {
    name: "button/navigation",
    enhanced: true,
    tree: {
      contract: "button",
      signature: "Button.navigation",
      options: { variant: "primary", href: "/docs" },
      children: "Documentación",
    },
  },
  {
    name: "image-frame/src",
    enhanced: false,
    tree: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", src: SAMPLE_MEDIA, alt: "La plaza al atardecer" },
    },
  },
  {
    /*
     * The other source: authored content. Exactly one of the two, never neither — with neither, the
     * frame renders an empty box that every static check calls valid.
     *
     * KNOWN LIMIT, and worth naming rather than hiding: the real case here is an authored
     * `<picture>` or `<video>`, and a usage tree cannot say that. A tree's children are text or
     * another signature, and raw markup is neither. Until the model grows a way to carry authored
     * markup, this case proves the constraint and the render, not the media element itself.
     */
    name: "image-frame/authored-media",
    enhanced: false,
    tree: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "1/1", fit: "contain", radius: "none" },
      children: "—",
    },
  },
  {
    /*
     * The machine-backed case. Both bindings run the SAME Zag machine, so the symmetry gate here is
     * checking something the static families could not: that a machine writing state onto authored
     * markup lands where it lands onto React-rendered markup.
     */
    name: "tabs/two-panels",
    enhanced: true,
    tree: {
      contract: "tabs",
      signature: "Tabs",
      options: { value: "summary" },
      attrs: { "aria-label": "Proyecto" },
      slots: {
        items: [
          {
            options: { value: "summary" },
            slots: { label: "Resumen", children: "Atlas está listo para el lanzamiento de julio." },
          },
          {
            options: { value: "activity" },
            slots: { label: "Actividad", children: "Tres cambios aprobados esta semana." },
          },
        ],
      },
    },
  },
  {
    /*
     * The wiring case. Six ids bind these four elements, and the whole point is that the author wrote
     * none of them: the label points at the control, the control points back at the hint and the
     * error, and each target carries the id it is pointed at by.
     *
     * G2 here is checking the thing that is invisible on screen and breaks every screen reader when
     * it is wrong — and the ids differ between bindings (React's `useId` vs the emitter's slug), so
     * what is compared is the RELATIONSHIP, not the string.
     */
    name: "field/with-hint-and-error",
    enhanced: false,
    tree: {
      contract: "field",
      signature: "Field",
      options: { required: true },
      slots: {
        label: "Email",
        hint: "Sólo la usamos para las boletas.",
        error: "Ingresa una dirección laboral.",
      },
      children: {
        contract: "input",
        signature: "Input",
        options: { type: "email", name: "email" },
      },
    },
  },
  {
    // The same contract with nothing optional filled: no `aria-describedby`, no `aria-invalid`, no
    // asterisk. A field that invents those would be describing something that is not there.
    name: "field/bare",
    enhanced: false,
    tree: {
      contract: "field",
      signature: "Field",
      slots: { label: "Nombre" },
      children: { contract: "input", signature: "Input", options: { name: "nombre" } },
    },
  },
  {
    /*
     * Five elements for one boolean, and the author wrote one of them. The rest is structure the
     * system owns: a real `<input>` for form participation and keyboard, paint that is `aria-hidden`
     * so the choice is announced once rather than twice, and two indicators the CSS switches between.
     *
     * No `for` and no `id` anywhere: wrapping IS the association, which is why this contract has no
     * wiring while Field is made of it.
     */
    name: "checkbox/labelled",
    enhanced: false,
    tree: {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "terms", required: true },
      children: "Acepto los términos",
    },
  },
  {
    /*
     * A collection whose entries share something: the `name` on every input is what makes the choice
     * exclusive, and it belongs to the group. Composed as loose children, repeating it correctly on
     * each option would be the author's job — the same invariant a tab's key is.
     */
    name: "radio-group/two-plans",
    enhanced: false,
    tree: {
      contract: "radio-group",
      signature: "RadioGroup",
      options: { name: "plan", value: "mensual" },
      slots: {
        items: [
          { options: { value: "mensual" }, slots: { label: "Mensual" } },
          { options: { value: "anual" }, slots: { label: "Anual" } },
        ],
      },
    },
  },
  {
    name: "switch/labelled",
    enhanced: false,
    tree: {
      contract: "switch",
      signature: "Switch",
      options: { name: "dark-mode", checked: true },
      children: "Modo oscuro",
    },
  },
  {
    /*
     * Order and cardinality, which nothing else in the catalogue needed. HTML fixes both: the caption
     * comes first and there is at most one, the body is required, and a footer written before the body
     * is markup the parser silently moves — while the page still looks right.
     */
    name: "table/captioned",
    enhanced: false,
    tree: {
      contract: "table",
      signature: "Table",
      children: [
        { contract: "table", signature: "TableCaption", children: "Planes" },
        {
          contract: "table",
          signature: "TableHead",
          children: {
            contract: "table",
            signature: "TableRow",
            children: [
              { contract: "table", signature: "TableHeader", children: "Plan" },
              { contract: "table", signature: "TableHeader", children: "Precio" },
            ],
          },
        },
        {
          contract: "table",
          signature: "TableBody",
          children: [
            {
              contract: "table",
              signature: "TableRow",
              children: [
                { contract: "table", signature: "TableCell", children: "Mensual" },
                { contract: "table", signature: "TableCell", children: "$9" },
              ],
            },
            {
              contract: "table",
              signature: "TableRow",
              children: [
                { contract: "table", signature: "TableCell", children: "Anual" },
                { contract: "table", signature: "TableCell", children: "$90" },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: "badge/danger",
    enhanced: false,
    tree: { contract: "badge", signature: "Badge", options: { tone: "danger" }, children: "3" },
  },
  {
    name: "kbd/key",
    enhanced: false,
    tree: { contract: "kbd", signature: "Kbd", children: "⌘K" },
  },
  {
    // Named: it IS the status, and gets role="status". Unnamed it would be aria-hidden decoration.
    name: "loader/labelled",
    enhanced: false,
    tree: {
      contract: "loader",
      signature: "Loader",
      options: { label: "Cargando resultados", variant: "dots" },
    },
  },
  {
    name: "placeholder/text",
    enhanced: false,
    tree: { contract: "placeholder", signature: "Placeholder", options: { shape: "text" } },
  },
  {
    name: "tag/removable",
    enhanced: true,
    tree: {
      contract: "tag",
      signature: "Tag",
      options: { tone: "accent", removable: true },
      children: "Diseño",
    },
  },
  {
    // A named bar: the three aria-value attributes are what make "62 of 100" audible.
    name: "progress/labelled",
    enhanced: false,
    tree: {
      contract: "progress",
      signature: "Progress",
      options: { value: 62, label: "Subiendo archivo" },
    },
  },
  {
    name: "avatar/initials",
    enhanced: false,
    tree: {
      contract: "avatar",
      signature: "Avatar.initials",
      options: { name: "John Doe" },
      children: "JD",
    },
  },
  {
    name: "typography/text",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Text",
      options: { tone: "secondary", size: "sm" },
      children: "Tres réplicas detrás del balanceador.",
    },
  },
  {
    // Level and size are separate on purpose: the level is document structure, the size is
    // appearance, and tying them forces an h3 to look like an h3 where it should not.
    name: "typography/heading",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Heading",
      options: { headingSize: "h3", flush: true },
      children: "Entorno",
    },
  },
  {
    name: "layout/stack",
    enhanced: false,
    tree: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      children: [
        { contract: "typography", signature: "Text", children: "Primero" },
        { contract: "typography", signature: "Text", children: "Segundo" },
      ],
    },
  },
  {
    name: "layout/box-grid",
    enhanced: false,
    tree: {
      contract: "box",
      signature: "Box",
      options: { padding: "md", surface: "surface", border: "subtle" },
      children: {
        contract: "layout",
        signature: "Grid",
        options: { columns: "2", gap: "sm" },
        children: [
          { contract: "badge", signature: "Badge", children: "Uno" },
          { contract: "badge", signature: "Badge", options: { tone: "success" }, children: "Dos" },
        ],
      },
    },
  },
  {
    // One entry, two shapes: a crumb with an href is a link, the last one is where you are.
    name: "breadcrumb/trail",
    enhanced: false,
    tree: {
      contract: "breadcrumb",
      signature: "Breadcrumb",
      slots: {
        items: [
          { options: { href: "/" }, slots: { label: "Inicio" } },
          { options: { href: "/proyectos" }, slots: { label: "Proyectos" } },
          { options: { current: true }, slots: { label: "Atlas" } },
        ],
      },
    },
  },
  {
    name: "stat/with-change",
    enhanced: false,
    tree: {
      contract: "stat",
      signature: "Stat",
      options: { trend: "up" },
      slots: { label: "Usuarios activos", value: "1.284", change: [{ contract: "icon", signature: "Icon", options: { name: "arrow-up", size: "sm" } }, "+12%"] },
    },
  },
  {
    name: "empty-state/no-results",
    enhanced: false,
    tree: {
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
        title: "No hay resultados",
        description: "Probá con otros términos.",
      },
    },
  },
  {
    // Tone changes the ACCESSIBILITY here, not just the colour: danger is an assertive live region.
    name: "alert/danger",
    enhanced: false,
    tree: {
      contract: "alert",
      signature: "Alert",
      options: { tone: "danger" },
      slots: {
        icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
        title: "No se pudo guardar",
      },
      children: "Revisá la conexión e intentá de nuevo.",
    },
  },
  {
    name: "steps/three-stages",
    enhanced: false,
    tree: {
      contract: "steps",
      signature: "Steps",
      slots: {
        items: [
          { options: { status: "complete" }, slots: { marker: "✓", label: "Datos" } },
          { options: { status: "current", current: true }, slots: { marker: "2", label: "Pago" } },
          { options: { status: "upcoming" }, slots: { marker: "3", label: "Confirmación" } },
        ],
      },
    },
  },
  {
    // Order, never progress: no complete, no current, no upcoming.
    name: "process-list/instructions",
    enhanced: false,
    tree: {
      contract: "process-list",
      signature: "ProcessList",
      children: [
        {
          contract: "process-list",
          signature: "ProcessListItem",
          slots: { title: "Instalar" },
          children: "pnpm add @skryensya/core",
        },
        {
          contract: "process-list",
          signature: "ProcessListItem",
          slots: { title: "Importar los tokens" },
          children: "Una vez, en el entry de la app.",
        },
      ],
    },
  },
  {
    // The interactive row puts the anchor AROUND the row, so focus and click land on the row itself.
    name: "list/rows",
    enhanced: false,
    tree: {
      contract: "list",
      signature: "List",
      children: [
        {
          contract: "list",
          signature: "ListItem",
          slots: { title: "Cuenta", description: "john.doe@ejemplo.cl" },
        },
        {
          contract: "list",
          signature: "ListItemLink",
          options: { href: "/ajustes" },
          slots: { title: "Ajustes", trailing: "→" },
        },
      ],
    },
  },
  {
    name: "navbar/brand-and-actions",
    enhanced: false,
    tree: {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Atlas" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", size: "sm" },
            children: "Cuenta",
          },
        },
      ],
    },
  },
  {
    // One tab stop for the whole bar: without it, every button is a stop and the keyboard pays.
    name: "toolbar/two-groups",
    enhanced: true,
    tree: {
      contract: "toolbar",
      signature: "Toolbar",
      options: { label: "Formato" },
      children: [
        {
          contract: "toolbar",
          signature: "ToolbarGroup",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", size: "sm" },
            children: "Negrita",
          },
        },
        { contract: "toolbar", signature: "ToolbarSeparator" },
        {
          contract: "toolbar",
          signature: "ToolbarGroup",
          children: {
            contract: "button",
            signature: "Button.action",
            options: { variant: "ghost", size: "sm" },
            children: "Alinear",
          },
        },
      ],
    },
  },
  {
    // The fill is derived from the value: a track that says 60 and looks 40 is a lie nobody sees.
    name: "slider/mid-range",
    enhanced: true,
    tree: {
      contract: "slider",
      signature: "Slider",
      options: { value: 60, name: "volumen" },
      attrs: { "aria-label": "Volumen" },
    },
  },
  {
    // Roving tabindex: one stop for the whole bar, which is why a Toolbar counts it as one.
    name: "segmented/view-switcher",
    enhanced: true,
    tree: {
      contract: "segmented",
      signature: "Segmented",
      options: { value: "lista" },
      slots: {
        items: [
          { options: { value: "lista" }, slots: { label: "Lista" } },
          { options: { value: "grilla" }, slots: { label: "Grilla" } },
        ],
      },
    },
  },
  /*
   * Caption wash over a photo. ImageFrame's `caption` slot is not a second media source, so `src`
   * and MediaCaption can coexist without breaking `exactlyOneOf`. Alone, MediaGradient paints
   * nothing — its CSS says so — which is why the canonical tree is this composition, not the wash.
   */
  {
    name: "media-gradient/caption-on-frame",
    enhanced: false,
    tree: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9", src: "/demos/media-gradient.svg", alt: "" },
      slots: {
        caption: {
          contract: "media-gradient",
          signature: "MediaCaption",
          options: { edge: "bottom" },
          children: [
            {
              contract: "media-gradient",
              signature: "MediaGradient",
              options: { strength: "lg" },
            },
            "Horizonte",
          ],
        },
      },
    },
  },
  /*
   * SELECT and MENU were published without fixtures, and G2 only compares what is listed here — so
   * for a while the two newest families were the only ones nobody was checking. Menu's divergences
   * (a `<div>` where the markup emitted a `<button>`, three indicators React drew only on request,
   * a tick that showed while unchecked) were all found by opening the page and looking, which is
   * exactly the work this gate exists to stop anyone having to do.
   */
  {
    name: "select/enhanced",
    enhanced: true,
    tree: {
      contract: "select",
      signature: "Select",
      options: { name: "plan", value: "starter" },
      slots: {
        label: "Plan",
        items: [
          { options: { value: "starter" }, slots: { label: "Starter" } },
          { options: { value: "pro" }, slots: { label: "Pro" } },
        ],
      },
    },
  },
  {
    name: "select/native",
    enhanced: false,
    tree: {
      contract: "select",
      signature: "Select.native",
      options: { name: "plan" },
      attrs: { "aria-label": "Plan" },
      slots: {
        items: [
          { options: { value: "starter" }, slots: { label: "Starter" } },
          { options: { value: "pro" }, slots: { label: "Pro" } },
        ],
      },
    },
  },
  /** A command, a checkbox and a submenu — the three item shapes, including the recursive one. */
  {
    name: "menu/with-submenu",
    enhanced: true,
    tree: {
      contract: "menu",
      signature: "Menu",
      options: { label: "Acciones del archivo" },
      slots: {
        trigger: "Acciones",
        items: [
          { options: { value: "rename" }, slots: { label: "Renombrar" } },
          { options: { value: "favorite", kind: "checkbox" }, slots: { label: "Favorito" } },
          {
            options: { value: "export" },
            slots: {
              label: "Exportar",
              children: [
                { options: { value: "pdf" }, slots: { label: "PDF" } },
                { options: { value: "csv" }, slots: { label: "CSV" } },
              ],
            },
          },
        ],
      },
    },
  },
  {
    name: "nav-list/labelled",
    enhanced: false,
    tree: {
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": "Principal" },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          slots: { label: "Espacio" },
          children: [
            {
              contract: "nav-list",
              signature: "NavListLink",
              options: { href: "/", current: true },
              children: "Inicio",
            },
            {
              contract: "nav-list",
              signature: "NavListLink",
              options: { href: "/reportes" },
              slots: { trailing: "12" },
              children: "Reportes",
            },
          ],
        },
      ],
    },
  },
  {
    /*
     * Icons, and the sharpest case of the two bindings meeting at different depths: React renders the
     * `<svg>`, authored markup writes a placeholder the enhancer replaces once a set is bound. The
     * system ships no geometry, so the drawing cannot exist in the markup — and this is the gate that
     * proves the two still land on the same element.
     */
    name: "nav-list/with-icons",
    enhanced: true,
    tree: {
      contract: "nav-list",
      signature: "NavList",
      attrs: { "aria-label": "Bandejas" },
      children: {
        contract: "nav-list",
        signature: "NavListGroup",
        children: [
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/inbox", current: true },
            slots: {
              icon: { contract: "icon", signature: "Icon", options: { name: "settings" } },
              trailing: "3",
            },
            children: "Bandeja",
          },
          {
            contract: "nav-list",
            signature: "NavListLink",
            options: { href: "/archivo" },
            slots: { icon: { contract: "icon", signature: "Icon", options: { name: "user" } } },
            children: "Archivo",
          },
        ],
      },
    },
  },
  {
    name: "nav-list/unlabelled-group",
    enhanced: false,
    tree: {
      contract: "nav-list",
      signature: "NavList",
      options: { orientation: "horizontal" },
      attrs: { "aria-label": "Secciones" },
      children: [
        {
          contract: "nav-list",
          signature: "NavListGroup",
          children: [
            {
              contract: "nav-list",
              signature: "NavListLink",
              options: { href: "/a" },
              children: "Uno",
            },
          ],
        },
      ],
    },
  },
  {
    /*
     * A composition that is a machine plus two Buttons: the triggers are not chrome, they are the
     * same Button every other page uses, and Zag names them. Authored markup carries min/max/step as
     * attributes on the real input because that is the only channel it has; React passes props.
     */
    name: "number-field/quantity",
    enhanced: true,
    tree: {
      contract: "number-field",
      signature: "NumberField",
      options: { name: "noches", min: 1, max: 14, step: 1 },
      slots: { label: "Noches" },
    },
  },
  {
    /*
     * Composition where the child is the point: a Toast alone has nowhere to be, so `parents` says
     * so and this tree is the pair. The dismiss control is structure the contract owns — declared
     * here as `dismissible`, wired to a handler by whoever renders it.
     */
    name: "content/toast-region",
    enhanced: false,
    tree: {
      contract: "content",
      signature: "ToastRegion",
      children: {
        contract: "content",
        signature: "Toast",
        options: { tone: "success", dismissible: true },
        slots: { title: "Cambios guardados" },
        children: "La versión de julio quedó publicada.",
      },
    },
  },
  {
    /*
     * Three faces in the markup, one lit. The tree says nothing about which: `data-scheme` is state
     * both bindings read off `<html>`, so what this case proves is that they agree on where the
     * mode lives rather than each keeping their own.
     */
    name: "theme-toggle/default",
    enhanced: true,
    tree: { contract: "theme-toggle", signature: "ThemeToggle" },
  },
  {
    /*
     * The first COMPUTED collection: the tree says page 4 of 12, and the window — 1 … 3 4 5 … 12 —
     * comes from the contract, not from the author. What G2 checks is that both bindings arrive at
     * the same window, which they do because both go through `paginationRange`.
     */
    name: "pagination/middle-of-twelve",
    enhanced: false,
    tree: { contract: "pagination", signature: "Pagination", options: { page: 4, total: 12 } },
  },
  {
    name: "tile/link",
    enhanced: false,
    tree: {
      contract: "tile",
      signature: "TileLink",
      options: { href: "/proyectos/atlas", padding: "md" },
      children: "Atlas",
    },
  },
  {
    /*
     * Three signatures composed in the author's order, paired by a machine both bindings run. The
     * trigger and the content are separate because each carries arbitrary markup — a slot would have
     * flattened them into two strings.
     */
    name: "tile/expandable",
    enhanced: true,
    tree: {
      contract: "tile",
      signature: "ExpandableTile",
      children: [
        { contract: "tile", signature: "ExpandableTileTrigger", children: "Detalle del envío" },
        { contract: "tile", signature: "ExpandableTileContent", children: "Sale el martes desde Valparaíso." },
      ],
    },
  },
  {
    /*
     * A coordinator over two composed sections, and the first signature reached through a compound
     * binding — React spells "only inside that one" as `Accordion.Item`, and the contract points at
     * it by the same path.
     */
    name: "accordion/two-sections",
    enhanced: true,
    tree: {
      contract: "accordion",
      signature: "Accordion",
      children: [
        {
          contract: "accordion",
          signature: "Accordion.Item",
          options: { value: "envio" },
          children: [
            { contract: "accordion", signature: "Accordion.Trigger", children: "¿Cuánto tarda el envío?" },
            { contract: "accordion", signature: "Accordion.Content", children: "Entre tres y cinco días hábiles." },
          ],
        },
        {
          contract: "accordion",
          signature: "Accordion.Item",
          options: { value: "devoluciones" },
          children: [
            { contract: "accordion", signature: "Accordion.Trigger", children: "¿Puedo devolver una compra?" },
            { contract: "accordion", signature: "Accordion.Content", children: "Sí, dentro de los treinta días." },
          ],
        },
      ],
    },
  },
  {
    /*
     * Six signatures composed as a shell. The trigger points at the content with `aria-controls`
     * and NEITHER binding's markup carries the pair — the id is generated at runtime, so both write
     * it themselves. G2 compares the relationship, which is the only part that has to hold.
     */
    name: "sidebar/collapsible-shell",
    enhanced: true,
    tree: {
      contract: "sidebar",
      signature: "Sidebar",
      children: [
        {
          contract: "sidebar",
          signature: "SidebarHeader",
          children: {
            contract: "sidebar",
            signature: "SidebarTrigger",
            options: { label: "Angostar la barra" },
            slots: { icon: { contract: "icon", signature: "Icon", options: { name: "menu" } } },
          },
        },
        { contract: "sidebar", signature: "SidebarContent", children: "Proyectos" },
        { contract: "sidebar", signature: "SidebarSeparator" },
        { contract: "sidebar", signature: "SidebarFooter", children: "John Doe" },
      ],
    },
  },
  {
    /*
     * The recursive case, and the only one in the catalogue: an entry's children are entries of the
     * same shape, three levels deep here. What G2 proves is that a template written once — named,
     * and pointed back at from inside — lands on the same DOM as React's recursive component.
     */
    name: "tree-view/nested-folders",
    enhanced: true,
    tree: {
      contract: "tree-view",
      signature: "TreeView",
      options: { label: "Archivos del proyecto" },
      slots: {
        items: [
          {
            options: { id: "src" },
            slots: {
              label: "src",
              children: [
                {
                  options: { id: "componentes" },
                  slots: {
                    label: "componentes",
                    children: [{ options: { id: "boton.ts" }, slots: { label: "boton.ts" } }],
                  },
                },
                { options: { id: "indice.ts" }, slots: { label: "indice.ts" } },
              ],
            },
          },
          { options: { id: "leeme.md" }, slots: { label: "leeme.md" } },
        ],
      },
    },
  },
  {
    /*
     * The rare family where symmetry is free: React renders the same markup and writes the mount
     * mark itself, so BOTH bindings are the same enhanced carousel. What the contract adds is the
     * vocabulary — which knobs exist and what each one costs.
     */
    name: "carousel/three-slides",
    enhanced: true,
    tree: {
      contract: "carousel",
      signature: "Carousel",
      attrs: { "aria-label": "Proyectos recientes" },
      children: [
        { contract: "carousel", signature: "CarouselSlide", children: "Atlas" },
        { contract: "carousel", signature: "CarouselSlide", children: "Brújula" },
        { contract: "carousel", signature: "CarouselSlide", children: "Cardumen" },
      ],
    },
  },
  {
    /*
     * The shell, which is all an author writes. The list of chosen files is runtime state the two
     * bindings meet differently — React renders it, the enhancer never renders markup — and the
     * contract says so rather than pretending the gap is not there.
     */
    name: "file-upload/attach-documents",
    enhanced: true,
    tree: {
      contract: "file-upload",
      signature: "FileUpload",
      options: { name: "adjuntos", multiple: true, accept: ".pdf,.docx" },
      slots: {
        label: "Documentos de respaldo",
        dropzoneLabel: "Arrastra los archivos aquí",
        triggerLabel: "Elegir archivos",
      },
    },
  },
  {
    /*
     * The CalendarView case: both bindings RENDER the control, because the segments and the
     * separators come from the locale and are not knowable when the markup is written. What the tree
     * carries is the shell — and what G2 proves is that two independent renderers of the same
     * `Intl` output land on the same DOM.
     */
    name: "time-field/appointment",
    enhanced: true,
    tree: {
      contract: "time-field",
      signature: "TimeField",
      options: { name: "hora", required: true },
      slots: { label: "Hora de la cita", hint: "Atendemos entre las 9 y las 18." },
    },
  },
  {
    name: "tile/checkbox",
    enhanced: true,
    tree: {
      contract: "tile",
      signature: "TileCheckbox",
      options: { name: "canales", value: "correo", padding: "md" },
      children: "Avisarme por correo",
    },
  },
  {
    name: "tile/switch",
    enhanced: true,
    tree: {
      contract: "tile",
      signature: "TileSwitch",
      options: { name: "resumen", value: "semanal", padding: "md" },
      children: "Resumen semanal",
    },
  },
  {
    /*
     * A collection whose entries are whole surfaces. The `name` belongs to the GROUP — that is what
     * makes the choice exclusive — and the tile paint belongs to each option, which is why the root
     * carries no part class on either side.
     */
    name: "tile/radio-group",
    enhanced: true,
    tree: {
      contract: "tile",
      signature: "TileRadioGroup",
      options: { name: "envio", padding: "md" },
      slots: {
        items: [
          { options: { value: "estandar" }, slots: { label: "Estándar, 3 a 5 días" } },
          { options: { value: "express" }, slots: { label: "Express, al día siguiente" } },
        ],
      },
    },
  },
  {
    /*
     * The one floating family that is not anchored: the panel is a CHILD of the root and placement is
     * fixed coordinates from the trigger's rect. Nothing is portalled, so both bindings land on the
     * same subtree — which is exactly why this one is published and tooltip, popover and menu are not.
     */
    name: "flyout/pick-a-status",
    enhanced: true,
    tree: {
      contract: "flyout",
      signature: "Flyout",
      slots: {
        label: "Estado",
        items: [
          { options: { value: "abierto" }, slots: { label: "Abierto" } },
          { options: { value: "en-curso" }, slots: { label: "En curso" } },
          { options: { value: "cerrado" }, slots: { label: "Cerrado" } },
        ],
      },
    },
  },
  {
    /*
     * The other control a Field can wrap. Same six ids, same wiring, a different element — which is
     * the point: the field derives its ids from whatever signature is slotted into it, and never
     * asks what that is.
     */
    name: "input/textarea-in-a-field",
    enhanced: false,
    tree: {
      contract: "field",
      signature: "Field",
      slots: { label: "Comentario", hint: "Contanos qué te pasó, con el detalle que puedas." },
      children: {
        contract: "input",
        signature: "Textarea",
        options: { name: "comentario", placeholder: "Escribí acá" },
      },
    },
  },
  {
    name: "layout/inline-row",
    enhanced: false,
    tree: {
      contract: "layout",
      signature: "Inline",
      options: { gap: "sm", justify: "between" },
      children: [
        { contract: "typography", signature: "Text", children: "Plan anual" },
        { contract: "badge", signature: "Badge", options: { tone: "success" }, children: "Activo" },
      ],
    },
  },
  {
    /*
     * The pattern only exists as a pair. The wash is `position: absolute` and sizes to the caption
     * it protects, so on its own it paints NOTHING — which is what the render gate caught the first
     * time this was published standalone. The caption is the measure, and that is the composition.
     */
    name: "media-gradient/caption-over-a-frame",
    enhanced: false,
    tree: {
      contract: "image-frame",
      signature: "ImageFrame",
      options: { aspect: "16/9" },
      children: {
        contract: "media-gradient",
        signature: "MediaCaption",
        children: [
          { contract: "media-gradient", signature: "MediaGradient", options: { strength: "lg" } },
          { contract: "typography", signature: "Heading", children: "La plaza al atardecer" },
        ],
      },
    },
  },
  {
    name: "tile/button",
    enhanced: false,
    tree: {
      contract: "tile",
      signature: "TileButton",
      options: { padding: "md" },
      children: "Empezar de cero",
    },
  },
  {
    name: "typography/link-in-a-sentence",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Link",
      options: { href: "/politica-de-privacidad" },
      children: "la política de privacidad",
    },
  },
  {
    name: "wrapper/page-column",
    enhanced: false,
    tree: {
      contract: "wrapper",
      signature: "Wrapper",
      options: { wrapperSize: "lg" },
      children: { contract: "typography", signature: "Text", children: "El ancho de medida vive acá." },
    },
  },
  {
    /*
     * The footer is where order and cardinality stop being abstract: written BEFORE the body it is
     * markup the parser silently moves, and the page still looks right while the reading order is
     * wrong. This case is the same table as `table/captioned` with the totals row it was missing.
     */
    name: "table/with-a-footer",
    enhanced: false,
    tree: {
      /*
       * Wrapped, because that is how a table is actually written: a flex or grid parent would let a
       * wide one blow the surface, and this is the box that scrolls instead. The catalogue published
       * a bare `<table>` until converting the docs page made the omission visible.
       */
      contract: "table",
      signature: "TableScroll",
      children: {
      contract: "table",
      signature: "Table",
      children: [
        { contract: "table", signature: "TableCaption", children: "Gastos de julio" },
        {
          contract: "table",
          signature: "TableHead",
          children: {
            contract: "table",
            signature: "TableRow",
            children: [
              { contract: "table", signature: "TableHeader", children: "Concepto" },
              { contract: "table", signature: "TableHeader", children: "Monto" },
            ],
          },
        },
        {
          contract: "table",
          signature: "TableBody",
          children: [
            {
              contract: "table",
              signature: "TableRow",
              children: [
                { contract: "table", signature: "TableCell", children: "Servidores" },
                { contract: "table", signature: "TableCell", children: "$120" },
              ],
            },
            {
              contract: "table",
              signature: "TableRow",
              children: [
                { contract: "table", signature: "TableCell", children: "Dominios" },
                { contract: "table", signature: "TableCell", children: "$30" },
              ],
            },
          ],
        },
        {
          contract: "table",
          signature: "TableFooter",
          children: {
            contract: "table",
            signature: "TableRow",
            children: [
              { contract: "table", signature: "TableCell", children: "Total" },
              { contract: "table", signature: "TableCell", children: "$150" },
            ],
          },
        },
      ],
    },
    },
  },
  {
    /*
     * The signature that draws nothing, which makes it the one case G5 cannot judge: there is no
     * box to measure. What G2 and G4 CAN say is the whole point of it — that both bindings put the
     * same name in the same live region, and that a screen reader finds it.
     */
    name: "loader/status-only",
    enhanced: false,
    tree: {
      contract: "loader",
      signature: "Loader.status",
      options: { label: "Cargando el catálogo" },
    },
  },
];

/*
 * The recipes, as gate cases.
 *
 * DERIVED, not copied. A recipe is already a usage tree per state, and the gates already know how to
 * render, diff and photograph a usage tree — so writing them out again here would be the duplication
 * this whole system argues against, and the copy would be the one that goes stale.
 *
 * They earn their place because a recipe exercises what a single-signature fixture cannot: a Field
 * inside a Stack inside a shell, a Toast inside its region, an Alert whose actions are two buttons.
 * The composition is where the two bindings have room to disagree, and until now nothing was looking.
 *
 * All marked `enhanced`: a recipe usually contains something machine-backed, and running the
 * enhancers over markup that has none is a no-op.
 */
const recipeTrees: readonly Canonical[] = recipes.flatMap((recipe) =>
  Object.entries(recipe.states).map(([state, tree]) => ({
    name: `recipe/${recipe.id}/${state}`,
    enhanced: true,
    tree,
  })),
);

export const canonicalTrees: readonly Canonical[] = [...signatureTrees, ...recipeTrees];
