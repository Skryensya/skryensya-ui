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
