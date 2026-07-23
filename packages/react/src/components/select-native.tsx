import { selectParts, type SelectOption } from "@skryensya/core/select";
import type { ReactNode, SelectHTMLAttributes } from "react";

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

export function NativeSelect({ children, className, disabled, options, ...props }: NativeSelectProps) {
  const classes = className ? `${selectParts.native} ${className}` : selectParts.native;

  return (
    <select {...props} className={classes} disabled={disabled}>
      {options?.map((option) => (
        <option disabled={option.disabled} key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
      {children}
    </select>
  );
}
