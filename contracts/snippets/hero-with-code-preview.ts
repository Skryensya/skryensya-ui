import type { Snippet } from "./snippet.js";

export const heroWithCodePreviewSnippet: Snippet = {
  id: "hero-with-code-preview",
  level: "molecule",
  intent: "A developer-tool hero: the pitch on one side, the install command on the other, instead of a screenshot.",
  notes: [
    "Same split shape as `hero-split-with-media` (an outer `Inline`, `wrap: false`, pitch beside a " +
      "second column), with `code-preview.CodePreview` standing in for `image-frame.ImageFrame`: a " +
      "developer-tool's own hero has a more convincing screenshot than a photo, the exact command " +
      "that gets someone from zero to running.",
    "`CodePreview`'s `children` slot takes plain text (the literal command), not a nested `Code` " +
      "signature: confirmed against `demos/process-list.ts`'s own established usage, the same shape " +
      "this snippet borrows rather than inventing a second convention for the same contract.",
    "One real command, not a fabricated block of application code: `pnpm add @skryensya/core " +
      "@skryensya/react` is something a reader could paste and run, which is the whole point of " +
      "showing it here, unlike a screenshot that only has to look plausible.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies), same shell every " +
      "other hero snippet uses.",
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
                    children: "Ship it in minutes, not sprints.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "One clear, end-to-end typed API.",
                  },
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { variant: "accent", href: "#docs" },
                    children: "Read the docs",
                  },
                ],
              },
              {
                contract: "code-preview",
                signature: "CodePreview",
                slots: {
                  label: "terminal",
                  children: "pnpm add @skryensya/core @skryensya/react",
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
