import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/* Icon, title, description and the action that resolves the state: EmptyState's four slots. */
export const emptyStateTree = (t: Translate): UsageTree => ({
  contract: "empty-state",
  signature: "EmptyState",
  slots: {
    icon: { contract: "icon", signature: "Icon", options: { name: "search" } },
    title: t("demo.emptyState.title"),
    description: t("demo.emptyState.description"),
    actions: {
      contract: "button",
      signature: "Button.action",
      children: t("demo.emptyState.action"),
    },
  },
});
