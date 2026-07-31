import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * Both halves of the page, from one newly published contract.
 *
 * Plan names are product nouns and stay written; only the label is a word.
 */

/** The enhanced Select: item markup, a positioned listbox and a value-change event. */
export const selectTree = (t: Translate): UsageTree => ({
  contract: "select",
  signature: "Select",
  options: { name: "plan", value: "starter" },
  slots: {
    label: t("demo.select.label"),
    items: [
      { options: { value: "starter" }, slots: { label: "Starter" } },
      { options: { value: "pro" }, slots: { label: "Pro" } },
      { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
    ],
  },
});

/*
 * The native control, wrapped in a Field.
 *
 * A visible label is the FIELD's job, not the select's: a `<select>` host cannot contain its own
 * label, and Field already owns the id wiring that ties the two together. The authored version
 * hand-rolled that as a Stack plus a matching `for`/`id` pair — two things to keep in sync by hand,
 * which is the class of bug this whole port exists to remove.
 */
export const selectNativeTree = (t: Translate): UsageTree => ({
  contract: "field",
  signature: "Field",
  slots: { label: t("demo.select.label") },
  children: {
    contract: "select",
    signature: "Select.native",
    options: { name: "plan" },
    slots: {
      items: [
        { options: { value: "starter" }, slots: { label: "Starter" } },
        { options: { value: "pro" }, slots: { label: "Pro" } },
        { options: { value: "enterprise" }, slots: { label: "Enterprise" } },
      ],
    },
  },
});
