import { imageFrameContract, imageFrameParts } from "@skryensya/core/image-frame";
import type { OptionsOf } from "@skryensya/core/contract";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

const o = imageFrameContract.options;

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type ImageFrameProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    /** Type over the media — a MediaCaption (and its wash). Not a second media source. */
    caption?: ReactNode;
    children?: ReactNode;
    className?: string;
  } & OptionsOf<typeof imageFrameContract>
>;

/**
 * Clipped media frame: aspect ratio, object-fit and object-position as data attributes.
 * The caller owns semantics (`figure`, `div`, a link wrapping the frame).
 */
export function ImageFrame<Element extends ElementType = "div">({
  as,
  aspect = o.aspect.default,
  fit = o.fit.default,
  position = o.position.default,
  radius = o.radius.default,
  border = o.border.default,
  caption,
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
      {...{
        [o.aspect.attr]: aspect,
        [o.fit.attr]: fit,
        [o.position.attr]: position,
        [o.radius.attr]: radius,
        [o.border.attr]: border,
      }}
    >
      {src != null ? <img className={imageFrameParts.media} src={src} alt={alt} /> : children}
      {caption}
    </Component>
  );
}
