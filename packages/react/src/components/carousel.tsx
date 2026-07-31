import { carouselContract, carouselEvents, carouselParts, type CarouselGotoDetail } from "@skryensya/core/carousel";
import type { OptionValue } from "@skryensya/core/contract";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type CarouselHandle = {
  /** Snap to a slide index. Dispatches the goto command the vanilla enhancer listens for. */
  snapTo: (index: number) => void;
  /** The carousel root element, or null before mount. */
  element: HTMLElement | null;
};

export type CarouselProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  /** Names the carousel region for assistive tech. */
  "aria-label"?: string;
  /*
   * The enhancer's knobs, as props. It reads them off the DOM either way — these exist so a React
   * caller sets them by name instead of hand-writing the data attributes, and the values are DERIVED
   * so Core stays the only place they are defined.
   */
  loop?: boolean;
  /** Advance on a timer. Also draws the pause control, which WCAG 2.2.2 requires along with it. */
  autoplay?: boolean | number;
  orientation?: OptionValue<typeof carouselContract.options.orientation>;
  controls?: OptionValue<typeof carouselContract.options.controls>;
  mouseDrag?: OptionValue<typeof carouselContract.options.mouseDrag>;
  /** Set false to leave the native CSS-only scroll-snap baseline unenhanced. */
  mounted?: boolean;
  /** CSS length for each slide, e.g. `min(42%, 14rem)`. */
  slideSize?: string;
};

/*
 * The static structure of a native scroll-snap carousel: a `<section>` region and a `<ul>` track of
 * slides. The controls (prev/next, dots) and the active-index tracking are the vanilla enhancer's job
 * at runtime — this only renders what it enhances, and forwards a `snapTo` handle that speaks to it
 * through the same goto event any consumer can dispatch.
 */
export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { autoplay, children, className, controls, loop, mounted = true, mouseDrag, orientation, slideSize, style, ...props },
  ref,
) {
  const rootRef = useRef<HTMLElement>(null);
  const carouselStyle: (CSSProperties & { "--sk-carousel-slide-size"?: string }) | undefined =
    slideSize ? { ...style, "--sk-carousel-slide-size": slideSize } : style;

  useImperativeHandle(
    ref,
    () => ({
      element: rootRef.current,
      snapTo: (index: number) => {
        const detail: CarouselGotoDetail = { index };
        rootRef.current?.dispatchEvent(new CustomEvent(carouselEvents.goto, { detail }));
      },
    }),
    [],
  );

  return (
    <section
      {...props}
      className={cx(carouselParts.root, className)}
      data-autoplay={typeof autoplay === "number" ? autoplay : autoplay ? "" : undefined}
      data-controls={controls}
      data-loop={loop ? "" : undefined}
      data-mouse-drag={mouseDrag}
      data-orientation={orientation}
      data-sk-carousel={mounted ? "" : undefined}
      ref={rootRef}
      style={carouselStyle}
    >
      {/* A div, not a <ul>: the machine gives each slide role="group", which takes it out of the
          list and leaves a list with no list items. */}
      <div className={carouselParts.track}>{children}</div>
    </section>
  );
});

export type CarouselSlideProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/** One slide. Any content: a Card, an image, a stat — the track snaps to its start edge. */
export function CarouselSlide({ children, className, ...props }: CarouselSlideProps) {
  return (
    <div {...props} className={cx(carouselParts.slide, className)}>
      {children}
    </div>
  );
}
