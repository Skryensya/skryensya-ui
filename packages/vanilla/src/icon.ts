/*
 * El enlazador de iconos de vanilla.
 *
 * ADR-15 dijo que vanilla no envía nada para iconos "porque un icono no tiene comportamiento que
 * hidratar", y para el `<svg>` escrito a mano sigue siendo cierto. Pero el mismo ADR define un
 * placeholder, `<svg class="sk-icon" data-icon="…">` sin geometría, que ALGO tiene que rellenar con
 * el set enlazado; en el sitio eso lo hacía código propio del docs. `mountIcons` sube ese enlace a la
 * capa vanilla, con paridad al `<Icon name>` de React: React inyecta `icon.body` del set por contexto;
 * aquí el autor escribe un placeholder con el NOMBRE del rol y el enlazador inyecta la geometría del set
 * que le pasas. No renderiza estructura propia ni inventa clases, sólo ocupa el rol con una marca,
 * que es exactamente lo que un set de iconos es (ADR-15).
 *
 * Uso:
 *
 *   <span data-sk-icon="arrow-up"></span>
 *
 *   import { mountIcons } from "@skryensya/vanilla/icon";
 *   import { lucideIcons } from "@skryensya/icons-lucide";
 *   mountIcons(document, lucideIcons);
 *
 * El `<span>` se reemplaza por el mismo `<svg class="sk-icon" data-icon="arrow-up" viewBox…>` que
 * escribirías a mano o que emite React. Como el resultado lleva `data-icon` (no `data-sk-icon`), es
 * idempotente, volver a llamar no toca lo ya hidratado, y sigue siendo compatible con un swap de set
 * posterior sobre `svg[data-icon]`.
 *
 * El set es SIEMPRE explícito: no hay un default de módulo. Para dos sets en una misma página, hidrata
 * cada subárbol con su set (el primero en correr gana el nodo, así que hidrata el subárbol especial
 * ANTES que el documento).
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";

const SVG_NS = "http://www.w3.org/2000/svg";
const placeholderSelector = "[data-sk-icon]";

/**
 * Reemplaza cada placeholder `[data-sk-icon="<rol>"]` dentro de `root` (incluido `root` si él mismo lo
 * es) por el `<svg class="sk-icon">` del rol en `set`. Devuelve cuántos hidrató.
 *
 * Un `data-sk-icon` que el set no cubre se deja intacto (es geometría del proyecto, que se escribe como
 * `<svg>` a mano, ADR-15) y se avisa una vez por nombre, porque casi siempre es un typo del rol.
 *
 * Remembers `set` so enhancers that inject placeholders later (e.g. table pager) can call
 * `remountIcons` without the app passing the set again.
 */
let lastSet: IconSet | undefined;

export function mountIcons(root: ParentNode, set: IconSet): number {
  lastSet = set;
  let mounted = 0;

  for (const placeholder of collect(root)) {
    const name = placeholder.getAttribute("data-sk-icon");
    if (!name) continue;

    const icon = set[name as StableIconName];
    if (!icon) {
      warnUnknown(name);
      continue;
    }

    placeholder.replaceWith(buildIcon(name, icon, placeholder));
    mounted += 1;
  }

  return mounted;
}

/** Hydrate new `[data-sk-icon]` nodes with the set from the last `mountIcons` call. */
export function remountIcons(root: ParentNode): number {
  if (!lastSet) return 0;
  return mountIcons(root, lastSet);
}

function collect(root: ParentNode): Element[] {
  const list = Array.from(root.querySelectorAll(placeholderSelector));
  if (root instanceof Element && root.matches(placeholderSelector)) list.unshift(root);
  return list;
}

/*
 * El binding escribe el `<svg>` y el set aporta la geometría, el mismo corte que hace `<Icon>` en
 * React y el sitio en su serializador. La caja (clase, viewBox, tamaño, a11y, precedencia) la calcula
 * `renderIconBox` en core, como dato; este enhancer es sólo el adapter a un nodo del DOM. Los attrs se
 * ponen por API del DOM (sin interpolar strings, así una etiqueta no puede inyectar markup); sólo el
 * `body` entra como HTML, que es geometría confiable por contrato de IconData.
 */
// Los atributos que el enhancer maneja él mismo: son control del placeholder o los escribe la caja.
// Ni se copian al svg tal cual (los de control) ni el autor puede pisarlos (los manejados por la caja).
const controlAttrs = new Set(["data-sk-icon", "data-sk-icon-size", "data-sk-icon-label"]);
const managedAttrs = new Set(["class", "viewbox", "aria-hidden", "role", "aria-label", "data-size", "focusable"]);

function buildIcon(name: string, icon: IconData, from: Element): SVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");

  // Preserva las clases extra que el autor puso en el placeholder, garantizando siempre `sk-icon`.
  const extra = Array.from(from.classList).filter((token) => token && token !== "sk-icon");
  const size = from.getAttribute("data-sk-icon-size");
  const label = from.getAttribute("data-sk-icon-label");

  const { presentation, box, body } = renderIconBox({
    icon,
    dataIcon: name,
    className: extra.length ? extra.join(" ") : undefined,
    size: size ? (size as IconSize) : undefined,
    // getAttribute devuelve "" para un data-sk-icon-label="" (contenido) y null si falta (decorativo).
    label: label ?? undefined,
  });

  // presentation primero (fill/stroke del set), luego los atributos del autor (style, id, title, data-*…)
  //, así el autor puede pisar fill/stroke, y por último la caja, que siempre gana. Los de control y
  // los manejados no se copian: el viewBox, la clase y la a11y no son del autor.
  for (const [key, value] of presentation) svg.setAttribute(key, value);

  for (const attr of Array.from(from.attributes)) {
    const key = attr.name.toLowerCase();
    if (controlAttrs.has(key) || managedAttrs.has(key)) continue;
    svg.setAttribute(attr.name, attr.value);
  }

  for (const [key, value] of box) svg.setAttribute(key, value);

  // body confiable por contrato de IconData: geometría autorada o de build, nunca de un usuario.
  svg.insertAdjacentHTML("afterbegin", body);

  return svg;
}

const warned = new Set<string>();
function warnUnknown(name: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(
    `[ds] mountIcons: el set enlazado no cubre "${name}". Si es un rol del sistema, revisa el nombre; ` +
      "si es geometría del proyecto, escribe el <svg> a mano (ADR-15) en vez de data-sk-icon.",
  );
}
