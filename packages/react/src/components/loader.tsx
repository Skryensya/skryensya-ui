import { loaderAttrs, loaderParts, loaderTicks, type LoaderSize, type LoaderSpeed, type LoaderVariant, loaderContract } from "@skryensya/core/loader";
import { type HTMLAttributes } from "react";

/* Derived, never restated: the default lives in the contract. */
const { size: sizeOption, speed: speedOption, variant: variantOption } = loaderContract.options;

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
  size = sizeOption.default,
  speed = speedOption.default,
  variant = variantOption.default,
  ...props
}: LoaderProps) {
  const decorative = label === undefined;

  /*
   * The COUNT comes from core and the ANGLE comes from the stylesheet, which is why the staggered
   * variants render nothing but empty spans. The six pseudo-element variants return zero and render
   * no children at all, so their markup is unchanged. Both halves are shared with authored markup,
   * so a spokes has one stagger rather than one per binding.
   */
  return (
    <span
      {...props}
      aria-atomic={decorative ? undefined : "true"}
      aria-hidden={decorative ? true : undefined}
      aria-label={label}
      className={cx(loaderParts.root, className)}
      data-size={size}
      data-speed={speed}
      data-variant={variant}
      role={decorative ? undefined : "status"}
      {...{ [loaderAttrs.root]: "" }}
    >
      {Array.from({ length: loaderTicks(variant) }, (_, index) => (
        <span className={loaderParts.tick} key={index} />
      ))}
    </span>
  );
}

/**
 * The wait announced and not drawn: for a skeleton screen, where Placeholders already carry the
 * shape and a spinner would undo the reason for them.
 *
 * The label is required, not optional: this element renders nothing, so without a name it is an
 * empty live region that announces an empty string.
 */
export function LoaderStatus({ label }: { label: string }) {
  return (
    <span aria-atomic="true" aria-label={label} className="sk-visually-hidden" role="status" />
  );
}
