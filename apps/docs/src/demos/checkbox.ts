import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

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
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: {
    role: "group",
    "aria-label": t("demo.checkbox.group"),
    "data-demo-checkbox-group": "",
  },
  children: [
    {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "all-permissions", defaultIndeterminate: true },
      children: t("demo.checkbox.group"),
    },
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "checkbox",
          signature: "Checkbox",
          options: { name: "permissions", value: "read", defaultChecked: true },
          children: t("demo.checkbox.read"),
        },
        {
          contract: "checkbox",
          signature: "Checkbox",
          options: { name: "permissions", value: "write" },
          children: t("demo.checkbox.write"),
        },
        {
          contract: "checkbox",
          signature: "Checkbox",
          options: { name: "permissions", value: "admin" },
          children: t("demo.checkbox.admin"),
        },
      ],
    },
  ],
});

export const checkboxGroupScript = `
const root = document.querySelector("[data-demo-checkbox-group]");
if (root) {
  const inputs = [...root.querySelectorAll('input[type="checkbox"]')];
  const parent = inputs[0];
  const children = inputs.slice(1);
  const sync = () => {
    const checked = children.filter((input) => input.checked).length;
    parent.checked = checked === children.length;
    parent.indeterminate = checked > 0 && checked < children.length;
  };
  children.forEach((input) => input.addEventListener("change", sync));
  parent.addEventListener("change", () => {
    parent.indeterminate = false;
    children.forEach((input) => { input.checked = parent.checked; });
  });
  sync();
}
`;

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
