import {
  fadeEdgeParts,
  type FadeEdgeDirection,
  type FadeEdgeMode,
} from "@skryensya/core/fade-edge";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

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
  direction = "to-bottom",
  mode = "transparent",
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
