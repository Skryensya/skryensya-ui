import { numberFieldParts } from "@skryensya/core/number-field";
import { numberInput } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, type ReactNode } from "react";
import { Icon } from "./icon.js";

export type NumberFieldProps = {
  id?: string;
  name?: string;
  label: ReactNode;
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
  decrementLabel = "Disminuir",
  defaultValue,
  disabled,
  formatOptions,
  id,
  incrementIcon,
  incrementLabel = "Aumentar",
  invalid,
  label,
  locale = "es",
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
  const service = useMachine(numberInput.machine, {
    id: id ?? generatedId,
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
    onValueChange,
  });
  const api = numberInput.connect(service, normalizeProps);
  return (
    <div {...api.getRootProps()} className={numberFieldParts.root}>
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
        <input {...api.getInputProps()} className={numberFieldParts.input} />
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
    </div>
  );
}
