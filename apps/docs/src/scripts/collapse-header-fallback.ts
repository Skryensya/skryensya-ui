/*
 * JS fallback for the `sk-fx-collapse-header` effect (`@skryensya/core/effects/collapse-header.css`)
 * on a browser without `animation-timeline: scroll()` — real-world support is ~84% globally as of
 * 2026, which still leaves a meaningful slice of mobile browsers on the plain, permanently-expanded
 * masthead the effect falls back to by design (ADR-20 rejected a JS dependency for what the platform
 * already resolves, for the browsers that DO resolve it). This is the opt-in door that ADR left open:
 * a consumer who wants the collapse everywhere anyway walks `--sk-fx-collapse-progress` by hand.
 *
 * `[data-sk-fx-collapse-js]` is the flag both the effect's own CSS and this docs site's `site.css`
 * gate their "JS-fallback twin" layout blocks behind (see the comments on that attribute in both
 * files); this module is the one thing that actually sets it, and only once it has confirmed the
 * native path is unavailable, so the two mechanisms never both try to drive the same element.
 *
 * THE MAPPING mirrors the native one exactly: `animation-range: 0 var(--sk-fx-collapse-range)`
 * against `scroll(root block)` walks the animation across the first `--sk-fx-collapse-range` pixels
 * of the ROOT scroller's `scrollY`, not the header's own position. `clamp(scrollY / range, 0, 1)` on
 * a rAF-throttled `scroll` listener is that same mapping done by hand.
 *
 * RESOLVING THE RANGE TO A PIXEL NUMBER is the one part with no direct API: `--sk-fx-collapse-range`
 * is an untyped custom property (a `calc()` of several tokens, not a registered `<length>`), so
 * `getComputedStyle` hands back its post-substitution token stream as text, not a resolved px number
 * the way it would for `font-size`. `resolvePx` closes that gap the same way the DevTools "Computed"
 * panel does it under the hood: assign the text to a REAL length property on a throwaway, invisible
 * element and read that property's own resolved computed value back.
 */
let bound = false;

function resolvePx(source: HTMLElement, varName: string): number {
  const raw = getComputedStyle(source).getPropertyValue(varName).trim();
  if (!raw) return 0;
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inline-size:${raw};`;
  document.body.appendChild(probe);
  const px = parseFloat(getComputedStyle(probe).inlineSize);
  probe.remove();
  return Number.isFinite(px) ? px : 0;
}

export function initCollapseHeaderFallback(): void {
  if (bound) return;
  /* Native support: nothing to do, the effect's own `@supports` block already has this. */
  if (CSS.supports("(animation-timeline: scroll())")) return;
  /* Same accessibility door the native path uses; this script staying silent is what lets
     `site.css`'s JS-fallback block share ITS `@media (prefers-reduced-motion: no-preference)`
     wrapper with the attribute below rather than needing its own reduced-motion branch. */
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  const shell = document.querySelector<HTMLElement>(".docs-component-shell");
  const header = document.querySelector<HTMLElement>(".sk-fx-collapse-header");
  /* Page has no collapsing masthead at all (most pages): nothing to walk. */
  if (!shell || !header) return;

  bound = true;
  document.documentElement.setAttribute("data-sk-fx-collapse-js", "");

  let range = 0;
  const measure = () => {
    range = resolvePx(shell, "--sk-fx-collapse-range");
  };

  let queued = false;
  const apply = () => {
    queued = false;
    /* No range yet (a layout pass still pending): render the collapsed end rather than the
       expanded one — a masthead settled onto the small bar reads better for one frame than the
       full-height one snapping shut the instant `range` resolves. */
    const progress = range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 1;
    header.style.setProperty("--sk-fx-collapse-progress", String(progress));
  };
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(apply);
  };

  measure();
  apply();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* The range depends on font metrics (`--docs-hero-title-max/-min`, line-height), never on
     viewport width directly, but a late web font swap or a `zoom`/text-size change can still
     shift it after first measure. */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    ro.observe(shell);
  } else {
    window.addEventListener("resize", () => {
      measure();
      apply();
    });
  }
}
