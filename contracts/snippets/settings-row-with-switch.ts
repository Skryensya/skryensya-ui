import type { Snippet } from "./snippet.js";

export const settingsRowWithSwitchSnippet: Snippet = {
  id: "settings-row-with-switch",
  level: "molecule",
  intent: "A settings row: a label and its description on one side, the control on the other.",
  notes: [
    "`Inline` with `justify: \"between\"`, not two elements floated by hand  -  the gap between the " +
      "text block and the control is a layout primitive's job (`layout`'s own `useWhen`: \"las cosas " +
      "van una al lado de otra\"), not a one-off margin invented for this row alone.",
    "The `Switch` carries its OWN `aria-label`, restating the row's visible title, even though the " +
      "text sits right next to it. Visual proximity is not an accessibility relationship: a screen " +
      "reader that lands on the switch directly (tab order, not reading order) hears only what the " +
      "control itself says. Passing the same text as the Switch's own `children` instead would work " +
      "too, but would print it a second time on screen next to the text already carrying it.",
    "The description is a SEPARATE, secondary-tone Text under the title, not folded into one string " +
      " -  the same title/description split `Callout` and `FormField` both make for the same reason: " +
      "one is the name of the setting, the other is what it does.",
  ],
  tree: {
    contract: "layout",
    signature: "Inline",
    options: { justify: "between", inlineAlign: "center" },
    children: [
      {
        contract: "layout",
        signature: "Stack",
        options: { gap: "xs" },
        children: [
          {
            contract: "typography",
            signature: "Text",
            options: { weight: "emphasis" },
            children: "Dark mode",
          },
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "secondary", size: "sm" },
            children: "Switches the whole app to a dark palette.",
          },
        ],
      },
      {
        contract: "switch",
        signature: "Switch",
        options: { checked: true },
        attrs: { "aria-label": "Dark mode" },
      },
    ],
  },
};
