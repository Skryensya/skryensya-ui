import type { ComponentContract } from "./contract.js";

export type SidebarCollapsedChangeDetails = {
  collapsed: boolean;
};

export type SidebarOptions = {
  id?: string;
  /** Controlled: the caller owns the state and re-renders on change. */
  collapsed?: boolean;
  /** Uncontrolled: initializes the state once, then interaction owns it. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (details: SidebarCollapsedChangeDetails) => void;
};

export const sidebarEvents = {
  collapsedChange: "sk-collapsed-change",
} as const;

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
} as const;

export type SidebarPart = keyof typeof sidebarParts;
export type SidebarPartClass = (typeof sidebarParts)[SidebarPart];

/**
 * The navigation shell down the side of an application.
 *
 * Collapsing NARROWS it; it never hides it (decision 8). The content stays mounted, reachable and
 * in the accessibility tree at both widths — the labels go visually quiet but keep naming the icons
 * — which is why this is not a disclosure and has no `hidden` anywhere.
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
     * The trigger's accessible name. It is icon-sized, so this is never painted — and an icon on
     * its own names nothing.
     */
    label: { type: "string", attr: "aria-label" },
  },

  signatures: {
    Sidebar: {
      intent: ["sidebar", "side-navigation", "app-shell-rail", "left-nav"],
      host: { element: "aside" },
      options: ["defaultCollapsed"],
      slots: {
        children: {
          accepts: "signature",
          of: ["SidebarHeader", "SidebarContent", "SidebarFooter", "SidebarSeparator", "SidebarTrigger"],
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
       * The header is where a sidebar actually puts it, beside the brand — and the footer is the
       * other real answer. `Sidebar` alone said the only legal place was loose in the shell, which
       * is the one place nobody puts it.
       */
      parents: ["Sidebar", "SidebarHeader", "SidebarFooter"],
      options: ["label"],
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
  },
} as const satisfies ComponentContract;
