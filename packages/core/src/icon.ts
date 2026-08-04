import type { ComponentContract } from "./contract.js";
/*
 * El contrato de iconos. Tipos y vocabulario, ni geometría, ni DOM, ni dependencias.
 *
 * Core nombra ROLES y nunca a un proveedor (decisión 2). "chevron-down" es una posición que el
 * sistema referencia; qué dibujo la ocupa lo decide el consumidor al enlazar un IconSet, exactamente
 * como una marca decide qué hue ocupa --ramp-accent-600. Un módulo de core llamado `lucide` sería un
 * inquilino con nombre propio, y además rompería las dependencies vacías del paquete.
 *
 * Lo que NO está aquí, y por qué (decisión 15):
 *   - providers con hasIcon/getIcon, un servicio de runtime necesita el catálogo entero en
 *     memoria, que es justo lo que el allowlist decía evitar. Un set es un índice, no un servicio.
 *   - generadores de manifiesto y de tipos, el objeto literal del consumidor ES el manifiesto, y
 *     `satisfies` da el mismo error que darían los tipos generados. Eliminar código muerto es
 *     trabajo del bundler.
 */

/**
 * Geometría SVG normalizada: los hijos de un `<svg>`, sin el elemento.
 *
 * El binding escribe el `<svg>` (viewBox, a11y, clase); el set aporta solo lo que va adentro. Esa
 * división es la que mantiene la accesibilidad y el nombre de la clase fuera del alcance del set.
 */
export type IconData = {
  /**
   * Markup hijo del `<svg>`. CONFIABLE: autorado en el proyecto o generado en build, nunca de un
   * usuario ni de una API, el renderer lo inyecta sin sanitizar. Ver el costo dicho en la decisión 15.
   */
  body: string;
  /**
   * El viewBox literal en que se dibujó `body`. Nunca un tamaño renderizado, eso lo decide
   * `--sk-icon-size`.
   *
   * Es un string y no un par width/height porque un viewBox no siempre arranca en `0 0`: Material
   * dibuja en `0 -960 960 960`. Guardar dos números y armar `0 0 w h` era una codificación con
   * pérdida que funcionaba solo por casualidad, mientras los únicos sets fueran Lucide (`0 0 24 24`)
   * y Phosphor (`0 0 256 256`).
   */
  viewBox: string;
  /**
   * Atributos de presentación para el `<svg>` externo. Aquí vive la intención de la geometría: un set
   * de contorno pone `{ fill: "none", stroke: "currentColor", "stroke-width": "2" }` y uno sólido
   * pone `{ fill: "currentColor" }`.
   *
   * Es del set y no del CSS a propósito: una declaración CSS le gana a un atributo de presentación,
   * así que un `fill: currentColor` en patterns/icon.css volvería sólido todo set de contorno.
   */
  attrs?: Readonly<Record<string, string>>;
};

/**
 * El vocabulario estable: los roles que el sistema referencia y que sobreviven a un cambio de set.
 *
 * Cubre los casos más usados de una app, no solo lo que consumen los componentes fundacionales: un
 * vocabulario que solo llegara hasta `chevron-down` obligaría a cada proyecto a re-declarar `search`
 * o `delete` como icono propio, y entonces el nombre del rol más común del sistema sería distinto en
 * cada app, que es exactamente lo que un vocabulario estable existe para impedir.
 *
 * Todo nombre aquí es un ROL, nunca un dibujo (decisión 2, un tier más arriba). Por eso `delete` y no
 * `trash`, `edit` y no `pencil`, `search` y no `magnifying-glass`, `more` y no `dots`, `visibility` y
 * no `eye`: el nombre tiene que seguir siendo verdad cuando otro set dibuje el rol distinto. Los
 * `chevron-*` y `arrow-*` son la excepción consciente, nombran una dirección, y la distinción entre
 * los dos (chevron revela, arrow mueve) no tiene otro nombre corto.
 *
 * `danger`, no `error`: el sistema ya dice danger en --color-text-danger, --color-action-danger y
 * BadgeTone, y una palabra no coexiste con su sinónimo.
 *
 * El límite sigue siendo el mismo: un concepto de PRODUCTO (invoice, warehouse, airplane-tilt) no
 * entra por más usado que sea en una app, se pasa como `data` y es del consumidor. Y cada nombre aquí
 * es una obligación para todo autor de set, porque IconSet es completo: agregar uno es aditivo para
 * el consumidor y trabajo nuevo para quien dibuja.
 */
