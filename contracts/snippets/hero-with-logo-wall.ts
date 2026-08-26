import type { Snippet } from "./snippet.js";

export const heroWithLogoWallSnippet: Snippet = {
  id: "hero-with-logo-wall",
  level: "molecule",
  intent: "A pitch closing on a row of the companies already using it, read as wordmarks rather than a stat.",
  notes: [
    "Text wordmarks (`typography.Text`, `weight: \"label\"`, `tone: \"tertiary\"`), not logo images: " +
      "this system has no real customer logos to publish, and standing in generic photos the way " +
      "`hero-split-with-media` does for a screenshot would read as exactly the wrong thing here, a " +
      "trust row is either real company marks or it says nothing. A consumer shipping this for real " +
      "swaps each `Text` for an `image-frame.ImageFrame` carrying the actual logo (`aspect: \"auto\"`, " +
      "a real `alt` naming the company), the same slot shape either way.",
    "\"Con la confianza de equipos en\" reads BEFORE the row, small and muted (`tone: \"tertiary\"`, " +
      "`size: \"sm\"`): the label frames what the row is, so a screen reader hears the claim before " +
      "the list of names, the same order a sighted reader's eye takes.",
    "REPLACES the earlier temptation to reach for `stat.Stat` here (a count: \"240+ empresas\"): a " +
      "number without a single visible name behind it is the mistake `hero-with-social-proof`'s own " +
      "notes already warn against for a different reason (a stat row with no CSS behind it read as " +
      "unstyled body text). Naming actual companies, even as plain wordmarks, earns more trust than " +
      "a number a reader has no way to verify.",
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
                    children: "The fastest way to ship your next idea.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "One system, two bindings, zero decisions made twice.",
                  },
                ],
              },
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "sm", align: "center" },
                children: [
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "tertiary", size: "sm", weight: "label" },
                    children: "Trusted by teams at",
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: { gap: "lg", inlineAlign: "center", justify: "center", wrap: true },
                    children: [
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "tertiary", size: "lg", weight: "label" },
                        children: "ACME",
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "tertiary", size: "lg", weight: "label" },
                        children: "GLOBEX",
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "tertiary", size: "lg", weight: "label" },
                        children: "INITECH",
                      },
                      {
                        contract: "typography",
                        signature: "Text",
                        options: { tone: "tertiary", size: "lg", weight: "label" },
                        children: "UMBRELLA",
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
