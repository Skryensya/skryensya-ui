import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * One email field, already invalid: the demo exists to show that the error message's presence is
 * what marks the control, and that Field owns the six ids that bind label, hint, error and input.
 * "Email" stays written: it is the same word in both languages.
 */
export const inputTree = (t: Translate): UsageTree => ({
  contract: "field",
  signature: "Field",
  options: { required: true },
  slots: {
    label: "Email",
    hint: t("demo.input.hint"),
    error: t("demo.input.error"),
  },
  children: {
    contract: "input",
    signature: "Input",
    options: { type: "email", name: "email" },
  },
});
