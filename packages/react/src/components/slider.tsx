import { clampSliderRange, sliderFill, sliderParts, sliderRangeBounds } from "@skryensya/core/slider";
import { forwardRef, useState, type CSSProperties, type ChangeEvent, type InputHTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

const toNumber = (value: string | number | readonly string[] | undefined, fallback: number) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export type SliderProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  onValueChange?: (value: number) => void;
};

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  { className, defaultValue, max = 100, min = 0, onChange, onValueChange, value, ...props },
  ref,
) {
  const lo = toNumber(min, 0);
  const hi = toNumber(max, 100);
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(() => toNumber(controlled ? value : defaultValue, lo));
  const current = controlled ? toNumber(value, lo) : internal;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = toNumber(event.currentTarget.value, lo);
    if (!controlled) setInternal(next);
    onChange?.(event);
    onValueChange?.(next);
  };

  const style = { ...props.style, [sliderFillPropertyName]: sliderFill(current, lo, hi) } as CSSProperties;

  return (
    <input
      {...props}
      className={cx(sliderParts.root, className)}
      defaultValue={controlled ? undefined : defaultValue}
      max={max}
      min={min}
      onChange={handleChange}
      ref={ref}
      style={style}
      type="range"
      value={controlled ? value : undefined}
    />
  );
});

// Kept as a literal so the CSS custom property name and the core constant can be diffed at a glance.
const sliderFillPropertyName = "--sk-slider-fill";

/*
 * Two native range inputs, not WAI's own custom `role="slider"` SVG widget; see `slider.ts`'s own
 * "MULTI-THUMB" banner for why. Uncontrolled only, for now: no demo or consumer needs a fully
 * controlled two-thumb slider yet, and `value`/`onChange` on TWO inputs at once (one author-facing
 * value, which one is "the" controlled input?) is a real API question worth deferring to an actual
 * use case rather than guessing at today.
 */
export type SliderRangeProps = {
  className?: string;
  id?: string;
  lowLabel: string;
  highLabel: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  defaultLowValue?: number;
  defaultHighValue?: number;
  lowName?: string;
  highName?: string;
  onValueChange?: (value: { low: number; high: number }) => void;
};

export function SliderRange({
  className,
  defaultHighValue,
  defaultLowValue,
  disabled,
  highLabel,
  highName,
  id,
  lowLabel,
  lowName,
  max = 100,
  min = 0,
  onValueChange,
  step,
}: SliderRangeProps) {
  const [low, setLow] = useState(() => clampSliderRange(defaultLowValue ?? min, defaultHighValue ?? max).low);
  const [high, setHigh] = useState(() => clampSliderRange(defaultLowValue ?? min, defaultHighValue ?? max).high);
  const bounds = sliderRangeBounds(low, high, min, max);

  const fillStyle = {
    "--sk-slider-range-fill-start": sliderFill(low, min, max),
    "--sk-slider-range-fill-end": sliderFill(high, min, max),
  } as CSSProperties;

  return (
    <div className={cx(sliderParts.rangeRoot, className)} id={id}>
      <div aria-hidden="true" className={sliderParts.rangeTrack} />
      <div aria-hidden="true" className={sliderParts.rangeFill} style={fillStyle} />
      <input
        aria-label={lowLabel}
        className={cx(`${sliderParts.rangeLow} ${sliderParts.root}`, undefined)}
        disabled={disabled}
        max={bounds.lowMax}
        min={bounds.lowMin}
        name={lowName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const next = toNumber(event.currentTarget.value, min);
          setLow(next);
          onValueChange?.({ low: next, high });
        }}
        step={step}
        type="range"
        value={low}
      />
      <input
        aria-label={highLabel}
        className={cx(`${sliderParts.rangeHigh} ${sliderParts.root}`, undefined)}
        disabled={disabled}
        max={bounds.highMax}
        min={bounds.highMin}
        name={highName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const next = toNumber(event.currentTarget.value, max);
          setHigh(next);
          onValueChange?.({ low, high: next });
        }}
        step={step}
        type="range"
        value={high}
      />
    </div>
  );
}
