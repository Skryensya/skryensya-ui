import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The control, not the chrome around it. Both trees still sit inside a FormField, because a control
 * without a label is not a thing to document, but what the page is about is what changes between
 * them: the element, and the one class both of them carry.
 */

/** A single line of text. `type` is the native one, so the keyboard and validation come with it. */
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
