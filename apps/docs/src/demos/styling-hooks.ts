import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The three Button variants the styling-hooks page restyles with one declaration. `display: contents`
 * on the Inline keeps the demo's own `.promo` scope from becoming a box between them.
 */
export const stylingHookOverrideTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  attrs: { class: "promo", style: "display: contents" },
  children: [
    { contract: "button", signature: "Button.action", options: { tone: "accent" }, children: t("demo.button.save") },
    { contract: "button", signature: "Button.action", options: { variant: "solid" }, children: t("demo.button.cancel") },
    { contract: "button", signature: "Button.action", options: { tone: "danger" }, children: t("demo.button.delete") },
  ],
});
