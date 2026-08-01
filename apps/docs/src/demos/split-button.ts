import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The default action plus its variants — and the Menu half is a real Menu, composed rather than
 * described by a flat list. That is what the contract takes, and what the stylesheet now reaches by
 * structure instead of through a class the composition could never pass.
 */
export const splitButtonTree = (t: Translate): UsageTree => ({
  contract: "split-button",
  signature: "SplitButton",
  slots: {
    children: t("demo.splitButton.primary"),
    menu: {
      contract: "menu",
      signature: "Menu",
      options: { label: t("demo.splitButton.menuLabel") },
      slots: {
        trigger: { contract: "icon", signature: "Icon", options: { name: "chevron-down" } },
        items: [
          { options: { value: "save-copy" }, slots: { label: t("demo.splitButton.copy") } },
          { options: { value: "save-template" }, slots: { label: t("demo.splitButton.template") } },
        ],
      },
    },
  },
});
