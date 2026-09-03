import type { Snippet } from "./snippet.js";

export const footerCreditLineSnippet: Snippet = {
  id: "footer-credit-line",
  level: "component",
  intent:
    "The whole footer is one line of credit, nothing else: a personal or portfolio page's close.",
  notes: [
    "The `allison.sh`-shaped footer, the mirror of `hero-centered-minimal`. Not every footer is a " +
      "site map with columns of links and a legal bar; a personal page's footer is often one " +
      "sentence saying who made the thing and with what. `Footer`'s `children` slot has no " +
      "minimum, so this is a fully valid composition, not a stripped-down site footer.",
    "`surface: \"sunken\"` and `divider` (both the contract's defaults, restated here for " +
      "clarity) still earn their place on a one-line footer: the tint and the hairline above are " +
      "what make the sentence read as the page's close rather than as a trailing caption someone " +
      "forgot to delete.",
    "`padding: \"md\"` steps down from the `\"lg\"` default: a full site footer needs the room " +
      "for its column row, one line of text does not, and `lg` around a single sentence reads as " +
      "empty space, not as breathing room.",
    "`wrapper.Wrapper` holds the line at the page's own measure so the credit sits under the body " +
      "text it follows, not stretched edge to edge across a wide viewport.",
    "The text is a plain `typography.Text` at `tone: \"tertiary\"`, `size: \"sm\"`: a credit line " +
      "is the quietest thing on the page. An inline link to the author's site goes in as a " +
      "`typography.Link` inside the sentence when there is a real URL to point at; omitted here " +
      "so the snippet stays about the footer shape, not about one person's domain.",
  ],
  tree: {
    contract: "footer",
    signature: "Footer",
    options: { padding: "md" },
    children: [
      {
        contract: "wrapper",
        signature: "Wrapper",
        children: [
          {
            contract: "typography",
            signature: "Text",
            options: { tone: "tertiary", size: "sm" },
            children: "Sitio elaborado a mano con skryensya/ui.",
          },
        ],
      },
    ],
  },
};
