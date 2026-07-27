export type { Api as MenuApi, Service as MenuService } from "@zag-js/menu";

export type MenuItemKind = "item" | "checkbox" | "radio";

export type MenuItem = {
  value: string;
  label: string;
  disabled?: boolean;
  kind?: MenuItemKind;
  checked?: boolean;
  group?: string;
  children?: readonly MenuItem[];
};

export const menuParts = {
  root: "sk-menu",
  trigger: "sk-menu__trigger",
  positioner: "sk-menu__positioner",
  content: "sk-menu__content",
  item: "sk-menu__item",
  itemLabel: "sk-menu__item-label",
  itemIndicator: "sk-menu__item-indicator",
  separator: "sk-menu__separator",
  group: "sk-menu__group",
  groupLabel: "sk-menu__group-label",
} as const;

export const menuAttrs = {
  root: "data-sk-menu",
  trigger: "data-sk-menu-trigger",
  contextTrigger: "data-sk-menu-context-trigger",
  positioner: "data-sk-menu-positioner",
  content: "data-sk-menu-content",
  item: "data-sk-menu-item",
  optionItem: "data-sk-menu-option-item",
  separator: "data-sk-menu-separator",
  group: "data-sk-menu-group",
  groupLabel: "data-sk-menu-group-label",
} as const;

export type MenuOpenChangeDetails = { open: boolean };
export type MenuSelectionDetails = { value: string };
