import { progressFraction, progressParts, type ProgressTone, progressContract } from "@skryensya/core/progress";
import { type CSSProperties, type HTMLAttributes } from "react";

/* Derived, never restated: the default lives in the contract. */
const { max: maxOption, tone: toneOption } = progressContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value: number;
  max?: number;
  tone?: ProgressTone;
  /**
   * Accessible name for the bar. Required: `core/progress.ts` requires it too, without one the
   * `progressbar` role announces a bare number about nothing.
   */
  label: string;
};

export function Progress({ className, label, max = maxOption.default, tone = toneOption.default, value, ...props }: ProgressProps) {
  const fraction = progressFraction(value, max);
  const clamped = Math.round(fraction * max * 100) / 100;
  const style = { ...props.style, "--sk-progress-fill": `${fraction * 100}%` } as CSSProperties;

  return (
    <div
      {...props}
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={clamped}
      className={cx(progressParts.root, className)}
      data-tone={tone}
      role="progressbar"
      style={style}
    >
      <div className={progressParts.bar} />
    </div>
  );
}
