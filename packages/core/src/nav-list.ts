export type NavListOrientation = "vertical" | "horizontal";

export type NavListOptions = {
  orientation?: NavListOrientation;
};

/*
 * A PATTERN, by decision 8's rule: the navbar and the sidebar need this exact structure, a list of
 * destinations, each an icon, a label and optional trailing metadata, so shipping it once is the
 * point. That the two differ by orientation is a variant, not a second structure.
 *
 * Named for its role, never for the thing it currently sits in (decision 2). `sk-sidebar__link`
 * named a tenant: the list was never the sidebar's, it is a guest there. It is deliberately NOT
 * called a menu: `role="menu"` means an application menu with menuitem children, and this is a
 * list of links.
 */
export const navListParts = {
  root: "sk-nav-list",
  group: "sk-nav-list__group",
  groupLabel: "sk-nav-list__group-label",
  list: "sk-nav-list__list",
  item: "sk-nav-list__item",
  link: "sk-nav-list__link",
  label: "sk-nav-list__label",
  trailing: "sk-nav-list__trailing",
} as const;

export type NavListPart = keyof typeof navListParts;
export type NavListPartClass = (typeof navListParts)[NavListPart];
