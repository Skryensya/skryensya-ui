import { inputParts, type InputSize } from "@skryensya/core/input";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useFormFieldControl } from "./form-field.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: never;
  /** Control height. Named `controlSize` because `size` is already a native input attribute. */
  controlSize?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, controlSize, type = "text", ...props },
  ref,
) {
  const control = useFormFieldControl(props);

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
  { className, ...props },
  ref,
) {
  return <input {...props} className={cx(inputParts.root, className)} ref={ref} />;
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  controlSize?: InputSize;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, controlSize, ...props },
  ref,
) {
  const control = useFormFieldControl(props);

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
