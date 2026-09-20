import { formFieldParts, formFieldContract } from "@skryensya/core/form-field";
import { createContext, useCallback, useContext, useId, useState, type ReactNode } from "react";

/* Derived, never restated: the default lives in the contract. */
const { disabled: disabledOption, labelHidden: labelHiddenOption, required: requiredOption } = formFieldContract.options;

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

type FormFieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  reportError: (message: string | undefined) => void;
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

  /*
   * A control with no field above it still validates and still blocks its form (the constraint it
   * sets is the platform's, not the field's); what it loses is the place to PRINT the message. A
   * no-op rather than a throw, because standing a control alone is a supported composition.
   */
  const reportError = field?.reportError ?? noReportError;

  return {
    id: props.id ?? field?.controlId ?? generatedId,
    describedBy: props["aria-describedby"] ?? field?.describedBy,
    invalid: field?.invalid ?? false,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
    reportError,
  };
}

const noReportError = (): void => {};

export type FormFieldProps = {
  children: ReactNode;
  label: ReactNode;
  hint?: ReactNode;
  /**
   * The error message. Its presence is what makes the field invalid, color is never the only cue.
   *
   * Authored, and therefore final: a control that validates itself (`Input`'s `format`) reports its
   * message through the context below, and this one WINS when both exist. The field's own author
   * knows something the validator does not, and silently replacing their sentence with a generated
   * one would be the field overruling them.
   */
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
  disabled = disabledOption.default,
  error,
  hint,
  id,
  label,
  labelHidden = labelHiddenOption.default,
  required = requiredOption.default,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  /*
   * THE MESSAGE A CONTROL WROTE FOR ITSELF, which is the one case the authored `error` slot cannot
   * cover: whether a RUT's check digit matches is not something the tree composing this field can
   * know, so there is nothing for an author to have written down. Same reasoning Questionnaire's
   * own machine-written error already stands on: when "is this invalid" is state no tree can carry,
   * the message is the machine's.
   *
   * It stays in the FIELD rather than in the control because the error is the field's chrome:
   * `sk-form-field__error`, pointed at by the control's own `aria-describedby`, after the control in
   * the stack. A control that rendered its own would put a second error box in a different place.
   */
  const [reportedError, setReportedError] = useState<string | undefined>(undefined);
  const reportError = useCallback((message: string | undefined) => {
    /* Identity-compared before it sets: a control revalidates on every keystroke and the message is
     * the same string almost every time, so this turns a per-keystroke render into a per-change one. */
    setReportedError((current) => (current === message ? current : message));
  }, []);

  /* Authored wins. See the `error` prop's own comment for why. */
  const shownError = error ?? reportedError;
  const describedBy = [hint ? hintId : null, shownError ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <FormFieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(shownError), required, disabled, reportError }}
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
        {shownError ? (
          /*
           * `role="alert"` ONLY on the generated message, and the asymmetry is deliberate. An
           * authored error is present when the field first renders, and announcing something that
           * was already there the moment the page arrived is noise. A reported one appears after
           * the reader has left the field, which is precisely the case the role exists for.
           */
          <div className={formFieldParts.error} id={errorId} role={error ? undefined : "alert"}>
            {shownError}
          </div>
        ) : null}
      </div>
    </FormFieldContext.Provider>
  );
}
