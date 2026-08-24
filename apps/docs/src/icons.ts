/*
 * Los iconos del sitio.
 *
 * El sitio no trae geometría propia: enlaza un set publicado, que es el camino que documenta. Lucide
 * es la elección del sitio, no la del sistema: core no nombra inquilinos (decisión 2), así que no hay
 * un set "oficial", hay tres publicados y tú eliges.
 *
 * Cambiar de set es cambiar las dos líneas de abajo. Ningún call site se mueve, y eso es exactamente
 * lo que el vocabulario estable compra.
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { materialIcons } from "@skryensya/icons-material";
import { phosphorIcons } from "@skryensya/icons-phosphor";

/*
 * EL SET Y SU ID SON EL MISMO HECHO, y por eso salen del mismo lugar.
 *
 * `siteIcons` es la geometría que el sitio serializa en build (`iconMarkup`); `siteIconSet` es el id
 * que el guard de Base re-pinta sobre `svg[data-icon]` antes del primer paint. Mientras los dos
 * dijeron cosas distintas (la geometría era Lucide, el guard pintaba Phosphor), cada icono del chrome
 * se escribía dos veces: salía Lucide en el HTML y el guard lo reemplazaba. Se veía como un icono que
 * CAMBIA al cargar, porque eso era. Con los dos alineados el guard queda idempotente.
 */
export const siteIconSet = "lucide";
export const siteIcons = lucideIcons;

/** Los tres sets publicados, para que la página los muestre lado a lado en vez de afirmar que existen. */
export const allSets: readonly { id: string; label: string; licence: string; set: IconSet }[] = [
  { id: "lucide", label: "Lucide", licence: "ISC", set: lucideIcons },
  { id: "phosphor", label: "Phosphor", licence: "MIT", set: phosphorIcons },
  { id: "material", label: "Material Symbols", licence: "Apache-2.0", set: materialIcons },
];

/*
 * El serializador del sitio: la única codificación string del markup contract, sobre `renderIconBox`.
 *
 * Esto NO lo envía el sistema (decisión 15): un consumidor de vanilla escribe el `<svg>` a mano, y lo
 * que el sistema documenta es exactamente esta forma. Aquí vive como helper del sitio, y las dos
 * entradas públicas, rol estable y geometría propia, son adapters de una línea sobre él, en vez de dos
 * plantillas de string que podían desincronizarse. La caja (clase, viewBox, tamaño, a11y, precedencia)
 * la calcula core; el sitio sólo la serializa a string.
 */
function svgString(
  icon: IconData,
  dataIcon: string,
  { size, className, extraAttrs }: { size?: IconSize; className?: string; extraAttrs?: Readonly<Record<string, string>> } = {},
): string {
  const { presentation, box, body } = renderIconBox({ icon, dataIcon, size, className });
  const serialize = (pairs: [string, string][]) => pairs.map(([k, v]) => `${k}="${v}"`).join(" ");
  // presentation, luego los attrs extra del consumidor (entre set y caja, como en los otros bindings),
  // y por último la caja, que gana.
  const attrs = [
    serialize(presentation),
    ...(extraAttrs ? [serialize(Object.entries(extraAttrs) as [string, string][])] : []),
    serialize(box),
  ].filter(Boolean);

  return `<svg ${attrs.join(" ")}>${body}</svg>`;
}

/**
 * El markup contract para un rol estable. Un icono es decorativo por defecto: en un trigger con texto,
 * el texto ya nombra la acción.
 */
export function iconMarkup(
  name: StableIconName,
  { className, size, set = siteIcons }: { className?: string; size?: IconSize; set?: IconSet } = {},
): string {
  return svgString(set[name], name, { size, className });
}

/**
 * Markup for geometría propia, same shape as `iconMarkup`, but the name is not a stable role, so
 * the site's icon-set swap leaves it alone (`applyIconSet` skips unknown `data-icon` keys).
 */
export function iconDataMarkup(
  name: string,
  icon: IconData,
  {
    className,
    size,
    attrs: extraAttrs,
  }: { className?: string; size?: IconSize; attrs?: Readonly<Record<string, string>> } = {},
): string {
  return svgString(icon, name, { size, className, extraAttrs });
}

const strokeAttrs = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/*
 * Un icono FUERA del set, lo único que es opt-in. No hay un SetIcon: esto es geometría que se pasa
 * como `data`, y el acoplamiento al proyecto es visible en el call site, que es el punto.
 */
export const sparkle: IconData = {
  viewBox: "0 0 24 24",
  attrs: { fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linejoin": "round" },
  body: `<path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" />`,
};

/* Four corners opening out: "ver en pantalla completa", not a device class. */
export const screenFullscreen: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M16 3h3a2 2 0 0 1 2 2v3" /><path d="M8 21H5a2 2 0 0 1-2-2v-3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" />`,
};


/* Lucide Sun / Moon / Monitor lived here for the docs theme toggle; they are now the stable
 * roles mode-light / mode-dark / mode-system in the published sets. */

/* Contrast toggle glyphs, a two-state pair that cross-fades in place:
 * an empty ring for normal, and the same ring with its inner half filled for high, so the
 * fill visibly appears the moment contrast turns on. The filled half uses currentColor while the ring
 * stays stroked. */
export const contrastNormal: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" />`,
};

export const contrastHigh: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" /><path d="M12 6a6 6 0 0 1 0 12z" fill="currentColor" stroke="none" />`,
};

/*
 * El selector de idioma del header. No es un rol estable, es geometría propia (decisión 15): un
 * conmutador de idioma es chrome de un sitio TRADUCIDO, no vocabulario del sistema, así que entra
 * por acá en vez de obligar a los tres sets publicados a dibujarlo, igual que play/pause abajo.
 *
 * Un globo con meridiano y ecuador, no una bandera: una bandera es un país y esto son idiomas -
 * la misma razón por la que el control anterior mostraba el código y no una bandera.
 */
export const language: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /><path d="M2 12h20" />`,
};

/* Transporte de reproducción para las muestras de /motion, otro par de dos estados que se
 * cruzan en el mismo hueco. No son roles estables: play/pause es vocabulario de un reproductor,
 * no del sistema, así que entra como geometría propia de la página (decisión 15) en vez de
 * obligar a los tres sets publicados a dibujarlo. */
export const play: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<polygon points="6 3 20 12 6 21 6 3" />`,
};

export const pause: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />`,
};
