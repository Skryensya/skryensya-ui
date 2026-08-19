import { anchoredParts } from "@skryensya/core/anchored";
import { breadcrumbParts, collapsibleBreadcrumbRange } from "@skryensya/core/breadcrumb";
import { menuAttrs, menuParts } from "@skryensya/core/menu";
import { createConnectMount } from "../runtime/svelte-hydrate.js";
import { mountMenu } from "./menu.js";

const rootSelector = "[data-sk-breadcrumb]";
const itemSelector = `:scope > .${breadcrumbParts.item}`;

type Cleanup = () => void;

export const mountBreadcrumb = createConnectMount({ key: "breadcrumb", rootSelector, connect: connectBreadcrumb });

/*
 * BREADCRUMB, the collapse. The compiled markup is already complete on its own (no machine, every
 * item a plain link) — this enhancer only decides, per resize, whether the trail fits on one line
 * and, when it does not, hides the ancestor `<li>`s `collapsibleBreadcrumbRange` marks as
 * collapsible and reveals a "…" trigger that opens the SAME items as a real `Menu` (`core/menu.ts`)
 * — the ARIA menu pattern's own keyboard model (arrow keys, Home/End, typeahead), not a plain list
 * of links. The menu markup is built once, from each collapsible item's own label/href, and mounted
 * with `mountMenu` (this package's own Menu enhancer) rather than reinvented: the machine, the
 * positioning, the safe-area, all of it is Menu's, same as `MenubarItem`'s own dropdown composes it.
 *
 * The ellipsis `<li>` is a PERMANENT anchor at position 1, inserted once and only ever hidden (never
 * removed) while collapsing is off. The ORIGINAL crumb `<li>`s never move — collapsing only hides
 * them (`hidden`, same as the ellipsis's own default-hidden state) — so the menu's own item nodes
 * are the only markup the machine ever attaches to, and re-measuring never has to reconcile two
 * lists' worth of moved DOM.
 */
export function connectBreadcrumb(root: HTMLElement): Cleanup {
  const list = root.querySelector<HTMLOListElement>(`.${breadcrumbParts.list}`);
  if (!list) return () => {};

  const items = Array.from(list.querySelectorAll<HTMLLIElement>(itemSelector));
  const range = collapsibleBreadcrumbRange(items.length);
  if (!range) return () => {};

  const collapsible = items.slice(range.start, range.end + 1);
  const anchorItem = items[0]!;
  const separatorTemplate = anchorItem.querySelector(`.${breadcrumbParts.separator}`);

  /*
   * A full-flat CLONE, taken before any of the mutation below, laid out off-screen purely to
   * measure the trail's true, unconstrained width. `.sk-breadcrumb__item` carries `min-inline-size:
   * 0` (needed so an ancestor LINK's own `text-overflow: ellipsis` can engage at all) — a flex item
   * with that set is free to shrink below its content size instead of ever truly overflowing, so
   * once nowrap is on, the live list silently absorbs a too-narrow container by shrinking every
   * crumb rather than its `scrollWidth` ever exceeding `clientWidth`. `position: absolute;
   * inline-size: max-content` gives the clone no imposed width to shrink against, so its children
   * size to their natural content instead — the same shadow-measurement move the React binding
   * makes for the identical reason.
   */
  const shadow = list.cloneNode(true) as HTMLOListElement;
  shadow.setAttribute("aria-hidden", "true");
  shadow.style.position = "absolute";
  shadow.style.visibility = "hidden";
  shadow.style.insetInlineStart = "0";
  shadow.style.insetBlockStart = "0";
  shadow.style.inlineSize = "max-content";
  shadow.style.pointerEvents = "none";
  root.append(shadow);

  const collapsedLabel = root.getAttribute("data-collapsed-label") ?? "Mostrar niveles ocultos";

  // Also `data-sk-menu`/`sk-menu`: this `<li>` doubles as the Menu's own root, the same move
  // `MenubarItem`'s wrapper makes (`menubar.ts`) — one element, not an extra wrapper, carrying both
  // this component's own part class and the `--sk-menu-*` custom properties every menu part below
  // reads.
  const ellipsisItem = document.createElement("li");
  ellipsisItem.className = `${breadcrumbParts.item} sk-breadcrumb__item--collapse ${menuParts.root}`;
  ellipsisItem.setAttribute(menuAttrs.root, "");
  ellipsisItem.hidden = true;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = `${breadcrumbParts.collapseTrigger} ${anchoredParts.anchor}`;
  trigger.setAttribute("aria-label", collapsedLabel);
  trigger.setAttribute(menuAttrs.trigger, "");
  trigger.textContent = "…";

  const positioner = document.createElement("div");
  positioner.className = `${menuParts.positioner} ${anchoredParts.positioner}`;
  positioner.setAttribute(menuAttrs.positioner, "");

  const content = document.createElement("div");
  content.className = menuParts.content;
  content.setAttribute(menuAttrs.content, "");
  positioner.append(content);

  for (const item of collapsible) {
    const link = item.querySelector<HTMLAnchorElement>(`.${breadcrumbParts.link}`);
    const current = item.querySelector<HTMLElement>(`.${breadcrumbParts.current}`);
    const label = (link ?? current)?.textContent?.trim() ?? "";
    const href = link?.getAttribute("href") ?? undefined;

    // A destination is a real `<a href>`; the rare case of a collapsible item marked `current`
    // without an href (no link to give) falls back to a plain, unclickable entry — the same
    // either/or `menuPopupTemplate` itself uses for a command vs. a destination.
    const menuItem = document.createElement(href ? "a" : "div");
    menuItem.className = `${menuParts.item} sk-interactive`;
    menuItem.setAttribute(menuAttrs.item, "");
    menuItem.setAttribute("data-value", href ?? label);
    if (href) menuItem.setAttribute("href", href);

    const itemLabel = document.createElement("span");
    itemLabel.className = menuParts.itemLabel;
    itemLabel.textContent = label;
    menuItem.append(itemLabel);

    content.append(menuItem);
  }

  ellipsisItem.append(trigger, positioner);
  if (separatorTemplate) ellipsisItem.append(separatorTemplate.cloneNode(true) as HTMLElement);
  anchorItem.after(ellipsisItem);

  // Synchronous, like every Svelte mount in this runtime (`flushSync` inside `createSvelteMount`):
  // the menu is fully wired — role, positioning, keyboard handling — before this function returns.
  mountMenu(ellipsisItem);

  const expand = () => {
    for (const item of collapsible) item.hidden = false;
    ellipsisItem.hidden = true;
  };

  const collapse = () => {
    for (const item of collapsible) item.hidden = true;
    ellipsisItem.hidden = false;
  };

  // Idempotent either way, so a measurement never needs to undo the other branch first — unlike
  // the live list, the shadow's width never depends on which branch ran last.
  const measure = () => {
    if (shadow.scrollWidth > root.clientWidth) collapse();
    else expand();
  };

  root.setAttribute("data-sk-breadcrumb-ready", "");
  measure();

  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
  observer?.observe(root);

  return () => {
    observer?.disconnect();
    expand();
    ellipsisItem.remove();
    shadow.remove();
    root.removeAttribute("data-sk-breadcrumb-ready");
  };
}
