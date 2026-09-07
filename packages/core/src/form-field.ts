import type { ComponentContract } from "./contract.js";

export type FormFieldOptions = {
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
};

/*
 * The chrome around any control, label, hint, error. Deliberately independent of `input`: a form
 * field wraps a select, a group of checkboxes or a textarea just as readily, and naming it for the
 * control it most often holds would make the name a lie the first time it holds another.
 */
export const formFieldParts = {
  root: "sk-form-field",
  label: "sk-form-field__label",
  hint: "sk-form-field__hint",
  error: "sk-form-field__error",
  requiredIndicator: "sk-form-field__required",
} as const;

export type FormFieldPart = keyof typeof formFieldParts;
export type FormFieldPartClass = (typeof formFieldParts)[FormFieldPart];

/*
 * The contract, and the case that wiring exists for.
 *
 * A form field is chrome plus a control, and what binds them is six ids: the label points at the
 * control, the control points back at the hint and the error, and each of those carries the id being
 * pointed at. Written by hand, which is what authored markup does today. Every one of them is a
 * chance to be silently wrong: a mistyped `aria-describedby` shows nothing on screen and breaks every
 * screen reader that reads the form.
 *
 * Deliberately independent of `input`: it wraps a select, a group of checkboxes or a textarea just as
 * readily, and naming it for the control it most often holds would make the name a lie the first time
 * it holds another. That is why `children` accepts any signature and the wiring points at `"control"`
 * rather than at an input. `FormField` rather than `Field` for the same reason the rest of the name
 * is literal: a bare "field" is a word every domain model already uses for something else.
 */
export const formFieldContract = {
  id: "form-field",
  css: "@skryensya/core/components/form-field.css",
  parts: formFieldParts,

  options: {
    /**
     * Marks the control required and shows the indicator beside the label. The asterisk is
     * decorative; the attribute is the control's, which is why it travels through the wiring.
     */
    required: { type: "boolean", default: false, attr: "required", trueValue: "" },
    disabled: { type: "boolean", default: false, attr: "data-disabled", trueValue: "" },
    /**
     * Clips the label to a name-only box instead of dropping it. The control still HAS a label, the
     * wiring below still points at it, and a screen reader still reads it: what changes is that the
     * eye does not, because the surrounding composition already said what this field is. A reply box
     * under the comment it answers is the case that asked for it.
     *
     * Not "no label": a field with none is a control nothing announces, which is why the slot stays
     * required. Same distinction `SkipLink` and every icon-only Button already make.
     */
    labelHidden: { type: "boolean", default: false, attr: "data-label-hidden", trueValue: "" },
  },

  signatures: {
    FormField: {
      intent: ["labelled-control", "form-field", "input-with-label", "validation-message"],
      host: { element: "div" },
      // Neither lands on the field box: both are the control's, delivered by the wiring below.
      options: ["required", "disabled", "labelHidden"],
      slots: {
        label: { accepts: "node", required: true },
        /** Guidance shown before the control. Pointed at by `aria-describedby`. */
        hint: { accepts: "node" },
        /**
         * The validation message. Its PRESENCE is what makes the field invalid. Colour is never the
         * only cue, and there is no separate `invalid` option to fall out of step with it.
         */
        error: { accepts: "node" },
        children: { accepts: "signature", required: true },
      },

      /*
       * Six ids from one name. `control` is the slotted child, wherever it came from; the emitter
       * derives every id from the field's own and neither binding invents one of its own.
       */
      wiring: [
        { on: "label", attr: "for", references: ["control"] },
        { on: "control", attr: "required", value: "", whenGiven: "required" },
        { on: "control", attr: "disabled", value: "", whenGiven: "disabled" },
        { on: "control", attr: "aria-describedby", references: ["hint", "error"] },
        { on: "control", attr: "aria-invalid", value: "true", whenGiven: "error" },
      ],

      template: {
        element: "div",
        part: "root",
        host: true,
        children: [
          {
            element: "label",
            part: "label",
            name: "label",
            slot: "label",
            children: [
              // Decorative: the required state is already on the control, this only shows it.
              { element: "span", part: "requiredIndicator", whenGiven: "required", text: "*", attrs: { "aria-hidden": "true" } },
            ],
          },
          { element: "div", part: "hint", name: "hint", whenGiven: "hint", slot: "hint" },
          { slot: "children" },
          { element: "div", part: "error", name: "error", whenGiven: "error", slot: "error" },
        ],
      },
      react: { from: "@skryensya/react/form-field", name: "FormField" },
    },
  },
} as const satisfies ComponentContract;