export const stableIconNames = [
  // dirección, chevron revela y adjunta, arrow mueve y navega
  "chevron-up",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "arrow-up",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "external-link",

  // acción
  "add",
  "remove",
  "close",
  "check",
  "search",
  "edit",
  "delete",
  "copy",
  "filter",
  "refresh",
  "more",
  "menu",

  // estado, los cuatro tonos que el sistema ya nombra
  "info",
  "success",
  "warning",
  "danger",

  // contenido y sistema
  "calendar",
  "clock",
  "upload",
  "download",
  "settings",
  "user",
  "visibility",
  "visibility-off",

  // modo de color (caras del ThemeToggle)
  "mode-system",
  "mode-light",
  "mode-dark",

  /* clase de pantalla. Es un ROL igual que los demás: nombra el TAMAÑO de pantalla, no el aparato
   * dibujado. Un set puede dibujar `screen-desktop` como monitor o como laptop y `screen-mobile`
   * como teléfono o como mano con teléfono, y los tres nombres siguen siendo verdad. Por eso
   * `screen-desktop` y no `monitor`, que sería el dibujo, exactamente como `delete` y no `trash`.
   *
   * `screen-desktop` NO es sinónimo de `mode-system`, aunque Lucide y Phosphor dibujen los dos como
   * un monitor: uno dice "el modo lo decide el sistema" y el otro "pantalla grande". Dos roles que
   * hoy comparten dibujo siguen siendo dos roles, y un set puede separarlos mañana. */
  "screen-desktop",
  "screen-tablet",
  "screen-mobile",
] as const;

export type StableIconName = (typeof stableIconNames)[number];

/**
 * El enlace de cada rol a una geometría, un set de iconos es una marca.
 *
 * Completo, no parcial: un set que no cubre el vocabulario deja a un componente fundacional sin su
 * icono en runtime, igual que una marca a la que le falta una posición de ramp deja un color roto.
 *
 * Core no envía ninguno, y no puede: un set real viene de una librería externa, y las dependencies
 * de @skryensya/core están vacías a propósito. Los sets viven en paquetes aparte, 
 * `@skryensya/icons-lucide`, `@skryensya/icons-phosphor`, `@skryensya/icons-material`, que es la salida
 * que la decisión 15 ya había anticipado: aditiva, y sin que core nombre a un inquilino.
 */
export type IconSet = Readonly<Record<StableIconName, IconData>>;

/**
 * Los tres tamaños del pattern, que el renderer escribe como `data-size`.
 *
 * No hay escotilla numérica: un tamaño arbitrario se pide redeclarando el hook, que es como se piden
 * todos los valores arbitrarios del sistema, `.hero .sk-icon { --sk-icon-size: 2rem; }`. Una prop
 * numérica que escribiera width/height perdería igual contra el inline-size del CSS.
 */
export type IconSize = "sm" | "md" | "lg";

/**
 * The icon "box", the `<svg>` the binding writes around a set's geometry, computed ONCE, as data.
 *
 * The same contract was being encoded four times: React's `<Icon>`, vanilla's `buildIcon`, and the
 * docs' `iconMarkup`/`iconDataMarkup`. The rules that matter, the box always owns the class, the
 * viewBox, the size and the accessibility, so a set can never override them; a set's `attrs` supply
 * fill/stroke and nothing else; a label turns a decorative icon into content, lived in only one of
 * the four (vanilla). This centralises them so every renderer stays a thin adapter to its own output
 * target (JSX, a DOM node, a string): pure data in, two ordered attribute groups plus the body out.
 *
 * `presentation` is the set's own attrs (fill/stroke/…), with any box-owned key stripped out so a set
 * can't seize the viewBox or accessibility. `box` is what the binding owns, and it comes LAST at every
 * call site so it wins. An adapter that also carries consumer attributes (React's `{...props}`,
 * vanilla's authored attributes) places them BETWEEN the two groups, after presentation, so they may
 * override fill/stroke; before box, so they never override the contract.
 */
