import type { Snippet } from "./snippet.js";

export const actionRowInCardsSnippet: Snippet = {
  id: "action-row-in-cards",
  level: "molecule",
  intent:
    "A wrapping row of buttons as the last thing in a card, pinned to the floor when neighbouring cards grow taller.",
  notes: [
    "This is `Inline`, not a use-named ButtonWrapper. Layout names stay CSS vocabulary " +
      "(`block-start`, wrap, gap); a second component whose only job is 'the row a set of buttons sits in' " +
      "would duplicate Inline's published intent `button-row`.",
    "`blockStart: \"auto\"` is the card-floor case: leftover height in the parent column goes ABOVE the " +
      "row, so a grid of cards with different copy still lines their actions up. A Box whose last child is " +
      "that Inline becomes a flex column filling its grid cell; you do not invent a `margin-top: auto` " +
      "utility per card.",
    "Space above a row that is NOT pinning to a floor is a named step on the stack scale " +
      "(`blockStart: \"md\"`), or a `Stack` gap around the Inline. Default `none` so a label-and-value " +
      "Inline does not grow a gap it never asked for.",
    "Do not replace EmptyState's `__actions` part, a Dialog footer, or Toolbar with this. Those own " +
      "their action anatomy. Reach for Inline when YOU are composing buttons into a Box, a Hero, or a " +
      "form footer that has no part of its own.",
  ],
  tree: {
    contract: "layout",
    signature: "Grid",
    options: { columns: "2", gap: "md" },
    children: [
      {
        contract: "box",
        signature: "Box",
        options: { surface: "raised", border: "subtle", padding: "lg" },
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h4", flush: true },
                children: "Short plan",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary" },
                children: "A one-line pitch.",
              },
            ],
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", blockStart: "auto" },
            children: [
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "ghost" },
                children: "Details",
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { tone: "accent" },
                children: "Choose",
              },
            ],
          },
        ],
      },
      {
        contract: "box",
        signature: "Box",
        options: { surface: "raised", border: "subtle", padding: "lg" },
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "xs" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h4", flush: true },
                children: "Longer plan",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary" },
                children:
                  "Enough copy that this card grows taller than its neighbour, so the action row has to sit on the floor rather than under the last line of text.",
              },
            ],
          },
          {
            contract: "layout",
            signature: "Inline",
            options: { gap: "sm", blockStart: "auto" },
            children: [
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "ghost" },
                children: "Details",
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { tone: "accent" },
                children: "Choose",
              },
            ],
          },
        ],
      },
    ],
  },
};
