import {
  imageFrameParts,
  type ImageFrameAspect,
  type ImageFrameBorder,
  type ImageFrameFit,
  type ImageFramePosition,
  type ImageFrameRadius,
} from "@skryensya/core/image-frame";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type ImageFrameProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    children?: ReactNode;
    className?: string;
    aspect?: ImageFrameAspect;
    fit?: ImageFrameFit;
    position?: ImageFramePosition;
    radius?: ImageFrameRadius;
    border?: ImageFrameBorder;
    /** Convenience: renders an `<img class="sk-image-frame__media">`. Prefer `children` for `picture` / `video`. */
    src?: string;
    alt?: string;
  }
>;

/**
 * Clipped media frame: aspect ratio, object-fit and object-position as data attributes.
 * The caller owns semantics (`figure`, `div`, a link wrapping the frame).
 */
export function ImageFrame<Element extends ElementType = "div">({
  as,
  aspect = "auto",
  fit = "cover",
  position = "center",
  radius = "surface",
  border = "none",
  className,
  src,
  alt = "",
  children,
  ...props
}: ImageFrameProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(imageFrameParts.root, className)}
      data-aspect={aspect}
      data-fit={fit}
      data-position={position}
      data-radius={radius}
      data-border={border}
    >
      {src != null ? <img className={imageFrameParts.media} src={src} alt={alt} /> : children}
    </Component>
  );
}
