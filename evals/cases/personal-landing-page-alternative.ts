import type { UsageTree } from "@skryensya/core/usage-tree";

/*
 * ANOTHER VALID ANSWER to `personal-landing-page`, composed independently: the final tree of a live
 * run (claude-code, claude-sonnet-5, 2026-09-26, against the server before get_contracts), copied
 * verbatim. It differs from the reference where a correct page may differ: NavList links in the bar,
 * sections drawn by a `<section>` Wrapper, project rows as plain ListItems (the prompt never asks for
 * them to be links), and a Footer for the copyright line. `run.ts` holds it to the case invariants,
 * so an invariant that only the reference tree could meet fails the static gate.
 */
export const independentLandingPage: UsageTree = {
  contract: "layout",
  signature: "Stack",
  options: {
    gap: "none",
  },
  children: [
    {
      contract: "navbar",
      signature: "Navbar",
      children: [
        {
          contract: "navbar",
          signature: "NavbarBrand",
          children: "Alex Rivera",
        },
        {
          contract: "nav-list",
          signature: "NavList",
          options: {
            orientation: "horizontal",
          },
          attrs: {
            "aria-label": "Primary",
          },
          children: [
            {
              contract: "nav-list",
              signature: "NavListGroup",
              children: [
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: {
                    href: "#projects",
                  },
                  children: "Projects",
                },
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: {
                    href: "#about",
                  },
                  children: "About",
                },
                {
                  contract: "nav-list",
                  signature: "NavListLink",
                  options: {
                    href: "#contact",
                  },
                  children: "Contact",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      contract: "layout",
      signature: "Main",
      children: {
        contract: "layout",
        signature: "Stack",
        options: {
          gap: "xl",
        },
        children: [
          {
            contract: "hero",
            signature: "Hero",
            children: {
              contract: "wrapper",
              signature: "Wrapper",
              children: {
                contract: "layout",
                signature: "Stack",
                options: {
                  gap: "md",
                  align: "start",
                },
                children: [
                  {
                    contract: "typography",
                    signature: "Heading",
                    options: {
                      headingSize: "display-sm",
                      headingElement: "h1",
                      flush: true,
                    },
                    children: "I build small, useful software.",
                  },
                  {
                    contract: "typography",
                    signature: "Text",
                    options: {
                      tone: "secondary",
                      size: "lg",
                    },
                    children: "Software engineer who likes turning fuzzy ideas into fast, reliable products. This is a small corner of the internet for my work.",
                  },
                  {
                    contract: "layout",
                    signature: "Inline",
                    options: {
                      gap: "sm",
                    },
                    children: [
                      {
                        contract: "button",
                        signature: "Button.navigation",
                        options: {
                          tone: "accent",
                          href: "#projects",
                        },
                        children: "See my projects",
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            contract: "wrapper",
            signature: "Wrapper",
            options: {
              wrapperElement: "section",
            },
            attrs: {
              id: "projects",
            },
            children: {
              contract: "layout",
              signature: "Stack",
              options: {
                gap: "lg",
              },
              children: [
                {
                  contract: "typography",
                  signature: "Heading",
                  options: {
                    headingSize: "h2",
                  },
                  children: "Projects",
                },
                {
                  contract: "box",
                  signature: "Box",
                  options: {
                    padding: "none",
                    surface: "surface",
                    border: "subtle",
                  },
                  children: [
                    {
                      contract: "image-frame",
                      signature: "ImageFrame",
                      options: {
                        src: "https://picsum.photos/seed/featherweight/800/450",
                        alt: "Screenshot of the Featherweight Notes app",
                        aspect: "16/9",
                        radius: "top",
                      },
                    },
                    {
                      contract: "box",
                      signature: "Box",
                      options: {
                        padding: "md",
                      },
                      children: {
                        contract: "layout",
                        signature: "Stack",
                        options: {
                          gap: "sm",
                        },
                        children: [
                          {
                            contract: "typography",
                            signature: "Heading",
                            options: {
                              headingSize: "h3",
                              flush: true,
                            },
                            children: "Featherweight Notes",
                          },
                          {
                            contract: "typography",
                            signature: "Text",
                            options: {
                              tone: "secondary",
                            },
                            children: "A minimal note-taking app for people who just want to capture a thought and get back to their day.",
                          },
                          {
                            contract: "typography",
                            signature: "Link",
                            options: {
                              href: "/projects/featherweight-notes",
                            },
                            children: "View project",
                          },
                        ],
                      },
                    },
                  ],
                },
                {
                  contract: "list",
                  signature: "List",
                  children: [
                    {
                      contract: "list",
                      signature: "ListItem",
                      slots: {
                        title: "Tidepool",
                        description: "A small tool for tracking personal habits with a calm, distraction-free interface.",
                      },
                    },
                    {
                      contract: "list",
                      signature: "ListItem",
                      slots: {
                        title: "Waypoint",
                        description: "A lightweight route planner for weekend hikes, built as a weekend project.",
                      },
                    },
                    {
                      contract: "list",
                      signature: "ListItem",
                      slots: {
                        title: "Fernweh",
                        description: "A photo journal for travel notes, with offline-first sync.",
                      },
                    },
                    {
                      contract: "list",
                      signature: "ListItem",
                      slots: {
                        title: "Slate",
                        description: "A command-line scaffolding tool for spinning up new side projects fast.",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            contract: "wrapper",
            signature: "Wrapper",
            options: {
              wrapperElement: "section",
            },
            attrs: {
              id: "about",
            },
            children: {
              contract: "layout",
              signature: "Stack",
              options: {
                gap: "md",
              },
              children: [
                {
                  contract: "typography",
                  signature: "Heading",
                  options: {
                    headingSize: "h2",
                  },
                  children: "About",
                },
                {
                  contract: "layout",
                  signature: "Inline",
                  options: {
                    gap: "md",
                    inlineAlign: "start",
                  },
                  children: [
                    {
                      contract: "avatar",
                      signature: "Avatar.image",
                      options: {
                        size: "xl",
                        src: "https://i.pravatar.cc/160?img=12",
                        imageName: "Alex Rivera",
                      },
                    },
                    {
                      contract: "typography",
                      signature: "Text",
                      options: {
                        tone: "secondary",
                      },
                      children: "Hi, I'm Alex - I've spent the last several years building web products, mostly small tools that try to do one thing well. When I'm not writing code I'm usually hiking, reading, or tinkering with side projects like the ones above.",
                    },
                  ],
                },
              ],
            },
          },
          {
            contract: "wrapper",
            signature: "Wrapper",
            options: {
              wrapperElement: "section",
            },
            attrs: {
              id: "contact",
            },
            children: {
              contract: "layout",
              signature: "Stack",
              options: {
                gap: "md",
              },
              children: [
                {
                  contract: "typography",
                  signature: "Heading",
                  options: {
                    headingSize: "h2",
                  },
                  children: "Contact",
                },
                {
                  contract: "list",
                  signature: "List",
                  children: [
                    {
                      contract: "list",
                      signature: "ListItemLink",
                      options: {
                        href: "mailto:alex@example.com",
                      },
                      slots: {
                        title: "Email",
                      },
                    },
                    {
                      contract: "list",
                      signature: "ListItemLink",
                      options: {
                        href: "https://linkedin.com/in/alexrivera",
                      },
                      attrs: {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      },
                      slots: {
                        title: "LinkedIn",
                      },
                    },
                    {
                      contract: "list",
                      signature: "ListItemLink",
                      options: {
                        href: "https://github.com/alexrivera",
                      },
                      attrs: {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      },
                      slots: {
                        title: "GitHub",
                      },
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
    },
    {
      contract: "footer",
      signature: "Footer",
      options: {
        padding: "md",
      },
      children: {
        contract: "wrapper",
        signature: "Wrapper",
        children: {
          contract: "typography",
          signature: "Text",
          options: {
            tone: "tertiary",
            size: "sm",
          },
          children: "© 2026 Alex Rivera. All rights reserved.",
        },
      },
    },
  ],
};
