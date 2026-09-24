import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";
import { genericIcon } from "./anatomy-subject";

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

/*
 * Every optional part filled, so the diagram can name each one.
 *
 * ITS OWN SUBJECT, and not `emptyStateTree` with the labels drawn on top. The demo above is a real
 * empty state: a magnifier, a search that found nothing, a button that clears the filter, and all
 * three have to agree with each other to be worth showing. The diagram wants the opposite, a subject
 * that says nothing at all, so it composes the same four slots out of `anatomy.*` filler and the
 * generic icon. Sharing one tree meant the two were always trading off against each other.
 */
export const emptyStateAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("emptyState.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "empty-state",
      signature: "EmptyState",
      slots: {
        icon: genericIcon(),
        title: t("anatomy.title"),
        description: t("anatomy.description"),
        actions: {
          contract: "button",
          signature: "Button.action",
          children: t("anatomy.action"),
        },
      },
    },
    items: [
      namePart(".sk-empty-state", "block-start", { mark: "bracket" }),
      namePart(".sk-empty-state__icon", "inline-start"),
      namePart(".sk-empty-state__title", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__description", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-empty-state__actions", "block-end", { ringPlacement: "offset", ringDistance: 3 }),
    ],
  },
});
