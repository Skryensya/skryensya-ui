import type { Snippet } from "./snippet.js";

export const heroWithSocialProofSnippet: Snippet = {
  id: "hero-with-social-proof",
  level: "molecule",
  intent: "A centered pitch backed by the people already using it: an avatar group and a short line of trust.",
  notes: [
    "Molecule level: `AvatarGroup` is its own published family (`get_catalog`'s own `avatar` entry, " +
      "`intent: [\"people\", \"avatar-stack\", \"group-with-overflow\"]`), paired here with a " +
      "`typography.Text` reading the count out loud. `Hero` still owns exactly one child (the outer " +
      "`Stack` holding both the pitch and the proof row) and still has no dedicated slot for it, the " +
      "same reasoning `hero-split-with-media` gives: a hero's variety lives in what a consumer " +
      "composes inside it, not in growing the contract a named slot per pattern.",
    "REPLACES an earlier `hero-with-stat-row` pattern (a row of `Stat` metrics under the pitch), " +
      "removed for two real reasons found live, not one: first, the docs page that rendered it never " +
      "imported `components/stat.css`, so every `Stat` inside it painted with zero styling, plain " +
      "16px text with no visual hierarchy between the number and its label, exactly what \"doesn't " +
      "look right\" was pointing at. Second, and the reason it isn't simply getting the missing " +
      "import back: a row of KPIs (\"10,400 active teams\", \"99.9% uptime\") is a PROOF section a " +
      "page builds AFTER establishing what it does, not something a reader has any reason to trust " +
      "in the first three seconds a hero gets. Social proof (a visible group of real avatars, a " +
      "trust count) earns credibility the way a hero actually can: by showing people, not numbers " +
      "nobody has context for yet.",
    "`AvatarGroup`'s `overflow` slot (`\"+240\"`) is what makes three avatars read as MANY, not just " +
      "three: without it, three initials circles read as \"this pitch has three friends,\" the " +
      "opposite of the trust this pattern exists to build. The accompanying `Text` (\"Trusted by " +
      "240+ product teams\") says the same number in words, for the reader who can't infer it from " +
      "a stack of circles alone, especially the reader relying on a screen reader that has no visual " +
      "stack to look at in the first place.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies) shells the whole " +
      "column, same reasoning as every other hero snippet: the pitch and the proof row both read as " +
      "one considered, centered block at the same measure the page's own main content already " +
      "uses, not stretched across the hero's own full-bleed width.",
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
                    children: "Built with teams like yours in mind.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "A short pitch, backed by the people already using it.",
                  },
                  {
                    contract: "button",
                    signature: "Button.action",
                    options: { variant: "accent" },
                    children: "Get started",
                  },
                ],
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "sm", inlineAlign: "center" },
                children: [
                  {
                    contract: "avatar",
                    signature: "AvatarGroup",
                    slots: {
                      overflow: "+240",
                      children: [
                        {
                          contract: "avatar",
                          signature: "Avatar.initials",
                          options: { name: "Alex Rivera" },
                          children: "AR",
                        },
                        {
                          contract: "avatar",
                          signature: "Avatar.initials",
                          options: { name: "Sam Okafor" },
                          children: "SO",
                        },
                        {
                          contract: "avatar",
                          signature: "Avatar.initials",
                          options: { name: "Priya Nair" },
                          children: "PN",
                        },
                      ],
                    },
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "sm" },
                    children: "Trusted by 240+ product teams",
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
