import type { ComponentContract } from "./contract.js";
import { splitterValuePercent } from "./splitter.js";
import { definePreference, numberValue, type Preference } from "./storage.js";

export type SidebarCollapsedChangeDetails = {
  collapsed: boolean;
};

export type SidebarResizeChangeDetails = {
  /** The width the sidebar settled at, in CSS pixels, already clamped to the min/max hooks. */
  inlineSize: number;
};

export type SidebarOptions = {
  id?: string;
  /** Controlled: the caller owns the state and re-renders on change. */
  collapsed?: boolean;
  /** Uncontrolled: initializes the state once, then interaction owns it. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (details: SidebarCollapsedChangeDetails) => void;
  /**
   * Where a dragged width is remembered. Omit it and the resize lasts the session: the width is
   * state either way, this only says whether it outlives the tab.
   */
  storageKey?: string;
  onResizeChange?: (details: SidebarResizeChangeDetails) => void;
  /**
   * How far a drag may travel, as CSS lengths. They are the `clamp()` arguments, so anything CSS
   * accepts works: `"18rem"`, `"30%"`, `"min(24rem, 40vw)"`.
   *
   * The bounds are per-INSTANCE where the expanded width is not, and the split is not arbitrary:
   * the expanded width is the size the sidebar was designed at, which is a system decision and
   * belongs in a stylesheet; the travel is about this reader's screen and this rail's content, and
   * two sidebars in one app can honestly want different answers. Both still resolve to the same
   * hooks, so a consumer with fifty of them sets `--sk-sidebar-max-inline-size` once in CSS instead
   * of passing the same prop fifty times.
   */
  minInlineSize?: string;
  maxInlineSize?: string;
  /**
   * Names the `<aside>` landmark. Optional — required only once a page has a second
   * `complementary` region to disambiguate from.
   */
  landmarkLabel?: string;
};

export const sidebarEvents = {
  collapsedChange: "sk-collapsed-change",
  resizeChange: "sk-resize-change",
} as const;

/*
 * ── RESIZING, the part both bindings share ────────────────────────────────────────────────────
 *
 * The width lives in CSS, not in JavaScript. A drag writes ONE custom property, and the stylesheet
 * clamps it between `--sk-sidebar-min-inline-size` and `--sk-sidebar-max-inline-size`. That split is
 * the whole design, and it buys three things a JS-owned width does not:
 *
 *   - The bounds stay overridable by the consumer, in the same place every other dimension of this
 *     component is overridable, instead of being constants compiled into two bindings.
 *   - A brand or a density that moves those hooks moves the resize with them, with nothing to
 *     re-run.
 *   - The two bindings cannot drift, because neither one owns the arithmetic.
 *
 * What JavaScript still owns is the pointer, the keyboard and the storage, which is exactly the part
 * CSS has no answer for.
 */

/** The custom property a drag writes. The stylesheet clamps it; nothing here does. */
export const SIDEBAR_WIDTH_PROPERTY = "--sk-sidebar-resize-inline-size";

/**
 * A stored sidebar width, one slot per key, so two sidebars on one origin do not fight over one
 * number. Bounded at parse time: see {@link numberValue}. The ceiling is deliberately far above any
 * sane `--sk-sidebar-max-inline-size`, since the real clamp is the stylesheet's and this only has to
 * reject values that are not a width at all.
 */
export function sidebarWidthPreference(storageKey: string): Preference<number | null> {
  return definePreference<number | null>({
    slot: `sidebar-width:${storageKey}`,
    fallback: null,
    parse: (raw) => numberValue(0, 10000)(raw),
  });
}

/**
 * Where a width sits between the two bounds, 0 to 100 — Sidebar's own name for
 * `splitterValuePercent` (`core/splitter.ts`, the shared "Window Splitter" primitive Treegrid's
 * column resizer now uses too), kept as its own export since it is Sidebar's public, documented,
 * tested API and a rename would be a breaking one for no behavioural reason.
 */
export const sidebarWidthPercent = splitterValuePercent;

/*
 * The shell only. There is no `link`, `item` or `list` part here on purpose: the list of
 * destinations is the `nav-list` pattern, which the sidebar hosts rather than owns (decision 17).
 * A part named `sk-sidebar__link` would be naming a tenant (decision 2), and it would be a lie the
 * first time a navbar or a drawer needed the same list.
 *
 * No `icon` part either, the icon is a pattern and brings its own box (decision 15).
 */
