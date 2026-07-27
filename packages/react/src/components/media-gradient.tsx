import {
  mediaGradientParts,
  type MediaGradientEdge,
  type MediaGradientStrength,
} from "@skryensya/core/media-gradient";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type MediaGradientProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    className?: string;
    strength?: MediaGradientStrength;
  }
>;

/**
 * Decorative wash. Author inside `MediaCaption` so the box matches the type.
 * Always `aria-hidden`. Direction comes from the caption's `edge`.
 */
export function MediaGradient<Element extends ElementType = "div">({
  as,
  className,
  strength = "md",
  ...props
}: MediaGradientProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      aria-hidden="true"
      className={classes(mediaGradientParts.root, className)}
      data-strength={strength}
    />
  );
}

export type MediaCaptionProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  {
    children?: ReactNode;
    className?: string;
    edge?: MediaGradientEdge;
    /** When set, renders a `MediaGradient` as the first child. */
    strength?: MediaGradientStrength;
  }
>;

/**
 * Readable content on media. Sizes the wash: nest `MediaGradient` (or pass `strength` to
 * inject one) so the gradient is only as tall/wide as this caption.
 */
export function MediaCaption<Element extends ElementType = "div">({
  as,
  children,
  className,
  edge = "bottom",
  strength,
  ...props
}: MediaCaptionProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(mediaGradientParts.caption, className)}
      data-edge={edge}
    >
      {strength != null ? <MediaGradient strength={strength} /> : null}
      {children}
    </Component>
  );
}
