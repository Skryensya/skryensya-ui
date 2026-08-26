import type { EvalCase } from "../case.js";

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
      "en todos lados — lo que importa es la forma de la página, no el texto exacto.",
    en:
      "A personal landing page, in the same spirit as allison.sh: a top bar with the person's name " +
      "and a couple of nav links; a hero with a short one-line headline, a one-to-two sentence " +
      "sub-line, and a button linking to the projects section; a 'Projects' section with one " +
      "featured project shown as a card (image + title + short description + a 'View project' " +
      "link) and, below it, a compact list of several more projects, each with a title and a " +
      "one-line description; an 'About' section with a round photo/avatar next to a short " +
      "first-person bio; a 'Contact' section with a list of links (email, LinkedIn, GitHub); and a " +
      "copyright line at the bottom. Placeholder content is fine everywhere — what matters is the " +
      "shape of the page, not the exact wording.",
  },
  notes: [
    "El primer caso del corpus a escala de PÁGINA COMPLETA, no de componente ni de molécula. Sigue " +
      "siendo un `EvalCase` — un solo `tree`, no los cuatro estados de un `Recipe` — pero ejercita " +
      "muchas más familias a la vez que cualquier otro caso: layout (Stack/Inline/Main), wrapper, " +
      "navbar, typography, button, box, image-frame, list y avatar, todas anidadas correctamente en " +
      "una sola composición. Es exactamente el tipo de prompt que separa a un agente que compone " +
      "landmark por landmark con criterio de uno que sólo sabe resolver un pedido a la vez.",
    "Inspirado en la ESTRUCTURA real de una landing page personal (relevada en vivo con un browser " +
      "headless: qué tipo de sección hay, en qué orden, y cuántos ítems trae cada lista repetida — " +
      "nunca el copy exacto, que este prompt deliberadamente no pide reproducir). El patrón " +
      "'proyecto destacado como card + el resto como lista compacta de enlaces' en la sección de " +
      "Proyectos viene de ahí: no es una elección arbitraria del caso, es una forma real y común de " +
      "priorizar un ítem sobre el resto sin repetir la card completa N veces.",
    "El catálogo no publica una familia `Footer`: el copyright final es un `typography.Text` suelto " +
      "al pie del `Stack` principal, sin ningún landmark `<footer>` propio. `Hero` SÍ existe ahora " +
      "(publicado junto con este caso, `packages/core/src/hero.ts`) — la referencia lo usa " +
      "envolviendo el mismo `Stack` de `Heading`/`Text`/`Button` que antes flotaba sin superficie " +
      "propia: `Hero` no tiene anatomía fija (sin slots con nombre), sólo `padding`/`surface` con " +
      "los defaults de `Box` invertidos (`xl`/`surface` en vez de `none`/`none`), así que el " +
      "contenido adentro sigue siendo composición libre. Si el catálogo llega a publicar `Footer`, " +
      "este árbol de referencia debería migrar a usarlo en vez de un `Text` suelto.",
    "El proyecto destacado reusa el mismo patrón de dos `Box` anidados que `article-card-in-grid` y " +
      "el snippet `product-card-in-grid` (exterior `padding: none` para que la imagen llegue al " +
      "borde, interior `padding: md` sólo alrededor del texto) — la repetición es intencional: es la " +
      "prueba de que un agente que ya vio ese patrón en un ejemplo lo reconoce y lo reaplica dentro " +
      "de una composición mucho más grande, no sólo cuando el pedido es 'una sola card'.",
  ],
  tree: {
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
                            options: { variant: "accent", href: "#projects" },
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
                    children: "© 2026 — built with a design system.",
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
