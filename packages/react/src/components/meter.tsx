import { meterFraction, meterParts, type MeterTone } from "@skryensya/core/meter";
import { type CSSProperties, type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type MeterProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  value: number;
  min?: number;
  max?: number;
  /** For when the raw number alone is not user-friendly: "50% (6 hours) remaining". */
  valueText?: string;
  tone?: MeterTone;
  /** Accessible name for the bar. Falls back to aria-labelledby / an ambient label when omitted. */
  label?: string;
};

export function Meter({
  className,
  label,
  max = 100,
  min = 0,
  tone = "accent",
  value,
  valueText,
  ...props
}: MeterProps) {
  const fraction = meterFraction(value, min, max);
  const style = { ...props.style, "--sk-meter-fill": `${fraction * 100}%` } as CSSProperties;

  return (
    // Painted, not just announced (see meter.ts's own file banner): `label`/`valueText` also drive
    // this header row, so a reader tells a Meter from a Progress bar at a glance, not only via a
    // screen reader. The track below still carries its own `aria-label`/`aria-valuetext` independently
    // of what's painted here — spoken and painted never have to agree on layout to both be correct.
    <div className={cx(meterParts.root, className)}>
      <div className={meterParts.header}>
        <span className={meterParts.label}>{label}</span>
        {valueText && <span className={meterParts.value}>{valueText}</span>}
      </div>
      <div
        {...props}
        aria-label={label}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={value}
        aria-valuetext={valueText}
        className={meterParts.track}
        data-tone={tone}
        role="meter"
        style={style}
      >
        <div className={meterParts.bar} />
      </div>
    </div>
  );
}
