import { progressFraction, progressParts, type ProgressTone } from "@skryensya/core/progress";
import { type CSSProperties, type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value: number;
  max?: number;
  tone?: ProgressTone;
  /** Accessible name for the bar. Falls back to aria-labelledby / an ambient label when omitted. */
  label?: string;
};

export function Progress({ className, label, max = 100, tone = "accent", value, ...props }: ProgressProps) {
  const fraction = progressFraction(value, max);
  const clamped = Math.round(fraction * max * 100) / 100;
  const style = { ...props.style, "--ds-progress-fill": `${fraction * 100}%` } as CSSProperties;

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
