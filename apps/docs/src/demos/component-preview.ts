import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * `ComponentPreview.bare` — a titled stage plus its source, composed from `Button` and
 * `CodePreview` rather than reimplemented. The full apparatus this page otherwise teaches (binding
 * switch, screen presets) is this site's own chrome and has no tree of its own; this is the part
 * that does.
 */
export const componentPreviewBareTree = (t: Translate): UsageTree => ({
  contract: "component-preview",
  signature: "ComponentPreview.bare",
  slots: {
    title: t("demo.componentPreview.title"),
    stage: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "primary" },
      children: t("demo.componentPreview.button"),
    },
    code: {
      contract: "code-preview",
      signature: "CodePreview",
      slots: {
        children: '<button class="sk-button" data-variant="primary">' + t("demo.componentPreview.button") + "</button>",
      },
    },
  },
});
