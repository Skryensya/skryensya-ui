import {
  typographyParts,
  type HeadingSize,
  type LinkTone,
  type TextSize,
  type TextTone,
  type TextWeight,
} from "@skryensya/core/typography";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: "div" | "p" | "span";
  children: ReactNode;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
};

export function Text({ as: Component = "p", children, className, size = "body", tone = "primary", weight = "body", ...props }: TextProps) {
  return (
    <Component {...props} className={cx(typographyParts.text, className)} data-size={size} data-tone={tone} data-weight={weight}>
      {children}
    </Component>
  );
}

export type HeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, "children"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  children: ReactNode;
  size?: HeadingSize;
  /** No block-start spacing: first title in a dialog, card, or other already-padded container. */
  flush?: boolean;
};

export function Heading({ as: Component = "h2", children, className, flush = false, size = "h2", ...props }: HeadingProps) {
  return (
    <Component
      {...props}
      className={cx(typographyParts.heading, className)}
      data-flush={flush ? "" : undefined}
      data-size={size}
    >
      {children}
    </Component>
  );
}

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
  children: ReactNode;
  tone?: LinkTone;
};

/* Always underlined, the underline is not configurable, because a text link with no permanent
 * non-color cue fails WCAG 1.4.1 (see core/css/components/typography.css). Hover/press/focus come
 * from `sk-interactive` + the state layer, same as every other control. Default paint matches prose;
 * pass `tone="primary"` for the brand-colored call-out. */
export function Link({ children, className, tone, ...props }: LinkProps) {
  return (
    <a
      {...props}
      className={cx(`${typographyParts.link} sk-interactive`, className)}
      data-tone={tone}
    >
      {children}
    </a>
  );
}
