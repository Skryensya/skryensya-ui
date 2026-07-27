/*
 * Genera el set de Lucide desde la librería.
 *
 * POR QUÉ HAY CODEGEN AQUÍ Y NO EN EL MANIFIESTO. La decisión 15 rechazó el generador de manifiesto
 * porque el allowlist reimplementa el tree-shaking del bundler, bórrelo y el consumidor escribe un
 * objeto literal, sin que reaparezca complejidad. Este generador es otra cosa: convierte el formato
 * de la librería a IconData. Bórrelo y la complejidad SÍ reaparece, el consumidor parsea SVG en
 * runtime, o se ata a `?raw`, que es de Vite y no del ecosistema. Es el mismo test, cayendo distinto.
 *
 * Y el resultado paga dos veces: la librería queda como devDependency, así que el bundle del
 * consumidor recibe 32 iconos de datos y CERO runtime de Lucide.
 *
 * La shell (--check, el template emitido) la comparten los tres sets, vive en @skryensya/core/emit-icon-set.
 * Aquí queda sólo lo que varía: el MAP, los ATTRS, el header, y cómo se resuelve UN nombre a geometría.
 * Lucide es el adapter data-shaped: la librería entrega nodos, no archivos `.svg`, así que su `resolve`
 * serializa los hijos en vez de leer y extraer un archivo (que es lo que hacen Phosphor y Material).
 */
import { generateIconSet } from "@skryensya/core/emit-icon-set";
import { icons } from "lucide";

/* Rol del sistema → nombre de Lucide. Esta tabla es la única parte que un humano mantiene, y es
 * donde se ve que el rol es nuestro y el nombre es de ellos: `delete` es su `Trash2`. */
const MAP = {
  "chevron-up": "ChevronUp",
  "chevron-down": "ChevronDown",
  "chevron-left": "ChevronLeft",
  "chevron-right": "ChevronRight",
  "arrow-up": "ArrowUp",
  "arrow-down": "ArrowDown",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "external-link": "ExternalLink",
  add: "Plus",
  remove: "Minus",
  close: "X",
  check: "Check",
  search: "Search",
  edit: "Pencil",
  delete: "Trash2",
  copy: "Copy",
  filter: "Funnel",
  refresh: "RefreshCw",
  more: "Ellipsis",
  menu: "Menu",
  info: "Info",
  success: "CircleCheck",
  warning: "TriangleAlert",
  danger: "CircleX",
  calendar: "Calendar",
  upload: "Upload",
  download: "Download",
  settings: "Settings",
  user: "User",
  visibility: "Eye",
  "visibility-off": "EyeOff",
  "mode-system": "Monitor",
  "mode-light": "Sun",
  "mode-dark": "Moon",
  "screen-desktop": "Monitor",
  "screen-tablet": "Tablet",
  "screen-mobile": "Smartphone",
};

/* Los defaults del <svg> de Lucide. Van en attrs y no en el CSS porque una declaración CSS le gana a
 * un atributo de presentación: un `fill: currentColor` en patterns/icon.css volvería sólido todo
 * este set, que es de contorno. */
const ATTRS = {
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

const HEADER = `/*
 * GENERADO por scripts/generate.mjs, no editar a mano.
 *
 * Geometría de Lucide (ISC), redistribuida bajo su licencia. Ver LICENSE-lucide.
 */`;

/** Lucide entrega `[["path", {d}], ["circle", {...}]]`, datos, no markup. Serializamos los hijos. */
const toBody = (nodes) =>
  nodes
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(" ")} />`)
    .join("");

/** El adapter de Lucide: la geometría es data, y el viewBox de la librería es siempre `0 0 24 24`. */
const resolve = (name, role) => {
  const nodes = icons[name];
  if (!nodes) throw new Error(`Lucide no tiene "${name}" (rol "${role}"), ¿se renombró en un upgrade?`);
  return { viewBox: "0 0 24 24", body: toBody(nodes) };
};

generateIconSet({ dir: import.meta.dirname, label: "lucide", map: MAP, attrs: ATTRS, header: HEADER, resolve });
