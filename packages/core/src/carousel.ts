/*
 * CAROUSEL, a native scroll-snap region of slides (cards or any content) with controls.
 *
 * The scrolling is the platform's: a `<ul>` track with `scroll-snap-type`, so momentum, touch, wheel
 * and snap points come for free. Two control layers sit on top of that one substrate:
 *
 *   1. A ZERO-JS baseline of the native carousel pseudo-elements (`::scroll-button`, `::scroll-marker`),
 *      shown until the enhancer marks the root ready. Chrome/Edge today; elsewhere a plain snap scroller.
 *   2. The vanilla ENHANCER, machine-backed by `@zag-js/carousel` (the SAME machine any framework
 *      binding would use, re-exported from `@skryensya/core/machines`). It renders the prev/next
 *      buttons and one dot per PAGE, and the machine owns the rest: it measures the track's real
 *      scroll-snap positions, tracks the page from the native scroll offset, disables the ends,
 *      handles keyboard and drag, and re-measures on resize.
 *
 * Why the machine matters here, concretely: the reachable snap positions are NOT one-per-slide. With
 * peeking slides the last few all clamp to the same maximum scroll offset, so a hand-rolled
 * "one dot per slide" carousel ends with dots that can never activate and a next button that never
 * disables. The machine derives the pages from the measured, clamped, de-duplicated positions, so the
 * dots and the scroll agree by construction.
 *
 * Layout is CSS's, not the machine's: `--sk-carousel-slide-size` sizes a slide (peek or multi-up) for
 * BOTH layers, so the zero-JS baseline and the enhanced carousel are the same carousel.
 */

export const carouselAttrs = {
  /** Marks the enhancer root; its presence is what loads and mounts the vanilla controls. */
  root: "data-sk-carousel",
  /** `data-loop` on the root: wrap around past either end. */
  loop: "data-loop",
  /** `data-autoplay` on the root: advance on a timer. Empty for the 4000ms default, or a delay in ms. */
  autoplay: "data-autoplay",
  /** `data-orientation="vertical"` on the root: a vertical track. Defaults to horizontal. */
  orientation: "data-orientation",
  /**
   * `data-controls="none"` on the root: draw no prev/next and no dots, in either layer. The track
   * is then a plain snap scroller you swipe or drag, and the peek is the only thing saying so.
   */
  controls: "data-controls",
  /**
   * `data-mouse-drag="off"` on the root: turn OFF click-and-drag with a mouse. It is ON by default,
   * because a mouse cannot scroll a horizontal track any other way, a vertical wheel scrolls the
   * PAGE, so without drag a desktop pointer has no way through a carousel with no controls.
   * Turn it off for slides whose text people are meant to select: the drag suppresses selection.
   */
  mouseDrag: "data-mouse-drag",
} as const;

export const carouselParts = {
  root: "sk-carousel",
  track: "sk-carousel__track",
  slide: "sk-carousel__slide",
  controls: "sk-carousel__controls",
  button: "sk-carousel__button",
  /** The pause/play toggle, drawn only when `data-autoplay` is on. A carousel that moves by itself
   * has to be stoppable (WCAG 2.2.2), so the option and the control are one thing, not two. */
  autoplay: "sk-carousel__autoplay",
  dots: "sk-carousel__dots",
  dot: "sk-carousel__dot",
} as const;

export type CarouselPart = keyof typeof carouselParts;
export type CarouselPartClass = (typeof carouselParts)[CarouselPart];

/** Fired on the root whenever the active page changes (scroll, control, keyboard, drag, or a goto). */
export const carouselEvents = {
  change: "sk-carousel-change",
  /** Dispatch this on the root to command a snap: `new CustomEvent("sk-carousel-goto", { detail: { index } })`. */
  goto: "sk-carousel-goto",
} as const;

export type CarouselChangeDetail = {
  /** The active page. With one slide per page (the default) this is the slide index. */
  index: number;
  /** How many pages the track actually has — measured, so peeking slides do not invent a page. */
  count: number;
};

export type CarouselGotoDetail = {
  index: number;
};
