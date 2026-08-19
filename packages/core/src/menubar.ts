import type { ComponentContract } from "./contract.js";
import { menuAttrs, menuItemShape, menuParts, menuPopupTemplatePortable } from "./menu.js";

/*
 * MENUBAR — WAI-ARIA APG `menubar`: a persistent, horizontal bar of `menuitem`s, some of which open
 * a dropdown. No `@zag-js/*` machine covers the BAR itself (`core/machines.ts` does not list one):
 * a menubar is SEVERAL triggers, arranged as one roving-tabindex row, where Left/Right moves between
 * them and — the detail a naive implementation misses — moving to an adjacent item while a dropdown
 * is open closes the old one and opens the new one too, not just moves a highlight. That part stays
 * hand-rolled, for the same reason `Treegrid`/`DataGrid` are: real behaviour no existing machine
 * provides.
 *
 * EACH ITEM'S DROPDOWN IS A REAL `Menu` (`core/menu.ts`), not a second, poorer description of one.
 * `MenubarItem`'s own `items` slot is `menuItemShape` verbatim — checkbox/radio, separators,
 * arbitrarily nested submenus, all of it, the same feature set `Menu` itself has, because it IS
 * `Menu`'s own item shape and popup template (`menuPopupTemplate`), not a copy kept in sync by hand.
 * `MenubarMenu`/`MenubarMenuItem`, the hand-rolled parallel signatures this used to be built from,
 * are gone.
 *
 * The seam this composition needs: `MenubarItem`'s own trigger button (`role="menuitem"`, driven by
 * Menubar's roving-tabindex resolver below) is ALSO Menu's expected trigger — it carries
 * `data-sk-menu-trigger` alongside `data-sk-menubar-item`, and the item's wrapper carries
 * `data-sk-menu` alongside its own `itemWrapper` part, so Menu's machine finds and attaches to a
 * button Menubar already owns instead of rendering a second one. Zag's own trigger keys
 * (ArrowDown/Up, Enter, Space) are a strict subset of what Menubar already wanted for that button;
 * Menubar's resolver keeps ArrowLeft/Right/Escape/Home/End and drives the open/close handoff via
 * Menu's own `api.setOpen()` — see the vanilla/react bindings for exactly how.
 */
