/*
 * NEITHER TREE IS WIRED YET, and both validate. Measured against what the page renders today
 * (2026-07-31); each is blocked on one line of contract, not on someone converting the page.
 *
 * `toolbarTree` — Tooltip's template never paints its own mount hooks. The Vanilla enhancer
 * (`packages/vanilla/src/components/Tooltip.svelte`) finds the trigger and the content by
 * `[data-sk-anchor-trigger]` / `[data-sk-anchor-content]`, and `emitMarkup` writes neither: the
 * trigger is a bare `{ slot: "children" }` with no `also`/`attrs` (so `parts.trigger`,
 * `sk-tooltip__trigger`, is a declared part no signature emits — and `sk-anchor` with it), and the
 * content node carries only `role="tooltip"`. So `trigger` and `content` come back null, no Zag
 * handler is ever bound, `data-state="open"` is never written, and `.sk-tooltip__content` stays at
 * `display: none` forever. React builds its own trigger span and portals its own content, so it
 * works — the two bindings would paint identically and only one of them would have a tooltip.
 * The content hook cannot be patched from the tree either: `attrs` reach the HOST, and the content
 * is a node inside Tooltip's own template. The page's authored markup writes all three hooks by
 * hand, so converting would trade a working tooltip for a dead one.
 * Two smaller gaps behind it: `arrow` is a React-only prop with no contract option (the arrow is
 * authored as `.sk-anchored-arrow` inside the positioner), and `bold`/`italic`/`link` are not in
 * Icon's stable `name` enum, which is why the tree below reaches for edit/copy/delete instead.
 *
 * `nestedToolbarTree` — Segmented's `value` option has no `prop: "defaultValue"`, so `emitReact`
 * writes `value="free"`, which `SegmentedControl` reads as the CONTROLLED prop with no
 * `onValueChange` beside it: the control is frozen. Measured on the already-converted
 * /componentes/segmented, where clicking the React stage's second option leaves `aria-checked`
 * exactly where it started while Vanilla moves it. Slider, Tabs, RadioGroup and TimeField all
 * carry that one line; Segmented never got it. This page's nested preview is Vanilla-only today,
 * so wiring the tree would ADD a React stage whose selection cannot move — on the one demo whose
 * whole subject is moving a selection with the keyboard.
 */
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
