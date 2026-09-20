import { inputEvents, inputParts, type InputSize, inputContract } from "@skryensya/core/input";
import {
  inputFormatMessage,
  shouldShowInputError,
  validateInputFormat,
  type InputFormat,
  type InputFormatResult,
} from "@skryensya/core/input-format";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { useFormFieldControl } from "./form-field.js";

/* Derived, never restated: the default lives in the contract. */
const { type: typeOption } = inputContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  size?: never;
  /** Control height. Named `controlSize` because `size` is already a native input attribute. */
  controlSize?: InputSize;
  /**
   * Validation the control owns, for values the platform has no check for: a RUT's check digit, a
   * Chilean numbering plan, a URL that actually resolves somewhere. See the contract's own option.
   */
  format?: InputFormat;
  /**
   * Which country's numbering plan reads a national-format phone number ("CL", "US"). Only
   * `format="phone"` uses it, and only `@skryensya/phone` implements that format.
   */
  country?: string;
  /** One sentence replacing whatever message a failed `format` would have generated. */
  errorLabel?: string;
  /**
   * Every recomputation of validity, which is every keystroke once a `format` is set, not only the
   * failures. Read `reason` off a rejection to write your own message instead of the default one.
   */
  onValidate?: (result: InputFormatResult) => void;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, controlSize, country, errorLabel, format, onBlur, onChange, onValidate, type = typeOption.default, ...props },
  ref,
) {
  const control = useFormFieldControl(props);
  const { reportError } = control;

  const node = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => node.current as HTMLInputElement, []);

  /*
   * A REF, NOT STATE, and that is the whole reason this reads cleanly: "has this person left the
   * field" never needs to paint on its own. It is read inside the next validation run, and the
   * thing that DOES paint (`showError`) is the state below. As state it would render once on blur
   * and once more when validation followed it.
   */
  const touched = useRef(false);
  /*
   * Only so a control standing OUTSIDE a FormField still paints. Inside one, `control.invalid` is
   * already true by then (the field re-renders when the message reaches it) and the two agree; this
   * is what stops a bare `<Input format="rut">` from silently passing for valid.
   */
  const [showError, setShowError] = useState(false);

  /**
   * One validation pass.
   *
   * `notify` is false for the sync-only pass on mount and true for anything a person did. A field
   * arriving pre-filled with a broken RUT must ALREADY be blocking its form, so the constraint is
   * set either way; announcing a result nobody asked for is what the flag suppresses.
   */
  const validate = useCallback(
    (element: HTMLInputElement, notify: boolean) => {
      if (!format) {
        /* `format` was removed, or never set. Hand the constraint back to the platform untouched:
           a stale custom validity would block a form for a rule that no longer exists. */
        element.setCustomValidity("");
        setShowError(false);
        reportError(undefined);
        return;
      }

      const result = validateInputFormat(format, element.value, { country });
      const message = result.ok ? "" : (errorLabel ?? inputFormatMessage(format, result.reason));

      /*
       * THE PLATFORM ENFORCES IT, not this component. `setCustomValidity` is what makes a native
       * form refuse to submit, makes `:invalid` match and makes `reportValidity()` focus the field,
       * all of which a component reimplementing submission would have to fake. It is set on every
       * pass, including before the field has been touched: the value IS invalid then, and hiding
       * that from the form while hiding the message from the reader are two different decisions.
       */
      element.setCustomValidity(message);

      const visible = shouldShowInputError(touched.current, result);
      setShowError(visible);
      reportError(visible ? message : undefined);

      if (!notify) return;
      onValidate?.(result);
      /* The same channel, and the same detail, authored markup gets. A consumer should not have to
         know which binding rendered the field to listen for the result. */
      element.dispatchEvent(
        new CustomEvent(inputEvents.validate, {
          bubbles: true,
          detail: result.ok
            ? { ok: true, normalized: result.normalized }
            : { ok: false, reason: result.reason },
        }),
      );
    },
    [country, errorLabel, format, onValidate, reportError],
  );

  useEffect(() => {
    if (node.current) validate(node.current, false);
  }, [validate]);

  /* An unmounting control leaves no message behind in a field that outlives it. */
  useEffect(() => () => reportError(undefined), [reportError]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    validate(event.currentTarget, true);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    touched.current = true;
    validate(event.currentTarget, true);
  };

  return (
    <input
      {...props}
      aria-describedby={control.describedBy}
      aria-invalid={control.invalid || showError ? "true" : undefined}
      className={cx(inputParts.root, className)}
      data-country={country}
      data-format={format}
      data-size={controlSize}
      disabled={control.disabled}
      id={control.id}
      onBlur={format ? handleBlur : onBlur}
      onChange={format ? handleChange : onChange}
      ref={node}
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
