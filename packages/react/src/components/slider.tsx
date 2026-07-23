import { sliderFill, sliderParts } from "@skryensya/core/slider";
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
const sliderFillPropertyName = "--ds-slider-fill";
