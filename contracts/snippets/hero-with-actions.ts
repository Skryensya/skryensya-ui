import type { Snippet } from "./snippet.js";

export const heroWithActionsSnippet: Snippet = {
  id: "hero-with-actions",
  level: "component",
  intent: "A page's opening moment: a distinct surface, a headline, a pitch, and one or two actions.",
  notes: [
    "`Hero` has no anatomy of its own: no named slot for the headline, the sub-line or the " +
      "actions. What's inside is ordinary composition: a `Stack` holding a `Heading`, a `Text`, " +
      "and an `Inline` of one or two `Button.navigation`s. What `Hero` DOES fix is that this reads " +
      "as a hero at all: its `surface` defaults to `\"surface\"` and its `padding` to `\"xl\"`, " +
      "the opposite of `Box`'s own `\"none\"`/`\"none\"`, so a hero composed with no options set " +
      "still looks like an opening, not a floating headline sitting on the bare page background.",
    "Two actions, not three or more: a hero's job is to point at ONE next step, with at most a " +
      "quieter second option (here, `variant: \"ghost\"` next to the primary `\"accent\"`) for a " +
      "reader who wants to learn more before committing. A row of equal-weight buttons here would " +
      "undo the one thing a hero is supposed to decide for the reader.",
    "`headingSize: \"display-sm\"` is a VISUAL size, not a tag override: `Heading`'s host stays " +
      "`<h2>` regardless (get_contract's own `host.element`), so a hero heading this size still " +
      "nests correctly under a page's real `<h1>` wherever that lives (a document title, an app " +
      "shell's own branding) rather than competing with it for the single top heading level.",
    "`wrapper.Wrapper` (no `wrapperSize` given, so its own default `\"md\"` applies) is the shell " +
      "around the pitch, not `Hero` itself: `Hero`'s own surface stays full-bleed (the same reason " +
      "`Navbar` spans edge to edge), but a headline left to stretch that full width reads as a " +
      "stray sentence lost in the box rather than a deliberate column sized to match the rest of " +
      "the page's own main content, the same measure `ComponentPageShell`'s own prose reads at.",
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
            options: { gap: "md", align: "start" },
            children: [
              {
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "display-sm", flush: true },
                children: "Build the interface once, use it everywhere.",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "lg" },
                children: "A short pitch for what this product does and who it's for.",
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "sm" },
                children: [
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { tone: "accent", href: "#get-started" },
                    children: "Get started",
                  },
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { variant: "ghost", href: "#docs" },
                    children: "Read the docs",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
