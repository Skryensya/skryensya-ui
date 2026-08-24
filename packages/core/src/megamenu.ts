import type { ComponentContract } from "./contract.js";

/*
 * MEGAMENU, the contract: a row of category triggers, each opening an edge-to-edge panel of 2-4
 * `NavListGroup` columns (`nav-list.ts`). NOT a variant of `Menu`, `Menubar` or `Popover`, a peer to
 * `Navbar`/`NavList` instead (grilled with the user before writing this: see the session that
 * produced it). WAI-ARIA "Disclosure (Navigation)" throughout, the same reasoning `NavListGroup`'s
 * own `collapsible` option already documents: `role="menu"` means an application menu whose children
 * are reachable only by arrow keys and typeahead, and this is a list of ordinary links a reader
 * expects to Tab through, Cmd/Ctrl-click and middle-click like any other. So: plain `<button
 * aria-expanded>` triggers, plain `<a>` links inside (via `NavListGroup`/`NavListLink`), normal DOM
 * Tab order, no arrow-key roving tabindex, no `@zag-js/*` machine. There is no menu machine to
 * misuse and no bespoke one earns its keep here.
 *
 * ONE SHARED PANEL, structurally: every trigger's panel anchors to the `Megamenu` ROOT (via
 * `anchored.ts`'s already-generic `bindAnchor(anchor, positioner, name)`, pointed at the root instead
 * of the individual trigger: no change to that file, it never assumed the anchor was a trigger) and
 * matches its width (`anchor-size(width)`, `megamenu.css`), so every panel occupies the exact same
 * edge-to-edge box regardless of which trigger opened it. The template below still emits one
 * positioner PER trigger (the compiler's template model has no primitive for one DOM node whose
 * content swaps across sibling data entries. That is a new capability, not a reuse of an existing
 * one, and out of scope here). The bindings are what make N identically-anchored panels read as one
 * persistent surface: only one open at a time, and switching triggers swaps which one is visible
 * without an intervening close animation (see `resolveMegamenuEvent` below, and the vanilla/react
 * bindings that drive it).
 *
 * Activation is click/Enter/Space (native `<button>` semantics: nothing here re-implements them);
 * hover-intent is a mouse-only enhancement layered on top by the bindings, never a second code path.
 * No focus trap: Tab flows through a panel's links in normal DOM order and on into whatever follows
 * on the page. Mobile does not get a second markup shape. The same `NavListGroup` columns collapse
 * into `NavListGroup`'s own existing `collapsible` accordion mechanic below a breakpoint, in CSS only
 * (`megamenu.css`), the same "content decides, JS only toggles" split `NavListGroup` already uses.
 */
export const megamenuParts = {
  root: "sk-megamenu",
  list: "sk-megamenu__list",
  item: "sk-megamenu__item",
  trigger: "sk-megamenu__trigger",
  positioner: "sk-megamenu__positioner",
  content: "sk-megamenu__content",
  /** Holds every trigger's columns at once, `visibility: hidden`: never painted, never focusable,
   *  never in the accessibility tree, so the shared panel's height track always sizes to the
   *  tallest trigger has ever needed, constant regardless of which one is actually shown. A binding
   *  construct, not something the declarative template emits (see `megamenu.ts`'s own header
   *  comment on why the template still describes N per-trigger positioner/content pairs). */
  ruler: "sk-megamenu__ruler",
  /** One trigger's columns, grid-templated. Reused for both the ruler's copies and the one visible
   *  instance (`panelVisible`), which is what makes the ruler's sizing match exactly. */
  panel: "sk-megamenu__panel",
  /** The modifier marking which `panel` is the real, currently-shown one. As opposed to one of the
   *  ruler's invisible copies. */
  panelVisible: "sk-megamenu__panel--visible",
  /** A binding construct, not the declarative template: a temporary clone of the OUTGOING image,
   *  absolutely positioned over the real one, that a link-to-image preview swap fades away instead
   *  of fading the real image through its own transparency (which would expose the frame's
   *  background instead of crossfading photo to photo; see `megamenu.css`'s own doc). Removed
   *  once its own transition ends. */
  previewOutgoing: "sk-megamenu__preview-outgoing",
} as const;

export type MegamenuPart = keyof typeof megamenuParts;
export type MegamenuPartClass = (typeof megamenuParts)[MegamenuPart];

