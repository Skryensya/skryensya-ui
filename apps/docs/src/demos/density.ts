import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The local-density lab: a slider OUTSIDE the scope, and a small form inside it.
 *
 * The slider has to sit outside `data-sk-density-scope` for the demo to mean anything. Inside, it
 * would resize itself as you dragged it, and a control that moves under the pointer is reading its
 * own output rather than the panel's.
 *
 * The scope and its value are written as raw attributes, the same way `CopyButton.astro` and the
 * presets gallery already do it: `data-sk-density-scope` is a plain attribute contract and never
 * needed a signature of its own to exist.
 */
export const densityLabTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "lg" },
  attrs: { "data-density-lab": "", style: "inline-size: 100%" },
  children: [
    {
      contract: "layout",
      signature: "Stack",
      options: { gap: "xs" },
      children: [
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", inlineAlign: "baseline" },
          children: [
            t("demo.density.localFactor"),
            { contract: "typography", signature: "Code", attrs: { "data-density-factor-output": "" }, children: "1.00×" },
          ],
        },
        {
          contract: "slider",
          signature: "Slider",
          options: { value: 72, min: 50, max: 120, step: 1 },
          attrs: {
            id: "density-factor-control",
            "aria-label": t("demo.density.localFactor"),
            "data-density-slider": "",
            "aria-valuetext": t("demo.density.valueText"),
          },
        },
      ],
    },
    {
      contract: "box",
      signature: "Box",
      options: { surface: "surface", border: "subtle", padding: "lg" },
      attrs: {
        class: "sk-stack",
        "data-density-target": "",
        "data-gap": "sm",
        "data-sk-density-scope": "",
        style: "--sk-density-factor: 0.72",
      },
      children: [
        t("demo.density.summary"),
        {
          contract: "form-field",
          signature: "FormField",
          slots: {
            label: "Email",
            children: { contract: "input", signature: "Input", options: { type: "email" }, attrs: { id: "delivery-email" } },
          },
        },
        { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.density.save") },
        {
          contract: "layout",
          signature: "Inline",
          options: { gap: "sm", inlineAlign: "baseline" },
          children: [
            { contract: "button", signature: "Button.action", options: { variant: "ghost" }, children: t("demo.button.cancel") },
            { contract: "typography", signature: "Code", attrs: { "data-density-effective-output": "" }, children: "0.72×" },
            { contract: "typography", signature: "Code", attrs: { "data-density-padding-output": "" }, children: "0px" },
            { contract: "typography", signature: "Code", attrs: { "data-density-button-output": "" }, children: "44px" },
          ],
        },
      ],
    },
  ],
});
