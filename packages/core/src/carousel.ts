import type { ComponentContract } from "./contract.js";

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

/**
 * The contract. Both bindings render the SAME markup and hand it to the same enhancer — React's
 * Carousel writes the mount mark itself — so what a contract adds here is not symmetry, which is
 * free, but the vocabulary: which knobs exist and what each one costs.
 *
 * `autoplay` is the interesting one. A carousel that moves by itself has to be stoppable (WCAG
 * 2.2.2), so turning it on is also what draws the pause control: the option and the control are one
 * thing. The millisecond form (`data-autoplay="6000"`) stays authorable and is not published — a
 * delay is tuning, and the catalogue is for choosing.
 */
export const carouselContract = {
  id: "carousel",
  css: "@skryensya/core/components/carousel.css",
  parts: carouselParts,

  options: {
    /** Wrap around past either end. */
    loop: { type: "boolean", default: false, attr: "data-loop", trueValue: "" },
    /** Advance on a timer, and draw the pause control that WCAG 2.2.2 requires along with it. */
    autoplay: { type: "boolean", default: false, attr: "data-autoplay", trueValue: "" },
    /** Explicit delay in milliseconds. Same behavior as autoplay, with authored timing. */
    autoplayDelay: { type: "number", attr: "data-autoplay", prop: "autoplay" },
    /** Leave false to demonstrate the native CSS-only scroll-snap baseline. */
    mounted: { type: "boolean", default: true, attr: "data-sk-carousel", trueValue: "" },
    /** The one authored size knob, kept as a custom property on the root. */
    slideSize: {
      type: "string",
      styleProperty: "--sk-carousel-slide-size",
    },
    orientation: { type: "enum", values: ["horizontal", "vertical"], attr: "data-orientation" },
    /**
     * `none` draws no prev/next and no dots, in either layer. The track is then a plain snap
     * scroller, and the peeking slide is the only thing saying so — which is a real design, and a
     * bad accident.
     */
    controls: { type: "enum", values: ["auto", "none"], attr: "data-controls" },
    /**
     * Click-and-drag with a mouse, ON by default: a mouse cannot scroll a horizontal track any
     * other way. Turn it off for slides whose text people are meant to select.
     */
    mouseDrag: { type: "enum", values: ["on", "off"], attr: "data-mouse-drag" },
  },

  signatures: {
    Carousel: {
      intent: ["carousel", "slider-of-cards", "snap-scroller", "gallery"],
      host: { element: "section" },
      options: ["loop", "autoplay", "autoplayDelay", "mounted", "slideSize", "orientation", "controls", "mouseDrag"],
      slots: { children: { accepts: "signature", of: ["CarouselSlide"], required: true } },
      template: {
        element: "section",
        part: "root",
        host: true,
        /*
         * A plain div, not a `<ul>`. It reads like a list and it is not one: the machine gives each
         * slide `role="group"` and `aria-roledescription="slide"`, which is the ARIA carousel
         * pattern and which takes the items OUT of the list — leaving a list with no list items,
         * exactly what axe reports. The slides are counted by "1 de 3", not by the list.
         */
        children: [{ element: "div", part: "track", slot: "children" }],
      },
      react: { from: "@skryensya/react/carousel", name: "Carousel" },
    },

    CarouselSlide: {
      intent: ["slide", "carousel-item"],
      host: { element: "div" },
      parents: ["Carousel"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "slide", host: true, slot: "children" },
      react: { from: "@skryensya/react/carousel", name: "CarouselSlide" },
    },
  },
} as const satisfies ComponentContract;
