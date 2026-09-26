import type { UsageTree } from "@skryensya/core/usage-tree";
import type { EvalCase } from "../case.js";
import { replaceEach } from "../tree-edit.js";
import { independentLandingPage } from "./personal-landing-page-alternative.js";

/*
 * What any correct answer to this prompt holds, stated as structure and never as copy. Section
 * membership ("the avatar is in the About section") is NOT stated: nothing structural marks a section
 * as About, so it could only be checked by reading an id or a heading's text, which is copy. What
 * each requirement below CAN say is written as tightly as the tree allows, and no tighter, so a
 * different valid page (links in a Stack instead of a List, a TileLink instead of a Box card, a
 * `<main>` Stack instead of Main) still passes.
 */
const links = ["Link", "NavListLink", "ListItemLink", "Button.navigation", "TileLink"];
const cards = ["Box", "TileLink"];
const rows = ["ListItemLink", "ListItem", "ListItemPlain"];

const invariants: EvalCase["invariants"] = [
  { uses: ["Navbar"], because: "a top bar with the name and nav links is the site's navbar" },
  {
    anyOf: [
      { uses: ["Main"] },
      { option: { signature: "Box", name: "boxElement", equals: "main" } },
      { option: { signature: ["Stack", "Inline", "Grid", "LayoutGrid"], name: "layoutElement", equals: "main" } },
      { option: { signature: "Wrapper", name: "wrapperElement", equals: "main" } },
    ],
    because: "a page has one main landmark, whichever primitive draws it",
  },
  { uses: ["Hero"], because: "the page opens with a hero" },
  { contains: { ancestor: "Hero", descendant: "Heading" }, because: "the hero's one-line headline is a real heading" },
  { before: { first: "Navbar", then: "Hero" }, because: "the top bar comes first" },
  { before: { first: "Hero", then: cards }, because: "the hero opens the page, before the projects" },
  {
    anchors: { from: "Button.navigation", within: "Hero", to: [rows, ["ImageFrame", "TileLink"]] },
    because: "the hero's button is a link to the projects section: the one holding the featured card and the project rows",
  },
  { avoids: ["Button.action"], because: "every control on this page goes somewhere; an action button here goes nowhere" },
  { contains: { ancestor: cards, descendant: "ImageFrame" }, because: "the featured project is a card with an image" },
  { contains: { ancestor: cards, descendant: "Heading" }, because: "the featured project's card has a title" },
  {
    count: { signature: rows, min: 3 },
    because: "the compact project list holds several projects, one row each",
  },
  {
    anyOf: [{ uses: ["Avatar.image"] }, { option: { signature: "ImageFrame", name: "radius", equals: "pill" } }],
    because: "the About section has a round photo of the person",
  },
  {
    option: { signature: links, name: "href", startsWith: "mailto:" },
    because: "the contact links reach the person by email",
  },
  {
    count: { signature: links, min: 7 },
    because: "two nav links, the CTA, the featured project's link and three contact links",
  },
];

/** The reference tree with one decision made wrong. Each one validates. */
const counterexamples = (tree: UsageTree): EvalCase["counterexamples"] => [
  {
    tree: replaceEach(tree, "Button.navigation", ({ options, ...node }) => ({
      ...node,
      signature: "Button.action",
      options: { tone: options?.tone ?? "accent" },
    })),
    because: "the hero's CTA is an action button: valid, and it navigates nowhere",
  },
  {
    tree: replaceEach(tree, "Button.navigation", (node) => ({ ...node, options: { ...node.options, href: "#contact" } })),
    because: "the hero's CTA links to the contact section instead of the projects",
  },
  {
    tree: replaceEach(tree, "Hero", (node) => ({ ...node, contract: "box", signature: "Box", options: { padding: "xl", surface: "surface" } })),
    because: "the opener is a padded Box: valid, and the page has no hero",
  },
  {
    tree: replaceEach(tree, "Avatar.image", () => ({
      contract: "image-frame",
      signature: "ImageFrame",
      options: { src: "https://picsum.photos/seed/portrait/200/200", alt: "Portrait of the author", aspect: "1/1" },
    })),
    because: "the portrait is a square frame: valid, and not round",
  },
  {
    tree: replaceEach(tree, "ListItemLink", (node) =>
      node.options?.href === "mailto:hello@example.com" ? { ...node, options: { href: "https://example.com/contact" } } : node,
    ),
    because: "the contact list has no email link",
  },
  {
    tree: replaceEach(tree, "List", (node) => (JSON.stringify(node).includes("mailto:") ? null : node)),
    because: "the contact list is missing",
  },
  {
    tree: replaceEach(tree, "Main", (node) => ({ ...node, contract: "layout", signature: "Stack", options: { gap: "none" } })),
    because: "the page has no main landmark: a Stack where Main was",
  },
];

