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
      /* The field's own box has no corner of its own to borrow, and its parts sit flush against its
         edges: an inset ring would trace the same line as the label's. Offset far enough to read as
         the box AROUND them, with a corner so it reads as a mark and not as a crop. */
      namePart(".sk-form-field", "block-start", { ringPlacement: "offset", ringDistance: 10, ringRadius: 10 }),
      /* Text has square corners and no edge to speak of, so a ring drawn 2px off the glyphs reads as
         an underline that failed. Clear of the text, and rounded, so each one reads as one mark. */
      namePart(".sk-form-field__label", "inline-start", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      /* THE SLOTTED CONTROL, and the only name here that belongs to another contract. It is named
         anyway because that is the claim: the chrome holds a control it never asks about, and a hole
         with no name in the middle of the drawing states the opposite. No `ringRadius`: the input
         has a corner of its own, and letting the ring take it is what says the ring is ITS outline
         and not one more box the diagram laid on top. */
      namePart(".sk-input", "inline-start", { ringPlacement: "offset", ringDistance: 3 }),
      namePart(".sk-form-field__required", "inline-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      namePart(".sk-form-field__hint", "inline-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
      namePart(".sk-form-field__error", "block-end", { ringPlacement: "offset", ringDistance: 3, ringRadius: 6 }),
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
