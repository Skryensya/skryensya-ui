import { carouselEvents, carouselParts, type CarouselGotoDetail } from "@skryensya/core/carousel";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type LiHTMLAttributes,
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
};

/*
 * The static structure of a native scroll-snap carousel: a `<section>` region and a `<ul>` track of
 * slides. The controls (prev/next, dots) and the active-index tracking are the vanilla enhancer's job
 * at runtime — this only renders what it enhances, and forwards a `snapTo` handle that speaks to it
 * through the same goto event any consumer can dispatch.
 */
export const Carousel = forwardRef<CarouselHandle, CarouselProps>(function Carousel(
  { children, className, ...props },
  ref,
) {
  const rootRef = useRef<HTMLElement>(null);

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
    <section {...props} className={cx(carouselParts.root, className)} data-sk-carousel="" ref={rootRef}>
      <ul className={carouselParts.track}>{children}</ul>
    </section>
  );
});

export type CarouselSlideProps = LiHTMLAttributes<HTMLLIElement> & {
  children: ReactNode;
};

/** One slide. Any content: a Card, an image, a stat — the track snaps to its start edge. */
export function CarouselSlide({ children, className, ...props }: CarouselSlideProps) {
  return (
    <li {...props} className={cx(carouselParts.slide, className)}>
      {children}
    </li>
  );
}
