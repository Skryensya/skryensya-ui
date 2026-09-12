import { fadeEdgeParts, type FadeEdgeDirection, type FadeEdgeMode, fadeEdgeContract } from "@skryensya/core/fade-edge";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { direction: directionOption, mode: modeOption } = fadeEdgeContract.options;

type FadeEdgeStyle = CSSProperties & {
  "--sk-fade-edge-size"?: string;
  "--sk-fade-edge-color"?: string;
};

export type FadeEdgeProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  mode?: FadeEdgeMode;
  direction?: FadeEdgeDirection;
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
  size,
  style,
  ...props
}: FadeEdgeProps) {
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
      style={fadeStyle}
    >
      {children}
    </div>
  );
}
