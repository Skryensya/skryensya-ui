import {
  BACK_TO_TOP_DEFAULT_THRESHOLD,
  backToTopParts,
  backToTopScrollBehavior,
  backToTopShouldReveal,
} from "@skryensya/core/back-to-top";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { Icon } from "./icon.js";

/*
 * BACK TO TOP: the React half of the same contract the Vanilla enhancer connects to.
 *
 * Copies `connectBackToTop` rather than improving on it (the rule `NOT-PUBLISHED.md` states for the
 * families whose two bindings must stay one behaviour). `visible` is React's `hidden` toggle;
 * `scrollTargetRef` is the resolved scroller the click acts on, kept in a ref so a re-render never
 * re-reads the DOM for it. "Past the threshold?" and "does the scroll animate?" come from
 * `@skryensya/core/back-to-top`, the same two functions the enhancer calls.
 */
export type BackToTopProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "type"
> & {
  /** The accessible name. A destination, not an instruction: "Volver arriba". */
  children: ReactNode;
  /** Pixels scrolled from the start before it reveals itself. Default 400. */
  threshold?: number;
  /** A CSS selector for the scroll container to return to its start. Default: the window. */
  scroller?: string;
  /** A selector for a focusable element at the top to move focus to after scrolling. Default: focus
   *  stays put and only the scroll happens. */
  target?: string;
};

export function BackToTop({
  children,
  className,
  onClick,
  scroller,
  target,
  threshold = BACK_TO_TOP_DEFAULT_THRESHOLD,
  ...props
}: BackToTopProps) {
  const [visible, setVisible] = useState(false);
  const scrollTargetRef = useRef<Window | HTMLElement | null>(null);

  useEffect(() => {
    const host: Window | HTMLElement =
      (scroller && document.querySelector<HTMLElement>(scroller)) || window;
    scrollTargetRef.current = host;
    const isWindow = host === window;
    const readTop = () =>
      isWindow
        ? window.scrollY || document.documentElement.scrollTop || 0
        : (host as HTMLElement).scrollTop;

    let frame = 0;
    const sync = () => {
      frame = 0;
      setVisible(backToTopShouldReveal(readTop(), threshold));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sync);
    };

    (host as EventTarget).addEventListener("scroll", onScroll, { passive: true });
    sync();
    return () => {
      if (frame) cancelAnimationFrame(frame);
      (host as EventTarget).removeEventListener("scroll", onScroll);
    };
  }, [scroller, threshold]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;

      const host = scrollTargetRef.current ?? window;
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const options: ScrollToOptions = {
        top: 0,
        left: 0,
        behavior: backToTopScrollBehavior(prefersReducedMotion),
      };
      if (host === window) window.scrollTo(options);
      else (host as HTMLElement).scrollTo(options);

      if (target) document.querySelector<HTMLElement>(target)?.focus({ preventScroll: true });
    },
    [onClick, target],
  );

  return (
    <button
      {...props}
      className={
        className
          ? `${backToTopParts.root} sk-interactive ${className}`
          : `${backToTopParts.root} sk-interactive`
      }
      data-sk-back-to-top=""
      hidden={!visible}
      onClick={handleClick}
      type="button"
    >
      <span aria-hidden="true" className={backToTopParts.icon}>
        {/* `sm`, matched to the root's own `-md` footprint; see the CSS's own comment. */}
        <Icon name="chevron-up" size="sm" />
      </span>
      <span className={backToTopParts.label}>{children}</span>
    </button>
  );
}
