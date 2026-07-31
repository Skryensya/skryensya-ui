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
import type { ComponentPropsWithoutRef, CSSProperties, ElementType, ReactNode } from "react";

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
  LayoutChildren & {
    align?: InlineAlign;
    equal?: boolean;
    gap?: Space;
    justify?: InlineJustify;
    wrap?: boolean;
  }
>;

export function Inline<Element extends ElementType = "div">({
  as,
  align = "center",
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
      data-equal={equal ? "" : undefined}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap}
    />
  );
}

export type GridProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { columns?: GridColumns; gap?: Space; multicol?: boolean; "data-multicol"?: string }
>;

export function Grid<Element extends ElementType = "div">({
  as,
  className,
  columns = 1,
  gap = "md",
  multicol,
  "data-multicol": rawMulticol,
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
    />
  );
}

export type DensityScopeProps<Element extends ElementType = "div"> = PolymorphicProps<
  Element,
  LayoutChildren & { densityFactor?: number }
>;

export function DensityScope<Element extends ElementType = "div">({
  as,
  densityFactor = 1,
  style,
  ...props
}: DensityScopeProps<Element>) {
  const Component = as ?? "div";
  const densityStyle = {
    ...style,
    "--sk-density-factor": densityFactor,
  } as CSSProperties;
  return <Component {...props} data-sk-density-scope="" style={densityStyle} />;
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
