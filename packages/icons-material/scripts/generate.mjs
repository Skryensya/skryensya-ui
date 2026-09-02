/*
 * Genera el set de Material Symbols desde los assets de la librería.
 *
 * Igual que Phosphor, Material no publica datos: publica archivos `.svg`. El porqué del codegen está
 * en la decisión 15, convierte un formato que ningún bundler convierte solo, así que pasa el test de
 * borrado que el generador de manifiesto no pasaba.
 *
 * Y este set es el que probó que IconData estaba mal: Material dibuja en `viewBox="0 -960 960 960"`,
 * que NO arranca en `0 0`. El par width/height original armaba `0 0 w h` y habría recortado cada
 * icono de este set. Lucide (0 0 24 24) y Phosphor (0 0 256 256) escondían el defecto.
 *
 * La shell (--check, el template, la extracción del <svg>) la comparten los tres sets, vive en
 * @skryensya/core/emit-icon-set. Aquí queda sólo lo que varía: el MAP, los ATTRS, el header, y el spec
 * del asset. `resolve` corre en ESTE módulo a propósito: `import.meta.resolve` tiene que ver la
 * devDependency de Material, que core no tiene.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { generateIconSet, extractSvgBody } from "@skryensya/core/emit-icon-set";

/* Rol del sistema → nombre de Material. Aquí la distancia es la más grande de los tres sets:
 * `arrow-left` es su `arrow_back`, `more` es `more_horiz`, `user` es `person`. Nada de eso se filtra
 * al call site, que es el punto. */
const MAP = {
  "chevron-up": "keyboard_arrow_up",
  "chevron-down": "keyboard_arrow_down",
  "chevron-left": "chevron_left",
  "chevron-right": "chevron_right",
  "arrow-up": "arrow_upward",
  "arrow-down": "arrow_downward",
  "arrow-left": "arrow_back",
  "arrow-right": "arrow_forward",
  "external-link": "open_in_new",
  add: "add",
  remove: "remove",
  close: "close",
  check: "check",
  search: "search",
  edit: "edit",
  delete: "delete",
  copy: "content_copy",
  filter: "filter_alt",
  refresh: "refresh",
  "zoom-out": "zoom_out",
  more: "more_horiz",
  menu: "menu",
  info: "info",
  success: "check_circle",
  warning: "warning",
  danger: "cancel",
  calendar: "calendar_today",
  clock: "schedule",
  upload: "upload",
  download: "download",
  file: "description",
  folder: "folder",
  settings: "settings",
  user: "person",
  language: "translate",
  visibility: "visibility",
  "visibility-off": "visibility_off",
  "mode-system": "monitor",
  "mode-light": "light_mode",
  "mode-dark": "dark_mode",
  "screen-desktop": "monitor",
  /* `tablet` / `mobile`, no `tablet_mac` / `phone_iphone`: Material ofrece los dos, y el que nombra
   * un vendor es el que envejece mal cuando el set cambie de estilo. */
  "screen-tablet": "tablet",
  "screen-mobile": "mobile",
};

/* Los assets de Material NO declaran fill: sus `<path>` heredarían el default del navegador, que es
 * negro, un icono que ignora el color de su contenedor y queda invisible en modo oscuro. Declararlo
 * aquí es lo que lo hace correcto en las ocho marcas y los dos modos. */
const ATTRS = { fill: "currentColor" };

const STYLE = "outlined";

const HEADER = `/*
 * GENERADO por scripts/generate.mjs, no editar a mano.
 *
 * Geometría de Material Symbols (Apache-2.0), estilo "${STYLE}", peso 400, redistribuida bajo su
 * licencia. Ver LICENSE-material.
 */`;

/** El adapter de Material: resolver el asset `.svg` de la devDependency y extraerle el cuerpo. */
const resolve = (name, role) => {
  const spec = `@material-symbols/svg-400/${STYLE}/${name}.svg`;
  let path;
  try {
    path = fileURLToPath(import.meta.resolve(spec));
  } catch {
    throw new Error(`Material no tiene "${name}" (rol "${role}"), ¿se renombró en un upgrade?`);
  }
  return extractSvgBody(readFileSync(path, "utf8"), name);
};

generateIconSet({ dir: import.meta.dirname, label: "material", map: MAP, attrs: ATTRS, header: HEADER, resolve });
