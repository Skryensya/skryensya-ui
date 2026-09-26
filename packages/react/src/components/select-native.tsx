import { selectParts, type SelectOption } from "@skryensya/core/select";
import type { ReactNode, SelectHTMLAttributes } from "react";
import { useFormFieldControl } from "./form-field.js";

/**
 * The platform <select>, styled through Core but intentionally outside every enhancer and machine.
 *
 * It lives in its own entry point so choosing the native control does not make Select's Zag
 * dependency part of the module graph. Use Select only when its extra interaction contract is
 * actually required.
 */
export type NativeSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  children?: ReactNode;
  options?: readonly SelectOption[];
};

export function NativeSelect({ children, className, options, ...props }: NativeSelectProps) {
  const classes = className ? `${selectParts.native} ${className}` : selectParts.native;
  /* Inside a FormField this is the field's control, wired exactly as Input is: the label's `for`,
     the hint and error ids, and the field's required/disabled/invalid state. Outside one, every
     value falls back to what was passed here. */
  const control = useFormFieldControl(props);

  return (
    <select
      {...props}
      aria-describedby={control.describedBy}
      aria-invalid={control.invalid ? "true" : undefined}
      className={classes}
      disabled={control.disabled}
      id={control.id}
      required={control.required}
    >
      {options?.map((option) => (
        <option disabled={option.disabled} key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
}
