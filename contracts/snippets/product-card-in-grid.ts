import type { Snippet } from "./snippet.js";

export const productCardInGridSnippet: Snippet = {
  id: "product-card-in-grid",
  level: "molecule",
  intent: "One card  -  image, title, lead text, a trailing link  -  as one cell of an equal-width grid.",
  notes: [
    "`Grid`, not `DataGrid`: the catalogue publishes both under a near-identical phrase (\"grilla de " +
      "tarjetas\"), and only one is right here. `DataGrid` is the WAI keyboard-navigation pattern  -  " +
      "arrow keys move focus between cells  -  for a grid of interchangeable, keyboard-navigable " +
      "widgets. A row of cards a reader tabs through normally, each one just an equal-width column, " +
      "is `layout`'s `Grid`; reaching for `DataGrid` here would ask every card to behave like a " +
      "spreadsheet cell for no reason.",
    "The card is NOT one big link. The whole-card-as-anchor pattern (`TileLink`) is right when the " +
      "card has exactly one destination and nothing inside it needs its own focus stop. This card " +
      "has a title, a description AND a distinct 'View product' link  -  collapsing all of that into " +
      "one anchor would swallow the description's own text into the link's accessible name and give " +
      "a keyboard user no way to stop short of \"navigate\".",
    "Two nested `Box`es, not one: the outer carries the card's own surface/border and NO padding " +
      "(`padding: \"none\"`) so the image can sit flush against all four edges up to its own " +
      "`radius: \"top\"`; the inner one is where the padding actually lives, around the text alone. " +
      "One `Box` trying to do both jobs would either pad the image too, or leave the text unpadded.",
  ],
  tree: {
    contract: "layout",
    signature: "Grid",
    options: { columns: "3", gap: "md" },
    children: [
      {
        contract: "box",
        signature: "Box",
        options: { padding: "none", surface: "surface", border: "subtle" },
        children: [
          {
            contract: "image-frame",
            signature: "ImageFrame",
            options: {
              src: "https://picsum.photos/seed/desk-lamp/600/450",
              alt: "A brass desk lamp with a fabric shade",
              aspect: "4/3",
              radius: "top",
            },
          },
          {
            contract: "box",
            signature: "Box",
            options: { padding: "md" },
            children: [
              {
                contract: "layout",
                signature: "Stack",
                options: { gap: "sm" },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: { headingSize: "h3", flush: true },
                    children: "Brass desk lamp",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: { tone: "secondary" },
                    children: "Warm dimmable light with a fabric shade and a weighted base.",
                  },
                  {
                    contract: "typography",
                    signature: "Link",
                    options: { href: "/products/brass-desk-lamp" },
                    children: "View product",
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
