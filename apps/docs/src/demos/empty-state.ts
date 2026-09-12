import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { namePart } from "./annotation-parts";

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

/** Every optional part filled, so the diagram can name each one. */
export const emptyStateAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("emptyState.anatomyLabel"), inert: true },
  slots: {
    subject: emptyStateTree(t),
    items: [
      namePart(".sk-empty-state", "block-start"),
      namePart(".sk-empty-state__icon", "inline-start"),
      namePart(".sk-empty-state__title", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__description", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__actions", "block-end", { ringPlacement: "offset", ringDistance: 3 }),
    ],
  },
});
