import { slider } from "@skryensya/core/machines";
import { clampSliderRange, sliderParts } from "@skryensya/core/slider";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, type CSSProperties, type HTMLAttributes } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

const toNumber = (value: unknown, fallback: number) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const thumbSize = { width: 32, height: 32 };

export type SliderProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: number;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  disabled?: boolean;
  onValueChange?: (value: number) => void;
};

export function Slider({
  className,
  defaultValue,
  disabled,
  id,
  max = 100,
  min = 0,
  name,
  onValueChange,
  step,
  style,
  value,
  ...props
}: SliderProps) {
  const generatedId = useId();
  const lo = toNumber(min, 0);
  const hi = toNumber(max, 100);
  const controlled = value !== undefined;
  const service = useMachine(slider.machine, {
    id: id ?? generatedId,
    "aria-label": props["aria-label"] ? [String(props["aria-label"])] : undefined,
    "aria-labelledby": props["aria-labelledby"] ? [String(props["aria-labelledby"])] : undefined,
    defaultValue: [toNumber(defaultValue, lo)],
    disabled,
    max: hi,
    min: lo,
    name,
    onValueChange(details) {
      onValueChange?.(details.value[0] ?? lo);
    },
    step,
    thumbAlignment: "center",
    thumbSize,
    value: controlled ? [toNumber(value, lo)] : undefined,
  });
  const api = slider.connect(service, normalizeProps);
  const rootProps = api.getRootProps();
  const controlProps = api.getControlProps();
  const trackProps = api.getTrackProps();
  const rangeProps = api.getRangeProps();
  const thumbProps = api.getThumbProps({ index: 0 });

  return (
    <div
      {...props}
      {...rootProps}
      className={cx(sliderParts.root, className)}
      style={{ ...(rootProps.style as CSSProperties), ...style }}
    >
      <div {...controlProps} className={sliderParts.control} data-sk-slider-control="">
        <div {...trackProps} className={sliderParts.track} data-sk-slider-track="">
          <div {...rangeProps} className={sliderParts.range} data-sk-slider-range-part="" />
        </div>
        <div {...thumbProps} className={sliderParts.thumb} data-sk-slider-thumb="" draggable={undefined}>
          <input {...api.getHiddenInputProps({ index: 0, name })} className={sliderParts.input} data-sk-slider-input="" />
        </div>
      </div>
    </div>
  );
}

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
  const generatedId = useId();
  const { low, high } = clampSliderRange(defaultLowValue ?? min, defaultHighValue ?? max);
  const service = useMachine(slider.machine, {
    id: id ?? generatedId,
    "aria-label": [lowLabel, highLabel],
    defaultValue: [low, high],
    disabled,
    max,
    min,
    onValueChange(details) {
      onValueChange?.({ low: details.value[0] ?? min, high: details.value[1] ?? max });
    },
    step,
    thumbAlignment: "center",
    thumbSize,
  });
  const api = slider.connect(service, normalizeProps);
  const rootProps = api.getRootProps();
  const controlProps = api.getControlProps();
  const trackProps = api.getTrackProps();
  const rangeProps = api.getRangeProps();
  const lowThumbProps = api.getThumbProps({ index: 0, name: lowName });
  const highThumbProps = api.getThumbProps({ index: 1, name: highName });

  return (
    <div
      {...rootProps}
      className={cx(sliderParts.rangeRoot, className)}
      style={rootProps.style as CSSProperties}
    >
      <div {...controlProps} className={sliderParts.rangeControl} data-sk-slider-range-control="">
        <div {...trackProps} className={sliderParts.rangeTrack} data-sk-slider-range-track="">
          <div {...rangeProps} className={sliderParts.rangeFill} data-sk-slider-range-fill="" />
        </div>
        <div {...lowThumbProps} className={sliderParts.rangeLow} data-sk-slider-range-low="" draggable={undefined}>
          <input
            {...api.getHiddenInputProps({ index: 0, name: lowName })}
            className={sliderParts.rangeLowInput}
            data-sk-slider-range-low-input=""
          />
        </div>
        <div {...highThumbProps} className={sliderParts.rangeHigh} data-sk-slider-range-high="" draggable={undefined}>
          <input
            {...api.getHiddenInputProps({ index: 1, name: highName })}
            className={sliderParts.rangeHighInput}
            data-sk-slider-range-high-input=""
          />
        </div>
      </div>
    </div>
  );
}
