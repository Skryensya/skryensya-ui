import { formFieldParts } from "@skryensya/core/form-field";
import { createContext, useContext, useId, type ReactNode } from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type FormFieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

/*
 * Lives here rather than beside Input because the wiring belongs to the field, not to whichever
 * control it happens to hold. Exported so that any control can read it. A select, a checkbox group
 * or a combobox has the same six ids to honour, and the alternative is each of them growing its own
 * copy of the wiring, which is the drift this contract exists to prevent.
 */
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/*
 * A control inside a FormField inherits the wiring the field already computed; the same control
 * outside one is still a valid control, so every inherited value falls back to the prop.
 */
export function useFormFieldControl(props: {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
}) {
  const field = useContext(FormFieldContext);
  const generatedId = useId();

  return {
    id: props.id ?? field?.controlId ?? generatedId,
    describedBy: props["aria-describedby"] ?? field?.describedBy,
    invalid: field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
  };
}

export type FormFieldProps = {
  children: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  /** The error message. Its presence is what makes the field invalid, color is never the only cue. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  /** Clips the label to a name-only box. The control keeps its label; only the eye skips it. */
  labelHidden?: boolean;
  className?: string;
  id?: string;
};

export function FormField({
  children,
  className,
  disabled = false,
  error,
  hint,
  id,
  label,
  labelHidden = false,
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FormFieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(error), required, disabled }}
    >
      <div
        className={cx(formFieldParts.root, className)}
        data-disabled={disabled ? "" : undefined}
        data-label-hidden={labelHidden ? "" : undefined}
      >
        <label className={formFieldParts.label} htmlFor={controlId}>
          {label}
          {required ? (
            <span aria-hidden="true" className={formFieldParts.requiredIndicator}>
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <div className={formFieldParts.hint} id={hintId}>
            {hint}
          </div>
        ) : null}
        {children}
        {error ? (
          <div className={formFieldParts.error} id={errorId}>
            {error}
          </div>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
