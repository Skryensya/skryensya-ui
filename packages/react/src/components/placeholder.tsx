import { placeholderParts, type PlaceholderShape } from "@skryensya/core/placeholder";
import { type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type PlaceholderProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "role" | "aria-label" | "aria-hidden"
> & {
  shape?: PlaceholderShape;
};

/** Decorative geometry only. Put aria-busy and the loading message on the surrounding region. */
export function Placeholder({ className, shape = "text", ...props }: PlaceholderProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cx(placeholderParts.root, className)}
      data-shape={shape}
    />
  );
}
