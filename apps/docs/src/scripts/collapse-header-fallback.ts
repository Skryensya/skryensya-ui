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
 * READING THE RANGE AS A PIXEL NUMBER: measure the SPACER. Once `[data-sk-fx-collapse-js]` is set,
 * the effect's own twin sizes `.sk-fx-collapse-header__spacer` to `block-size: var(--sk-fx-collapse-
 * range)`, so its rendered height IS the range — no reparsing `--sk-fx-collapse-range`'s token
 * stream (a `calc()` of `round()`-wrapped tokens that an older engine can resolve differently, or
 * not at all). Same for the resting lead: `getComputedStyle(spacer).marginBlockStart` hands back
 * `var(--space-inset-lg)` already resolved to px, because it is a real property, not a custom one.
 */
let bound = false;

export function initCollapseHeaderFallback(): void {
  if (bound) return;
  /* Native support: nothing to do, the effect's own `@supports` block already has this. */
  if (CSS.supports("(animation-timeline: scroll())")) return;
  /* Same accessibility door the native path uses; this script staying silent is what lets
     `site.css`'s JS-fallback block share ITS `@media (prefers-reduced-motion: no-preference)`
     wrapper with the attribute below rather than needing its own reduced-motion branch. */
  if (!matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

  const header = document.querySelector<HTMLElement>(".sk-fx-collapse-header");
  const spacer = document.querySelector<HTMLElement>(".sk-fx-collapse-header__spacer");
  /* Page has no collapsing masthead at all (most pages): nothing to walk. */
  if (!header || !spacer) return;

  bound = true;
  document.documentElement.setAttribute("data-sk-fx-collapse-js", "");

  /* The resting lead above the band (`site.css`'s JS twin sets `margin-block-start:
     var(--space-inset-lg)` on the spacer), read once now that the twin applies. A browser that
     cannot resolve the token computes this to 0, which just means no closing gap — the collapse
     itself stays correct either way. */
  const lead = parseFloat(getComputedStyle(spacer).marginBlockStart) || 0;

  let range = 0;
  const measure = () => {
    range = spacer.getBoundingClientRect().height;
  };

  let queued = false;
  let settleTries = 0;
  const apply = () => {
    queued = false;
    /* No range yet (a layout pass still pending): stay at the EXPANDED end and re-measure next
       frame. Rendering the collapsed bar here instead would flash a shrunk masthead on cold load,
       which is the exact "looks broken" this fallback is meant to avoid. Bounded so a spacer that
       never gets a height (effect CSS missing) just leaves the plain expanded masthead. */
    if (range <= 0) {
      measure();
      if (range <= 0) {
        if (settleTries++ < 30) requestAnimationFrame(apply);
        return;
      }
    }
    const progress = Math.min(1, Math.max(0, window.scrollY / range));
    header.style.setProperty("--sk-fx-collapse-progress", String(progress));
    /* Mirror the native path's `docs-hero-lead-close` keyframe: close the lead in lockstep with
       progress so the header pins the frame the collapse finishes, not `lead` px later. */
    spacer.style.marginBlockStart = `${lead * (1 - progress)}px`;
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
     shift it after first measure. Observe the spacer itself, since that is what carries the
     resolved range as its own height. */
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      measure();
      apply();
    });
    ro.observe(spacer);
  } else {
    window.addEventListener("resize", () => {
      measure();
      apply();
    });
  }
}
