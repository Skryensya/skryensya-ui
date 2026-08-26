import type { Snippet } from "./snippet.js";

export const heroWithEyebrowSnippet: Snippet = {
  id: "hero-with-eyebrow",
  level: "component",
  intent: "A short accent-toned label above the headline, giving the pitch context before it lands.",
  notes: [
    "The label above the headline is a real `Badge` (`tone: \"accent\"`), not `Text` styled small: " +
      "confirmed live, `typography.Text`'s own `tone` enum is `primary`/`secondary`/`tertiary`/" +
      "`danger`, no `\"accent\"` value; `Badge`'s IS one of its five (`get_contract`'s own list). A " +
      "consumer reaching for Text with an invented tone value gets rejected by `validate_ui` " +
      "instead of silently falling back to something unstyled, which is the schema doing exactly " +
      "its job. `Badge` is also the semantically right call regardless of the type error: the label " +
      "is a short, set-apart tag (\"New\", \"Beta\", a product name), not a sentence, which is " +
      "`Badge`'s own `useWhen` (`label-on-something`) rather than body copy.",
    "The eyebrow reads BEFORE the headline in document order, and stays first even though it's " +
      "visually the smallest thing on the page: a screen reader announces it ahead of the headline " +
      "the same way a sighted reader's eye lands on it first, so the two experiences describe the " +
      "same order rather than the visual hierarchy silently disagreeing with the reading order.",
    "Still exactly one `Heading`: the eyebrow is a `Badge`, not a second heading competing with it " +
      "for the page's single top heading level. A composer tempted to make the eyebrow a small " +
      "`Heading` of its own would double the headings inside one hero, which is the shape " +
      "`Hero`'s own content rule (`useWhen`: \"un encabezado real, nunca sólo texto grande\") warns " +
      "against reading backwards, not forwards.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies) shells the whole " +
      "stack, same reasoning as `hero-with-actions`: the badge, headline, pitch and action all read " +
      "as one considered column at the same measure the page's own main content already uses, not " +
      "stretched across the hero's own full-bleed width.",
  ],
  tree: {
    contract: "hero",
    signature: "Hero",
    children: [
      {
        contract: "wrapper",
        signature: "Wrapper",
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "sm", align: "start" },
            children: [
              { contract: "badge", signature: "Badge", options: { tone: "accent" }, children: "New" },
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "display-sm", flush: true },
                children: "A faster way to compose your design system.",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "lg" },
                children: "A short pitch, set up by the small label above it.",
              },
              {
                contract: "button",
                signature: "Button.navigation",
                options: { variant: "accent", href: "#get-started" },
                children: "Get started",
              },
            ],
          },
        ],
      },
    ],
  },
};
