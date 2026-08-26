import type { Snippet } from "./snippet.js";

export const heroWithVideoDemoSnippet: Snippet = {
  id: "hero-with-video-demo",
  level: "molecule",
  intent: "A pitch that closes on watching the product work, a paused thumbnail and one explicit action, instead of a screenshot.",
  notes: [
    "No play-glyph overlay: this system's own published icon set (`get_contract(\"icon\")`'s own " +
      "`name` enum) has no play/pause pictogram, and hand-drawing one glyph just for this snippet " +
      "would be the same one-off `[...path].astro` already avoids for its own layout-switch icons " +
      "(see that file's own header on why those stay hand-drawn rather than imported). A real " +
      "`Button.action` (\"Ver la demo\") carries the same instruction in text a floating play icon " +
      "would carry silently, and unlike an icon-only control it needs no separate `aria-label` to " +
      "say what it does.",
    "The thumbnail is a real `image-frame.ImageFrame`, `alt` describing it as PAUSED and ready to " +
      "play (\"Vista previa en pausa de la demo del producto, lista para reproducirse\"), not the " +
      "product's own name repeated: an image that never actually plays needs its `alt` to say so, " +
      "the same content rule `hero-split-with-media`'s own notes draw for its own screenshot.",
    "The button sits ABOVE the thumbnail in document order, not layered on top of it: an overlay " +
      "button centered on an image needs its own absolute positioning this contract does not publish, " +
      "and forcing it in would be exactly the kind of one-off inline styling this system's own " +
      "snippets avoid elsewhere. Reading the action before the image it triggers is also the more " +
      "honest order for anyone using a screen reader, who has no \"floating over the picture\" cue " +
      "to find it by otherwise.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies) shells the whole " +
      "column, same reasoning as every other hero snippet.",
  ],
  tree: {
    contract: "hero",
    signature: "Hero",
    options: { align: "center" },
    children: [
      {
        contract: "wrapper",
        signature: "Wrapper",
        children: [
          {
            contract: "layout",
            signature: "Stack",
            options: { gap: "lg", align: "center" },
            children: [
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "sm", align: "center" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "display-sm", flush: true },
                    children: "See how it works in two minutes.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "A quick walkthrough of the essentials, no call required.",
                  },
                ],
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { variant: "accent" },
                children: "Watch the demo",
              },
              {
                contract: "image-frame",
                signature: "ImageFrame",
                options: {
                  src: "https://picsum.photos/seed/video-demo-thumb/960/540",
                  alt: "A paused preview of the product demo, ready to play",
                  aspect: "16/9",
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
