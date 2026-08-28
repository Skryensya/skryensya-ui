import type { Snippet } from "./snippet.js";

export const iconOnlyButtonTooltipSnippet: Snippet = {
  id: "icon-only-button-tooltip",
  level: "component",
  intent: "An icon-only button that explains itself, both visually and to assistive tech.",
  notes: [
    "An icon-only Button needs an accessible name from `aria-label` (get_contract's own a11y rule: " +
      "`requiresOneOf: [aria-label, aria-labelledby]` when `iconOnly` is true)  -  `validate_ui` " +
      "rejects the tree without it. The Tooltip's `content` is a SEPARATE thing: a visible hint for a " +
      "sighted pointer user who is hovering, not a substitute for the aria-label a screen reader " +
      "reads regardless of the tooltip ever opening.",
    "Both strings say the same thing on purpose (\"Delete item\")  -  a tooltip that reads differently " +
      "from the button's own accessible name teaches two different names for one control, which is " +
      "the kind of small mismatch that makes a reader distrust every label after it.",
    "`variant: \"ghost\"`: an icon-only control in a toolbar or a row of actions reads as chrome, not " +
      "a primary action  -  `neutral` (the contract default) would visually compete with whatever the " +
      "actual primary action on the page is.",
  ],
  tree: {
    contract: "tooltip",
    signature: "Tooltip",
    slots: {
      content: "Delete item",
    },
    children: {
      contract: "button",
      signature: "Button.action",
      options: { variant: "ghost", iconOnly: true },
      attrs: { "aria-label": "Delete item" },
      children: { contract: "icon", signature: "Icon", options: { name: "delete" } },
    },
  },
};
