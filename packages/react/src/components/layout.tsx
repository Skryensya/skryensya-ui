import {
  layoutParts,
  type BoxBorder,
  type BoxSurface,
  type GridColumns,
  type InlineAlign,
  type InlineJustify,
  type LayoutAlign,
  type Space,
  type WrapperSize,
} from "@skryensya/core/layout";
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
  LayoutChildren & { align?: InlineAlign; gap?: Space; justify?: InlineJustify; wrap?: boolean }
>;

export function Inline<Element extends ElementType = "div">({
  as,
  align = "center",
  className,
  gap = "md",
  justify = "start",
  wrap = true,
  ...props
}: InlineProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutParts.inline, className)} data-align={align} data-gap={gap} data-justify={justify} data-wrap={wrap} />;
}

export type GridProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { columns?: GridColumns; gap?: Space }
>;

export function Grid<Element extends ElementType = "div">({ as, className, columns = 1, gap = "md", ...props }: GridProps<Element>) {
  const Component = as ?? "div";
  return <Component {...props} className={classes(layoutParts.grid, className)} data-columns={columns} data-gap={gap} />;
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
