import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

const iconButton = (
  label: string,
  icon: "copy" | "delete" | "edit",
): UsageTree => ({
  contract: "tooltip",
  signature: "Tooltip",
  options: { placement: "block-end" },
  slots: {
    content: label,
    children: {
      contract: "button",
      signature: "Button.action",
      options: { iconOnly: true, size: "sm" },
      attrs: { "aria-label": label },
      children: { contract: "icon", signature: "Icon", options: { name: icon } },
    },
  },
});

/** Three icon-only document actions, each independently named before its tooltip describes it. */
export const toolbarTree = (t: Translate): UsageTree => ({
  contract: "toolbar",
  signature: "Toolbar",
  options: { label: t("demo.toolbar.actions") },
  children: [
    {
      contract: "toolbar",
      signature: "ToolbarGroup",
      children: [
        iconButton(t("demo.toolbar.edit"), "edit"),
        iconButton(t("demo.toolbar.copy"), "copy"),
      ],
    },
    { contract: "toolbar", signature: "ToolbarSeparator" },
    iconButton(t("demo.toolbar.delete"), "delete"),
  ],
});

/** Two composite radiogroups: each is one stop in the outer toolbar's roving focus. */
export const nestedToolbarTree = (t: Translate): UsageTree => ({
  contract: "toolbar",
  signature: "Toolbar",
  options: { label: t("demo.toolbar.viewControls") },
  children: [
    {
      contract: "toolbar",
      signature: "ToolbarGroup",
      attrs: { "aria-label": t("demo.toolbar.screenSize") },
      children: {
        contract: "segmented",
        signature: "Segmented",
        options: { value: "free" },
        attrs: { "aria-label": t("demo.toolbar.screenSize") },
        slots: {
          items: [
            { options: { value: "free" }, slots: { label: t("demo.toolbar.free") } },
            { options: { value: "tablet" }, slots: { label: t("demo.toolbar.tablet") } },
            { options: { value: "mobile" }, slots: { label: t("demo.toolbar.mobile") } },
          ],
        },
      },
    },
    { contract: "toolbar", signature: "ToolbarSeparator" },
    {
      contract: "toolbar",
      signature: "ToolbarGroup",
      attrs: { "aria-label": t("demo.toolbar.binding") },
      children: {
        contract: "segmented",
        signature: "Segmented",
        options: { value: "vanilla" },
        attrs: { "aria-label": t("demo.toolbar.binding") },
        slots: {
          items: [
            { options: { value: "vanilla" }, slots: { label: "Vanilla" } },
            { options: { value: "react" }, slots: { label: "React" } },
          ],
        },
      },
    },
  ],
});