export const megamenuAttrs = {
  root: "data-sk-megamenu",
  trigger: "data-sk-megamenu-trigger",
  positioner: "data-sk-megamenu-positioner",
  content: "data-sk-megamenu-content",
  /**
   * Consumer-authored on a `NavListLink` inside a trigger's `columns`, via that signature's own
   * `attrs` (nav-list.ts's own escape hatch, unmodified. This needs no contract change there):
   * hovering or focusing that link swaps this trigger's `ImageFrame` column to this image,
   * reverting to its authored default the moment neither a link nor the image itself has hover or
   * focus. Absent this on a link, hovering it does nothing to the image.
   */
  preview: "data-sk-megamenu-preview",
  /** Paired with `preview`: the swapped image's `alt`. Empty (decorative) when absent, the same
   *  default `ImageFrame` itself already has. */
  previewAlt: "data-sk-megamenu-preview-alt",
} as const;

export type MegamenuOpenChangeDetails = { readonly open: boolean; readonly index: number | null };

export const megamenuContract = {
  id: "megamenu",
  css: "@skryensya/core/components/megamenu.css",
  parts: megamenuParts,

  options: {
    /** The bar's accessible name. Required, the same reason `Menubar`'s own `label` is: a `<nav>`
     *  landmark carries no implicit one, and a page with a second nav needs each named. */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Megamenu: {
      intent: ["edge-to-edge-navigation-panel", "marketing-site-navigation", "multi-column-dropdown-navigation"],
      host: { element: "nav" },
      mount: megamenuAttrs.root,
      options: ["label"],
      requires: ["label"],
      /*
       * Floating content leaves the subtree in React, but as ONE portal owned by the ROOT, not one
       * per trigger the way `Menu`/`Menubar` do it: `megamenu.tsx`'s own header comment is explicit
       *: "ONE PHYSICAL PANEL... never one inside each trigger", because every trigger's columns
       * share a single positioner sized to the tallest one, so switching triggers reads as the same
       * box gaining new content, not one box closing while another opens. `Megamenu`'s own React
       * component is what calls `createPortal` and is what accepts `container`; a consumer needs one
       * to scope it, same reason `Menu`/`Menubar` declare this on whichever signature actually owns
       * the call. `MegamenuTrigger` carries no portal of its own. It hands its `columns` content to
       * the parent, which is where it is rendered, so marking THAT signature `portals: true` (as an
       * earlier revision did, copying the flag from `Menu` without checking which component actually
       * owns the call here) left every consumer's injected `container` landing on a component that
       * never reads one, and `Megamenu` itself always falling back to `document.body`. Invisible to
       * anything scoped to where the tree was composed. First caught by `megamenu/product`, the first
       * canonical tree to render this contract at all.
       */
      portals: true,
      slots: {
        children: { accepts: "signature", required: true, of: ["MegamenuTrigger"] },
      },
      template: {
        element: "nav",
        part: "root",
        /* `sk-anchor`, on the ROOT: not a trigger, unlike every other anchored pattern in this
         * catalogue. Every trigger's panel measures itself against the BAR (edge-to-edge, see the
         * header comment), so the bar itself is what carries `anchor-name`; a trigger carries none. */
        also: ["sk-anchor"],
        host: true,
        children: [{ element: "ul", part: "list", attrs: { role: "list" }, slot: "children" }],
      },
      react: { from: "@skryensya/react/megamenu", name: "Megamenu" },
    },

    /*
     * A `<button>`, not `<a>`: this is a CATEGORY, not a destination. The same either/or
     * `NavListGroup`'s own collapsible label already draws between a group's own label (never a
     * link) and its children (always links). The button and its panel are SIBLINGS inside one `<li>`
     * (the host), never button-contains-panel: a `<button>` cannot contain another interactive
     * element as a descendant, and the panel is full of links. The identical shape `MenubarItem`
     * already uses for its own trigger-plus-popup pair (`menubar.ts`), for the identical reason.
     */
    MegamenuTrigger: {
      intent: ["megamenu-category-trigger", "disclosure-navigation-trigger"],
      host: { element: "li" },
      parents: ["Megamenu"],
      options: [],
      slots: {
        /** The category's own name. Plain text, an accessible name a screen reader announces on
         *  the button itself, nothing more (no icon slot: a category label is not a destination). */
        children: { accepts: "text", required: true },
        /**
         * 2-4 columns (`nav-list.ts`'s `NavListGroup`, or `image-frame.ts`'s `ImageFrame` for a
         * media column), reused verbatim rather than described a second time: a links column IS a
         * group. An optional heading plus a list of `NavListLink`s, and an image column IS an
         * `ImageFrame`, nothing megamenu-specific about either. The 2-4 range is a documented usage
         * guideline, not a compiler-enforced cardinality: this contract's `ContractSlot` has no
         * numeric-range primitive (only per-signature `"one"|"optional"|"many"`), and inventing one
         * was out of scope for this change.
         */
        columns: { accepts: "signature", required: true, of: ["NavListGroup", "ImageFrame"] },
      },
      template: {
        element: "li",
        part: "item",
        host: true,
        children: [
          {
            element: "button",
            part: "trigger",
            also: ["sk-interactive"],
            attrs: { type: "button", "aria-expanded": "false" },
            mount: megamenuAttrs.trigger,
            slot: "children",
          },
          {
            element: "div",
            part: "positioner",
            /* `also: [megamenuParts.root]`, the same reason `MenubarItem`'s own wrapper carries
             * `menuParts.root`: React portals this node to `document.body`, breaking DOM-inheritance
             * from wherever `.sk-megamenu` was declared, unless the node the CSS custom properties
             * are read from also carries the class. Vanilla never portals, so this costs it nothing. */
            also: ["sk-anchored", megamenuParts.root],
            mount: megamenuAttrs.positioner,
            children: [
              {
                element: "div",
                part: "content",
                mount: megamenuAttrs.content,
                slot: "columns",
              },
            ],
          },
        ],
      },
      react: { from: "@skryensya/react/megamenu", name: "MegamenuTrigger" },
    },
  },
} as const satisfies ComponentContract;

