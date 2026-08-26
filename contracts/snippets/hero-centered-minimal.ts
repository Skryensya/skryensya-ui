import type { Snippet } from "./snippet.js";

export const heroCenteredMinimalSnippet: Snippet = {
  id: "hero-centered-minimal",
  level: "component",
  intent: "A page's opening with nothing but a headline and a one-line pitch, centered, no action.",
  notes: [
    "The `allison.sh`-shaped hero: a headline and a sub-line, nothing else. Not every hero is a " +
      "product pitch with a next step to point at; a personal or portfolio landing page's opening " +
      "often has no single action to push toward, and forcing one in (a `Button` linking to " +
      "nowhere in particular) would be worse than omitting it. `Hero`'s `children` slot has no " +
      "minimum beyond a heading, so this is a fully valid, small composition, not a stripped-down " +
      "version of `hero-with-actions`.",
    "`align: \"center\"` on BOTH the `Hero` and the inner `Stack` is deliberate, not redundant: " +
      "`Hero`'s own `align` centers the CONTENT BLOCK inside the hero's own box (a flex lever the " +
      "hero itself owns, see `patterns/hero.css`); `Stack`'s `align` centers each line of text " +
      "WITHIN that block. Set `Hero`'s `align` alone and a wide `Stack` still left-aligns its own " +
      "text inside a centered box, an inconsistent look confirmed live when the two were tried " +
      "independently.",
    "No `Button` at all is still a real hero, not a broken one: `useWhen` says at MOST one primary " +
      "and one secondary action, never that one is required. A composer reaching for a Button here " +
      "just because a hero \"should have one\" is exactly the kind of unrequested addition this " +
      "snippet exists to show is unnecessary.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies) shells the pitch " +
      "the same way `hero-with-actions` does: a centered headline stretched to the hero's own full " +
      "width reads as lost in the box, not as a deliberate, considered opening, and matching the " +
      "same measure the rest of the page's own main content already uses keeps the hero from " +
      "reading as a narrower, unrelated column dropped into it.",
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
            options: { gap: "sm", align: "center" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "display-sm", flush: true },
                children: "I build careful, quiet software.",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "lg" },
                children: "A one-line summary of what this person works on.",
              },
            ],
          },
        ],
      },
    ],
  },
};
