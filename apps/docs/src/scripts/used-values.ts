/*
 * Fills every [data-token] element with that token's USED value, in whatever brand / mode /
 * contrast / density the reader currently has set, and re-reads whenever one moves.
 *
 * THE TRAP this exists to work around, stated once for the whole site:
 * getComputedStyle().getPropertyValue('--x') does NOT resolve a custom property. It returns the
 * specified value with var()s substituted, `round(calc(16px * 1), 2px)`, never `16px`, and
 * `light-dark(a, b)` with neither slot picked. Custom properties are only evaluated when USED
 * in a real property. So the token is assigned to a probe's real property and that property is
 * read back instead.
 *
 * Which property to use is decided at BUILD time (see lib/tokens.ts `probeProp`), because
 * answering it means walking the token's alias chain down to a literal, which the parser knows
 * and the browser doesn't. The build half and the runtime half genuinely need each other.
 */

const probeFor = (cls: string) =>
  document.querySelector(`[data-probe-for="${cls}"]`) as HTMLElement | null;

/*
 * Every color in this system arrives through color-mix() or light-dark(), and Chrome serialises
 * both as `oklab(…)`. Matching only the authored function names left the entire ramp (most of the
 * corpus) with no swatch at all, which is the bug that made the reference look value-only.
 */
const isColor = (v: string) => /^(oklch|oklab|lab|lch|rgba?|hsla?|#|color\()/i.test(v.trim());

/** The used value of `name`, evaluated in `el`'s cascade context. */
function usedValue(name: string, prop: string, el: HTMLElement): string {
  if (!prop) return getComputedStyle(el).getPropertyValue(name).trim();
  const prev = el.style.cssText;
  el.style.setProperty(prop, `var(${name})`);
  const out = getComputedStyle(el).getPropertyValue(prop).trim();
  el.style.cssText = prev;
  return out;
}

function paint(target: HTMLElement) {
  const name = target.dataset.token!;
  // Tier 3 lives on the element, never on :root, an empty probe means :root is right.
  const el = probeFor(target.dataset.probe ?? "");
  if (!el) {
    target.textContent = ", sin elemento donde existir";
    return;
  }
  const value = usedValue(name, target.dataset.prop ?? "", el);
  target.textContent = "";
  if (isColor(value)) {
    const sw = document.createElement("span");
    sw.className = "swatch";
    sw.style.background = value;
    target.appendChild(sw);
  }
  target.appendChild(document.createTextNode(value || "-"));
}

export function initUsedValues() {
  /*
   * A Set, not a WeakSet, because this is also the repaint list below, and a repaint has to be able
   * to enumerate what it already painted.
   */
  const painted = new Set<HTMLElement>();

  const paintOnce = (target: HTMLElement) => {
    if (painted.has(target)) return;
    paint(target);
    painted.add(target);
  };

  /*
   * Reading a used value costs a style recalculation each (the probe is written, then read back),
   * and the token reference alone has a thousand of them. So only what a reader can see gets paid
   * for: the rest stay as their placeholder until they scroll into range.
   */
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target instanceof HTMLElement) {
          paintOnce(entry.target);
          /* Its value is now correct until a dimension moves, and that case is handled below by
             repainting, not by observing. Nothing more to learn about this element. */
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "100px" },
  );

  for (const el of document.querySelectorAll<HTMLElement>("[data-token]")) observer.observe(el);

  /*
   * A dimension moving (density, mode, contrast, brand) makes every value ALREADY on screen wrong,
   * so those are repainted, and only those: the ones still showing a placeholder will be painted
   * with the new dimensions when they scroll in, which is the same work either way.
   *
   * This used to call the paint-once path, whose entire job is to skip elements that were already
   * painted, so the repaint repainted nothing: the reference kept showing values from the density
   * the reader had left. Same listener, right function.
   */
  document.addEventListener("sk:dimensions-changed", () => {
    for (const el of painted) paint(el);
  });
}
