/*
 * Los iconos del sitio.
 *
 * El sitio no trae geometría propia: enlaza un set publicado, que es el camino que documenta. Lucide
 * es la elección del sitio, no la del sistema: core no nombra inquilinos (decisión 2), así que no hay
 * un set "oficial", hay tres publicados y tú eliges.
 *
 * Cambiar de set es cambiar la línea de abajo. Ningún call site se mueve, y eso es exactamente lo que
 * el vocabulario estable compra.
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";
import { lucideIcons } from "@skryensya/icons-lucide";
import { materialIcons } from "@skryensya/icons-material";
import { phosphorIcons } from "@skryensya/icons-phosphor";

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
    attrs: extraAttrs,
  }: { className?: string; attrs?: Readonly<Record<string, string>> } = {},
): string {
  return svgString(icon, name, { className, extraAttrs });
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

/* Lucide Sun / Moon / Monitor, docs chrome for the theme toggle, not stable roles. */
export const sun: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />`,
};

export const moon: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />`,
};

export const monitor: IconData = {
  viewBox: "0 0 24 24",
  attrs: strokeAttrs,
  body: `<rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" />`,
};

/* Contrast toggle glyphs, a two-state pair that cross-fades in place, like the theme toggle's
 * sun/moon: an empty ring for normal, and the same ring with its inner half filled for high, so the
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
