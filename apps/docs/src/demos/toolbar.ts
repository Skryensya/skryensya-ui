/*
 * The toolbar, twice: loose controls, and a composite widget as one stop.
 *
 * Both trees sat here validated and unwired, each blocked on one line of contract rather than on
 * anyone converting the page. Both lines have landed:
 *
 *   - Tooltip's template never painted its own mount hooks, so an emitted toolbar had buttons whose
 *     tooltips could never open in Vanilla while React's worked: two stages painting the same
 *     markup and only one of them having a tooltip.
 *   - Segmented's `value` had no `prop: "defaultValue"`, so the emitter wrote `value="free"`,
 *     which React reads as the CONTROLLED prop with no handler beside it: the control was frozen.
 *     Wiring this tree would have ADDED a React stage whose selection cannot move, on the one demo
 *     whose whole subject is moving a selection with the keyboard.
 *
 * The icons still reach for edit/copy/delete rather than bold/italic/link, which are not in Icon's
 * stable `name` enum. That one is a gap in the icon set, not in the contract.
 */
import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";
import { toolbarBindingItems, toolbarScreenItems } from "./data/toolbar";

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
      // `ghost`: no fill, no border, matching the bar's own chrome instead of drawing a second
      // box inside it. Button's own variant, not a toolbar-specific reinterpretation of it.
      options: { iconOnly: true, size: "sm", variant: "ghost" },
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
        options: { value: "free", label: t("demo.toolbar.screenSize") },
        slots: { items: toolbarScreenItems(t) },
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
        options: { value: "vanilla", label: t("demo.toolbar.binding") },
        slots: { items: toolbarBindingItems },
      },
    },
  ],
});
