import {
  placeholderLines,
  placeholderParts,
  type PlaceholderCircleSize,
  type PlaceholderTextRole,
} from "@skryensya/core/placeholder";
import { type CSSProperties, type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * Decorative geometry only, in every signature below: `aria-hidden` is not a prop any of them
 * accept. A skeleton is a picture of absence, and `aria-busy` plus the loading message belong to the
 * region around it, which is the thing that actually knows something is loading.
 */
type SkeletonProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "role" | "aria-label" | "aria-hidden"
>;

/** A style object with the contract's custom properties allowed alongside real CSS. */
type SkeletonStyle = CSSProperties & Record<`--${string}`, string | undefined>;

function skeletonStyle(style: CSSProperties | undefined, own: SkeletonStyle): SkeletonStyle {
  return { ...own, ...style };
}

export type PlaceholderProps = SkeletonProps & {
  /**
   * The type role this line replaces, from the same vocabulary Typography publishes. The stylesheet
   * resolves it to that role's font-size and line-height PAIR, so the bar occupies exactly the block
   * the real text will.
   */
  text?: PlaceholderTextRole;
  /** How far the bar runs: any CSS length or percentage. */
  width?: string;
};

/** One bar standing in for one line of text, sized by the role it replaces. */
export function Placeholder({ className, style, text = "body", width, ...props }: PlaceholderProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(placeholderParts.root, className)}
      data-shape="text"
      data-text={text}
      style={skeletonStyle(style, { "--sk-placeholder-inline-size": width })}
    />
  );
}

export type PlaceholderParagraphProps = SkeletonProps & {
  text?: PlaceholderTextRole;
  /** How many lines to draw. Clamped by `placeholderLines`, the same way the emitter clamps it. */
  lines?: number;
  /** How far the last line runs. The raggedness that reads as prose rather than as a table. */
  lastLine?: string;
};

/**
 * Several lines with a short last one: the shape of a paragraph that has not loaded.
 *
 * The COUNT comes from core and the WIDTHS come from the stylesheet, which is why this renders
 * nothing but empty spans. Both halves are shared with authored markup, so a paragraph skeleton has
 * one ragged edge rather than one per binding.
 */
export function PlaceholderParagraph({
  className,
  lastLine,
  lines = 3,
  style,
  text = "body",
  ...props
}: PlaceholderParagraphProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(placeholderParts.root, className)}
      data-shape="paragraph"
      data-text={text}
      style={skeletonStyle(style, { "--sk-placeholder-last-line": lastLine })}
    >
      {Array.from({ length: placeholderLines(lines) }, (_, index) => (
        <span className={placeholderParts.line} key={index} />
      ))}
    </span>
  );
}

export type PlaceholderBlockProps = SkeletonProps & {
  width?: string;
  /** How tall the block runs. Media inside a clipped frame usually wants `fill` instead. */
  height?: string;
  /** Take the parent's whole box and its corner: media inside an ImageFrame or any clipped surface. */
  fill?: boolean;
};

/** A rectangle: media, a card, a chart. */
export function PlaceholderBlock({
  className,
  fill,
  height,
  style,
  width,
  ...props
}: PlaceholderBlockProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(placeholderParts.root, className)}
      data-fill={fill ? "" : undefined}
      data-shape="block"
      style={skeletonStyle(style, {
        "--sk-placeholder-inline-size": width,
        "--sk-placeholder-block-size": height,
      })}
    />
  );
}

export type PlaceholderCircleProps = SkeletonProps & {
  /** The control scale this disc matches, so swapping in the real Avatar does not resize. */
  size?: PlaceholderCircleSize;
};

/** A disc standing in for an avatar, on the same scale Avatar uses. */
export function PlaceholderCircle({ className, size = "md", ...props }: PlaceholderCircleProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(placeholderParts.root, className)}
      data-shape="circle"
      data-size={size}
    />
  );
}
