import type { Snippet } from "./snippet.js";

export const heroSplitWithMediaSnippet: Snippet = {
  id: "hero-split-with-media",
  level: "molecule",
  intent: "A hero split into two columns: the pitch on one side, a supporting screenshot on the other.",
  notes: [
    "Molecule level, not component: the pattern is a `layout.Inline` HOLDING a `Hero`'s single " +
      "child, pairing a `Stack` of text with an `ImageFrame` side by side. `Hero` itself stays the " +
      "same one-slot contract every other hero snippet uses; the split is ordinary layout " +
      "composition inside it, the same reasoning `hero-with-actions`'s own notes give for why an " +
      "`Inline` of buttons doesn't need `Hero` to grow a `actions` slot either.",
    "`wrap: false` on the outer `Inline` is deliberate: the whole reason this pattern exists is the " +
      "two columns SIDE BY SIDE. Left as the default `wrap: true`, a narrow viewport would stack " +
      "them, which is a real, reasonable outcome for a responsive page, but not what this SNIPPET " +
      "demonstrates the pattern to be at the width where a composer chose it. A consumer adapting " +
      "this for a page that genuinely needs to reflow narrow should set `wrap: true` back " +
      "deliberately, not inherit it by omission.",
    "The image carries a REAL, descriptive `alt` (\"The product's dashboard, showing a project list " +
      "and its own status column\"), not the headline's own text repeated and not empty: `Hero`'s " +
      "own content rule is that an image is either genuinely informative or purely decorative, never " +
      "a stand-in for the heading. This screenshot IS informative (it shows a real product surface a " +
      "reader can't otherwise see), so it earns a real description, exactly the case " +
      "`image-frame`'s own a11y rule (`requiresOneOf: [\"alt\"]` whenever `src` is given) exists for.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies), the SAME shell " +
      "every other hero snippet uses: the two columns share the page's own main-content measure " +
      "rather than reaching wider for a two-column layout, so a split hero lines up with whatever " +
      "sits above or below it on a real page instead of bulging past that column on its own.",
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
            signature: "Inline",
            options: { gap: "lg", inlineAlign: "center", wrap: false },
            children: [
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "md", align: "start" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "display-sm", flush: true },
                    children: "See your whole product in one view.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "A short pitch describing what the screenshot beside it shows.",
                  },
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { tone: "accent", href: "#get-started" },
                    children: "Get started",
                  },
                ],
              },
              {
                contract: "image-frame",
                signature: "ImageFrame",
                options: {
                  src: "https://picsum.photos/seed/product-screenshot/720/480",
                  alt: "The product's dashboard, showing a project list and its own status column",
                  aspect: "3/2",
                  radius: "surface",
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