/* ------------------------------------------------------------------------------------------------ *
 * Shared behaviour. Pure here, imperative glue in `@skryensya/vanilla`, declarative glue in
 * `@skryensya/react` (the three-way split `hotkey.ts` documents, `menubar.ts`'s own
 * `resolveMenubarKey` reuses, and this reuses in turn).
 *
 * Unlike Menubar there is no arrow-key vocabulary to resolve: activation is native `<button>`
 * semantics (Tab, Enter/Space, real click), never reimplemented here. What IS genuinely stateful and
 * worth a pure, tested reducer is which trigger's panel is open, given four independent signals that
 * all want to say so: a click toggle, hover-intent opening after its own delay, hover-intent closing
 * after ITS delay (cancelled by a re-entry before it fires. The binding's job, not this function's),
 * Escape, and focus leaving the whole bar+panel subtree. Exactly one trigger's panel is ever open.
 * ------------------------------------------------------------------------------------------------ */

export interface MegamenuState {
  readonly openIndex: number | null;
}

export type MegamenuEvent =
  /** Click, or Enter/Space on a trigger: toggles ITS panel, closing whichever else was open. */
  | { readonly kind: "activate"; readonly index: number }
  /** The binding's hover-intent delay elapsed while the pointer was still over this trigger or its
   *  panel. Opens it, closing whichever else was open. The same exclusivity a click gets. */
  | { readonly kind: "hoverIntentOpen"; readonly index: number }
  /** The binding's hover-intent delay elapsed after the pointer left this trigger AND its panel with
   *  no re-entry. A no-op unless THIS index is still the open one. A stale timer from a trigger the
   *  user already moved away from must never close whatever they moved TO. */
  | { readonly kind: "hoverIntentClose"; readonly index: number }
  /** Closes whichever panel is open, unconditionally. The binding returns focus to its trigger. */
  | { readonly kind: "escape" }
  /** Focus left the bar+panel subtree entirely. Closes whichever panel is open. */
  | { readonly kind: "blur" };

export function resolveMegamenuEvent(state: MegamenuState, event: MegamenuEvent): MegamenuState {
  switch (event.kind) {
    case "activate":
      return { openIndex: state.openIndex === event.index ? null : event.index };
    case "hoverIntentOpen":
      return { openIndex: event.index };
    case "hoverIntentClose":
      return state.openIndex === event.index ? { openIndex: null } : state;
    case "escape":
    case "blur":
      return state.openIndex === null ? state : { openIndex: null };
  }
}
