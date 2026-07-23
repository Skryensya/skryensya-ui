import { statParts, type StatTrend } from "@skryensya/core/stat";
import { type HTMLAttributes, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type StatProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: ReactNode;
  value: ReactNode;
  /** Optional change indicator, e.g. `<><Icon name="arrow-up" size="sm" /> 12.5%</>`. Coloured by `trend`, not by its own sign. */
  change?: ReactNode;
  trend?: StatTrend;
};

export function Stat({ change, className, label, trend = "neutral", value, ...props }: StatProps) {
  return (
    <div {...props} className={cx(statParts.root, className)}>
      <span className={statParts.label}>{label}</span>
      <span className={statParts.value}>{value}</span>
      {change != null ? (
        <span className={statParts.change} data-trend={trend}>
          {change}
        </span>
      ) : null}
    </div>
  );
}
