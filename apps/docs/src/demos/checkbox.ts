import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { checkboxGroupItems } from "./data/checkbox";
import { namePart } from "./annotation-parts";

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});

/** Input, control, indicator and label: the native checkbox's painted parts. */
export const checkboxAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { label: t("checkbox.anatomyLabel"), inert: true },
  slots: {
    subject: {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "alerts-anatomy", value: "email", defaultChecked: true },
      children: t("demo.checkbox.emailAlerts"),
    },
    items: [
      namePart(".sk-checkbox", "block-start"),
      namePart(".sk-checkbox__input", "inline-start"),
      namePart(".sk-checkbox__control", "inline-start", { ringPlacement: "offset", ringDistance: 2 }),
      namePart(".sk-checkbox__indicator", "inline-end"),
      namePart(".sk-checkbox__label", "inline-end", { ringPlacement: "offset", ringDistance: 2 }),
    ],
  },
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