export const sidebarParts = {
  root: "sk-sidebar",
  header: "sk-sidebar__header",
  /** The scrolling middle. Header and footer stay pinned; only this moves. */
  content: "sk-sidebar__content",
  footer: "sk-sidebar__footer",
  separator: "sk-sidebar__separator",
  trigger: "sk-sidebar__trigger",
  /** The drag edge. Authoring it is what makes a sidebar resizable; there is no second switch. */
  resizeHandle: "sk-sidebar__resize-handle",
} as const;

export type SidebarPart = keyof typeof sidebarParts;
export type SidebarPartClass = (typeof sidebarParts)[SidebarPart];

/**
 * The navigation shell down the side of an application.
 *
 * Collapsing NARROWS it; it never hides it (decision 8). The content stays mounted, reachable and
 * in the accessibility tree at both widths: the labels go visually quiet but keep naming the icons,
 * which is why this is not a disclosure and has no `hidden` anywhere.
 *
 * What goes inside is the caller's, usually a NavList, which the sidebar HOSTS rather than owns
 * (decision 17). There is no link or item part here for the same reason.
 *
 * The trigger points at the content with `aria-controls`, and neither binding's markup carries that
 * pair: the id is generated at runtime, so both bindings write it themselves. What the contract
 * fixes is that the two elements exist and can be found.
 */
