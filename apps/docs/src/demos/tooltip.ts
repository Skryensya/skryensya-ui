import type { UsageTree } from "@skryensya/core/usage-tree";
import type { Translate } from "../i18n";

/*
 * WRITTEN BUT NOT IMPORTED. The page still authors its markup by hand, and this is the evidence of
 * why — the tree below VALIDATES and still renders a tooltip that can never open.
 *
 * `Tooltip`'s template paints the root, the positioner and the content, but it never writes the
 * hooks the vanilla enhancer scans for. `Tooltip.svelte` looks up `[data-sk-anchor-trigger]` and
 * `[data-sk-anchor-content]` under the mounted root and patches the machine's props onto whatever
 * it finds; the emitted markup has neither, so `content` is `null`, `data-state` is never written,
 * and `.sk-tooltip__content { display: none }` holds forever. The React binding is fine — it builds
 * its own trigger and content — so a tree here ships a page whose two stages disagree about whether
 * the component works at all.
 *
 * MEASURED, not deduced. With this tree wired into both pages, hovering the first trigger inside
 * the stage frame gave:
 *
 *   vanilla  3 roots, 0 [data-sk-anchor-trigger], 0 [data-sk-anchor-content],
 *            all three contents data-state=null, display:none, 0x0, no aria-describedby
 *   react    content data-state="open", display:block, 253x24, aria-describedby present
 *
 * Same in both locales. `verify-stages` caught it too, as `BINDINGS DISAGREE on text`: the vanilla
 * stage has all three descriptions in its DOM and hidden, React has none until it opens one.
 *
 * The mechanism is already there and used elsewhere: a template node carries `mount`, the way every
 * node of `Flyout`'s template carries `data-sk-flyout-*`. Three lines in
 * `packages/core/src/tooltip.ts` unblock this file:
 *
 *   - `mount: "data-sk-anchor-trigger"` (plus `also: ["sk-anchor"]`) on the `children` slot node
 *   - `mount: "data-sk-anchor-content"` on the `content` node
 *
 * Two more holes are smaller but real, and both are visible in the emitted output:
 *
 *   - THE DEFAULT PLACEMENT DISAGREES WITH ITSELF. `contract.options.placement.default` is
 *     `block-end`, while `tooltipDefaultPlacement` — what both bindings and the sheet resolve
 *     against, and what this page documents — is `block-start`. The emitter writes every mapped
 *     default, so a tree with no `placement` emits `data-sk-placement="block-end"` into the markup
 *     and nothing into the TSX: one authoring, two sides. Only demo 2 is affected, because it is
 *     the one that asks for the default.
 *   - THE ARROW IS UNREACHABLE. `sk-anchored-arrow` is authored inside the positioner in markup and
 *     is the `arrow` prop in React; the contract declares neither a slot nor an option for it, and
 *     the template has no arrow node. All three demos draw one.
 *
 * And one deviation this file already had to make: the third trigger is the truncated TEXT itself,
 * a bare `<span class="sk-truncate" tabindex="0">`. `children` accepts `signature`, and the nearest
 * signature is `Text`, which is a `<p class="sk-text">` — a paragraph where the demo teaches a span,
 * with three typography attributes the demo never asked for. That one is a judgement call rather
 * than a bug; the three above are not.
 *
 * `sk-tooltip__trigger` is a declared part no template emits, and it is NOT on this list: no rule in
 * `tooltip.css` mentions it, so nothing is lost by its absence. Neither are `sk-anchor` /
 * `sk-anchored` / `sk-anchored-arrow` as CLASSES — those are the ambient Anclaje pattern and free to
 * write; `also: ["sk-anchored"]` already puts one of them on the positioner.
 *
 * Meanwhile the two pages share the WORDS through the same `demo.tooltip.*` keys this file reads, so
 * the drift a tree would have removed is removed anyway: one dictionary feeds the HTML string, the
 * React snippet and the live island. The composition is the only thing still written twice.
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
      options: { placement: "block-end" },
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
      options: { placement: "inline-end" },
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
