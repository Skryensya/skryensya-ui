import {
  isKeyboardClick,
  passwordInputAttrs,
  passwordInputContract,
  passwordInputEvents,
  passwordInputParts,
} from "@skryensya/core/password-input";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import { passwordInput } from "@skryensya/core/machines";
import { normalizeProps, useMachine } from "@zag-js/react";
import { useId, useRef, type MouseEvent } from "react";
import { Icon } from "./icon.js";

/* Derived, never restated: the defaults live in the contract. */
const {
  autoComplete: autoCompleteOption,
  hideLabel: hideLabelOption,
  showLabel: showLabelOption,
} = passwordInputContract.options;

export type PasswordInputProps = {
  id?: string;
  name?: string;
  /** Names the field. Contract slot is text-only. */
  label: string;
  /** Optional supporting text under the control, read with the field. */
  hint?: string;
  placeholder?: string;
  autoComplete?: SignatureOptionsOf<typeof passwordInputContract, "PasswordInput">["autoComplete"];
  /** Controlled visibility. */
  visible?: boolean;
  defaultVisible?: boolean;
  ignorePasswordManagers?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  /** The toggle's accessible name while the password is hidden. */
  showLabel?: string;
  /** The toggle's accessible name while the password is shown. */
  hideLabel?: string;
  onVisibilityChange?: (details: { visible: boolean }) => void;
};

export function PasswordInput({
  autoComplete = autoCompleteOption.default,
  defaultVisible,
  disabled,
  hideLabel = hideLabelOption.default,
  hint,
  id,
  ignorePasswordManagers,
  invalid,
  label,
  name,
  onVisibilityChange,
  placeholder,
  readOnly,
  required,
  showLabel = showLabelOption.default,
  visible,
}: PasswordInputProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const hintId = hint ? `${resolvedId}-hint` : undefined;
  const service = useMachine(passwordInput.machine, {
    id: resolvedId,
    name,
    autoComplete,
    visible,
    defaultVisible,
    ignorePasswordManagers,
    disabled,
    readOnly,
    required,
    invalid,
    translations: { visibilityTrigger: (shown) => (shown ? hideLabel : showLabel) },
    onVisibilityChange(details) {
      onVisibilityChange?.(details);
      rootRef.current?.dispatchEvent(
        new CustomEvent(passwordInputEvents.visibilityChange, { bubbles: true, detail: { visible: details.visible } }),
      );
    },
  });
  const api = passwordInput.connect(service, normalizeProps);
  const inputProps = api.getInputProps();
  const describedBy = [inputProps["aria-describedby"], hintId].filter(Boolean).join(" ") || undefined;
  const interactive = !(disabled || readOnly);

  /* The keyboard half Zag leaves out (see core/password-input.ts): a tab stop, and Enter/Space. */
  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (interactive && isKeyboardClick(event)) api.toggleVisible();
  };

  return (
    <div
      {...api.getRootProps()}
      className={passwordInputParts.root}
      data-invalid={invalid || undefined}
      {...{ [passwordInputAttrs.root]: "" }}
      ref={rootRef}
    >
      <label {...api.getLabelProps()} className={passwordInputParts.label}>
        {label}
      </label>
      <div {...api.getControlProps()} className={passwordInputParts.control}>
        <input
          {...inputProps}
          aria-describedby={describedBy}
          className={passwordInputParts.input}
          placeholder={placeholder}
        />
        <button
          {...api.getVisibilityTriggerProps()}
          className={`${passwordInputParts.visibilityTrigger} sk-button sk-interactive sk-icon-toggle`}
          data-icon-only=""
          data-size="sm"
          data-variant="ghost"
          onClick={onTriggerClick}
          tabIndex={0}
          type="button"
        >
          <span aria-hidden="true" data-face="show">
            <Icon name="visibility" size="sm" />
          </span>
          <span aria-hidden="true" data-face="hide">
            <Icon name="visibility-off" size="sm" />
          </span>
        </button>
      </div>
      {hint ? (
        <span className={passwordInputParts.hint} id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}
