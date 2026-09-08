import type { Snippet } from "./snippet.js";

export const heroWithPricingToggleSnippet: Snippet = {
  id: "hero-with-pricing-toggle",
  level: "molecule",
  intent: "A pricing-led hero: the pitch, a monthly/annual switch, the number itself, and one action.",
  notes: [
    "The price is a `typography.Text` (`size: \"lg\"`, `weight: \"emphasis\"`), never a second " +
      "`Heading`: `Hero`'s own content rule is exactly one real heading inside, and a second, " +
      "visually larger `<h2>` for the number would double it, the same mistake `hero-with-eyebrow`'s " +
      "own notes warn a small label above the headline into becoming.",
    "`segmented.Segmented` (`Mensual` / `Anual`), not `tabs.Tabs`: the two values are a SETTING that " +
      "changes what the price reads (Segmented's own `useWhen`, \"small-exclusive-choice\"), not two " +
      "separate panels of different content, which is what `Tabs` is for (see `hero-with-audience-" +
      "tabs`'s own notes for that distinction drawn the other way).",
    "A real composition, not a live one: this tree shows the price and the toggle in one static " +
      "moment (`Anual` selected). A consumer wiring this for real reads `Segmented`'s own change " +
      "event and swaps the `Text` content between the two numbers; that behavior lives in the page's " +
      "own script, the same way a real waitlist form's submit handler does for `hero-with-email-" +
      "capture`.",
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
                    children: "One simple price, for any size team.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary", size: "lg" },
                    children: "Switch between monthly and annual, cancel any time.",
                  },
                ],
              },
              {
                contract: "segmented",
                signature: "Segmented",
                options: { value: "annual", label: "Billing cycle" },
                slots: {
                  items: [
                    { options: { value: "monthly" }, slots: { label: "Monthly" } },
                    { options: { value: "annual" }, slots: { label: "Annual (2 months free)" } },
                  ],
                },
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "primary", size: "lg", weight: "emphasis" },
                children: "$29/month",
              },
              {
                contract: "button",
                signature: "Button.action",
                options: { tone: "accent" },
                children: "Start free trial",
              },
            ],
          },
        ],
      },
    ],
  },
};
