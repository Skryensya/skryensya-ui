import type { ComponentContract } from "./contract.js";

/*
 * MENUBAR — WAI-ARIA APG `menubar`: a persistent, horizontal bar of `menuitem`s, some of which open
 * a dropdown submenu. No `@zag-js/*` machine covers this pattern (`core/machines.ts` does not list
 * it) and it is NOT the same thing `core/menu.ts`'s `Menu` already covers — that is one trigger and
 * one popup; a menubar is SEVERAL, arranged as one roving-tabindex row, where Left/Right moves
 * between them and — the detail a naive implementation misses — moving to an adjacent item while a
 * dropdown is open closes the old one and opens the new one too, not just moves a highlight.
 *
 * Scope, decided before building: ONE level of dropdown per item (a command list, optionally with
 * `href` links), no nested submenus inside a menubar's own dropdown — `core/menu.ts`'s `Menu`
 * already owns arbitrarily-nested submenus for the single-trigger case, and WAI's own menubar
 * examples (`menubar-editor`, `menubar-navigation`) do not need a second level either. Hand-rolled
 * for the same reason `Treegrid`/`DataGrid` are: the pattern has real behaviour (`Toolbar`-style
 * roving tabindex, PLUS open-state handoff between items) no existing machine provides.
 */
export const menubarParts = {
  root: "sk-menubar",
  itemWrapper: "sk-menubar__item-wrapper",
  item: "sk-menubar__item",
  positioner: "sk-menubar__positioner",
  menu: "sk-menubar__menu",
  menuItem: "sk-menubar__menu-item",
} as const;

export type MenubarPart = keyof typeof menubarParts;
export type MenubarPartClass = (typeof menubarParts)[MenubarPart];

export const menubarContract = {
  id: "menubar",
  css: "@skryensya/core/components/menubar.css",
  parts: menubarParts,

  options: {
    /** The bar's accessible name. `role="menubar"` carries no implicit one. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Menubar: {
      intent: ["application-menu-bar", "editor-menubar", "site-navigation-with-dropdowns"],
      host: { element: "div" },
      options: ["label"],
      requires: ["label"],
      slots: { children: { accepts: "signature", required: true, of: ["MenubarItem"] } },
      template: {
        element: "div",
        part: "root",
        host: true,
        attrs: { role: "menubar" },
        slot: "children",
      },
      mount: "data-sk-menubar",
      react: { from: "@skryensya/react/menubar", name: "Menubar" },
    },

    /*
     * `role="menuitem"` regardless of whether it opens a submenu — WAI's own vocabulary: a menubar
     * ITEM either activates directly or opens a dropdown, but both are `menuitem`s at the top level,
     * never `menu` itself. Whether the popup children exist is what makes it a command vs. a
     * dropdown trigger (`aria-haspopup`/`aria-expanded`/`aria-controls`), the same "content decides
     * the shape" rule `TreeView`'s branch-vs-leaf already uses.
     */
    MenubarItem: {
      intent: ["menubar-command", "menubar-dropdown-trigger"],
      // The HOST is a wrapper, not the button: a `<button>` cannot contain another interactive
      // element as a descendant (a `role="menu"` full of its own `menuitem`s counts), so the
      // positioner has to be the button's SIBLING, both inside a `position: relative` common
      // ancestor — the same shape `NavListGroup`'s own trigger-plus-content wrapper already uses.
      host: { element: "div" },
      options: [],
      parents: ["Menubar"],
      slots: {
        children: { accepts: "text", required: true },
        items: { accepts: "signature", of: ["MenubarMenu"] },
      },
      template: {
        element: "div",
        part: "itemWrapper",
        host: true,
        children: [
          {
            element: "button",
            part: "item",
            also: ["sk-interactive"],
            attrs: { type: "button", role: "menuitem" },
            mount: "data-sk-menubar-item",
            slot: "children",
          },
          { whenGiven: "items", slot: "items" },
        ],
      },
      react: { from: "@skryensya/react/menubar", name: "MenubarItem" },
    },

    MenubarMenu: {
      intent: ["menubar-dropdown"],
      host: { element: "div" },
      options: [],
      parents: ["MenubarItem"],
      slots: { children: { accepts: "signature", required: true, of: ["MenubarMenuItem"] } },
      template: {
        element: "div",
        part: "positioner",
        host: true,
        mount: "data-sk-menubar-menu",
        children: [{ element: "div", part: "menu", attrs: { role: "menu" }, slot: "children" }],
      },
      react: { from: "@skryensya/react/menubar", name: "MenubarMenu" },
    },

    /*
     * A plain command button — v1 scope, decided before building: no `href` variant (a real link
     * inside a menubar dropdown), matching `Menu`'s own items rather than `Breadcrumb`'s link/span
     * split. Nothing in this contract stops a later pass from adding one the same way; it just is
     * not today's gap.
     */
    MenubarMenuItem: {
      intent: ["menubar-dropdown-command"],
      host: { element: "button" },
      options: [],
      parents: ["MenubarMenu"],
      slots: { children: { accepts: "text", required: true } },
      template: {
        element: "button",
        part: "menuItem",
        also: ["sk-interactive"],
        host: true,
        attrs: { type: "button", role: "menuitem", tabindex: "-1" },
        mount: "data-sk-menubar-menu-item",
        slot: "children",
      },
      react: { from: "@skryensya/react/menubar", name: "MenubarMenuItem" },
    },
  },
} as const satisfies ComponentContract;

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour — the pure matcher here, the imperative binding in `@skryensya/vanilla`, the
 * declarative one in `@skryensya/react` (the three-way split `hotkey.ts` documents, reused by every
 * hand-rolled interactive pattern in this catalogue: `treegrid.ts`, `data-grid.ts`, now this one).
 * ------------------------------------------------------------------------------------------------ */

