import { timeFieldParts } from "@skryensya/core/time-field";
import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
} from "react";

export type TimeFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> & {
  label: ReactNode;
  hint?: ReactNode;
  controlSize?: "sm" | "md" | "lg";
};

/** One native time input with platform editing, validation and picker behind the shared field chrome. */
export function TimeField({
  "aria-describedby": describedBy,
  className,
  controlSize = "md",
  disabled,
  hint,
  id,
  label,
  ...props
}: TimeFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const descriptions = [describedBy, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      className={timeFieldParts.root}
      data-disabled={disabled ? "" : undefined}
      data-size={controlSize}
    >
      <label className={timeFieldParts.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={timeFieldParts.control}>
        <input
          {...props}
          aria-describedby={descriptions}
          className={[timeFieldParts.input, className]
            .filter(Boolean)
            .join(" ")}
          disabled={disabled}
          id={inputId}
          type="time"
        />
      </div>
      {hint ? (
        <span className={timeFieldParts.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
