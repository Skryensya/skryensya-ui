import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * One tooltip per placement, so the four logical sides can be compared at once.
 *
 * A PLAIN CONSTANT, per this directory's README: every string in it is a proper noun. The labels ARE
 * the placement values (`block-start`, `inline-end`), which is the vocabulary the page teaches and is
 * identical in every language, and the content reads "Tooltip", the component's own name.
 */
export const anchorPlacementsTree: UsageTree = {
  contract: "layout",
  signature: "Inline",
  attrs: { class: "sk-anchoring-demo" },
  children: ["block-start", "block-end", "inline-start", "inline-end"].map((placement) => ({
    contract: "tooltip",
    signature: "Tooltip",
    options: { placement, arrow: true },
    slots: {
      children: {
        contract: "button",
        signature: "Button.action",
        attrs: { class: "sk-tooltip__trigger" },
        children: placement,
      },
      content: "Tooltip",
    },
  })),
};
