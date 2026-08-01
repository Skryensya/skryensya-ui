import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * The three cases where a tooltip earns its place, shared by both pages and both bindings.
 *
 * This file sat here written-but-unimported for a while, because the tree VALIDATED and still
 * rendered a tooltip that could never open: the template painted the root, the positioner and the
 * content but never the hooks `Tooltip.svelte` scans for, so `content` came back null and
 * `.sk-tooltip__content { display: none }` held forever. Three contract holes, all closed now:
 *
 *   - the trigger and content `mount` points, so the enhancer can find what to patch
 *   - the placement default, which said `block-end` while both bindings resolve `block-start`
 *   - the arrow, which had neither slot nor option while all three demos draw one
 *
 * One deviation remains and it is a judgement call rather than a hole: the third trigger is the
 * truncated TEXT itself, and the nearest signature for it is `Text`, a `<p class="sk-text">` where
 * the demo taught a span. A paragraph inside an inline row reads the same and says something
 * slightly different; it is the smallest lie available until a bare inline-text signature exists.
 */

/** An icon-only control whose `aria-label` is the name and whose tooltip is the description. */
const iconTrigger = (name: string, label: string, size?: "sm"): UsageTree => ({
  contract: "button",
  signature: "Button.action",
  options: { variant: "ghost", iconOnly: true, ...(size ? { size } : {}) },
  attrs: { "aria-label": label },
  children: { contract: "icon", signature: "Icon", options: { name } },
});

/*
 * The three cases where a tooltip earns its place, and nothing else. Between one and the next only
 * the shape of the trigger and the placement change; that sameness is the thing to be able to read.
 *
 * No layout wrapper around each one: `.sk-tooltip` is `inline-flex`, so they flow wherever they are
 * dropped. The outer `Inline` is the demo's own row, not part of a tooltip.
 */
export const tooltipTree = (t: Translate): UsageTree => ({
  contract: "layout",
  signature: "Inline",
  options: { gap: "md", inlineAlign: "center" },
  children: [
    // 1. An icon-only control. The name lives in `aria-label`; the tooltip expands it.
    {
      contract: "tooltip",
      signature: "Tooltip",
      options: { placement: "block-end", arrow: true },
      slots: {
        content: t("demo.tooltip.export.content"),
        children: iconTrigger("download", t("demo.tooltip.export.label")),
      },
    },
    // 2. Explaining a figure that is already on screen: the number is always visible, the tooltip
    //    only says how it is arrived at. Default placement, which is the case the contract's own
    //    default gets wrong.
    {
      contract: "layout",
      signature: "Inline",
      options: { gap: "xs" },
      children: [
        t("demo.tooltip.metric.value"),
        {
          contract: "tooltip",
          signature: "Tooltip",
          options: { arrow: true },
          slots: {
            content: t("demo.tooltip.metric.content"),
            children: iconTrigger("info", t("demo.tooltip.metric.label"), "sm"),
          },
        },
      ],
    },
    // 3. Giving back what the width had to cut. The trigger is the truncated text itself, and
    //    `tabindex` is what makes it reachable: without focus the tooltip would be mouse-only.
    {
      contract: "tooltip",
      signature: "Tooltip",
      options: { placement: "inline-end", arrow: true },
      slots: {
        content: t("demo.tooltip.truncated.content"),
        children: {
          contract: "typography",
          signature: "Text",
          attrs: { class: "sk-truncate", tabindex: "0" },
          children: t("demo.tooltip.truncated.content"),
        },
      },
    },
  ],
});
