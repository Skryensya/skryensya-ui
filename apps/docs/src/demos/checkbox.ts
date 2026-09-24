import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { checkboxGroupItems } from "./data/checkbox";
import { anatomyCanvas, anatomyHints, namePart } from "./annotation-parts";

const tileContent = (title: string, description: string): UsageTree => ({
  contract: "tile",
  signature: "TileContent",
  slots: { title, description },
});

/** Input, control, indicator and label: the native checkbox's painted parts. */
export const checkboxAnatomyTree = (t: Translate): UsageTree => ({
  contract: "annotation",
  signature: "Annotated",
  options: { ...anatomyCanvas(t), label: t("checkbox.anatomyLabel"), inert: true },
  slots: {
    ...anatomyHints(t),
    subject: {
      contract: "checkbox",
      signature: "Checkbox",
      options: { name: "alerts-anatomy", value: "email", defaultChecked: true },
      children: t("demo.checkbox.emailAlerts"),
    },
    items: [
      namePart(".sk-checkbox", "block-start", { mark: "bracket" }),
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

/*
 * THE SCALE'S MULTI-SELECT TWIN. A Likert asks for one point on a range (`radio-group`'s own
 * composition); the same box and the same ends hold checkboxes when the question is "all that
 * apply" rather than "how much". Nothing new is drawn: Box, Inline, Checkbox, Text.
 */
export const checkboxScaleTree = (t: Translate): UsageTree => ({
  /* A Wrapper, so the row has a width to spread across: the preview stage sizes a demo to its content. */
  contract: "wrapper",
  signature: "Wrapper",
  options: { wrapperSize: "sm" },
  children: [
    {
      contract: "box",
      signature: "Box",
      options: { border: "subtle", padding: "sm" },
      children: [
        {
          contract: "layout",
          signature: "Stack",
          options: { gap: "xs" },
          children: [
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "md", equal: true },
              children: [
                { contract: "checkbox", signature: "Checkbox", options: { name: "days", value: "mon" }, children: t("demo.checkboxScale.mon") },
                { contract: "checkbox", signature: "Checkbox", options: { name: "days", value: "tue" }, children: t("demo.checkboxScale.tue") },
                { contract: "checkbox", signature: "Checkbox", options: { name: "days", value: "wed" }, children: t("demo.checkboxScale.wed") },
                { contract: "checkbox", signature: "Checkbox", options: { name: "days", value: "thu" }, children: t("demo.checkboxScale.thu") },
              ],
            },
            {
              contract: "layout",
              signature: "Inline",
              options: { justify: "between", gap: "md" },
              children: [
                { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: t("demo.checkboxScale.min") },
                { contract: "typography", signature: "Text", options: { size: "caption", tone: "secondary" }, children: t("demo.checkboxScale.max") },
              ],
            },
          ],
        },
      ],
    },
  ],
});
