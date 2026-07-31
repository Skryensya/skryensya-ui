import { fieldParts } from "@skryensya/core/field";
import { inputParts, type InputSize } from "@skryensya/core/input";
import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type FieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/*
 * A control inside a Field inherits the wiring the Field already computed; the same control
 * outside one is still a valid control, so every inherited value falls back to the prop.
 */
function useFieldControl(props: { id?: string; required?: boolean; disabled?: boolean; "aria-describedby"?: string }) {
  const field = useContext(FieldContext);
  const generatedId = useId();

  return {
    id: props.id ?? field?.controlId ?? generatedId,
    describedBy: props["aria-describedby"] ?? field?.describedBy,
    invalid: field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
  };
}

export type FieldProps = {
  children: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  /** The error message. Its presence is what makes the field invalid, color is never the only cue. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function Field({ children, className, disabled = false, error, hint, id, label, required = false }: FieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(error), required, disabled }}
    >
      <div className={cx(fieldParts.root, className)} data-disabled={disabled ? "" : undefined}>
        <label className={fieldParts.label} htmlFor={controlId}>
          {label}
          {required ? (
            <span aria-hidden="true" className={fieldParts.requiredIndicator}>
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <div className={fieldParts.hint} id={hintId}>
            {hint}
          </div>
        ) : null}
        {children}
        {error ? (
          <div className={fieldParts.error} id={errorId}>
            {error}
          </div>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: never;
  /** Control height. Named `controlSize` because `size` is already a native input attribute. */
  controlSize?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, controlSize, type = "text", ...props },
  ref,
) {
  const control = useFieldControl(props);

  return (
    <input
      {...props}
      aria-describedby={control.describedBy}
      aria-invalid={control.invalid ? "true" : undefined}
      className={cx(inputParts.root, className)}
      data-size={controlSize}
      disabled={control.disabled}
      id={control.id}
      ref={ref}
      required={control.required}
      type={type}
    />
  );
});

export type NativeInputProps = InputHTMLAttributes<HTMLInputElement>;

export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(function NativeInput(
  props,
  ref,
) {
  return <input {...props} ref={ref} />;
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  controlSize?: InputSize;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, controlSize, ...props },
  ref,
) {
  const control = useFieldControl(props);

  return (
    <textarea
      {...props}
      aria-describedby={control.describedBy}
      aria-invalid={control.invalid ? "true" : undefined}
      className={cx(inputParts.root, className)}
      data-size={controlSize}
      disabled={control.disabled}
      id={control.id}
      ref={ref}
      required={control.required}
    />
  );
});
