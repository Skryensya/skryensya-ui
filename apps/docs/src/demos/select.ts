import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { planItems } from "./data/select";

/*
 * Both halves of the page, from one newly published contract.
 *
 * The plans they offer are the same list, written once in `data/select.ts`.
 */

/** The enhanced Select: item markup, a positioned listbox and a value-change event. */
export const selectTree = (t: Translate): UsageTree => ({
  contract: "select",
  signature: "Select",
  options: { name: "plan", value: "starter" },
  slots: { label: t("demo.select.label"), items: planItems },
});

/*
 * The native control, wrapped in a FormField.
 *
 * A visible label is the FORM FIELD's job, not the select's: a `<select>` host cannot contain its own
 * label, and FormField already owns the id wiring that ties the two together. The authored version
 * hand-rolled that as a Stack plus a matching `for`/`id` pair: two things to keep in sync by hand,
 * which is the class of bug this whole port exists to remove.
 */
export const selectNativeTree = (t: Translate): UsageTree => ({
  contract: "form-field",
  signature: "FormField",
  slots: { label: t("demo.select.label") },
  children: {
    contract: "select",
    signature: "Select.native",
    options: { name: "plan" },
    slots: { items: planItems },
  },
});
