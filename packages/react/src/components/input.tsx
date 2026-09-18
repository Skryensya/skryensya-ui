import { inputParts, type InputSize, inputContract } from "@skryensya/core/input";
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useFormFieldControl } from "./form-field.js";

/* Derived, never restated: the default lives in the contract. */
const { type: typeOption } = inputContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: never;
  /** Control height. Named `controlSize` because `size` is already a native input attribute. */
  controlSize?: InputSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, controlSize, type = typeOption.default, ...props },
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

export type NativeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: never;
  /** Control height. Named `controlSize` because `size` is already a native input attribute. */
  controlSize?: InputSize;
};

/*
 * Same appearance and FormField wiring as Input: "native" names the CONTROL (time/color/range…),
 * not a refusal of the field chrome. Outside a FormField it stays a valid control with its own
 * aria-label; inside one it inherits id / describedBy / invalid / required / disabled.
 */
export const NativeInput = forwardRef<HTMLInputElement, NativeInputProps>(function NativeInput(
  { className, controlSize, ...props },
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
    />
  );
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
