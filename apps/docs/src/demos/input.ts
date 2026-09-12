import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

/*
 * The control, not the chrome around it. Both trees still sit inside a FormField, because a control
 * without a label is not a thing to document, but what the page is about is what changes between
 * them: the element, and the one class both of them carry.
 */

/** A single line of text. `type` is the native one, so the keyboard and validation come with it. */
/*
 * THE ANATOMY, and it is one label on purpose, because this contract publishes one class and the
 * interesting thing about it is HOW MANY ELEMENTS wear it.
 *
 * `sk-input` is the appearance contract for every native text control: the same class on
 * `<input type="email">`, on `<textarea>`, and on a real `<input type="time">` whose selection,
 * keyboard and validation all belong to the platform. Three signatures, three elements, one ring
 * each from a single bubble (`match: "all"`), which is the drawing saying what the source says: a
 * second class per element would be a second set of hooks to keep in step.
 *
 * NOTHING ELSE IS NAMED, and the absence is the other half of the lesson. A control has no label,
 * no hint and no error of its own: those are FormField's, they are drawn on FormField's own
 * diagram, and an Input that carried them would be a control that can disagree with the message
 * beside it.
 *
 * A `Stack` holds the three rather than an `Inline`, so each ring spans a full control width and
 * the three read as the same box three times, which is the claim.
 */
export const inputAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("inputPage.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "layout",
      signature: "Stack",
      options: { gap: "sm" },
      attrs: { style: "inline-size: 18rem" },
      children: [
        /*
         * EACH CONTROL IN ITS OWN FormField, and not because the drawing wants the chrome: the
         * contract says `parents: ["FormField"]` for Input and Textarea, and the tree gate enforces
         * it, which is the contract refusing to let a diagram show a control in a place a consumer
         * could not put one. So the labels above each ring are real, unnamed, and make the second
         * half of the point on their own: everything outside the ring belongs to FormField.
         */
        {
          contract: "form-field",
          signature: "FormField",
          slots: { label: t("demo.input.anatomyEmailLabel") },
          children: {
            contract: "input",
            signature: "Input",
            options: { type: "email", name: "email", placeholder: t("demo.input.anatomyEmail") },
          },
        },
        {
          contract: "form-field",
          signature: "FormField",
          slots: { label: t("demo.input.notesLabel") },
          children: {
            contract: "input",
            signature: "Textarea",
            options: { name: "notes", placeholder: t("demo.input.anatomyNotes") },
          },
        },
        /* `NativeInput` has no `parents`, so it stands alone: the platform control is the one that
           needs no wiring from the field around it. */
        { contract: "input", signature: "NativeInput", options: { type: "time", name: "at" } },
      ],
    },
    items: [namePart(".sk-input", "inline-end", { match: "all" })],
  },
});

export const inputTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: "Email", hint: t("demo.input.hint") },
  children: {
    contract: "input",
    signature: "Input",
    options: { type: "email", name: "email" },
  },
});

/** The same appearance contract on a different element: `sk-input` goes on `<textarea>` too. */
export const textareaTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.input.notesLabel"), hint: t("demo.input.notesHint") },
  children: {
    contract: "input",
    signature: "Textarea",
    options: { name: "notes", placeholder: t("demo.input.notesPlaceholder") },
  },
});
