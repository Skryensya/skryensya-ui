import {
  numberFieldEvents,
  numberFieldParts,
  numberFieldContract,
} from "@skryensya/core/number-field";
import { numberInput } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useRef, type ReactNode } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const {
  decrementLabel: decrementLabelOption,
  incrementLabel: incrementLabelOption,
  locale: localeOption,
} = numberFieldContract.options;

export type NumberFieldProps = {
  id?: string;
  name?: string;
  /** Names the field. Contract slot is text-only. */
  label: string;
  /** Optional supporting text under the control. Contract slot is text-only. */
  hint?: string;
  value?: string;
  defaultValue?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  locale?: string;
  formatOptions?: Intl.NumberFormatOptions;
  decrementLabel?: string;
  incrementLabel?: string;
  decrementIcon?: ReactNode;
  incrementIcon?: ReactNode;
  onValueChange?: (details: { value: string; valueAsNumber: number }) => void;
};

export function NumberField({
  decrementIcon,
  decrementLabel = decrementLabelOption.default,
  defaultValue,
  disabled,
  formatOptions,
  hint,
  id,
  incrementIcon,
  incrementLabel = incrementLabelOption.default,
  invalid,
  label,
  locale = localeOption.default,
  max,
  min,
  name,
  onValueChange,
  readOnly,
  required,
  step,
  value,
}: NumberFieldProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = hint ? `${resolvedId}-hint` : undefined;
  const service = useMachine(numberInput.machine, {
    id: resolvedId,
    name,
    locale,
    value,
    defaultValue,
    min,
    max,
    step,
    disabled,
    readOnly,
    required,
    invalid,
    formatOptions,
    translations: { decrementLabel, incrementLabel },
    onValueChange(details) {
      onValueChange?.(details);
      rootRef.current?.dispatchEvent(
        new CustomEvent(numberFieldEvents.valueChange, {
          bubbles: true,
          detail: { value: details.value, valueAsNumber: details.valueAsNumber },
        }),
      );
    },
  });
  const api = numberInput.connect(service, normalizeProps);
  const inputProps = api.getInputProps();
  const describedBy = [inputProps["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div
      {...api.getRootProps()}
      className={numberFieldParts.root}
      data-invalid={invalid || undefined}
      data-sk-number-field=""
      ref={rootRef}
    >
      <label {...api.getLabelProps()} className={numberFieldParts.label}>
        {label}
      </label>
      <div {...api.getControlProps()} className={numberFieldParts.control}>
        {/* Composed icon buttons: the button provides the shape and the state layer, the accessible
            name is written by Zag (`translations`), and the glyph stays decorative. */}
        <button
          {...api.getDecrementTriggerProps()}
          className={`sk-button sk-interactive ${numberFieldParts.decrement}`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          {decrementIcon ?? <Icon name="remove" size="sm" />}
        </button>
        <input {...inputProps} aria-describedby={describedBy} className={numberFieldParts.input} />
        <button
          {...api.getIncrementTriggerProps()}
          className={`sk-button sk-interactive ${numberFieldParts.increment}`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          type="button"
        >
          {incrementIcon ?? <Icon name="add" size="sm" />}
        </button>
      </div>
      {hint ? (
        <span className={numberFieldParts.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
