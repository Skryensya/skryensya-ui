/*
 * The bar only: a surface, a brand and a place for actions. The links inside are the `nav-list`
 * pattern, horizontal, shared with the sidebar rather than duplicated here (decision 17).
 */
export const navbarParts = {
  root: "ds-navbar",
  brand: "ds-navbar__brand",
  actions: "ds-navbar__actions",
} as const;

export type NavbarPart = keyof typeof navbarParts;
export type NavbarPartClass = (typeof navbarParts)[NavbarPart];
