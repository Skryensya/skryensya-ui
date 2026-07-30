import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/** Dynamic emission, timeout state and stacking stay authored; they require runtime behavior. */
export const toastSimpleTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  children: {
    contract: "content",
    signature: "Toast",
    options: {
      dismissible: true,
      dismissLabel: t("demo.toast.dismiss"),
    },
    children: t("demo.toast.linkCopied"),
  },
});

export const toastActionTree = (t: Translate): UsageTree => ({
  contract: "content",
  signature: "ToastRegion",
  children: {
    contract: "content",
    signature: "Toast",
    options: {
      dismissible: true,
      dismissLabel: t("demo.toast.dismiss"),
    },
    slots: {
      title: t("demo.toast.documentArchived"),
      actions: {
        contract: "button",
        signature: "Button.action",
        options: { size: "sm", variant: "neutral" },
        children: t("demo.toast.undo"),
      },
    },
    children: t("demo.toast.movedToArchived"),
  },
});
