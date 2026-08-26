import type { Snippet } from "./snippet.js";

export const iconButtonToolbarWithTooltipsSnippet: Snippet = {
  id: "icon-button-toolbar-with-tooltips",
  level: "molecule",
  intent: "A row of icon-only actions, each one individually labelled and hinted.",
  notes: [
    "Three `icon-only-button-tooltip` component snippets, side by side in an `Inline` — a molecule is " +
      "often exactly this: a layout primitive around several already-correct single-component " +
      "instances, not a new shape invented from raw parts.",
    "Every button gets its OWN `aria-label` and its OWN `Tooltip`, matched to what it does (\"Edit\", " +
      "\"Duplicate\", \"Delete\") — three icon buttons with the same generic label (\"Action\", say) " +
      "would pass `validate_ui` (each individually satisfies the a11y rule) while still being " +
      "useless to anyone using a screen reader's \"list all buttons\" navigation, where three " +
      "identically-named controls are indistinguishable.",
    "`gap: \"sm\"`, tighter than a typical `Inline` row of full-size buttons — this is chrome " +
      "(actions ON a row, not the row's own content), and reads as one cohesive toolbar rather than " +
      "three separate controls that happen to be adjacent.",
  ],
  tree: {
    contract: "layout",
    signature: "Inline",
    options: { gap: "sm" },
    children: [
      {
        contract: "tooltip",
        signature: "Tooltip",
        slots: { content: "Edit" },
        children: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": "Edit" },
          children: { contract: "icon", signature: "Icon", options: { name: "edit" } },
        },
      },
      {
        contract: "tooltip",
        signature: "Tooltip",
        slots: { content: "Duplicate" },
        children: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": "Duplicate" },
          children: { contract: "icon", signature: "Icon", options: { name: "copy" } },
        },
      },
      {
        contract: "tooltip",
        signature: "Tooltip",
        slots: { content: "Delete" },
        children: {
          contract: "button",
          signature: "Button.action",
          options: { variant: "ghost", iconOnly: true },
          attrs: { "aria-label": "Delete" },
          children: { contract: "icon", signature: "Icon", options: { name: "delete" } },
        },
      },
    ],
  },
};
