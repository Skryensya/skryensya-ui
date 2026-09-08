/*
 * Vanilla's icon binder.
 *
 * ADR-19 said vanilla ships nothing for icons "because an icon has no behavior to hydrate", and for
 * the hand-written `<svg>` that is still true. But the same ADR defines a placeholder,
 * `<svg class="sk-icon" data-icon="…">` with no geometry, that SOMETHING has to fill in with the bound
 * set; on the site that was done by the docs' own code. `mountIcons` lifts that binding into the
 * vanilla layer, with parity to React's `<Icon name>`: React injects the set's `icon.body` through
 * context; here the author writes a placeholder with the ROLE's name and the binder injects the
 * geometry of the set you pass it. It renders no structure of its own and invents no classes, it only
 * occupies the role with a brand, which is exactly what an icon set is (ADR-19).
 *
 * Usage:
 *
 *   <span data-sk-icon="arrow-up"></span>
 *
 *   import { mountIcons } from "@skryensya/vanilla/icon";
 *   import { lucideIcons } from "@skryensya/icons-lucide";
 *   mountIcons(document, lucideIcons);
 *
 * The `<span>` is replaced by the same `<svg class="sk-icon" data-icon="arrow-up" viewBox…>` you would
 * write by hand or that React emits. Since the result carries `data-icon` (not `data-sk-icon`), it is
 * idempotent: calling again does not touch what is already hydrated, and it stays compatible with a
 * later set swap over `svg[data-icon]`.
 *
 * The set is ALWAYS explicit: there is no module default. For two sets on the same page, hydrate each
 * subtree with its own set (the first to run wins the node, so hydrate the special subtree BEFORE the
 * document).
 */
import { renderIconBox, type IconData, type IconSet, type IconSize, type StableIconName } from "@skryensya/core/icon";

const SVG_NS = "http://www.w3.org/2000/svg";
const placeholderSelector = "[data-sk-icon]";

/**
 * Replaces every `[data-sk-icon="<role>"]` placeholder inside `root` (including `root` itself if it is
 * one) with the role's `<svg class="sk-icon">` from `set`. Returns how many it hydrated.
 *
 * A `data-sk-icon` the set does not cover is left untouched (it is project geometry, written as a
 * hand-authored `<svg>`, ADR-19) and warned about once per name, because it is almost always a typo in
 * the role.
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
 * The binding writes the `<svg>` and the set contributes the geometry, the same cut `<Icon>` makes in
 * React and the site makes in its serializer. The box (class, viewBox, size, a11y, precedence) is
 * computed by `renderIconBox` in core, as data; this enhancer is only the adapter to a DOM node. The
 * attrs are set through the DOM API (no string interpolation, so a label cannot inject markup); only
 * the `body` goes in as HTML, which is trusted geometry by IconData's contract.
 */
// The attributes the enhancer handles itself: they are placeholder control or written by the box.
// They are neither copied to the svg as-is (the control ones) nor overridable by the author (the ones
// handled by the box).
const controlAttrs = new Set(["data-sk-icon", "data-sk-icon-size", "data-sk-icon-label"]);
const managedAttrs = new Set(["class", "viewbox", "aria-hidden", "role", "aria-label", "data-size", "focusable"]);

function buildIcon(name: string, icon: IconData, from: Element): SVGElement {
  const svg = document.createElementNS(SVG_NS, "svg");

  // Preserves the extra classes the author put on the placeholder, always guaranteeing `sk-icon`.
  const extra = Array.from(from.classList).filter((token) => token && token !== "sk-icon");
  const size = from.getAttribute("data-sk-icon-size");
  const label = from.getAttribute("data-sk-icon-label");

  const { presentation, box, body } = renderIconBox({
    icon,
    dataIcon: name,
    className: extra.length ? extra.join(" ") : undefined,
    size: size ? (size as IconSize) : undefined,
    // getAttribute returns "" for a data-sk-icon-label="" (content) and null when it is missing (decorative).
    label: label ?? undefined,
  });

  // presentation first (the set's fill/stroke), then the author's attributes (style, id, title, data-*…),
  // so the author can override fill/stroke, and finally the box, which always wins. The control ones and
  // the handled ones are not copied: the viewBox, the class and the a11y are not the author's.
  for (const [key, value] of presentation) svg.setAttribute(key, value);

  for (const attr of Array.from(from.attributes)) {
    const key = attr.name.toLowerCase();
    if (controlAttrs.has(key) || managedAttrs.has(key)) continue;
    svg.setAttribute(attr.name, attr.value);
  }

  for (const [key, value] of box) svg.setAttribute(key, value);

  // body is trusted by IconData's contract: authored or build-time geometry, never from a user.
  svg.insertAdjacentHTML("afterbegin", body);

  return svg;
}

const warned = new Set<string>();
function warnUnknown(name: string): void {
  if (warned.has(name)) return;
  warned.add(name);
  console.warn(
    `[ds] mountIcons: el set enlazado no cubre "${name}". Si es un rol del sistema, revisa el nombre; ` +
      "si es geometría del proyecto, escribe el <svg> a mano (ADR-19) en vez de data-sk-icon.",
  );
}
