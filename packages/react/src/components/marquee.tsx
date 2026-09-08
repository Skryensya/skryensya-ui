import {
  marqueeDurationSeconds,
  marqueeGapFill,
  marqueeParts,
  marqueeProperties,
  type MarqueeDirection,
  type MarqueeFade,
  type MarqueeSpeed,
  type MarqueeStart,
} from "@skryensya/core/marquee";
import {
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Button } from "./button.js";

type MarqueeBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  /** Physical travel direction; `up` and `down` form a vertical strip. */
  direction?: MarqueeDirection;
  /** Constant perceived velocity; duration is derived from the measured travel distance. */
  speed?: MarqueeSpeed;
  /**
   * Whether the viewport softens the two edges where it clips the run. On by default; `none` is for
   * a strip already bounded by something that explains the cut.
   */
  fade?: MarqueeFade;
};

/*
 * The labels are REQUIRED on the requested marquee and OPTIONAL on the automatic one, for the same
 * reason the contract splits its slots: a strip that starts paused cannot drop the button that
 * starts it, while an ambient strip has no button unless `control` asks for one. Two prop types
 * rather than one with everything optional, so the compiler says it instead of a runtime warning.
 */
export type MarqueeProps = MarqueeBaseProps & {
  /** Accessible action labels, kept separate so only the available action is announced. */
  playLabel: ReactNode;
  pauseLabel: ReactNode;
};

export type AutoplayMarqueeProps = MarqueeBaseProps & {
  /**
   * Whether to ship a visible Play/Pause button. Off by default. Turning it off is a conformance
   * decision as much as a visual one: hover and focus still pause the strip, but WCAG 2.2.2 asks for
   * an explicit control on motion that starts by itself and runs past five seconds.
   */
  control?: boolean;
  playLabel?: ReactNode;
  pauseLabel?: ReactNode;
};

type MarqueeRootProps = MarqueeBaseProps & {
  control: boolean;
  playLabel?: ReactNode;
  pauseLabel?: ReactNode;
  start: MarqueeStart;
};

function MarqueeRoot({
  children,
  className,
  control,
  direction = "left",
  fade = "edges",
  pauseLabel,
  playLabel,
  speed = "normal",
  start,
  style,
  ...props
}: MarqueeRootProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const userChangedRef = useRef(false);
  const [playing, setPlaying] = useState(start === "auto");

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      if (reducedMotion.matches) setPlaying(false);
      else if (start === "auto" && !userChangedRef.current) setPlaying(true);
    };
    syncPreference();
    reducedMotion.addEventListener("change", syncPreference);
    return () => reducedMotion.removeEventListener("change", syncPreference);
  }, [start]);

  /*
   * The one measurement the loop's continuity depends on. Two copies only look infinite while one of
   * them reaches across the viewport; a shorter run gets its gaps widened until it does, and the
   * viewport is observed alongside the content because a window resize opens the hole without ever
   * changing the content's own size.
   */
  useEffect(() => {
    const root = rootRef.current;
    const viewport = root?.querySelector<HTMLElement>(`.${marqueeParts.viewport}`);
    const content = root?.querySelector<HTMLElement>(`.${marqueeParts.content}:not([aria-hidden="true"])`);
    if (!root || !viewport || !content) return;
    const vertical = direction === "up" || direction === "down";

    const syncGeometry = () => {
      const cadenceMilliseconds = Number.parseFloat(
        getComputedStyle(root).getPropertyValue("--sk-marquee-cadence-duration"),
      );
      // Measure at the authored gap; reading back a filled run and filling it again would compound.
      root.style.setProperty(marqueeProperties.gapFill, "0px");
      const gapCount = content.childElementCount;
      const runSize = vertical ? content.scrollHeight : content.scrollWidth;
      const viewportSize = vertical ? viewport.clientHeight : viewport.clientWidth;
      const fill = marqueeGapFill(runSize, gapCount, viewportSize);
      if (fill > 0) root.style.setProperty(marqueeProperties.gapFill, `${fill}px`);
      const seconds = marqueeDurationSeconds(runSize + fill * gapCount, cadenceMilliseconds);
      if (seconds > 0) root.style.setProperty(marqueeProperties.duration, `${seconds}s`);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncGeometry);
    resizeObserver?.observe(content);
    resizeObserver?.observe(viewport);
    syncGeometry();
    return () => resizeObserver?.disconnect();
  }, [children, direction, speed]);

  const toggle = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    userChangedRef.current = true;
    setPlaying((current) => !current);
  };

  return (
    <div
      {...props}
      className={className ? `${marqueeParts.root} ${className}` : marqueeParts.root}
      /* Only where `control` is an OPTION, which is the autoplay signature alone. The requested
       * marquee's button is structural (it is the only cause of motion it has), so the contract
       * does not declare `control` there and the emitter writes no attribute; writing one here
       * anyway is a divergence G2 catches and a fact the DOM states twice. */
      data-control={start === "auto" && control ? "" : undefined}
      data-direction={direction}
      data-fade={fade}
      data-speed={speed}
      data-start={start}
      data-state={playing ? "playing" : "paused"}
      ref={rootRef}
      style={style}
    >
      <div className={marqueeParts.viewport}>
        <div className={marqueeParts.track}>
          <div className={marqueeParts.content}>{children}</div>
          <div aria-hidden="true" className={marqueeParts.content}>{children}</div>
        </div>
      </div>
      {/* A real Button, not a button-shaped lookalike: the state layer, the focus ring and the touch
          target come with it, and `translucent` is the variant for a control sitting on a busy
          surface. The glyph is its own element because Button's own pseudos are already spoken for;
          the name comes from whichever label is not hidden. */}
      {control ? (
        <Button
          className={marqueeParts.toggle}
          iconOnly
          onClick={toggle}
          /* The contract's own option, not a raw `aria-pressed`: Button paints the pressed state as
           * well as announcing it, so the look and the announcement cannot drift apart. */
          pressed={playing}
          size="sm"
          variant="translucent"
        >
          <span aria-hidden="true" className={marqueeParts.glyph} />
          <span
            className={`${marqueeParts.label} sk-visually-hidden`}
            data-action="play"
            hidden={playing}
          >
            {playLabel}
          </span>
          <span
            className={`${marqueeParts.label} sk-visually-hidden`}
            data-action="pause"
            hidden={!playing}
          >
            {pauseLabel}
          </span>
        </Button>
      ) : null}
    </div>
  );
}

/**
 * A continuous strip that stays still until the reader explicitly starts it. Its control is not
 * optional: the button is the only cause of motion it has.
 */
export function Marquee(props: MarqueeProps) {
  return <MarqueeRoot {...props} control start="manual" />;
}

/** A continuous strip that starts on its own. `control` adds the persistent Pause button. */
export function AutoplayMarquee({ control = false, ...props }: AutoplayMarqueeProps) {
  return <MarqueeRoot {...props} control={control} start="auto" />;
}
