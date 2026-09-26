import { fadeEdgeParts, type FadeEdgeDirection, type FadeEdgeMode, fadeEdgeContract } from "@skryensya/core/fade-edge";
import { watchFadeEdge } from "@skryensya/core/fade-edge-dom";
import { type CSSProperties, type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";

/* Derived, never restated: the default lives in the contract. */
const { direction: directionOption, mode: modeOption, scrollAware: scrollAwareOption } = fadeEdgeContract.options;

type FadeEdgeStyle = CSSProperties & {
  "--sk-fade-edge-size"?: string;
  "--sk-fade-edge-color"?: string;
};

export type FadeEdgeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  mode?: FadeEdgeMode;
  direction?: FadeEdgeDirection;
  /** Retire the fade once the scroll reaches its edge. The FadeEdge must be the scroll container. */
  scrollAware?: boolean;
  size?: string;
  color?: string;
};

/** Paint-only wrapper: content, semantics, focus, and overflow remain owned by its child. */
export function FadeEdge({
  children,
  className,
  color,
  direction = directionOption.default,
  mode = modeOption.default,
  scrollAware = scrollAwareOption.default,
  size,
  style,
  ...props
}: FadeEdgeProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  /* The same watcher the vanilla enhancer mounts; it owns `data-at-edge`, which React never renders. */
  useEffect(() => {
    const root = rootRef.current;
    if (!scrollAware || !root) return;
    return watchFadeEdge(root);
  }, [scrollAware]);

  const fadeStyle: FadeEdgeStyle | undefined =
    size || color
      ? {
          ...style,
          ...(size ? { "--sk-fade-edge-size": size } : null),
          ...(color ? { "--sk-fade-edge-color": color } : null),
        }
      : style;

  return (
    <div
      {...props}
      className={className ? `${fadeEdgeParts.root} ${className}` : fadeEdgeParts.root}
      data-direction={direction}
      data-fade={mode}
      data-scroll-aware={scrollAware ? scrollAwareOption.trueValue : undefined}
      ref={rootRef}
      style={fadeStyle}
    >
      {children}
    </div>
  );
}