export type RenderIconBoxInput = {
  /** The geometry to wrap. */
  icon: IconData;
  /** Written as `data-icon`; omit to skip it (React re-renders on context change and needs no marker). */
  dataIcon?: string;
  /** Emitted as `data-size` only when provided. React defaults to `"md"`, so it is always present there. */
  size?: IconSize;
  /**
   * The accessible name. `undefined`/`null` → decorative (`aria-hidden`). Any string, INCLUDING the
   * empty string, → content (`role="img"` + `aria-label`), matching an authored `data-sk-icon-label=""`.
   */
  label?: string | null;
  /** Extra classes beyond `sk-icon`, already joined. `sk-icon` is always present and always first. */
  className?: string;
};

/** The resolved box: two ordered attribute groups (set-owned, then box-owned) and the inner geometry. */
export type IconBox = {
  presentation: [string, string][];
  box: [string, string][];
  body: string;
};

/** The attributes the box owns outright, a set that names one of these in `attrs` is ignored. */
const BOX_OWNED = new Set([
  "class",
  "viewbox",
  "data-icon",
  "data-size",
  "aria-hidden",
  "aria-label",
  "role",
  "focusable",
]);

export function renderIconBox({ icon, dataIcon, size, label, className }: RenderIconBoxInput): IconBox {
  const presentation = Object.entries(icon.attrs ?? {}).filter(([k]) => !BOX_OWNED.has(k.toLowerCase()));

  const box: [string, string][] = [];
  if (dataIcon !== undefined) box.push(["data-icon", dataIcon]);
  box.push(["class", className ? `sk-icon ${className}` : "sk-icon"]);
  if (size) box.push(["data-size", size]);
  // the viewBox is where the geometry was drawn, taken from the set as-is, never a rendered size, and
  // never `0 0 w h` (Material draws in "0 -960 960 960").
  box.push(["viewBox", icon.viewBox]);
  // a label makes the icon content; without one it is decorative. A control with text already names the
  // action, so decorative is the right default.
  if (label !== undefined && label !== null) {
    box.push(["role", "img"], ["aria-label", label]);
  } else {
    box.push(["aria-hidden", "true"]);
  }
  // an svg is not a tab stop; historic IE/Edge made it one and this is still the cure.
  box.push(["focusable", "false"]);

  return { presentation, box, body: icon.body };
}

/*
 * The contract. An icon is the clearest case of the two bindings meeting at different depths:
 * React renders the `<svg>` itself, while authored markup writes a PLACEHOLDER; `<span
 * data-sk-icon="delete">`; the enhancer replaces with the real element once a set is bound.
 *
 * They converge because both go through `renderIconBox` above: the same box attributes, the same
 * viewBox from the set, the same decorative-by-default accessibility. The placeholder is not a
 * lesser form, it is the only form authored markup can take; the system ships no geometry
 * (decision 15), so the drawing cannot exist until a set is chosen.
 *
 * `name` is a stable icon name, a ROLE the system names: `delete`, never `trash`.
 */
export const iconContract = {
  id: "icon",
  css: "@skryensya/core/patterns/icon.css",
  parts: { root: "sk-icon" },

  options: {
    /**
     * The stable name: a ROLE the system names, never the drawing. Constrained to the vocabulary
     * itself, so a name no set is obliged to draw fails validation instead of crashing at mount;
     * which is what `inbox` did the first time this contract was exercised.
     */
    name: { type: "enum", values: stableIconNames, attr: "data-sk-icon" },
    size: { type: "enum", values: ["sm", "md", "lg"], default: "md", attr: "data-sk-icon-size" },
    /**
     * The accessible name. Absent means decorative, which is the right default: a control with a
     * visible label already names itself, and a second name is noise.
     */
    label: { type: "string", attr: "data-sk-icon-label" },
  },

  signatures: {
    Icon: {
      intent: ["icon", "glyph", "pictogram", "decorative-mark"],
      host: { element: "span" },
      options: ["name", "size", "label"],
      requires: ["name"],
      slots: {},
      /*
       * The placeholder carries no part class: the class belongs to the `<svg>` the binding writes,
       * and a set never controls the class, the size or the accessibility (decision 15).
       */
      template: { element: "span", host: true },
      react: { from: "@skryensya/react/icon", name: "Icon" },
    },
  },
} as const satisfies ComponentContract;
