import {
  loaderParts,
  type LoaderSize,
  type LoaderSpeed,
  type LoaderVariant,
} from "@skryensya/core/loader";
import { type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type LoaderProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "role" | "aria-label" | "aria-hidden"
> & {
  /** Accessible status name. Without a label, Loader is decorative beside another status label. */
  label?: string;
  size?: LoaderSize;
  /** Motion design. Orthogonal to size and speed. */
  variant?: LoaderVariant;
  /** Cycle length via motion-loading intents. Orthogonal to size and variant. */
  speed?: LoaderSpeed;
};

export function Loader({
  className,
  label,
  size = "md",
  speed = "normal",
  variant = "ring",
  ...props
}: LoaderProps) {
  const decorative = label === undefined;

  return (
    <span
      {...props}
      aria-hidden={decorative ? true : undefined}
      aria-label={label}
      className={cx(loaderParts.root, className)}
      data-size={size}
      data-speed={speed}
      data-variant={variant}
      role={decorative ? undefined : "status"}
    />
  );
}
