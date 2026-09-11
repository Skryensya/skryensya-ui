import {
  layoutParts,
  layoutGridParts,
  type BoxBorder,
  type BoxSurface,
  type GridColumns,
  type InlineAlign,
  type InlineBlockStart,
  type InlineJustify,
  type LayoutAlign,
  type Space,
  type WrapperSize,
} from "@skryensya/core/layout";
import { heroParts, type HeroAlign, type HeroPadding, type HeroSurface } from "@skryensya/core/hero";
import { footerParts, type FooterPadding, type FooterSurface } from "@skryensya/core/footer";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PolymorphicProps<Element extends ElementType, OwnProps> = OwnProps & {
  as?: Element;
} & Omit<ComponentPropsWithoutRef<Element>, keyof OwnProps | "as">;

type LayoutChildren = { children?: ReactNode; className?: string };

function classes(base: string, className: string | undefined) {
  return className ? `${base} ${className}` : base;
}

export type BoxProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { border?: BoxBorder; padding?: Space; surface?: BoxSurface }
>;

export function Box<Element extends ElementType = "div">({
  as,
  border = "none",
  className,
  padding = "none",
  surface = "none",
  ...props
}: BoxProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutParts.box, className)} data-border={border} data-padding={padding} data-surface={surface} />;
}

export type HeroProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { align?: HeroAlign; padding?: HeroPadding; surface?: HeroSurface }
>;

export function Hero<Element extends ElementType = "div">({
  align = "start",
  as,
  className,
  padding = "xl",
  surface = "surface",
  ...props
}: HeroProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(heroParts.hero, className)}
      data-align={align}
      data-padding={padding}
      data-surface={surface}
    />
  );
}

/*
 * FREE COMPOSITIONAL, like `Hero`: the host is a real `<footer>` by default (the `contentinfo`
 * landmark at document level), and everything inside is the composer's, `Grid` of `NavList`
 * columns, a `Text` legal line, a `Wrapper` to hold the measure. `as` is here for the one case a
 * footer is deliberately nested inside an `<article>` and must NOT be the landmark.
 */
export type FooterProps<Element extends ElementType = "footer"> = PolymorphicProps<
  Element,
  LayoutChildren & { divider?: boolean; padding?: FooterPadding; surface?: FooterSurface }
>;

export function Footer<Element extends ElementType = "footer">({
  as,
  className,
  divider = true,
  padding = "lg",
  surface = "sunken",
  ...props
}: FooterProps<Element>) {
  const Component = as ?? "footer";
  return (
    <Component
      {...props}
      className={classes(footerParts.footer, className)}
      data-divider={divider ? "" : "false"}
      data-padding={padding}
      data-surface={surface}
    />
  );
}

export type StackProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { align?: LayoutAlign; gap?: Space }
>;

export function Stack<Element extends ElementType = "div">({ as, align, className, gap = "md", ...props }: StackProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutParts.stack, className)} data-align={align} data-gap={gap} />;
}

export type InlineProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    align?: InlineAlign;
    blockStart?: InlineBlockStart;
    equal?: boolean;
    gap?: Space;
    justify?: InlineJustify;
    wrap?: boolean;
  }
>;

export function Inline<Element extends ElementType = "div">({
  as,
  align = "end",
  blockStart = "none",
  className,
  equal = false,
  gap = "md",
  justify = "start",
  wrap = true,
  ...props
}: InlineProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.inline, className)}
      data-align={align}
      data-block-start={blockStart === "none" ? undefined : blockStart}
      data-equal={equal ? "" : undefined}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap}
    />
  );
}

export type GridProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & {
    columns?: GridColumns;
    gap?: Space;
    multicol?: boolean;
    responsive?: boolean;
    "data-multicol"?: string;
    "data-responsive"?: string;
  }
>;

export function Grid<Element extends ElementType = "div">({
  as,
  className,
  columns = 1,
  gap = "md",
  multicol,
  responsive,
  "data-multicol": rawMulticol,
  "data-responsive": rawResponsive,
  ...props
}: GridProps<Element>) {
  const Component = as ?? "div";
  return (
    <Component
      {...props}
      className={classes(layoutParts.grid, className)}
      data-columns={columns}
      data-gap={gap}
      data-multicol={multicol === true ? "" : multicol === false ? undefined : rawMulticol}
      data-responsive={responsive === true ? "" : responsive === false ? undefined : rawResponsive}
    />
  );
}

/**
 * A page flow with content, narrow, breakout and full-width spans.
 *
 * The span stays on the semantic direct child as `data-width`; this root only owns the grid.
 */
export type LayoutGridProps<Element extends ElementType = "div"> = PolymorphicProps<Element, LayoutChildren>;

export function LayoutGrid<Element extends ElementType = "div">({
  as,
  className,
  ...props
}: LayoutGridProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutGridParts.layoutGrid, className)} />;
}

/**
 * The application work-area landmark. It deliberately owns no layout styling and may be empty.
 */
export type MainProps = ComponentPropsWithoutRef<"main">;

export function Main(props: MainProps) {
  return <main {...props} />;
}

export type WrapperProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { size?: WrapperSize }
>;

export function Wrapper<Element extends ElementType = "div">({
  as,
  className,
  size = "md",
  ...props
}: WrapperProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutParts.wrapper, className)} data-size={size} />;
}