export const sidebarContract = {
  id: "sidebar",
  css: "@skryensya/core/components/sidebar.css",
  parts: sidebarParts,

  options: {
    /** Starts narrowed. Read once as the initial state; after that the interaction owns it. */
    defaultCollapsed: {
      type: "boolean",
      default: false,
      attr: "data-default-collapsed",
      trueValue: "",
      machineInput: true,
    },
    /**
     * The trigger's accessible name. It is icon-sized, so this is never painted, and an icon on
     * its own names nothing.
     */
    label: { type: "string", attr: "aria-label" },

    /**
     * Names the `<aside>` itself — a different target than `label` above (the trigger's own name).
     * Optional: a page with exactly one `complementary` landmark needs no name to be unambiguous,
     * but WAI's own landmark practice requires one the moment a consumer renders a second `<aside>`
     * (or a second `Sidebar`) on the same page, and the contract had no way to supply it at all.
     */
    landmarkLabel: { type: "string", attr: "aria-label", prop: "landmarkLabel" },

    /**
     * The slot a dragged width is remembered under. Absent, the resize still works and simply does
     * not outlive the tab: persistence is opt-in because a width is a preference, and a product
     * that renders two different sidebars needs to say which one it is remembering.
     */
    storageKey: { type: "string", attr: "data-storage-key" },

    /**
     * The ends of the resize, written straight onto the hooks the `clamp()` reads. A style property
     * and not a `data-` attribute because a length is not a state: CSS is what has to consume it,
     * and routing it through an attribute would mean a stylesheet rule per value a consumer might
     * pick. It also means the bound is in the markup the emitter produces, so it holds before any
     * JavaScript runs.
     */
    minInlineSize: { type: "string", styleProperty: "--sk-sidebar-min-inline-size" },
    maxInlineSize: { type: "string", styleProperty: "--sk-sidebar-max-inline-size" },

    /**
     * Lifts the trigger out of flow and pins it just past the panel's own edge, near the top,
     * rather than sitting inline where it was authored (a header row, say). For a shell whose
     * header is the application's own (a navbar above, a workspace switcher), an inline trigger
     * row is chrome the shell did not ask for; a corner control reads as the rail's own affordance
     * instead. Purely presentational — the DOM position (and which legal parent hosts it) is
     * unchanged, so `aria-controls` and the click handler need nothing new to find it.
     */
    floating: { type: "boolean", default: false, attr: "data-floating", trueValue: "" },
  },

  signatures: {
    Sidebar: {
      intent: ["sidebar", "side-navigation", "app-shell-rail", "left-nav"],
      host: { element: "aside" },
      options: ["defaultCollapsed", "storageKey", "minInlineSize", "maxInlineSize", "landmarkLabel"],
      slots: {
        children: {
          accepts: "signature",
          of: [
            "SidebarHeader",
            "SidebarContent",
            "SidebarFooter",
            "SidebarSeparator",
            "SidebarTrigger",
            "SidebarResizeHandle",
          ],
          required: true,
        },
      },
      mount: "data-sk-sidebar",
      template: { element: "aside", part: "root", host: true, slot: "children" },
      react: { from: "@skryensya/react/sidebar", name: "Sidebar" },
    },

    SidebarHeader: {
      intent: ["sidebar-header", "brand-area", "pinned-top"],
      host: { element: "div" },
      parents: ["Sidebar"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "header", host: true, slot: "children" },
      react: { from: "@skryensya/react/sidebar", name: "SidebarHeader" },
    },

    SidebarContent: {
      intent: ["sidebar-body", "where-the-nav-list-goes", "scrolling-middle"],
      host: { element: "div" },
      parents: ["Sidebar"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      // The trigger points at this by id, so the enhancer has to be able to find it.
      mount: "data-sk-sidebar-content",
      template: { element: "div", part: "content", host: true, slot: "children" },
      react: { from: "@skryensya/react/sidebar", name: "SidebarContent" },
    },

    SidebarFooter: {
      intent: ["sidebar-footer", "account-area", "pinned-bottom"],
      host: { element: "div" },
      parents: ["Sidebar"],
      options: [],
      slots: { children: { accepts: "node", required: true } },
      template: { element: "div", part: "footer", host: true, slot: "children" },
      react: { from: "@skryensya/react/sidebar", name: "SidebarFooter" },
    },

    SidebarSeparator: {
      intent: ["sidebar-divider", "group-break"],
      host: { element: "hr" },
      parents: ["Sidebar"],
      options: [],
      slots: {},
      /*
       * A real `<hr>`, not a styled div. It is the element that MEANS a break between groups, so a
       * screen reader announces the grouping instead of only sighted users seeing it.
       */
      template: { element: "hr", part: "separator", host: true },
      react: { from: "@skryensya/react/sidebar", name: "SidebarSeparator" },
    },

    SidebarTrigger: {
      intent: ["collapse-sidebar", "rail-toggle", "hamburger"],
      host: { element: "button" },
      /*
       * The header is where a sidebar actually puts it, beside the brand, and the footer is the
       * other real answer. `Sidebar` alone said the only legal place was loose in the shell, which
       * is the one place nobody puts it — DOM position, that is. `floating` (below) still renders
       * it wherever it was authored, just visually lifted to the panel's own corner; it is a paint
       * decision, not a second legal parent.
       *
       * ONE LEVEL, EVERY ITEM ICONED — that is the whole of what collapsing can show. The rail
       * narrows to `--sk-sidebar-collapsed-inline-size`, one icon's width, so a nested group has no
       * row left to draw its own trigger on, and a destination with no icon collapses to nothing at
       * all. A list with either reaches for `SidebarResizeHandle` instead: smaller, never iconified,
       * exactly the semantic overlay's `useWhen`/`avoidWhen` for the two (contracts/semantic/
       * sidebar.yaml).
       */
      parents: ["Sidebar", "SidebarHeader", "SidebarFooter"],
      options: ["label", "floating"],
      requires: ["label"],
      slots: { icon: { accepts: "signature", of: ["Icon"] } },
      mount: "data-sk-sidebar-trigger",
      template: {
        element: "button",
        part: "trigger",
        host: true,
        also: ["sk-interactive"],
        attrs: { type: "button" },
        slot: "icon",
      },
      react: { from: "@skryensya/react/sidebar", name: "SidebarTrigger" },
    },

    /**
     * The drag edge, and the switch: a sidebar is resizable when one of these is authored inside it,
     * with no `resizable` option beside it. Two ways to say the same thing is two ways to disagree,
     * and the stylesheet needs the answer anyway, which it reads as `:has()` on this part.
     *
     * It is a WINDOW SPLITTER, so the whole ARIA pattern applies and none of it is optional: a
     * focusable `separator` reports where it sits with `aria-valuenow`, which is why arrow keys move
     * it and why the value is a PERCENTAGE of the travel rather than a pixel count (see
     * `sidebarWidthPercent`). The static `50` here is the pre-JavaScript state; both bindings
     * overwrite it with the real position as they mount.
     */
    SidebarResizeHandle: {
      intent: ["resize-sidebar", "drag-the-rail-wider", "splitter", "drag-handle"],
      host: { element: "div" },
      parents: ["Sidebar"],
      options: ["label"],
      requires: ["label"],
      slots: {},
      mount: "data-sk-sidebar-resize",
      template: {
        element: "div",
        part: "resizeHandle",
        // The shared "Window Splitter" visual language (`patterns/splitter.css`) — the hairline,
        // hover/focus/active colour, hit region, cursor. `core/splitter.ts` is the matching shared
        // behaviour both bindings drive this element with (see `connectSidebar`/`SidebarResizeHandle`).
        also: ["sk-splitter"],
        host: true,
        attrs: {
          role: "separator",
          "aria-orientation": "vertical",
          "aria-valuemin": "0",
          "aria-valuemax": "100",
          "aria-valuenow": "50",
          tabindex: "0",
        },
      },
      react: { from: "@skryensya/react/sidebar", name: "SidebarResizeHandle" },
    },
  },
} as const satisfies ComponentContract;
