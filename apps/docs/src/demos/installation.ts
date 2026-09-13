import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** The three buttons the install page renders once the kit is wired up. */
export const installUsageTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  children: [
    { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.button.save") },
    { contract: "button", signature: "Button.action", children: t("demo.button.cancel") },
    { contract: "button", signature: "Button.action", options: { tone: "danger" }, children: t("demo.button.delete") },
  ],
});
