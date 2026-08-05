import {
  selectionParts,
  type CheckedChangeDetails,
  type CheckedState,
  type RadioGroupOrientation,
  type RadioValueChangeDetails,
} from "@skryensya/core/selection";
import { forwardRef, useEffect, useRef, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";
import { Icon } from "./icon.js";

function classes(...values: readonly (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

/** Check + remove from the icon set, shared with TileCheckbox so both paint one control. */
export function CheckboxIndicators() {
  return (
    <>
      <span className={selectionParts.checkboxIndicator} data-state="checked">
        <Icon name="check" size="sm" />
      </span>
      <span className={selectionParts.checkboxIndicator} data-state="indeterminate">
        <Icon name="remove" size="sm" />
      </span>
    </>
  );
}

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onChange" | "type"> & {
  checked?: CheckedState;
  children?: ReactNode;
  defaultChecked?: CheckedState;
  defaultIndeterminate?: boolean;
  onCheckedChange?: (details: CheckedChangeDetails) => void;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { checked, children, className, defaultChecked, defaultIndeterminate, disabled, onCheckedChange, ...props },
  ref,
) {
  const input = useRef<HTMLInputElement>(null);
  const controlled = checked !== undefined;

  useEffect(() => {
    if (controlled && input.current) input.current.indeterminate = checked === "indeterminate";
  }, [checked, controlled]);

  const setRef = (node: HTMLInputElement | null) => {
    input.current = node;
    if (node) node.indeterminate = !controlled && (defaultChecked === "indeterminate" || defaultIndeterminate === true);
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.({ checked: event.currentTarget.indeterminate ? "indeterminate" : event.currentTarget.checked });
  };

  return (
    <label className={classes(selectionParts.checkbox, className)}>
      <input
        {...props}
        checked={controlled ? checked === true : undefined}
        className={selectionParts.checkboxInput}
        // `undefined` when controlled, never `false`: React reads a present `defaultChecked` as the
        // author asking for an uncontrolled input, and warns that the element is both at once.
        defaultChecked={controlled ? undefined : defaultChecked === true}
        disabled={disabled}
        onChange={onChange}
        ref={setRef}
        type="checkbox"
      />
      <span aria-hidden="true" className={classes(selectionParts.checkboxControl, "sk-interactive")}>
        <CheckboxIndicators />
      </span>
      {children ? <span className={selectionParts.checkboxLabel}>{children}</span> : null}
    </label>
  );
});

export type RadioGroupItem = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

export type RadioGroupProps = Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  defaultValue?: string | null;
  disabled?: boolean;
  items: readonly RadioGroupItem[];
  name: string;
  onValueChange?: (details: RadioValueChangeDetails) => void;
  orientation?: RadioGroupOrientation;
  required?: boolean;
  value?: string | null;
};

export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, defaultValue, disabled, items, name, onValueChange, orientation = "vertical", required, value, ...props },
  ref,
) {
  const controlled = value !== undefined;

  /*
   * On each input rather than delegated on the group. A change event does bubble, so one handler on
   * the wrapper would fire, but React checks per element whether a `checked` input can be typed
   * into, sees no handler of its own, and renders every option read-only.
   */
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.checked) onValueChange?.({ value: event.currentTarget.value });
  };

  return (
    <div {...props} aria-orientation={orientation} className={classes(selectionParts.radioGroup, className)} data-orientation={orientation} ref={ref} role="radiogroup">
      {items.map((item) => (
        <label className={selectionParts.radio} key={item.value}>
          <input
            checked={controlled ? value === item.value : undefined}
            className={selectionParts.radioInput}
            defaultChecked={controlled ? undefined : defaultValue === item.value}
            disabled={disabled || item.disabled}
            name={name}
            onChange={onChange}
            required={required}
            type="radio"
            value={item.value}
          />
          <span aria-hidden="true" className={selectionParts.radioControl}>
            <span className={selectionParts.radioIndicator} />
          </span>
          <span className={selectionParts.radioLabel}>{item.label}</span>
        </label>
      ))}
    </div>
  );
});

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "checked" | "defaultChecked" | "onChange" | "role" | "type"> & {
  checked?: boolean;
  children?: ReactNode;
  defaultChecked?: boolean;
  onCheckedChange?: (details: CheckedChangeDetails) => void;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { checked, children, className, defaultChecked, disabled, onCheckedChange, ...props },
  ref,
) {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => onCheckedChange?.({ checked: event.currentTarget.checked });

  return (
    <label className={classes(selectionParts.switch, className)}>
      <input {...props} checked={checked} className={selectionParts.switchInput} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange} ref={ref} role="switch" type="checkbox" />
      <span aria-hidden="true" className={selectionParts.switchControl}>
        <span className={selectionParts.switchThumb} />
      </span>
      {children ? <span className={selectionParts.switchLabel}>{children}</span> : null}
    </label>
  );
});
