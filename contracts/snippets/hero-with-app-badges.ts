import type { Snippet } from "./snippet.js";

export const heroWithAppBadgesSnippet: Snippet = {
  id: "hero-with-app-badges",
  level: "molecule",
  intent: "A mobile app's own landing pitch, closing on the two destinations that actually install it.",
  notes: [
    "Both actions are `Button.navigation` (`href` set, real destinations), not `Button.action`: " +
      "the row's whole job is sending the reader to a store, which is navigation, not something the " +
      "page itself does. This is the same call `hero-with-actions`'s own secondary link makes, " +
      "applied to both buttons here instead of one.",
    "No store badge artwork: a consumer's real app-store badge is a licensed image (Apple's and " +
      "Google's own marks, in their own required proportions), not something this system draws or " +
      "fakes. Plain text buttons (\"Descargar en App Store\" / \"Disponible en Google Play\") carry " +
      "the same two destinations honestly; a consumer shipping this for real swaps them for the " +
      "actual badge images, which is a `Button.navigation`'s `children` slot's job either way (it " +
      "already `accepts: \"node\"`, an `<img>` fits the same slot text does).",
    "`wrap: true` here, the opposite of `hero-split-with-media`'s own `wrap: false`: these two " +
      "buttons are equally weighted alternatives, not primary/secondary, so a narrow viewport " +
      "stacking them (rather than shrinking both to fit one line) is the right outcome, not a " +
      "concession.",
    "`wrapper.Wrapper` (no `wrapperSize` given, its own default `\"md\"` applies), same shell every " +
      "other hero snippet uses.",
  ],
  tree: {
    contract: "hero",
    signature: "Hero",
    options: { align: "start" },
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
                children: "Take it everywhere you go.",
              },
              {
                contract: "typography",
                signature: "Text",
                options: { tone: "secondary", size: "lg" },
                children: "Available on iOS and Android, kept in sync in real time.",
              },
              {
                contract: "layout",
                signature: "Inline",
                options: { gap: "sm", inlineAlign: "center", wrap: true },
                children: [
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { variant: "neutral", href: "#app-store" },
                    children: "Download on the App Store",
                  },
                  {
                    contract: "button",
                    signature: "Button.navigation",
                    options: { variant: "neutral", href: "#google-play" },
                    children: "Get it on Google Play",
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
