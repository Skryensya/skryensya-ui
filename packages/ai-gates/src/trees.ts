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
 * nothing. A gate's fixture cannot depend on an asset that may or may not be served: inline it, and
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
      options: { tone: "accent" },
      children: "Guardar",
    },
  },
  {
    name: "button/action-danger-sm",
    enhanced: true,
    tree: {
      contract: "button",
      signature: "Button.action",
      options: { tone: "danger", size: "sm" },
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
      options: { tone: "accent", href: "/docs" },
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
     * The other source: authored content. Exactly one of the two, never neither: with neither, the
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
      children: "Foto",
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
     * it is wrong, and the ids differ between bindings (React's `useId` vs the emitter's slug), so
     * what is compared is the RELATIONSHIP, not the string.
     */
    name: "form-field/with-hint-and-error",
    enhanced: false,
    tree: {
      contract: "form-field",
      signature: "FormField",
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
    name: "form-field/bare",
    enhanced: false,
    tree: {
      contract: "form-field",
      signature: "FormField",
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
     * wiring while FormField is made of it.
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
     * The one selection signature whose state is DERIVED. The parent holds no name and no value: it
     * reads its children (all / none / some) and a click on it makes them agree. Which children
     * start checked is per-entry data, not a group `value`, because nothing here is exclusive and
     * so no entry's state is the group's to hold.
     *
     * Enhanced, unlike every other tree in this family: `indeterminate` is a DOM property with no
     * attribute behind it, so the third state cannot exist in authored markup until something runs.
     */
    name: "checkbox/group",
    enhanced: true,
    tree: {
      contract: "checkbox",
      signature: "CheckboxGroup",
      options: { name: "permissions" },
      slots: {
        label: "Permisos del repositorio",
        items: [
          { options: { value: "read", defaultChecked: true }, slots: { label: "Lectura" } },
          { options: { value: "write" }, slots: { label: "Escritura" } },
          { options: { value: "admin" }, slots: { label: "Administración" } },
        ],
      },
    },
  },
  {
    /*
     * A collection whose entries share something: the `name` on every input is what makes the choice
     * exclusive, and it belongs to the group. Composed as loose children, repeating it correctly on
     * each option would be the author's job, the same invariant a tab's key is.
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
     * is markup the parser silently moves, while the page still looks right.
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
    tree: { contract: "placeholder", signature: "Placeholder", options: { text: "h3", width: "72%" } },
  },
  /* The paragraph is the one skeleton signature whose DOM is generated rather than fixed: the
   * emitter expands `lines` through the same clamp React does, so this is where the two bindings
   * would drift if either stopped agreeing about the count. */
  {
    name: "placeholder/paragraph",
    enhanced: false,
    tree: {
      contract: "placeholder",
      signature: "Placeholder.paragraph",
      options: { text: "body", lines: 3, lastLine: "62%" },
    },
  },
  {
    name: "placeholder/circle",
    enhanced: false,
    tree: { contract: "placeholder", signature: "Placeholder.circle", options: { size: "sm" } },
  },
  {
    name: "placeholder/block",
    enhanced: false,
    tree: {
      contract: "placeholder",
      signature: "Placeholder.block",
      options: { width: "12rem", height: "6rem" },
    },
  },
  /*
   * MARQUEE and FADE-EDGE, published in the same session as the skeleton signatures and uncompared
   * by G2 until this entry: exactly the gap `every published signature is reachable` exists to
   * catch. The marquee cases are `enhanced` because the enhancer is what measures the run and turns
   * it into a duration; the strip is inert markup until it mounts.
   */
  {
    name: "marquee/requested",
    enhanced: true,
    tree: {
      contract: "marquee",
      signature: "Marquee",
      options: { speed: "slow" },
      slots: {
        playLabel: "Reproducir movimiento",
        pauseLabel: "Pausar movimiento",
        children: "NORTHSTAR",
      },
    },
  },
  /* The default autoplay shape: no control at all, which is what `control` being opt-in means. */
  {
    name: "marquee/autoplay",
    enhanced: true,
    tree: {
      contract: "marquee",
      signature: "Marquee.autoplay",
      options: { direction: "right", speed: "normal" },
      slots: { children: "NORTHSTAR" },
    },
  },
  {
    /* The one contract whose payload is COMPUTED into an attribute rather than authored: G2 compares
       the two bindings' `<path d>` here, which is the only check that both call the same encoder. */
    name: "qr-code/default",
    enhanced: false,
    tree: {
      contract: "qr-code",
      signature: "QRCode",
      options: { value: "https://ui.skryensya.dev", label: "Abrir el sitio", level: "Q" },
    },
  },
  /* The same symbol with a hole knocked through the middle, because the logo path clears modules
     and a binding that only covered them would look identical until someone scanned it. */
  {
    name: "qr-code/with-logo",
    enhanced: false,
    tree: {
      contract: "qr-code",
      signature: "QRCode",
      options: {
        value: "https://ui.skryensya.dev/components/qr-code",
        label: "Abrir la documentación",
        level: "H",
        logoRatio: 0.2,
        tone: "accent",
      },
      slots: {
        logo: { contract: "icon", signature: "Icon", options: { name: "settings", size: "lg" } },
      },
    },
  },
  /* The opt-in inversion. Here so G2 sees that `polarity` is serialized identically by both
     bindings: it decides whether the symbol scans, and it is carried by an attribute alone. */
  {
    name: "qr-code/inverted",
    enhanced: false,
    tree: {
      contract: "qr-code",
      signature: "QRCode",
      options: {
        value: "https://ui.skryensya.dev",
        label: "Abrir el sitio",
        polarity: "dark",
        tone: "info",
        qrSize: "sm",
      },
    },
  },
  {
    name: "fade-edge/inline",
    enhanced: false,
    tree: {
      contract: "fade-edge",
      signature: "FadeEdge",
      options: { direction: "to-right", size: "4rem" },
      children: {
        contract: "typography",
        signature: "Text",
        children: "Un texto que se desvanece en el borde",
      },
    },
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
    name: "tag/link",
    enhanced: false,
    tree: {
      contract: "tag",
      signature: "Tag.link",
      options: { href: "/topics/design", tone: "accent" },
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
    name: "callout/danger",
    enhanced: false,
    tree: {
      contract: "callout",
      signature: "Callout",
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
    /*
     * A version history: neither the progress Steps reports nor the plain order a ProcessList
     * counts. BOTH RELEASE STATES ARE HERE, and that is the point of the tree: the dated one carries
     * its day twice on purpose, once as the machine's `YYYY-MM-DD` and once as the words a reader
     * sees, which is the one thing about this contract a binding could most easily get half right;
     * the undated one is a version that has not shipped, where the two bindings have to agree that
     * no `<time>` is emitted at all and `data-unreleased` is. The last entry omits `target`, so the
     * optional node is exercised in the same tree as the one that supplies it.
     *
     * EVERY BADGE TONE IS HERE, and not one of them is written in the tree: `data-tone` is derived
     * from `kind`, by five `attrsWhen` branches on the contract side and by a lookup into
     * `changeKindTones` on React's. Those are two different mechanisms reaching the same table, so
     * every kind has to appear or a mistyped branch ships a badge with no tone at all and nothing
     * fails. The LAST entry names no `kind`, which is the case neither mechanism can fake: the
     * emitter has to fall back to the contract's default and React to its own, and a disagreement
     * about what an unmarked entry is shows up here rather than on a page.
     */
    name: "changelog/version-history",
    enhanced: false,
    tree: {
      contract: "changelog",
      signature: "Changelog",
      children: [
        {
          contract: "changelog",
          signature: "ChangelogRelease",
          slots: { version: "0.2.0-dev" },
          children: [
            {
              contract: "changelog",
              signature: "ChangelogEntry",
              options: { kind: "breaking" },
              slots: { kind: "breaking", title: "El evento cambió de nombre", target: "valueChange" },
              children: "El anterior ya no se emite.",
            },
            {
              contract: "changelog",
              signature: "ChangelogEntry",
              options: { kind: "rework" },
              slots: { kind: "rework", title: "collapsible pasa a ser false por defecto", target: "collapsible" },
              children: "Es como se comportaba un acordeón de una sola sección.",
            },
          ],
        },
        {
          contract: "changelog",
          signature: "ChangelogRelease",
          options: { date: "2026-07-29" },
          slots: { version: "0.1.0", date: "29 de julio de 2026" },
          children: [
            {
              contract: "changelog",
              signature: "ChangelogEntry",
              options: { kind: "bugfix" },
              slots: { kind: "bugfix", title: "La parte se busca sólo como hija directa", target: "content" },
              children: "El enhancer la buscaba en cualquier descendiente.",
            },
            {
              contract: "changelog",
              signature: "ChangelogEntry",
              options: { kind: "feature" },
              slots: { kind: "feature", title: "Primera publicación del contrato" },
              children: "Sale con sus tres firmas.",
            },
            {
              contract: "changelog",
              signature: "ChangelogEntry",
              slots: { kind: "chore", title: "El enhancer se publica con el resto del paquete" },
              children: "Ni el markup ni las opciones se mueven.",
            },
          ],
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
      options: { value: "lista", label: "Vista" },
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
   * nothing (its CSS says so), which is why the canonical tree is this composition, not the wash.
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
   * SELECT and MENU were published without fixtures, and G2 only compares what is listed here, so
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
  /*
   * A FIXED month, deliberately. Everything a calendar draws is derived from the date it opens on,
   * so a tree with no value would render a different grid every day and mark a different cell as
   * today: the visual baseline would rot on its own, monthly. March 2026 contains no today.
   */
  {
    name: "calendar/month",
    enhanced: true,
    tree: {
      contract: "calendar",
      signature: "Calendar",
      options: { value: "2026-03-12", min: "2026-03-01", max: "2026-03-31" },
      slots: { label: "Fecha de la reserva" },
    },
  },
  /** Same fixed month as the calendar above, and for the same reason. */
  {
    name: "date-picker/field",
    enhanced: true,
    tree: {
      contract: "date-picker",
      signature: "DatePicker",
      options: { name: "reserva", value: "2026-03-12", placeholder: "AAAA-MM-DD" },
      slots: { label: "Fecha de la reserva" },
    },
  },
  /* The first tooltip tree there has ever been: nothing compared the two bindings until now. */
  {
    name: "tooltip/on-an-icon-button",
    enhanced: true,
    tree: {
      contract: "tooltip",
      signature: "Tooltip",
      options: { arrow: true },
      slots: {
        children: {
          contract: "button",
          signature: "Button.action",
          options: { iconOnly: true },
          attrs: { "aria-label": "Archivar" },
          slots: { children: "🗄" },
        },
        content: "Archiva el hilo sin borrarlo",
      },
    },
  },
  /*
   * The last published contract whose two bindings had never been compared. Six signatures, and the
   * page window is COMPUTED rather than authored: `repeatComputed` is what makes the emitted nav
   * agree with React's about which pages are visible.
   */
  {
    name: "table-pager/page-two-of-nine",
    enhanced: true,
    tree: {
      contract: "table-pager",
      signature: "TablePager",
      options: { page: 2, pageSize: 10, siblings: 1 },
      children: [
        {
          contract: "table-pager",
          signature: "TablePagerBar",
          children: [
            {
              contract: "table-pager",
              signature: "TablePagerSize",
              /* The rows-per-page control. A native select: the browser owns the keyboard and the
                 form, and the pager only owns the box around it. */
              children: {
                contract: "select",
                signature: "Select.native",
                attrs: { "aria-label": "Filas por página" },
                slots: {
                  items: [
                    { options: { value: "10" }, slots: { label: "10" } },
                    { options: { value: "25" }, slots: { label: "25" } },
                  ],
                },
              },
            },
            {
              contract: "table-pager",
              signature: "TablePagerEnd",
              children: [
                { contract: "table-pager", signature: "TablePagerStatus", children: "11–20 de 90" },
                { contract: "table-pager", signature: "TablePagerNav" },
              ],
            },
          ],
        },
      ],
    },
  },
  /*
   * Two faces, `current` set: the copy-to-clipboard shape, minus the click behavior. A consumer's
   * own script now owns that, this only proves the anatomy both bindings agree on.
   */
  {
    name: "icon-state-button/copy-idle",
    enhanced: false,
    tree: {
      contract: "icon-state-button",
      signature: "IconStateButton",
      options: { current: "idle" },
      // The contract itself has no `label`/`aria-label` option (decision 33: genuinely no opinion
      // about behavior or naming, both are the consumer's). This is the consumer's own, the same
      // way a real one (CopyButton.astro's script, say) would author it.
      attrs: { "aria-label": "Copiar" },
      slots: {
        faces: [
          { options: { name: "idle", icon: "copy" }, slots: {} },
          { options: { name: "copied", icon: "check" }, slots: {} },
        ],
      },
    },
  },
  /** Three faces, so the same anatomy proves it is not hardcoded to two. */
  {
    name: "icon-state-button/theme-light",
    enhanced: false,
    tree: {
      contract: "icon-state-button",
      signature: "IconStateButton",
      options: { current: "light" },
      attrs: { "aria-label": "Modo: claro" },
      slots: {
        faces: [
          { options: { name: "system", icon: "mode-system" }, slots: {} },
          { options: { name: "light", icon: "mode-light" }, slots: {} },
          { options: { name: "dark", icon: "mode-dark" }, slots: {} },
        ],
      },
    },
  },
  /** `current` absent: no face carries `data-active` at all. */
  {
    name: "icon-state-button/no-current",
    enhanced: false,
    tree: {
      contract: "icon-state-button",
      signature: "IconStateButton",
      attrs: { "aria-label": "Copiar" },
      slots: {
        faces: [
          { options: { name: "idle", icon: "copy" }, slots: {} },
          { options: { name: "copied", icon: "check" }, slots: {} },
        ],
      },
    },
  },
  /** A literal inside a sentence: the signature the accordion prose had to do without. */
  {
    name: "typography/code-in-a-sentence",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Text",
      children: [
        "El healthcheck pega a ",
        { contract: "typography", signature: "Code", children: "/status" },
        " cada diez segundos.",
      ],
    },
  },
  /* Behaviour the browser owns entirely: no enhancer, no machine, nothing to anchor. */
  {
    name: "dialog/confirm",
    enhanced: false,
    tree: {
      contract: "dialog",
      signature: "Dialog",
      options: { open: true },
      slots: {
        title: "Borrar el despliegue",
        children: "Esto quita las tres réplicas y no se puede deshacer.",
      },
    },
  },
  /*
   * The same `<dialog>` opting into Dialog Vaul: the handle only exists because `vaul` is on, and
   * `data-edge="block-end"` only exists because the pattern only ever slides from the bottom; both
   * are what `attrsWhen`/`whenGiven` in the contract are there to prove hold for both bindings.
   */
  {
    name: "dialog/vaul",
    enhanced: true,
    tree: {
      contract: "dialog",
      signature: "Dialog",
      options: { open: true, vaul: true },
      slots: {
        title: "Filtros",
        children: "El mismo dialog, como hoja desde abajo en móvil.",
      },
    },
  },
  /* A composition, not a component with a list: both halves are real signatures, `action` a
   * Button.action and `menu` a Menu. Split-button.ts's own contract, since ae244c7. */
  {
    name: "split-button/save-and-more",
    enhanced: true,
    tree: {
      contract: "split-button",
      signature: "SplitButton",
      slots: {
        action: {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent", weldEnd: true },
          slots: { children: "Guardar" },
        },
        menu: {
          contract: "menu",
          signature: "Menu",
          options: {
            label: "Otras formas de guardar",
            triggerLabel: "Más",
            triggerVariant: "accent",
            triggerIconOnly: true,
            triggerWeldStart: true,
          },
          slots: {
            items: [
              { options: { value: "copy" }, slots: { label: "Guardar una copia" } },
              { options: { value: "template" }, slots: { label: "Guardar como plantilla" } },
            ],
          },
        },
      },
    },
  },
  /*
   * The silhouette is MEASURED, so this is the tree that proves the two bindings draw one shape: a
   * real browser lays both out, each binding calls `folderPath` with what it measured, and the gate
   * compares the resulting `d` attribute like any other. A difference of one pixel in either
   * measurement shows up here as a different string.
   */
  {
    name: "folder/one",
    enhanced: true,
    tree: {
      contract: "folder",
      signature: "Folder",
      options: {},
      slots: {
        label: { contract: "typography", signature: "Heading", options: { headingSize: "h2", flush: true }, children: "Radio" },
        children: { contract: "typography", signature: "Text", options: { size: "sm" }, children: "Una radio personal." },
      },
    },
  },
  /* The default use: a stack, invisible at rest in both bindings until something reaches into it. */
  {
    name: "folder/stack",
    enhanced: true,
    tree: {
      contract: "folder",
      signature: "FolderStack",
      options: { overlap: "100px" },
      slots: {
        children: [
          {
            contract: "folder",
            signature: "FolderLink",
            options: { href: "#radio" },
            slots: {
              label: { contract: "typography", signature: "Heading", options: { headingSize: "h2", flush: true }, children: "Radio" },
              children: { contract: "typography", signature: "Text", options: { size: "sm" }, children: "Una radio personal." },
              /* A Box rather than the `ImageFrame` the docs use: a canonical tree must not reach the
               * network, and what this proves is that both bindings place a preview identically. */
              previews: [
                {
                  contract: "folder",
                  signature: "FolderPreview",
                  slots: { children: { contract: "box", signature: "Box", options: { surface: "raised", padding: "md" }, slots: { children: "1" } } },
                },
                {
                  contract: "folder",
                  signature: "FolderPreview",
                  slots: { children: { contract: "box", signature: "Box", options: { surface: "raised", padding: "md" }, slots: { children: "2" } } },
                },
              ],
            },
          },
          {
            contract: "folder",
            signature: "FolderLink",
            options: { href: "#printer" },
            slots: {
              label: { contract: "typography", signature: "Heading", options: { headingSize: "h2", flush: true }, children: "Printer" },
              children: { contract: "typography", signature: "Text", options: { size: "sm" }, children: "Impresión instantánea." },
            },
          },
        ],
      },
    },
  },
  /* No enhancer at all: the browser owns light-dismiss, Escape and the top layer. */
  {
    name: "popover/on-a-trigger",
    enhanced: false,
    tree: {
      contract: "popover",
      signature: "Popover",
      options: { panelId: "demo-popover", arrow: true },
      slots: {
        trigger: "Detalles del plan",
        title: "Plan Pro",
        description: "Facturación mensual",
        children: "Incluye seis réplicas y soporte en horario hábil.",
      },
    },
  },
  /* Open but not yet searched: the list is empty in BOTH bindings until something is typed. */
  {
    name: "command-palette/open",
    enhanced: true,
    tree: {
      contract: "command-palette",
      signature: "CommandPalette",
      options: { label: "Buscar", paletteId: "demo-palette", open: true },
    },
  },
  /*
   * No real headings on this page, so the scroll-spy's own `IntersectionObserver` finds nothing to
   * observe and never writes: what is compared is the seeded `current`, identical in both bindings
   * whether or not the machine ever runs.
   */
  {
    name: "toc/nested",
    enhanced: true,
    tree: {
      contract: "toc",
      signature: "Toc",
      options: { title: "En esta página" },
      slots: {
        items: [
          { options: { href: "#resumen", current: true }, slots: { children: "Resumen" } },
          {
            options: { href: "#detalle", level: "h3" },
            slots: {
              children: "Detalle",
              icon: { contract: "icon", signature: "Icon", options: { name: "info", size: "sm" } },
            },
          },
        ],
      },
    },
  },
  /*
   * The first thing on a page and the only case here whose rendered state is "invisible". That is
   * the point of running it through the gates anyway: hidden must mean CLIPPED, never removed, so
   * the a11y gate can see a link with an accessible name and the symmetry gate can prove both
   * bindings produce the same reachable anchor. A `display: none` regression would fail here rather
   * than in production, where nobody sees a skip link either way.
   */
  {
    name: "skip-link/to-content",
    enhanced: false,
    tree: {
      contract: "skip-link",
      signature: "SkipLink",
      options: { href: "#main-content" },
      children: "Ir al contenido",
    },
  },
  /* The chrome, not the highlighting: Shiki runs where the code is made, never in the browser. */
  {
    name: "code-preview/collapsible",
    enhanced: true,
    tree: {
      contract: "code-preview",
      signature: "CodePreview",
      options: { collapsible: true, lines: "48", previewLines: "8" },
      slots: { label: "vite.config.ts", children: "export default defineConfig({})" },
    },
  },
  /* The portable half of this site's own preview frame: a titled stage plus its source, composed
   * from an already-published signature rather than reimplemented. */
  {
    name: "component-preview/bare",
    enhanced: false,
    tree: {
      contract: "component-preview",
      signature: "ComponentPreview.bare",
      slots: {
        title: "Botón de acento",
        stage: {
          contract: "button",
          signature: "Button.action",
          options: { tone: "accent" },
          children: "Guardar",
        },
        code: {
          contract: "code-preview",
          signature: "CodePreview",
          slots: { children: "<button class=\"sk-button\" data-variant=\"accent\">Guardar</button>" },
        },
      },
    },
  },
  /* The same component with less anatomy: what the docs call "popup". */
  {
    name: "popover/bare",
    enhanced: false,
    tree: {
      contract: "popover",
      signature: "Popover.bare",
      options: { panelId: "filters-popup", bare: true },
      slots: { trigger: "Filtros", children: "Cualquier cosa cabe acá." },
    },
  },
  /* Two panels and a switch: a second anatomy, not a flag on the first. */
  {
    name: "code-preview/density",
    enhanced: true,
    tree: {
      contract: "code-preview",
      signature: "CodePreview.density",
      options: { switchLabel: "Mostrar la versión completa" },
      slots: {
        label: "vite.config.ts",
        condensedLabel: "Condensado",
        fullLabel: "Completo",
        condensed: "export default defineConfig({})",
        full: "import { defineConfig } from 'vite';",
      },
    },
  },
  /* The no-JS layer: a real <input type="date"> inside the same field chrome. */
  {
    name: "date-picker/native",
    enhanced: false,
    tree: {
      contract: "date-picker",
      signature: "DatePicker.native",
      options: { name: "arrival", locale: "es-DO" },
      slots: { label: "Reserva" },
    },
  },
  /* The browser's own accordion: siblings sharing a name keep one open, with no script. */
  {
    name: "details/exclusive-group",
    enhanced: false,
    tree: {
      contract: "details",
      signature: "DetailsGroup",
      attrs: { "aria-label": "Configuración de despliegue" },
      children: [
        {
          contract: "details",
          signature: "Details",
          options: { name: "deployment" },
          children: [
            { contract: "details", signature: "Details.Summary", children: "Runtime" },
            { contract: "details", signature: "Details.Content", children: "Node 24 sobre el pool compartido." },
          ],
        },
        {
          contract: "details",
          signature: "Details",
          options: { name: "deployment" },
          children: [
            { contract: "details", signature: "Details.Summary", children: "Rollout" },
            { contract: "details", signature: "Details.Content", children: "Canary en tres tramos." },
          ],
        },
      ],
    },
  },
  /* A panel anchored to an edge: the modality is the platform's, the drag is the enhancer's. */
  {
    name: "vaul/edge-panel",
    enhanced: true,
    tree: {
      contract: "vaul",
      signature: "Vaul",
      options: { edge: "inline-start", open: true, label: "Navegación" },
      children: "Trabajo, Personal, Archivo",
    },
  },
  /* One modifier class away from the Vaul above, which is why it is a signature, not a family. */
  {
    name: "vaul/drawer",
    enhanced: true,
    tree: {
      contract: "vaul",
      signature: "Vaul.drawer",
      options: { edge: "inline-start", open: true, label: "Navegación" },
      children: "Trabajo, Personal, Archivo",
    },
  },
  /** A description on one row and not the other, so the conditional second line is compared too. */
  {
    name: "combobox/filterable",
    enhanced: true,
    tree: {
      contract: "combobox",
      signature: "Combobox",
      options: { name: "country", placeholder: "Buscar país" },
      slots: {
        label: "País",
        hint: "Escribí para filtrar la lista",
        items: [
          { options: { value: "cl" }, slots: { label: "Chile", description: "América del Sur" } },
          { options: { value: "mx" }, slots: { label: "México" } },
          { options: { value: "pt", disabled: true }, slots: { label: "Portugal" } },
        ],
      },
    },
  },
  /** A command, a checkbox, a separator and a submenu: the four item shapes, including the recursive one. */
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
          { options: { value: "divider", kind: "separator" }, slots: {} },
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
     * system ships no geometry, so the drawing cannot exist in the markup, and this is the gate that
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
     * so and this tree is the pair. The dismiss control is structure the contract owns, declared
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
     * The first COMPUTED collection: the tree says page 4 of 12, and the window (1 … 3 4 5 … 12)
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
     * trigger and the content are separate because each carries arbitrary markup: a slot would have
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
     * binding: React spells "only inside that one" as `Accordion.Item`, and the contract points at
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
            {
              contract: "accordion",
              signature: "Accordion.Trigger",
              /* Title, description and the disclosure mark: the composition all three accordion
               * demos are built on, and the one the chevron signature exists for. */
              children: [
                {
                  contract: "tile",
                  signature: "TileContent",
                  slots: { title: "¿Cuánto tarda el envío?", description: "Despachos y plazos" },
                },
                { contract: "tile", signature: "TileChevron" },
              ],
            },
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
     * and NEITHER binding's markup carries the pair: the id is generated at runtime, so both write
     * it themselves. G2 compares the relationship, which is the only part that has to hold.
     *
     * The resize handle is here for a second reason: it is the one part whose ARIA both bindings
     * COMPUTE rather than author. `aria-valuenow` starts at the contract's 50 and each binding
     * replaces it with the position it measured, so this case is what proves the two measurements
     * agree, and keeps agreeing.
     */
    name: "sidebar/collapsible-shell",
    enhanced: true,
    tree: {
      contract: "sidebar",
      signature: "Sidebar",
      /* A `styleProperty` option, which is the one mapping that lands in `style` rather than an
       * attribute: the emitter writes it into the markup and React assigns it through CSSOM, so
       * this is where the gate proves those two spellings of one declaration still compare equal. */
      options: { maxInlineSize: "18rem" },
      children: [
        {
          contract: "sidebar",
          signature: "SidebarResizeHandle",
          options: { label: "Cambiar el ancho de la barra" },
        },
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
     * same shape, three levels deep here. What G2 proves is that a template written once (named,
     * and pointed back at from inside) lands on the same DOM as React's recursive component.
     */
    name: "tree-view/nested-folders",
    enhanced: true,
    tree: {
      contract: "tree-view",
      signature: "TreeView",
      options: { label: "Archivos del proyecto" },
      slots: {
        branchIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "folder", size: "sm" },
        },
        leafIcon: {
          contract: "icon",
          signature: "Icon",
          options: { name: "file", size: "sm" },
        },
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
     * vocabulary: which knobs exist and what each one costs.
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
     * bindings meet differently (React renders it, the enhancer never renders markup), and the
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
     * carries is the shell, and what G2 proves is that two independent renderers of the same
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
     * A collection whose entries are whole surfaces. The `name` belongs to the GROUP: that is what
     * makes the choice exclusive, and the tile paint belongs to each option, which is why the root
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
     * The other control a FormField can wrap. Same six ids, same wiring, a different element: which is
     * the point: the field derives its ids from whatever signature is slotted into it, and never
     * asks what that is.
     */
    name: "input/textarea-in-a-form-field",
    enhanced: false,
    tree: {
      contract: "form-field",
      signature: "FormField",
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
     * it protects, so on its own it paints NOTHING, which is what the render gate caught the first
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
     * box to measure. What G2 and G4 CAN say is the whole point of it: that both bindings put the
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
  /*
   * ── Coverage gate additions ──────────────────────────────────────────────────────────────────
   *
   * `every published signature is reachable from a canonical tree` (rendered.spec.ts) found these
   * 31 signatures with no canonical tree anywhere. Some missing individually from an otherwise
   * covered family, four (menubar, data-grid, feed, treegrid) with no fixture at all. The same
   * class of gap the file's own header already names for select/menu/table-pager/tooltip, just not
   * caught until the check existed to catch it.
   */
  {
    name: "avatar/image",
    enhanced: false,
    tree: {
      contract: "avatar",
      signature: "Avatar.image",
      options: { imageName: "Foto de perfil de Ada Lovelace", src: SAMPLE_MEDIA },
    },
  },
  {
    name: "avatar/group",
    enhanced: false,
    tree: {
      contract: "avatar",
      signature: "AvatarGroup",
      options: { label: "Revisores" },
      slots: {
        children: [
          { contract: "avatar", signature: "Avatar.initials", options: { name: "Ada Lovelace" }, children: "AL" },
          { contract: "avatar", signature: "Avatar.initials", options: { name: "Grace Hopper" }, children: "GH" },
        ],
        overflow: "+3",
      },
    },
  },
  {
    name: "badge/dot",
    enhanced: false,
    tree: {
      contract: "badge",
      signature: "BadgeDot",
      options: { tone: "success", label: "En línea" },
    },
  },
  {
    // A control PLUS its badge, positioned as siblings: `of` lists both because a holder pairs
    // one (an avatar, a button) with one BadgeDot, not a list of either.
    name: "badge/holder",
    enhanced: false,
    tree: {
      contract: "badge",
      signature: "BadgeHolder",
      children: [
        { contract: "avatar", signature: "Avatar.initials", options: { name: "Ada Lovelace" }, children: "AL" },
        { contract: "badge", signature: "BadgeDot", options: { tone: "success", label: "En línea" } },
      ],
    },
  },
  {
    name: "layout/grid",
    enhanced: false,
    tree: {
      contract: "layout",
      signature: "LayoutGrid",
      children: { contract: "typography", signature: "Text", children: "Contenido con medida por defecto." },
    },
  },
  {
    // Also the only fixture for `list.ListItemPlain`: an ordered list's rows are the same three
    // item signatures a plain `List` takes, and this is the plain one.
    name: "list/ordered",
    enhanced: false,
    tree: {
      contract: "list",
      signature: "OrderedList",
      children: [
        { contract: "list", signature: "ListItemPlain", children: "Primero, crear la rama." },
        { contract: "list", signature: "ListItemPlain", children: "Segundo, abrir el PR." },
      ],
    },
  },
  {
    // `NativeInput` has no `label`/`aria-label` OPTION (it is the raw platform control, meant to
    // sit inside whatever gives it a name. A FormField, an authored sibling `<label>`); `attrs`
    // still reaches the host regardless, same as any consumer would supply one by hand.
    name: "input/native",
    enhanced: false,
    tree: {
      contract: "input",
      signature: "NativeInput",
      options: { type: "color", name: "accent" },
      attrs: { "aria-label": "Color de acento" },
    },
  },
  {
    /*
     * A blueprint, not a rendered toast: `<template>` content is inert, cloned by script per
     * notification, so this is the one Toast tree that never appears live as authored. Its
     * CLONE does, which `content/toast-region` already covers. What this proves is that both
     * bindings agree on the blueprint's own shape. Draws nothing for the same reason
     * `loader/status-only` does: template content is never part of the rendered tree.
     */
    name: "content/toast-template",
    enhanced: true,
    tree: {
      contract: "content",
      signature: "ToastTemplate",
      children: {
        contract: "content",
        signature: "Toast",
        options: { tone: "neutral", dismissible: true },
        slots: { title: "Nueva notificación" },
        children: "Contenido de ejemplo.",
      },
    },
  },
  {
    name: "slider/range",
    enhanced: true,
    tree: {
      contract: "slider",
      signature: "SliderRange",
      options: { lowValue: 20, highValue: 80, lowLabel: "Precio mínimo", highLabel: "Precio máximo" },
    },
  },
  {
    name: "typography/strong",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Strong",
      children: "importante",
    },
  },
  {
    name: "typography/output",
    enhanced: false,
    tree: {
      contract: "typography",
      signature: "Output",
      children: "42",
    },
  },
  {
    name: "meter/labelled",
    enhanced: true,
    tree: {
      contract: "meter",
      signature: "Meter",
      options: { value: 68, min: 0, max: 100, valueText: "68%", label: "Uso de disco" },
    },
  },
  {
    // One plain command, one dropdown: exercises MenubarItem's two shapes (`items` given or not).
    // The dropdown's `items` is Menu's OWN item shape now (decision: see `menubar.ts`'s header
    // comment in core). Same shape `menu/with-submenu` above exercises, not a second description.
    name: "menubar/with-dropdown",
    enhanced: true,
    tree: {
      contract: "menubar",
      signature: "Menubar",
      options: { label: "Barra de comandos" },
      children: [
        { contract: "menubar", signature: "MenubarItem", children: "Guardar" },
        {
          contract: "menubar",
          signature: "MenubarItem",
          slots: {
            children: "Archivo",
            items: [
              { options: { value: "open" }, slots: { label: "Abrir" } },
              { options: { value: "export" }, slots: { label: "Exportar" } },
            ],
          },
        },
      ],
    },
  },
  {
    // WAI's own layout-grid example: a row is a logical grouping, not necessarily one visual line.
    name: "data-grid/recipient-pills",
    enhanced: true,
    tree: {
      contract: "data-grid",
      signature: "DataGrid",
      options: { label: "Destinatarios" },
      children: {
        contract: "data-grid",
        signature: "DataGridRow",
        children: [
          { contract: "data-grid", signature: "DataGridCell", children: "ana@ejemplo.cl" },
          { contract: "data-grid", signature: "DataGridCell", children: "bruno@ejemplo.cl" },
        ],
      },
    },
  },
  {
    name: "feed/comments",
    enhanced: false,
    tree: {
      contract: "feed",
      signature: "Feed",
      options: { label: "Comentarios" },
      children: [
        {
          contract: "feed",
          signature: "FeedArticle",
          options: { posInset: 1, setSize: 2 },
          slots: { label: "Ana, hace 2 horas", children: "El deploy quedó bien, gracias por revisar." },
        },
        {
          contract: "feed",
          signature: "FeedArticle",
          options: { posInset: 2, setSize: 2 },
          slots: { label: "Bruno, hace 1 hora", children: "Encontré un caso borde en el filtro." },
        },
      ],
    },
  },
  /*
   * COMMENT THREAD, several trees for the same reason the contract is five signatures: the pieces
   * are meant to work apart, so a gate that only ever saw the full set would be evidence for exactly
   * one of the ways it ships. The composer is the one that has to hold a control it does not own.
   *
   * The single comment sits INSIDE a thread rather than at the top level: `Comment` declares
   * `parents`, so a bare one is a tree its own contract rejects, and the validity gate said so.
   */
  /*
   * The two signatures G2 had never compared, each unreachable for its own reason: a
   * `CommentTemplate` renders inert `<template>` content nobody composes by accident, and `Editor`
   * is the one field whose canonical shape nothing else nests.
   */
  {
    name: "comment-thread/template",
    enhanced: false,
    tree: {
      contract: "comment-thread",
      signature: "CommentTemplate",
      slots: {
        children: {
          contract: "comment-thread",
          signature: "Comment",
          slots: { author: "Ada", timestamp: "hace 3h", children: "Una respuesta que todavía no existe." },
        },
      },
    },
  },
  {
    name: "editor/field",
    enhanced: true,
    tree: {
      contract: "editor",
      signature: "Editor",
      options: { label: "Notas", placeholder: "Escribí algo", toolbarLabel: "Formato" },
    },
  },
  {
    name: "comment-thread/comment",
    enhanced: false,
    tree: {
      contract: "comment-thread",
      signature: "CommentThread",
      options: { label: "Comentarios" },
      slots: { children: {
      contract: "comment-thread",
      signature: "Comment",
      slots: {
        avatar: {
          contract: "avatar",
          signature: "Avatar.initials",
          options: { size: "sm", name: "Ada" },
          children: "Ad",
        },
        author: "Ada",
        timestamp: "hace 3h",
        children: "El deploy quedó bien, gracias por revisar.",
      },
    } },
    },
  },
  {
    name: "comment-thread/thread",
    enhanced: true,
    tree: {
      contract: "comment-thread",
      signature: "CommentThread",
      options: { label: "Comentarios" },
      slots: {
        /* The composer rides INSIDE the thread rather than as a tree of its own: its host is a
         * `<form>` and the stage wraps each binding in one, so a standalone tree renders form-in-
         * form. Nested here it is exercised the way a consumer nests it anyway, and G2 gets to
         * compare the signature instead of never having seen it. */
        composer: {
          contract: "comment-thread",
          signature: "CommentComposer",
          children: {
            contract: "form-field",
            signature: "FormField",
            slots: { label: "Comentario" },
            children: { contract: "input", signature: "Textarea" },
          },
        },
        children: {
          contract: "comment-thread",
          signature: "Comment",
          options: { commentId: "c1", collapsible: true },
          slots: {
            avatar: {
              contract: "avatar",
              signature: "Avatar.initials",
              options: { size: "sm", name: "Ada" },
              children: "Ad",
            },
            author: "Ada",
            timestamp: "hace 3h",
            children: "El deploy quedó bien, gracias por revisar.",
            actions: {
              contract: "comment-thread",
              signature: "CommentActions",
              options: { reply: true, deletable: true },
              slots: {
                children: {
                  contract: "comment-thread",
                  signature: "CommentVote",
                  options: { voted: "up" },
                  slots: { count: "4" },
                },
              },
            },
            /* A per-comment reply box, so the gates exercise the composer where a consumer actually
             * puts one and not only at thread level. */
            replyComposer: {
              contract: "comment-thread",
              signature: "CommentComposer",
              options: { cancellable: true },
              children: {
                contract: "form-field",
                signature: "FormField",
                options: { labelHidden: true },
                slots: { label: "Respuesta" },
                children: { contract: "input", signature: "Textarea" },
              },
            },
            replies: [
              {
                contract: "comment-thread",
                signature: "Comment",
                options: { commentId: "c1-r1" },
                slots: {
                  avatar: {
                    contract: "avatar",
                    signature: "Avatar.initials",
                    options: { size: "sm", name: "Bruno" },
                    children: "Br",
                  },
                  author: "Bruno",
                  timestamp: "hace 1h",
                  children: "Encontré un caso borde en el filtro.",
                },
              },
              {
                contract: "comment-thread",
                signature: "Comment",
                options: { commentId: "c1-r2" },
                slots: {
                  avatar: {
                    contract: "avatar",
                    signature: "Avatar.initials",
                    options: { size: "sm", name: "Carla" },
                    children: "Ca",
                  },
                  author: "Carla",
                  timestamp: "hace 20m",
                  children: "Lo reproduzco y lo dejo anotado.",
                },
              },
            ],
          },
        },
      },
    },
  },
  {
    /*
     * FLAT rows, `level`/`setSize`/`posInset` authored, never derived. The contract's own file
     * banner is explicit that a treegrid has no nesting structure of its own. "Documentos" is a
     * branch (authors `expanded`), "informe.pdf" is its child; "Fotos" is a second top-level
     * branch left collapsed, so this case exercises `expanded: false` too.
     */
    name: "treegrid/file-explorer",
    enhanced: true,
    tree: {
      contract: "treegrid",
      signature: "TreegridScroll",
      children: {
        contract: "treegrid",
        signature: "Treegrid",
        options: { label: "Archivos" },
        children: [
          {
            contract: "treegrid",
            signature: "TreegridHead",
            children: {
              contract: "treegrid",
              signature: "TreegridHeadRow",
              children: [
                { contract: "treegrid", signature: "TreegridColumnHeader", children: "Nombre" },
                { contract: "treegrid", signature: "TreegridColumnHeader", children: "Tamaño" },
              ],
            },
          },
          {
            contract: "treegrid",
            signature: "TreegridBody",
            children: [
              {
                contract: "treegrid",
                signature: "TreegridRow",
                options: { level: 1, setSize: 2, posInset: 1, expanded: true, value: "documentos" },
                children: [
                  { contract: "treegrid", signature: "TreegridCell", children: "Documentos" },
                  { contract: "treegrid", signature: "TreegridCell", children: "N/A" },
                ],
              },
              {
                contract: "treegrid",
                signature: "TreegridRow",
                options: { level: 2, setSize: 1, posInset: 1, value: "documentos/informe" },
                children: [
                  { contract: "treegrid", signature: "TreegridCell", children: "informe.pdf" },
                  { contract: "treegrid", signature: "TreegridCell", children: "2.1 MB" },
                ],
              },
              {
                contract: "treegrid",
                signature: "TreegridRow",
                options: { level: 1, setSize: 2, posInset: 2, expanded: false, value: "fotos" },
                children: [
                  { contract: "treegrid", signature: "TreegridCell", children: "Fotos" },
                  { contract: "treegrid", signature: "TreegridCell", children: "N/A" },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  {
    // The shell region: no options, children optional. An app shell can show chrome and a
    // deliberately empty work area before deciding what goes there, so a heading is content here,
    // not a requirement of the signature.
    name: "layout/main",
    enhanced: false,
    tree: {
      contract: "layout",
      signature: "Main",
      children: {
        contract: "typography",
        signature: "Heading",
        options: { headingSize: "h2" },
        children: "Panel",
      },
    },
  },
  {
    /*
     * One trigger, one column: `MegamenuTrigger`'s `columns` slot takes the same `NavListGroup` a
     * sidebar or navbar already builds with (`nav-list.ts`). Proven live by this very case, which
     * needed `NavListGroup.parents` to learn `MegamenuTrigger` as a third legal home (see that
     * signature's own comment). `enhanced`: the trigger's `aria-expanded` and the panel's anchored
     * positioning are both machine-driven, same as Menu.
     */
    name: "megamenu/product",
    enhanced: true,
    tree: {
      contract: "megamenu",
      signature: "Megamenu",
      options: { label: "Producto" },
      children: [
        {
          contract: "megamenu",
          signature: "MegamenuTrigger",
          children: "Soluciones",
          slots: {
            columns: [
              {
                contract: "nav-list",
                signature: "NavListGroup",
                options: { heading: true },
                slots: { label: "Producto" },
                children: [
                  { contract: "nav-list", signature: "NavListLink", options: { href: "/precios" }, children: "Precios" },
                  {
                    contract: "nav-list",
                    signature: "NavListLink",
                    options: { href: "/integraciones" },
                    children: "Integraciones",
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  },

  /*
   * BackToTop, Hero, Footer, ColorPicker (all three signatures): published contracts with NO
   * canonical-tree coverage until this entry - `rendered.spec.ts`'s "every published signature is
   * reachable from a canonical tree" was failing on exactly these six ids. This is the same gap
   * `chart` fell into for four days (2026-08-27 → 08-31): a contract can join `registry.ts`'s
   * catalogue and `render-tree.tsx`'s module map with no fixture ever exercising its React binding,
   * so a missing or broken render is caught only by luck, whenever some OTHER tree happens to touch
   * it. These six close that for the families that had it open.
   */
  {
    name: "back-to-top/default",
    enhanced: true,
    tree: { contract: "back-to-top", signature: "BackToTop", options: { threshold: 0 }, children: "Volver arriba" },
  },
  {
    name: "hero/basic",
    enhanced: false,
    tree: {
      contract: "hero",
      signature: "Hero",
      options: { align: "center", surface: "raised" },
      children: [
        {
          contract: "typography",
          signature: "Heading",
          options: { headingSize: "display-sm", flush: true },
          children: "Un sistema de diseño real",
        },
        {
          contract: "typography",
          signature: "Text",
          options: { tone: "secondary", size: "lg" },
          children: "Contratos, no componentes sueltos.",
        },
      ],
    },
  },
  {
    name: "footer/site",
    enhanced: false,
    tree: {
      contract: "footer",
      signature: "Footer",
      children: [
        {
          contract: "wrapper",
          signature: "Wrapper",
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "lg" },
              children: [
                {
                  contract: "layout",
                  signature: "Grid",
                  options: { columns: "2", gap: "lg" },
                  children: [
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "sm" },
                      children: [
                        { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: "Producto" },
                        { contract: "typography", signature: "Link", options: { href: "/componentes" }, children: "Componentes" },
                        { contract: "typography", signature: "Link", options: { href: "/changelog" }, children: "Changelog" },
                      ],
                    },
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "sm" },
                      children: [
                        { contract: "typography", signature: "Heading", options: { headingSize: "h5", flush: true }, children: "Legal" },
                        { contract: "typography", signature: "Link", options: { href: "/licencia" }, children: "Licencia" },
                      ],
                    },
                  ],
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { tone: "tertiary", size: "sm" },
                  children: "© skryensya/ui",
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    name: "color-picker/default",
    enhanced: true,
    tree: {
      contract: "color-picker",
      signature: "ColorPicker",
      options: { name: "brand", value: "#3366ff" },
      slots: { label: "Color de marca" },
    },
  },
  {
    name: "color-picker/compact",
    enhanced: true,
    tree: {
      contract: "color-picker",
      signature: "ColorPicker.compact",
      options: { name: "accent", value: "#22aabb" },
      slots: { label: "Acento" },
    },
  },
  {
    name: "color-picker/native",
    enhanced: true,
    tree: {
      contract: "color-picker",
      signature: "ColorPicker.native",
      options: { name: "bg", value: "#ffffff" },
      slots: { label: "Fondo" },
    },
  },
  /*
   * ANNOTATED is the one case here whose comparable output is MEASURED rather than authored: the
   * leaders' path data and each label's translate come out of the live layout, so this fixture is
   * asking a question no other one asks, which is whether the two bindings agree on a drawing.
   *
   * They can, and the stage is why: both halves are block-level children of the same `<section>`
   * (harness/main.tsx), so they lay out at the same width over the same content, and everything the
   * bindings write is rounded to whole pixels on the way out (`placeAnnotations`) so a half-pixel of
   * subpixel noise cannot read as a divergence. Three labels on three different sides, because the
   * gutters are where the geometry differs.
   */
  {
    name: "annotation/anatomy",
    enhanced: true,
    tree: {
      contract: "annotation",
      signature: "Annotated",
      options: { label: "Anatomía de Stat", inert: true },
      slots: {
        subject: {
          contract: "stat",
          signature: "Stat",
          slots: { label: "Ingresos", value: "38.2K" },
        },
        items: [
          {
            options: { for: ".sk-stat", side: "block-start" },
            slots: { children: "sk-stat" },
          },
          {
            options: { for: ".sk-stat__label", side: "inline-start" },
            slots: { children: "sk-stat__label" },
          },
          {
            options: { for: ".sk-stat__value", side: "inline-end" },
            slots: { children: "sk-stat__value" },
          },
        ],
      },
    },
  },
];

/*
 * The recipes, as gate cases.
 *
 * DERIVED, not copied. A recipe is already a usage tree per state, and the gates already know how to
 * render, diff and photograph a usage tree, so writing them out again here would be the duplication
 * this whole system argues against, and the copy would be the one that goes stale.
 *
 * They earn their place because a recipe exercises what a single-signature fixture cannot: a FormField
 * inside a Stack inside a shell, a Toast inside its region, a Callout whose actions are two buttons.
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
