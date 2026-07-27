import { sidebarEvents, type SidebarCollapsedChangeDetails, type SidebarOptions } from "@skryensya/core/sidebar";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-sidebar]";
const triggerSelector = "[data-sk-sidebar-trigger]";
const contentSelector = "[data-sk-sidebar-content]";

type Cleanup = () => void;

/*
 * Collapsing narrows the sidebar; it never hides it. That is why this is not a `<details>`
 * disclosure (decision 8): the content stays visible, reachable and in the a11y tree at both
 * widths, so the labels keep naming the icons for a screen reader while sighted users see a rail.
 *
 * The trigger's accessible name is the consumer's, an enhancer patches attributes, never content.
 * The trigger is icon-sized, so that name has to come from an `aria-label` or visually hidden text;
 * a visible label inside it would be a label inside a square the width of an icon.
 */
export function connectSidebar(root: HTMLElement, options: SidebarOptions = {}): Cleanup {
  const trigger = root.querySelector<HTMLButtonElement>(triggerSelector);
  const content = root.querySelector<HTMLElement>(contentSelector);
  if (!trigger) throw new Error("Sidebar requires a [data-sk-sidebar-trigger] element.");

  const id = options.id ?? (root.id || `sk-sidebar-${Math.random().toString(36).slice(2)}`);
  const isControlled = options.collapsed !== undefined;
  let collapsed = options.collapsed ?? options.defaultCollapsed ?? false;

  if (content && !content.id) content.id = `${id}-content`;

  const render = () => {
    applyAttrs(root, { "data-state": collapsed ? "collapsed" : "expanded" });
    applyAttrs(trigger, {
      type: trigger.tagName === "BUTTON" ? "button" : null,
      "aria-expanded": String(!collapsed),
      "aria-controls": content?.id ?? null,
    });
  };

  const setCollapsed = (next: boolean) => {
    collapsed = isControlled ? Boolean(options.collapsed) : next;
    render();

    const details: SidebarCollapsedChangeDetails = { collapsed };
    options.onCollapsedChange?.(details);
    root.dispatchEvent(
      new CustomEvent<SidebarCollapsedChangeDetails>(sidebarEvents.collapsedChange, { bubbles: true, detail: details }),
    );
  };

  const cleanup = bindEvents(trigger, { click: () => setCollapsed(!collapsed) });
  render();

  return cleanup;
}

export const mountSidebar = createConnectMount({
  key: "sidebar",
  rootSelector,
  connect: (root) => connectSidebar(root, { defaultCollapsed: root.hasAttribute("data-default-collapsed") }),
});