/** `subIndex: null` means focus is on the TOP-LEVEL item itself — the state before Down/Enter opens
 *  its dropdown, or the state after Escape/an adjacent move closes one. */
export interface MenubarFocus {
  readonly topIndex: number;
  readonly subIndex: number | null;
}

export type MenubarAction =
  /** Move focus without changing which dropdown (if any) is open. */
  | { readonly kind: "move"; readonly focus: MenubarFocus }
  /** Open `topIndex`'s dropdown; focus its first item, or its last (Up Arrow's own shortcut). */
  | { readonly kind: "open"; readonly topIndex: number; readonly focusLast: boolean }
  /** Close whichever dropdown is open; focus returns to its own trigger. */
  | { readonly kind: "close" }
  /**
   * Left/Right between top-level items. `keepOpen` is the detail a naive port of `Toolbar`'s own
   * roving tabindex misses: if a dropdown was open when the user pressed the arrow, the NEW item's
   * dropdown opens too (focus on its first item) — moving through open dropdowns, not just
   * highlighting closed triggers one at a time.
   */
  | { readonly kind: "moveTop"; readonly topIndex: number; readonly keepOpen: boolean }
  | { readonly kind: "none" };

export function resolveMenubarKey(params: {
  readonly key: string;
  readonly focus: MenubarFocus;
  readonly topCount: number;
  readonly hasMenuAt: (topIndex: number) => boolean;
  readonly subCountOf: (topIndex: number) => number;
}): MenubarAction {
  const { key, focus, topCount, hasMenuAt, subCountOf } = params;
  if (topCount < 1) return { kind: "none" };
  const lastTop = topCount - 1;
  const isOpen = focus.subIndex !== null;
  const hasMenu = hasMenuAt(focus.topIndex);
  const subCount = subCountOf(focus.topIndex);

  switch (key) {
    case "ArrowRight": {
      const topIndex = focus.topIndex < lastTop ? focus.topIndex + 1 : 0;
      return { kind: "moveTop", topIndex, keepOpen: isOpen };
    }
    case "ArrowLeft": {
      const topIndex = focus.topIndex > 0 ? focus.topIndex - 1 : lastTop;
      return { kind: "moveTop", topIndex, keepOpen: isOpen };
    }
    case "ArrowDown": {
      if (!hasMenu) return { kind: "none" };
      if (!isOpen) return { kind: "open", topIndex: focus.topIndex, focusLast: false };
      if (subCount < 1) return { kind: "none" };
      const subIndex = focus.subIndex === null ? 0 : (focus.subIndex + 1) % subCount;
      return { kind: "move", focus: { topIndex: focus.topIndex, subIndex } };
    }
    case "ArrowUp": {
      if (!hasMenu) return { kind: "none" };
      if (!isOpen) return { kind: "open", topIndex: focus.topIndex, focusLast: true };
      if (subCount < 1) return { kind: "none" };
      const subIndex = focus.subIndex === null ? subCount - 1 : (focus.subIndex - 1 + subCount) % subCount;
      return { kind: "move", focus: { topIndex: focus.topIndex, subIndex } };
    }
    case "Enter":
    case " ": {
      // A leaf item (no menu) activates via its own native click/Enter — nothing for this resolver
      // to add. A dropdown trigger not yet open, opens (focus first item); already open, the item
      // UNDER focus activates natively too (same reasoning).
      if (hasMenu && !isOpen) return { kind: "open", topIndex: focus.topIndex, focusLast: false };
      return { kind: "none" };
    }
    case "Escape": {
      if (!isOpen) return { kind: "none" };
      return { kind: "close" };
    }
    case "Home": {
      if (isOpen) {
        if (subCount < 1) return { kind: "none" };
        return { kind: "move", focus: { topIndex: focus.topIndex, subIndex: 0 } };
      }
      return { kind: "moveTop", topIndex: 0, keepOpen: false };
    }
    case "End": {
      if (isOpen) {
        if (subCount < 1) return { kind: "none" };
        return { kind: "move", focus: { topIndex: focus.topIndex, subIndex: subCount - 1 } };
      }
      return { kind: "moveTop", topIndex: lastTop, keepOpen: false };
    }
    default:
      return { kind: "none" };
  }
}
