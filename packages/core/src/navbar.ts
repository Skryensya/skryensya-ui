import type { ComponentContract } from "./contract.js";

/*
 * The bar only: a surface, a brand and a place for actions. The links inside are the `nav-list`
 * pattern, horizontal, shared with the sidebar rather than duplicated here (decision 17).
 */
export const navbarParts = {
  root: "sk-navbar",
  brand: "sk-navbar__brand",
  actions: "sk-navbar__actions",
} as const;

export type NavbarPart = keyof typeof navbarParts;
export type NavbarPartClass = (typeof navbarParts)[NavbarPart];

/*
 * The page's top chrome. A `<header>` and two named regions, and nothing else: a navbar is a SHELL
 * (decision 17): it owns its own bar and adjusts its guests only by re-declaring their styling hooks,
 * never by reaching into their markup. The nav list inside it is a guest, not a part.
 */
export const navbarContract = {
  id: "navbar",
  css: "@skryensya/core/components/navbar.css",
  parts: navbarParts,
  options: {},

  signatures: {
    Navbar: {
      intent: ["top-bar", "app-header", "page-chrome"],
      host: { element: "header" },
      options: [],
      slots: { children: { accepts: "signature", required: true, of: ["NavbarBrand", "NavbarActions", "NavList"] } },
      template: { element: "header", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "Navbar" },
    },

    NavbarBrand: {
      intent: ["logo", "product-name", "home-link-in-the-bar"],
      host: { element: "div" },
      options: [],
      parents: ["Navbar"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "brand", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "NavbarBrand" },
    },

    NavbarActions: {
      intent: ["actions-in-the-bar", "account-menu-area"],
      host: { element: "div" },
      options: [],
      parents: ["Navbar"],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "actions", host: true, slot: "children" },
      react: { from: "@skryensya/react/navbar", name: "NavbarActions" },
    },
  },
} as const satisfies ComponentContract;
