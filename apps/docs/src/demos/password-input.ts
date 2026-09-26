import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

const toggleLabels = (t: Translate) => ({
  showLabel: t("passwordInput.showLabel"),
  hideLabel: t("passwordInput.hideLabel"),
});

/** Label, the well, the input and the toggle: the parts at rest. */
export const passwordInputAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("passwordInput.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "password-input",
      signature: "PasswordInput",
      options: { name: "password-anatomy", ...toggleLabels(t) },
      slots: { label: t("passwordInput.signInLabel"), hint: t("passwordInput.signUpHint") },
    },
    items: [
      namePart(".sk-password-input", "block-start", { mark: "bracket" }),
      namePart(".sk-password-input__label", "inline-start"),
      namePart(".sk-password-input__input", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-password-input__visibility-trigger", "inline-end"),
      namePart(".sk-password-input__control", "block-end"),
      namePart(".sk-password-input__hint", "inline-end"),
    ],
  },
});

/*
 * 1. Signing in: `current-password` (the default), so the browser offers the saved one. Paired with
 * the email field it belongs to, because a password alone is not a form anyone fills in.
 */
export const passwordInputSignInTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 22rem; max-inline-size: 100%;" },
  children: [
    {
      contract: "form-field",
      signature: "FormField",
      slots: { label: t("passwordInput.emailLabel") },
      children: { contract: "input", signature: "Input", options: { type: "email", name: "email" } },
    },
    {
      contract: "password-input",
      signature: "PasswordInput",
      options: { name: "password", ...toggleLabels(t) },
      slots: { label: t("passwordInput.signInLabel") },
    },
  ],
});

/*
 * 2. Choosing one: `new-password`, so a manager offers to generate it, and the rule it has to meet
 * in the hint, where the input is described by it.
 */
export const passwordInputSignUpTree = (t: Translate): UsageTree => ({
  contract: "password-input",
  signature: "PasswordInput",
  options: { name: "new-password", autoComplete: "new-password", required: true, ...toggleLabels(t) },
  attrs: { style: "inline-size: 22rem; max-inline-size: 100%;" },
  slots: { label: t("passwordInput.signUpLabel"), hint: t("passwordInput.signUpHint") },
});

/* 3. The states: a value that failed validation, and a field that cannot be changed right now. */
export const passwordInputStatesTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "md" },
  attrs: { style: "inline-size: 22rem; max-inline-size: 100%;" },
  children: [
    {
      contract: "password-input",
      signature: "PasswordInput",
      options: { name: "invalid-password", invalid: true, ...toggleLabels(t) },
      slots: { label: t("passwordInput.signInLabel"), hint: t("passwordInput.invalidHint") },
    },
    {
      contract: "password-input",
      signature: "PasswordInput",
      options: { name: "disabled-password", disabled: true, ...toggleLabels(t) },
      slots: { label: t("passwordInput.disabledLabel") },
    },
  ],
});
