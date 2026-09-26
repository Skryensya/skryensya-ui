import { presenceContract, presenceExitMs, presenceParts } from "@skryensya/core/presence";
import { type HTMLAttributes, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

/* Derived, never restated: the default lives in the contract. */
const { present: presentOption } = presenceContract.options;

/* `useLayoutEffect` warns during server rendering, and there is nothing to measure there anyway. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type PresenceProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Whether the content is shown. Flipping it to `false` plays the exit before the content leaves. */
  present?: boolean;
  /** Do not render the children until the first time `present` is true. */
  lazyMount?: boolean;
  /** Drop the children once the exit has finished, instead of keeping them hidden in the DOM. */
  unmountOnExit?: boolean;
  /** Called once an exit has finished painting, after `unmountOnExit` has dropped the children. */
  onExitComplete?: () => void;
};

/*
 * The CSS animates; this only decides when the children may go.
 *
 * The host itself is never unmounted. It is what `presence.css` transitions, so it has to exist on
 * the frame `hidden` lands for the exit to have anything to run on, and on the frame it leaves for
 * `@starting-style` to have anything to run from. What `unmountOnExit` drops is the CHILDREN, and
 * only after `presenceExitMs` says the exit is over, read off this host's own computed style, so a
 * retuned styling hook or a consumer's own keyframes are waited for without a prop saying so.
 */
export function Presence({
  children,
  className,
  lazyMount = false,
  onExitComplete,
  present = presentOption.default,
  unmountOnExit = false,
  ...props
}: PresenceProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [everPresent, setEverPresent] = useState(present);
  const [exited, setExited] = useState(!present);
  const onExitCompleteRef = useRef(onExitComplete);
  onExitCompleteRef.current = onExitComplete;
  /* Whether there is anything on screen to animate out of. Starting closed is not an exit, and a
     ref rather than a first-run flag, because StrictMode runs the mount effect twice. */
  const shown = useRef(present);

  if (present && !everPresent) setEverPresent(true);
  if (present && exited) setExited(false);

  useIsomorphicLayoutEffect(() => {
    if (present) {
      shown.current = true;
      return;
    }
    if (!shown.current) return;

    const host = hostRef.current;
    const wait = host ? presenceExitMs(getComputedStyle(host)) : 0;
    const settle = () => {
      shown.current = false;
      setExited(true);
      onExitCompleteRef.current?.();
    };
    if (wait === 0) {
      settle();
      return;
    }
    /* Reopening mid-exit re-runs this effect, and the cleanup is what stops a stale settle. */
    const timer = setTimeout(settle, wait);
    return () => clearTimeout(timer);
  }, [present]);

  const renderChildren = (!lazyMount || everPresent) && !(unmountOnExit && exited);

  return (
    <div
      {...props}
      className={className ? `${presenceParts.root} ${className}` : presenceParts.root}
      data-state={present ? presentOption.trueValue : presentOption.falseValue}
      hidden={!present}
      ref={hostRef}
    >
      {renderChildren ? children : null}
    </div>
  );
}
