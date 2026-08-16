import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { checkboxGroupItems } from "./data/checkbox";

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});
export const checkboxTree = (t: Translate): UsageTree => ({
  contract: "checkbox",
  signature: "Checkbox",
  options: { name: "alerts", value: "email" },
  children: t("demo.checkbox.emailAlerts"),
});

export const checkboxGroupTree = (t: Translate): UsageTree => ({
  contract: "checkbox",
  signature: "CheckboxGroup",
  options: { name: "permissions" },
  slots: { label: t("demo.checkbox.group"), items: checkboxGroupItems(t) },
});

export const tileCheckboxTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "stretch", equal: true },
  children: [
    {
      contract: "tile",
      signature: "TileCheckbox",
      options: { name: "notifications", value: "critical", defaultChecked: true },
      children: tileContent(t("demo.checkbox.critical.title"), t("demo.checkbox.critical.body")),
    },
    {
      contract: "tile",
      signature: "TileCheckbox",
      options: { name: "notifications", value: "private" },
      children: tileContent(t("demo.checkbox.private.title"), t("demo.checkbox.private.body")),
    },
    {
      contract: "tile",
      signature: "TileCheckbox",
      options: { name: "notifications", value: "inherited", disabled: true },
      children: tileContent(t("demo.checkbox.disabled.title"), t("demo.checkbox.disabled.body")),
    },
  ],
});