export const menubarParts = {
  root: "sk-menubar",
  itemWrapper: "sk-menubar__item-wrapper",
  item: "sk-menubar__item",
  /** The chevron marking a DROPDOWN item — absent on a leaf command. Same idea as Menu's own
   *  trigger chevron (`menuParts`'s own, unrelated part of the same name); this is the bar's. */
  itemIndicator: "sk-menubar__item-indicator",
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
    /**
     * Styles the item as `nav-list`'s own link (`sk-nav-list__link`/`__label`) instead of a
     * Button — for a menubar used as site navigation, WAI's own `menubar-navigation` example,
     * where the row should read as destinations rather than commands. Nothing about Menubar's
     * OWN behavior changes: same `role`, same roving tabindex, same dropdown open/close: only
     * the trigger's classes and DOM shape swap, the same either/or `NavListGroup`'s own
     * collapsible-vs-static label already uses (`nav-list.ts`).
     */
    nav: { type: "boolean", default: false, attr: "data-nav", trueValue: "" },
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
      // element as a descendant (Menu's own popup, full of its own `menuitem`s, counts), so the
      // popup has to be the button's SIBLING, both inside one common ancestor — the same shape
      // `NavListGroup`'s own trigger-plus-content wrapper already uses. That ancestor is now ALSO
      // Menu's own root (`data-sk-menu`): see the header comment above for why.
      host: { element: "div" },
      options: ["nav"],
      parents: ["Menubar"],
      /* Its dropdown is `Menu`'s own popup, and that portals — same reason `Menu` itself declares
         this: React needs a container ref that keeps the floating content inside whatever subtree
         a scoped host (a preview frame, this repo's own symmetry gate) actually measures. */
      portals: true,
      slots: {
        children: { accepts: "text", required: true },
        /** Menu's own item shape, verbatim — see the header comment above. */
        items: { accepts: "items", item: menuItemShape },
      },
      template: {
        element: "div",
        part: "itemWrapper",
        /* `sk-menu`, so `--sk-menu-bg`/`-fg`/`-border-color`/etc. — declared on that class, read by
           every descendant via inheritance — actually get declared here too, not just the mount
           attribute the enhancer keys on. Without it the dropdown paints with undefined custom
           properties: structurally correct, visually blank. */
        also: [menuParts.root],
        host: true,
        mount: menuAttrs.root,
        children: [
          /*
           * TWO shapes for the same trigger, chosen by `nav` — the same either/or `NavListGroup`'s
           * own collapsible-vs-static label uses (`nav-list.ts`): `whenMissing`/`whenGiven` on a
           * boolean option, not a value-conditional node (the template engine has no composition-
           * level "equals" — only `attrsWhen`/`whenItem*` reach a value, and those are for
           * attributes or repeated item entries, not for choosing between two node shapes here).
           */
          {
            element: "button",
            part: "item",
            /*
             * `sk-button`: a bar item is a real Button, not a bespoke look `menubar.css` paints on
             * its own — the same rule Menu's own top-level trigger already follows (`menu.tsx`'s
             * `anchor.anchor(cx("sk-button", ...))`). `sk-anchor`, same as Menu's own trigger
             * (`menu.ts`): what the popup measures itself against. Costs nothing until a name is
             * written on it.
             */
            also: ["sk-button", "sk-interactive", "sk-anchor"],
            /*
             * `ghost`/`sm`: a bar item sits flush in a row of siblings, not alone the way a page's
             * one primary action does — the same reason Menu's own top-level trigger is the one
             * place in this system a filled default button is right and a menubar item is not.
             * `.sk-button`'s OWN variant/size hooks paint both, so nothing here duplicates them.
             */
            attrs: {
              type: "button",
              role: "menuitem",
              [menuAttrs.trigger]: "",
              "data-variant": "ghost",
              "data-size": "sm",
            },
            mount: "data-sk-menubar-item",
            slot: "children",
            whenMissing: "nav",
            /*
             * `whenGiven: "items"`: a LEAF item (a plain command, no dropdown) gets no chevron —
             * one would promise a popup that never opens. Same glyph, same part name, as Menu's own
             * top-level trigger (`menu.ts`), so the two read as the same affordance everywhere in
             * this system. `menubar.css` rotates it on `[aria-expanded="true"]`, which is the
             * second half of this: the glyph alone says "this opens something", the rotation says
             * "and it is open right now" — a bar item has no visited/pressed look of its own to
             * carry that fact otherwise.
             */
            children: [
              {
                element: "span",
                part: "itemIndicator",
                attrs: { "aria-hidden": "true" },
                whenGiven: "items",
                children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } }],
              },
            ],
          },
          /*
           * The `nav` shape: `sk-nav-list__link`/`__label` instead of Button, literal class
           * strings rather than a cross-contract part reference — same reason `menuPopupTemplate`
           * bakes its own resolved classes (`withResolvedParts`) before another contract embeds it:
           * `nav-list`'s `parts` map is not in scope here, and the two contracts stay independent.
           * Behaviorally identical to the sibling above: same role, same mount hook, same trigger
           * attribute, same chevron.
           */
          {
            element: "button",
            part: "item",
            also: ["sk-nav-list__link", "sk-interactive", "sk-anchor"],
            attrs: {
              type: "button",
              role: "menuitem",
              [menuAttrs.trigger]: "",
            },
            mount: "data-sk-menubar-item",
            whenGiven: "nav",
            children: [
              { element: "span", also: ["sk-nav-list__label"], slot: "children" },
              {
                element: "span",
                part: "itemIndicator",
                attrs: { "aria-hidden": "true" },
                whenGiven: "items",
                children: [{ element: "span", attrs: { "data-sk-icon": "chevron-down", "data-sk-icon-size": "md" } }],
              },
            ],
          },
          { ...menuPopupTemplatePortable, whenGiven: "items" },
        ],
      },
      react: { from: "@skryensya/react/menubar", name: "MenubarItem" },
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
