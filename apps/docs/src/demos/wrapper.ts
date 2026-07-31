import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/**
 * The four real Wrapper variants. Docs-only modifier classes scale their ceilings into one preview;
 * the contract still owns the centring, inset and size attributes shown in both emitted bindings.
 */
export const wrapperTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Stack",
  options: { gap: "sm" },
  attrs: {
    "aria-label": t("demo.wrapper.label"),
    class: "wrapper-scale",
    role: "img",
  },
  children: [
    {
      contract: "wrapper",
      signature: "Wrapper",
      options: { wrapperSize: "sm" },
      attrs: { class: "wrapper-scale__bar wrapper-scale__bar--sm" },
      children: t("demo.wrapper.sm"),
    },
    {
      contract: "wrapper",
      signature: "Wrapper",
      options: { wrapperSize: "md" },
      attrs: { class: "wrapper-scale__bar wrapper-scale__bar--md" },
      children: t("demo.wrapper.md"),
    },
    {
      contract: "wrapper",
      signature: "Wrapper",
      options: { wrapperSize: "lg" },
      attrs: { class: "wrapper-scale__bar wrapper-scale__bar--lg" },
      children: t("demo.wrapper.lg"),
    },
    {
      contract: "wrapper",
      signature: "Wrapper",
      options: { wrapperSize: "full" },
      attrs: { class: "wrapper-scale__bar wrapper-scale__bar--full" },
      children: t("demo.wrapper.full"),
    },
  ],
});