const tree: UsageTree = {
  contract: "layout",
  signature: "Stack",
  options: { gap: "none" },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        { contract: "navbar", signature: "NavbarBrand", children: "Personal Landing" },
        {
          contract: "navbar",
          signature: "NavbarActions",
          children: [
            {
              contract: "layout",
              signature: "Inline",
              options: { gap: "md" },
              children: [
                { contract: "typography", signature: "Link", options: { href: "#projects" }, children: "Projects" },
                { contract: "typography", signature: "Link", options: { href: "#contact" }, children: "Contact" },
              ],
            },
          ],
        },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      children: [
        {
          contract: "wrapper",
          signature: "Wrapper",
          options: { wrapperSize: "md" },
          children: [
            {
              contract: "layout",
              signature: "Stack",
              options: { gap: "xl" },
              children: [
                {
                  contract: "hero",
                  signature: "Hero",
                  children: [
                    {
                      contract: "layout",
                      signature: "Stack",
                      options: { gap: "md" },
                      children: [
                        {
                          contract: "typography",
                          signature: "Heading",
                          options: { headingSize: "display-sm", flush: true },
                          children: "I build interfaces that feel right.",
                        },
                        {
                          contract: "typography",
                          signature: "Text",
                          options: { tone: "secondary", size: "lg" },
                          children: "A short one-line summary of what this person does and for whom.",
                        },
                        {
                          contract: "button",
                          signature: "Button.navigation",
                          options: { tone: "accent", href: "#projects" },
                          children: "View projects",
                        },
                      ],
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md" },
                  attrs: { id: "projects" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: "Projects",
                    },
                    {
                      contract: "box",
                      signature: "Box",
                      options: { padding: "none", surface: "surface", border: "subtle" },
                      children: [
                        {
                          contract: "image-frame",
                          signature: "ImageFrame",
                          options: {
                            src: "https://picsum.photos/seed/featured-project/800/450",
                            alt: "Screenshot of the featured project",
                            aspect: "16/9",
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
                                  children: "Featured project name",
                                },
                                {
                                  contract: "typography",
                                  signature: "Text",
                                  options: { tone: "secondary" },
                                  children:
                                    "A short description of what this project is and the author's role in it.",
                                },
                                {
                                  contract: "typography",
                                  signature: "Link",
                                  options: { href: "https://example.com/featured-project" },
                                  children: "View project",
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      contract: "list",
                      signature: "List",
                      children: [
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://example.com/project-two" },
                          slots: { title: "Second project", description: "One line describing this project." },
                        },
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://example.com/project-three" },
                          slots: { title: "Third project", description: "One line describing this project." },
                        },
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://example.com/project-four" },
                          slots: { title: "Fourth project", description: "One line describing this project." },
                        },
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://example.com/project-five" },
                          slots: { title: "Fifth project", description: "One line describing this project." },
                        },
                      ],
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md" },
                  attrs: { id: "about" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: "About",
                    },
                    {
                      contract: "layout",
                      signature: "Inline",
                      options: { gap: "md", inlineAlign: "start" },
                      children: [
                        {
                          contract: "avatar",
                          signature: "Avatar.image",
                          options: {
                            size: "lg",
                            src: "https://picsum.photos/seed/portrait/200/200",
                            imageName: "Portrait of the author",
                          },
                        },
                        {
                          contract: "typography",
                          signature: "Text",
                          options: { tone: "secondary" },
                          children:
                            "A short first-person bio: what this person works on, what they care about, " +
                            "and where they've worked.",
                        },
                      ],
                    },
                  ],
                },
                {
                  contract: "layout",
                  signature: "Stack",
                  options: { gap: "md" },
                  attrs: { id: "contact" },
                  children: [
                    {
                      contract: "typography",
                      signature: "Heading",
                      options: { headingSize: "h2", flush: true },
                      children: "Contact",
                    },
                    {
                      contract: "list",
                      signature: "List",
                      children: [
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "mailto:hello@example.com" },
                          slots: { title: "hello@example.com" },
                        },
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://linkedin.com/in/example" },
                          slots: { title: "linkedin.com/in/example" },
                        },
                        {
                          contract: "list",
                          signature: "ListItemLink",
                          options: { href: "https://github.com/example" },
                          slots: { title: "github.com/example" },
                        },
                      ],
                    },
                  ],
                },
                {
                  contract: "typography",
                  signature: "Text",
                  options: { tone: "secondary", size: "sm" },
                  children: "© 2026  -  built with a design system.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export const personalLandingPageCase: EvalCase = {
  id: "personal-landing-page",
  prompt: {
    es:
      "Una landing page personal, en el mismo espíritu que allison.sh: una barra superior con el " +
      "nombre y un par de enlaces de navegación; un hero con un titular corto de una línea, una " +
      "bajada de una o dos frases, y un botón que lleva a la sección de proyectos; una sección de " +
      "'Proyectos' con un proyecto destacado como card (imagen + título + descripción corta + " +
      "enlace 'Ver proyecto') y debajo una lista compacta de varios proyectos más, cada uno con " +
      "título y una línea de descripción; una sección 'Sobre mí' con una foto/avatar redondo al " +
      "lado de una bio corta en primera persona; una sección de 'Contacto' con una lista de enlaces " +
      "(email, LinkedIn, GitHub); y una línea de copyright al final. Contenido de relleno está bien " +
      "en todos lados  -  lo que importa es la forma de la página, no el texto exacto.",
    en:
      "A personal landing page, in the same spirit as allison.sh: a top bar with the person's name " +
      "and a couple of nav links; a hero with a short one-line headline, a one-to-two sentence " +
      "sub-line, and a button linking to the projects section; a 'Projects' section with one " +
      "featured project shown as a card (image + title + short description + a 'View project' " +
      "link) and, below it, a compact list of several more projects, each with a title and a " +
      "one-line description; an 'About' section with a round photo/avatar next to a short " +
      "first-person bio; a 'Contact' section with a list of links (email, LinkedIn, GitHub); and a " +
      "copyright line at the bottom. Placeholder content is fine everywhere  -  what matters is the " +
      "shape of the page, not the exact wording.",
  },
  notes: [
    "El primer caso del corpus a escala de PÁGINA COMPLETA, no de componente ni de molécula. Sigue " +
      "siendo un `EvalCase`  -  un solo `tree`  -  pero ejercita " +
      "muchas más familias a la vez que cualquier otro caso: layout (Stack/Inline/Main), wrapper, " +
      "navbar, typography, button, box, image-frame, list y avatar, todas anidadas correctamente en " +
      "una sola composición. Es exactamente el tipo de prompt que separa a un agente que compone " +
      "landmark por landmark con criterio de uno que sólo sabe resolver un pedido a la vez.",
    "Inspirado en la ESTRUCTURA real de una landing page personal (relevada en vivo con un browser " +
      "headless: qué tipo de sección hay, en qué orden, y cuántos ítems trae cada lista repetida  -  " +
      "nunca el copy exacto, que este prompt deliberadamente no pide reproducir). El patrón " +
      "'proyecto destacado como card + el resto como lista compacta de enlaces' en la sección de " +
      "Proyectos viene de ahí: no es una elección arbitraria del caso, es una forma real y común de " +
      "priorizar un ítem sobre el resto sin repetir la card completa N veces.",
    "El catálogo no publica una familia `Footer`: el copyright final es un `typography.Text` suelto " +
      "al pie del `Stack` principal, sin ningún landmark `<footer>` propio. `Hero` SÍ existe ahora " +
      "(publicado junto con este caso, `packages/core/src/hero.ts`)  -  la referencia lo usa " +
      "envolviendo el mismo `Stack` de `Heading`/`Text`/`Button` que antes flotaba sin superficie " +
      "propia: `Hero` no tiene anatomía fija (sin slots con nombre), sólo `padding`/`surface` con " +
      "los defaults de `Box` invertidos (`xl`/`surface` en vez de `none`/`none`), así que el " +
      "contenido adentro sigue siendo composición libre. Si el catálogo llega a publicar `Footer`, " +
      "este árbol de referencia debería migrar a usarlo en vez de un `Text` suelto.",
    "El proyecto destacado reusa el mismo patrón de dos `Box` anidados que `article-card-in-grid` y " +
      "el snippet `product-card-in-grid` (exterior `padding: none` para que la imagen llegue al " +
      "borde, interior `padding: md` sólo alrededor del texto)  -  la repetición es intencional: es la " +
      "prueba de que un agente que ya vio ese patrón en un ejemplo lo reconoce y lo reaplica dentro " +
      "de una composición mucho más grande, no sólo cuando el pedido es 'una sola card'.",
  ],
  tree,
  invariants,
  counterexamples: counterexamples(tree),
  alternatives: [
    {
      tree: independentLandingPage,
      because: "a live agent's page: NavList links, section Wrappers, plain ListItem project rows, a Footer",
    },
  ],
};
