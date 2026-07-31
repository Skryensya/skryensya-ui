import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** Ordered instructions with their optional detail kept in the collection item. */
export const processListTree = (t: Translate): UsageTree => ({
  contract: "process-list",
  signature: "ProcessList",
  children: [
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.first.title"),
        children: t("demo.processList.first.description"),
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.second.title"),
        children: t("demo.processList.second.description"),
      },
    },
    {
      contract: "process-list",
      signature: "ProcessListItem",
      slots: {
        title: t("demo.processList.third.title"),
        children: t("demo.processList.third.description"),
      },
    },
  ],
});
