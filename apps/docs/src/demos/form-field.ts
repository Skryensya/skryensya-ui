import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { planItems } from "./data/select";
import { namePart } from "./annotation-parts";

/*
 * Two demos for one claim: the chrome is not the control's.
 *
 * The first fills every slot so the six ids are all on screen at once; the second is the same chrome
 * around a `<select>`, which is the whole reason the contract is not called Input. Read together they
 * show the wiring never asking what it wrapped.
 */

/** Label, required mark, hint and error all present: the chrome the diagram names. */
export const formFieldAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("formFieldPage.anatomyLabel"), inert: true },
  slots: {
    subject: formFieldTree(t),
    items: [
      namePart(".sk-form-field", "block-start"),
      namePart(".sk-form-field__label", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-form-field__required", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-form-field__hint", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-form-field__error", "block-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
});

/** One email field, already invalid: the error's presence is what marks the control. */
export const formFieldTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  options: { required: true },
  slots: {
    label: "Email",
    hint: t("demo.formField.hint"),
    error: t("demo.formField.error"),
  },
  children: {
    contract: "input",
    signature: "Input",
    options: { type: "email", name: "email" },
  },
});

/*
 * The same chrome, a different control. Nothing about the field changes: it derives its ids from
 * whatever signature is slotted into it, and a `<select>` host cannot carry its own visible label.
 */
export const formFieldAroundSelectTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: {
    label: t("demo.select.label"),
    hint: t("demo.formField.planHint"),
  },
  children: {
    contract: "select",
    signature: "Select.native",
    options: { name: "plan" },
    slots: { items: planItems },
  },
});
