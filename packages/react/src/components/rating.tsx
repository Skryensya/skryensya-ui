import { ratingGroup } from "@skryensya/core/machines";
import {
  ratingContract,
  ratingEvents,
  ratingFillPercent,
  ratingParts,
  type RatingSymbolSize,
} from "@skryensya/core/rating";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useRef, type ReactNode } from "react";

/* Derived, never restated: the defaults live in the contract. */
const { itemLabel: itemLabelOption, max: maxOption, symbolSize: symbolSizeOption } = ratingContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type RatingProps = {
  id?: string;
  name?: string;
  /** The accessible name of the group. A row of symbols announces nothing on its own. */
  label: string;
  defaultValue?: number;
  value?: number;
  max?: number;
  disabled?: boolean;
  readOnly?: boolean;
  symbolSize?: RatingSymbolSize;
  /** Each step's own name, with `{value}` for its number. See the contract's own note on the default. */
  itemLabel?: string;
  className?: string;
  onValueChange?: (details: { value: number }) => void;
};

/**
 * The input: a radio group over whole steps.
 *
 * Whole steps and not halves, while `RatingDisplay` takes fractions. See the contract's own note:
 * half of a 20px symbol is a 10px pointer target, and on a touch screen that is a coin toss.
 */
export function Rating({
  className,
  defaultValue,
  disabled,
  id,
  itemLabel = itemLabelOption.default,
  label,
  max = maxOption.default,
  name,
  onValueChange,
  readOnly,
  symbolSize = symbolSizeOption.default,
  value,
}: RatingProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);

  /*
   * SPREAD, NOT `value: undefined`, and this is not style.
   *
   * `@zag-js/core`'s `bindable` decides controlled-vs-uncontrolled by whether the `value` KEY is
   * present, not by whether it holds `undefined`. Passing `value` unconditionally therefore pins an
   * uncontrolled rating as controlled at its initial value forever: `onValueChange` still fires, the
   * internal value never moves, and the stars never light up. Measured directly against the machine
   * before this comment was written, because nothing about the symptom points at the cause.
   */
  const service = useMachine(ratingGroup.machine, {
    id: resolvedId,
    name,
    count: max,
    ...(value === undefined ? {} : { value }),
    ...(defaultValue === undefined ? {} : { defaultValue }),
    disabled,
    readOnly,
    /* Whole steps, which is the contract's own asymmetry rather than a Zag default. */
    allowHalf: false,
    translations: {
      /* Zag's own default is "N stars", in English, baked into the machine. The contract publishes
         the pattern instead so a Spanish page is not told about stars in another language. */
      ratingValueText: (index: number) => itemLabel.replace("{value}", String(index)),
    },
    onValueChange(details) {
      onValueChange?.({ value: details.value });
      /* The same channel authored markup gets, with the same detail. */
      rootRef.current?.dispatchEvent(
        new CustomEvent(ratingEvents.valueChange, { bubbles: true, detail: { value: details.value } }),
      );
    },
  });
  const api = ratingGroup.connect(service, normalizeProps);

  return (
    <div
      {...api.getRootProps()}
      className={cx(ratingParts.root, className)}
      data-disabled={disabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-size={symbolSize}
      ref={rootRef}
    >
      {/*
        * THE GROUP, and the name goes here rather than on the root: Zag puts `role="radiogroup"` on
        * the control, and `aria-labelledby` would otherwise point at a label element this binding
        * does not render, leaving the group with no accessible name at all.
        */}
      <div {...api.getControlProps()} aria-label={label} aria-labelledby={undefined} className={ratingParts.control}>
        {api.items.map((item) => (
          <span
            {...api.getItemProps({ index: item })}
            aria-roledescription={undefined}
            className={`${ratingParts.item} sk-interactive`}
            key={item}
          >
            {/*
             * Decorative, always. The step's own name is on the radio, and the glyph is a masked
             * box with no content of its own: announcing it would read the rating twice.
             */}
            <span aria-hidden="true" className={ratingParts.symbol} />
          </span>
        ))}
      </div>
      <input {...api.getHiddenInputProps()} className={ratingParts.input} />
    </div>
  );
}

export type RatingDisplayProps = {
  id?: string;
  /** The measurement. Fractional on purpose: an average of 4.3 is what the data holds. */
  value: number;
  max?: number;
  /** The whole reading as one sentence: "4.3 out of 5". Authored, so it is in the reader's language. */
  label: string;
  /** The visible number. Authored too, because "4,3" and "4.3" are the same value in two locales. */
  valueText?: ReactNode;
  /** What the average is of: "128 reviews". */
  count?: ReactNode;
  symbolSize?: RatingSymbolSize;
  className?: string;
};

/**
 * The display: one strip, one mask repeated `max` times, one hard colour stop.
 *
 * `role="img"` with the authored label and every symbol hidden, so the reading is announced once as
 * one fact rather than as five images a reader has to add up.
 */
export function RatingDisplay({
  className,
  count,
  id,
  label,
  max = maxOption.default,
  symbolSize = symbolSizeOption.default,
  value,
  valueText,
}: RatingDisplayProps) {
  return (
    <span
      aria-label={label}
      className={cx(ratingParts.root, className)}
      data-size={symbolSize}
      id={id}
      role="img"
      style={{ "--sk-rating-value": value, "--sk-rating-max": max } as React.CSSProperties}
    >
      <span
        aria-hidden="true"
        className={ratingParts.symbols}
        style={{ "--sk-rating-fill": `${ratingFillPercent(value, max)}%` } as React.CSSProperties}
      />
      {valueText === undefined ? null : <span className={ratingParts.value}>{valueText}</span>}
      {count === undefined ? null : <span className={ratingParts.count}>{count}</span>}
    </span>
  );
}
