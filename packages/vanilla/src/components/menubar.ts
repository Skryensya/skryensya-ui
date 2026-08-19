import { resolveMenubarKey, type MenubarFocus } from "@skryensya/core/menubar";
import { getMenuApi } from "./Menu.svelte";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

/*
 * MENUBAR, now that each item's dropdown is a real `Menu` instance (decision: see menubar.ts's own
 * header comment in core). This binding owns only what Menu's own machine does NOT: roving tabindex
 * between TOP-LEVEL triggers, and the handoff that closes one item's dropdown and opens the adjacent
 * one. Everything that happens ONCE a dropdown (or a submenu inside it) has focus — Up/Down, Enter,
 * Escape, Home/End within that list, checkbox/radio, nested submenus — is `Menu.svelte`'s own,
 * because `[data-sk-menu-trigger]` on each item's own button already got `api.getTriggerProps()`
 * spread onto it by that component, mounted independently on the SAME `[data-sk-menu]` root the
 * item's wrapper carries.
 *
 * The one seam that needs care: `@zag-js/menu`'s own content keydown handler ALSO claims
 * ArrowLeft/Right/Home/End once a dropdown has focus (for nested-submenu navigation), and it runs in
 * the BUBBLE phase. This binding's own keydown listener runs in CAPTURE phase on the bar root — capture
 * always fires before bubble, on any ancestor, so it gets first refusal — and steps aside (does
 * nothing, lets the event continue to Zag) whenever focus is inside a NESTED submenu
 * (`[data-sk-submenu]`), or whenever a dropdown is open at all and the key isn't Left/Right (Home/End
 * inside an open list is Zag's own job, matching APG menu conventions, not the bar's).
 */

const selector = {
  root: "[data-sk-menubar]",
  trigger: "[data-sk-menubar-item]",
  wrapper: "[data-sk-menu]",
  content: "[data-sk-menu-content]",
  item: "[data-sk-menu-item]",
  submenu: "[data-sk-submenu]",
} as const;

type TopEntry = {
  trigger: HTMLElement;
  /** The item's own `[data-sk-menu]` root — Menu.svelte's mount point, and what `getMenuApi` keys on. */
  wrapper: HTMLElement;
};

function readTops(root: HTMLElement): TopEntry[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector.trigger))
    .filter((trigger) => trigger.closest(selector.root) === root)
    .map((trigger) => ({ trigger, wrapper: trigger.closest<HTMLElement>(selector.wrapper) ?? trigger }));
}

/** The item's OWN top-level popup content — not a nested submenu's, even though both match `[data-sk-menu-content]`. */
function ownContent(wrapper: HTMLElement): HTMLElement | null {
  return (
    Array.from(wrapper.querySelectorAll<HTMLElement>(selector.content)).find(
      (node) => node.closest(selector.wrapper) === wrapper,
    ) ?? null
  );
}

function ownItemCount(wrapper: HTMLElement): number {
  const content = ownContent(wrapper);
  if (!content) return 0;
  return Array.from(content.querySelectorAll<HTMLElement>(selector.item)).filter(
    (node) => node.closest(selector.wrapper) === wrapper,
  ).length;
}

function connect(root: HTMLElement): () => void {
  const tops = readTops(root);
  if (!tops.length) return () => {};

  const hasMenuAt = (topIndex: number) => ownContent(tops[topIndex]!.wrapper) !== null;
  const subCountOf = (topIndex: number) => ownItemCount(tops[topIndex]!.wrapper);

  /** Is a dropdown (this item's own, not a nested submenu) currently open at `topIndex`? */
  const isOpenAt = (topIndex: number) => getMenuApi(tops[topIndex]!.wrapper)?.open ?? false;

  const openIndex = () => tops.findIndex((_, i) => isOpenAt(i));

  const currentFocus = (): MenubarFocus => {
    const active = root.ownerDocument?.activeElement as HTMLElement | null;
    for (let topIndex = 0; topIndex < tops.length; topIndex++) {
      const entry = tops[topIndex]!;
      if (entry.trigger === active) return { topIndex, subIndex: null };
      if (active && ownContent(entry.wrapper) === active) return { topIndex, subIndex: 0 };
    }
    const open = openIndex();
    if (open !== -1) return { topIndex: open, subIndex: 0 };
    for (let topIndex = 0; topIndex < tops.length; topIndex++) {
      if (tops[topIndex]!.trigger.tabIndex === 0) return { topIndex, subIndex: null };
    }
    return { topIndex: 0, subIndex: null };
  };

  const applyTabindex = (focus: MenubarFocus) => {
    for (const entry of tops) entry.trigger.tabIndex = -1;
    const entry = tops[focus.topIndex];
    if (entry) entry.trigger.tabIndex = 0;
  };

  const closeAll = (except?: number) => {
    tops.forEach((entry, index) => {
      if (index === except) return;
      getMenuApi(entry.wrapper)?.setOpen(false);
    });
  };

  const moveFocus = (focus: MenubarFocus) => {
    applyTabindex(focus);
    const entry = tops[focus.topIndex];
    if (!entry) return;
    if (focus.subIndex === null) entry.trigger.focus();
    // Focus onto an open dropdown's own content is Zag's own job as part of opening it —
    // `api.setOpen(true)` drives that, same as it does when the trigger opens itself natively.
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const target = event.target as HTMLElement;
    // Inside a NESTED submenu: none of this is the bar's business, defer entirely to Zag.
    if (target.closest(selector.submenu)) return;

    const focus = currentFocus();
    const dropdownOpen = focus.subIndex !== null;
    // Home/End only belong to the bar when NO dropdown has focus (roving between triggers); once a
    // dropdown's own content has focus, Home/End navigate ITS list, which is Zag's job.
    if ((event.key === "Home" || event.key === "End") && dropdownOpen) return;

    const action = resolveMenubarKey({ key: event.key, focus, topCount: tops.length, hasMenuAt, subCountOf });
    if (action.kind === "none") return;
    event.preventDefault();
    event.stopPropagation();

    if (action.kind === "moveTop") {
      if (action.keepOpen && hasMenuAt(action.topIndex)) {
        closeAll(action.topIndex);
        getMenuApi(tops[action.topIndex]!.wrapper)?.setOpen(true);
        applyTabindex({ topIndex: action.topIndex, subIndex: null });
      } else {
        if (action.keepOpen) closeAll();
        moveFocus({ topIndex: action.topIndex, subIndex: null });
      }
    } else if (action.kind === "move") {
      moveFocus(action.focus);
    }
    // "open"/"close" never reach here: this binding only ever calls `resolveMenubarKey` with
    // ArrowLeft/Right/Home/End, and neither key produces those two action kinds.
  };

  // Safety net beside Zag's own outside-dismiss handling: a click on a SIBLING trigger while
  // another item's dropdown is open must close that sibling too, not just open the clicked one.
  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const clickedIndex = tops.findIndex((entry) => entry.trigger === target || entry.trigger.contains(target));
    if (clickedIndex !== -1) closeAll(clickedIndex);
  };

  const onFocusIn = () => applyTabindex(currentFocus());

  applyTabindex({ topIndex: 0, subIndex: null });
  root.addEventListener("keydown", onKeyDown, { capture: true });
  root.addEventListener("click", onClick);
  root.addEventListener("focusin", onFocusIn);
  return () => {
    root.removeEventListener("keydown", onKeyDown, { capture: true });
    root.removeEventListener("click", onClick);
    root.removeEventListener("focusin", onFocusIn);
  };
}

export const mountMenubar = createConnectMount({
  key: "menubar",
  rootSelector: selector.root,
  connect,
});
