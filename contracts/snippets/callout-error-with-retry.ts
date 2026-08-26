import type { Snippet } from "./snippet.js";

export const calloutErrorWithRetrySnippet: Snippet = {
  id: "callout-error-with-retry",
  level: "component",
  intent: "An error message that gives the reader a way forward, not just a dead end.",
  notes: [
    "A Callout on its own is valid with no actions — most callouts are not dead ends, and nothing " +
      "in the contract should force one. This is what to reach for the moment a callout IS reporting " +
      "a failed operation: the reader's next step has to be as visible as the error itself.",
    "`actions` restricts `variant` to `translucent`/`danger` (get_contract's own `restrictOptions`) " +
      "— a full-strength `neutral` action inside a tone=\"danger\" callout would out-compete the " +
      "callout's own color for attention; `translucent` reads as \"lives inside this callout\", not " +
      "a separate control competing with it.",
    "`title` and the description in `children` are separate slots on purpose: assistive tech reaches " +
      "the callout's role and title first, then the longer text. Folding both into `children` loses " +
      "that order for anyone who can't see the visual hierarchy doing the same job silently.",
  ],
  tree: {
    contract: "callout",
    signature: "Callout",
    options: { tone: "danger" },
    slots: {
      icon: { contract: "icon", signature: "Icon", options: { name: "danger" } },
      title: "We couldn't save your changes",
      actions: [
        {
          contract: "button",
          signature: "Button.action",
          options: { variant: "translucent" },
          children: "Try again",
        },
      ],
    },
    children: "The last save attempt failed. Check your connection and try again.",
  },
};
