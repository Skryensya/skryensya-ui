/*
 * Genera el set de Phosphor desde los assets de la librería.
 *
 * Phosphor no publica datos: publica archivos `.svg` (`assets/regular/*.svg`). Por eso aquí hay un
 * generador y en el manifiesto no, ver la decisión 15. El allowlist reimplementaba el tree-shaking
 * del bundler y no hacía nada; esto convierte un formato que ningún bundler convierte solo. Bórrelo
 * y el consumidor parsea SVG en runtime o se ata a `?raw`, que es de Vite. La complejidad reaparece,
 * así que la capa hace algo.
 *
 * La librería queda como devDependency: el bundle del consumidor recibe 32 iconos y nada más.
 *
 * La shell (--check, el template, la extracción del <svg>) la comparten los tres sets, vive en
 * @skryensya/core/emit-icon-set. Aquí queda sólo lo que varía: el MAP, los ATTRS, el header, y el spec
 * del asset. `resolve` corre en ESTE módulo a propósito: `import.meta.resolve` tiene que ver la
 * devDependency de Phosphor, que core no tiene.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateIconSet, extractSvgBody } from "@skryensya/core/emit-icon-set";

/* Rol del sistema → nombre de Phosphor. El rol es nuestro y el nombre es de ellos: `search` es su
 * `magnifying-glass`, y esa distancia es exactamente lo que el vocabulario estable compra. */
const MAP = {
  "chevron-up": "caret-up",
  "chevron-down": "caret-down",
  "chevron-left": "caret-left",
  "chevron-right": "caret-right",
  "arrow-up": "arrow-up",
  "arrow-down": "arrow-down",
  "arrow-left": "arrow-left",
  "arrow-right": "arrow-right",
  "external-link": "arrow-square-out",
  add: "plus",
  remove: "minus",
  close: "x",
  check: "check",
  search: "magnifying-glass",
  edit: "pencil-simple",
  delete: "trash",
  copy: "copy",
  filter: "funnel",
  refresh: "arrows-clockwise",
  "zoom-out": "magnifying-glass-minus",
  more: "dots-three",
  menu: "list",
  info: "info",
  success: "check-circle",
  warning: "warning",
  danger: "x-circle",
  calendar: "calendar",
  clock: "clock",
  upload: "upload",
  download: "download",
  file: "file",
  folder: "folder",
  settings: "gear",
  user: "user",
  visibility: "eye",
  "visibility-off": "eye-slash",
  "mode-system": "monitor",
  "mode-light": "sun",
  "mode-dark": "moon",
  "screen-desktop": "monitor",
  "screen-tablet": "device-tablet",
  "screen-mobile": "device-mobile",
};

/* Phosphor dibuja formas RELLENAS, no trazos, hasta el peso `regular`, que parece de contorno pero
 * son contornos rellenos. Sus SVG ya traen fill="currentColor" en la raíz; lo re-declaramos aquí
 * igual para que IconData sea explícito y no dependa de que el asset no cambie. */
const ATTRS = { fill: "currentColor" };

const WEIGHT = "regular";

const HEADER = `/*
 * GENERADO por scripts/generate.mjs, no editar a mano.
 *
 * Geometría de Phosphor Icons (MIT), peso "${WEIGHT}", redistribuida bajo su licencia.
 * Ver LICENSE-phosphor.
 */`;

/** El adapter de Phosphor: resolver el asset `.svg` de la devDependency y extraerle el cuerpo. */
const resolve = (name, role) => {
  const spec = `@phosphor-icons/core/assets/${WEIGHT}/${name}.svg`;
  let path;
  try {
    path = fileURLToPath(import.meta.resolve(spec));
  } catch {
    throw new Error(`Phosphor no tiene "${name}" (rol "${role}"), ¿se renombró en un upgrade?`);
  }
  return extractSvgBody(readFileSync(path, "utf8"), name);
};

generateIconSet({ dir: import.meta.dirname, label: "phosphor", map: MAP, attrs: ATTRS, header: HEADER, resolve });
