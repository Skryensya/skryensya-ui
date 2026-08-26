import type { Snippet } from "./snippet.js";

export const heroWithTestimonialSnippet: Snippet = {
  id: "hero-with-testimonial",
  level: "molecule",
  intent: "A pull-quote hero: one real testimonial, attributed to a name and a role, standing in for a pitch of its own.",
  notes: [
    "The quote IS the `Heading` (`headingSize: \"h1\"`), not a plain `Text` standing in for one: an " +
      "earlier version of this pattern used a large `Text` here on the theory that quoting someone " +
      "ELSE'S words was a deliberate exception to Hero's own content rule. It was not; `Hero`'s own " +
      "rule (\"un encabezado real siempre adentro, nunca sólo texto grande\") reads exactly that " +
      "shape as the mistake it names, and it looked the part too, a quote at plain body-`lg` size " +
      "(18px) read as a caption underneath an empty hero, not as the thing the hero opens with. A " +
      "testimonial hero's headline is simply the words someone else said, not the page's own pitch in " +
      "its own voice, so the quote fills the same one-heading slot every other pattern's own pitch " +
      "fills.",
    "`headingSize: \"h1\"` (30px), not `\"display-sm\"` (36px): the other patterns' short, punchy " +
      "titles (four to seven words) can carry the biggest display size without wrapping awkwardly; a " +
      "whole quoted SENTENCE at that size would wrap across three or four lines and read as shouting. " +
      "`h1` is the next step down, still clearly the hero's own headline, sized for a longer run of " +
      "words instead of a short line.",
    "`Avatar.initials`, not `Avatar.image`: this is a molecule-level SNIPPET showing composition, the " +
      "same reason `hero-with-social-proof`'s own three avatars stay initials rather than photos. A " +
      "consumer with a real photo swaps in `Avatar.image` in the same slot, `AvatarGroup`'s own " +
      "`children` already accepts either.",
    "Name and role stack as two separate `Text` elements (`weight: \"emphasis\"` for the name, `tone: " +
      "\"secondary\"` for the role), not one string with a comma: a screen reader announces them as " +
      "two distinct facts in the same reading order a sighted reader's eye takes, top line first.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies), the same shell " +
      "every other hero snippet uses, kept here for the same reason: a single long quote reads better " +
      "at the page's own main-content measure than stretched full width.",
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
                contract: "typography",
                signature: "Heading",
                options: { headingSize: "h1", flush: true },
                children:
                  "“We've switched design systems three times before. This is the first one the team actually uses without a fight.”",
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "sm", inlineAlign: "center" },
                children: [
                  {
                    contract: "avatar",
                    signature: "Avatar.initials",
                    options: { size: "lg", name: "Jordan Cole" },
                    children: "JC",
                  },
                  {
                    contract: "layout",
                    signature: "Stack",
                    options: { gap: "none", align: "start" },
                    children: [
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { size: "sm", weight: "emphasis" },
                        children: "Jordan Cole",
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "secondary", size: "sm" },
                        children: "Head of Design, Northwind",
                      },
                    ],
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
