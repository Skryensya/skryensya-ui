import { resolveMenubarKey, type MenubarFocus } from "@skryensya/core/menubar";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-menubar]",
  item: "[data-sk-menubar-item]",
  menu: "[data-sk-menubar-menu]",
  menuItem: "[data-sk-menubar-menu-item]",
} as const;

type TopEntry = {
  trigger: HTMLElement;
  positioner: HTMLElement | null;
  menuItems: HTMLElement[];
};

const emit = <T>(root: HTMLElement, name: string, detail: T) =>
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

function readTops(root: HTMLElement): TopEntry[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector.item)).map((trigger) => {
    const positioner = trigger.parentElement?.querySelector<HTMLElement>(selector.menu) ?? null;
    return {
      trigger,
      positioner,
      menuItems: positioner ? Array.from(positioner.querySelectorAll<HTMLElement>(selector.menuItem)) : [],
    };
  });
}

function connect(root: HTMLElement): () => void {
  const tops = readTops(root);
  if (!tops.length) return () => {};

  for (const entry of tops) {
    if (!entry.positioner) continue;
    const id = entry.positioner.id || uniqueId("sk-menubar-menu");
    entry.positioner.id = id;
    entry.trigger.setAttribute("aria-haspopup", "menu");
    entry.trigger.setAttribute("aria-controls", id);
    entry.trigger.setAttribute("aria-expanded", "false");
    entry.positioner.hidden = true;
  }

  const hasMenuAt = (topIndex: number) => Boolean(tops[topIndex]?.positioner);
  const subCountOf = (topIndex: number) => tops[topIndex]?.menuItems.length ?? 0;

  const currentFocus = (): MenubarFocus => {
    const active = root.ownerDocument?.activeElement;
    for (let topIndex = 0; topIndex < tops.length; topIndex++) {
      const entry = tops[topIndex]!;
      if (entry.trigger === active) return { topIndex, subIndex: null };
      const subIndex = entry.menuItems.indexOf(active as HTMLElement);
      if (subIndex !== -1) return { topIndex, subIndex };
    }
    for (let topIndex = 0; topIndex < tops.length; topIndex++) {
      if (tops[topIndex]!.trigger.tabIndex === 0) return { topIndex, subIndex: null };
    }
    return { topIndex: 0, subIndex: null };
  };

  const applyTabindex = (focus: MenubarFocus) => {
    for (const entry of tops) {
      entry.trigger.tabIndex = -1;
      for (const item of entry.menuItems) item.tabIndex = -1;
    }
    const entry = tops[focus.topIndex];
    if (!entry) return;
    if (focus.subIndex === null) entry.trigger.tabIndex = 0;
    else if (entry.menuItems[focus.subIndex]) entry.menuItems[focus.subIndex]!.tabIndex = 0;
  };

  const closeAll = (except?: number) => {
    tops.forEach((entry, index) => {
      if (index === except || !entry.positioner) return;
      entry.positioner.hidden = true;
      entry.trigger.setAttribute("aria-expanded", "false");
    });
  };

  const openMenu = (topIndex: number) => {
    const entry = tops[topIndex];
    if (!entry?.positioner) return;
    closeAll(topIndex);
    entry.positioner.hidden = false;
    entry.trigger.setAttribute("aria-expanded", "true");
  };

  const closeMenu = (topIndex: number) => {
    const entry = tops[topIndex];
    if (!entry?.positioner) return;
    entry.positioner.hidden = true;
    entry.trigger.setAttribute("aria-expanded", "false");
  };

  const moveFocus = (focus: MenubarFocus) => {
    applyTabindex(focus);
    const entry = tops[focus.topIndex];
    const target = focus.subIndex === null ? entry?.trigger : entry?.menuItems[focus.subIndex];
    target?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    const focus = currentFocus();
    const action = resolveMenubarKey({ key: event.key, focus, topCount: tops.length, hasMenuAt, subCountOf });
    if (action.kind === "none") return;
    event.preventDefault();
    if (action.kind === "move") moveFocus(action.focus);
    else if (action.kind === "open") {
      openMenu(action.topIndex);
      const subCount = subCountOf(action.topIndex);
      const subIndex = subCount < 1 ? null : action.focusLast ? subCount - 1 : 0;
      moveFocus({ topIndex: action.topIndex, subIndex });
    } else if (action.kind === "close") {
      closeMenu(focus.topIndex);
      moveFocus({ topIndex: focus.topIndex, subIndex: null });
    } else if (action.kind === "moveTop") {
      if (action.keepOpen && hasMenuAt(action.topIndex)) {
        openMenu(action.topIndex);
        const subCount = subCountOf(action.topIndex);
        moveFocus({ topIndex: action.topIndex, subIndex: subCount < 1 ? null : 0 });
      } else {
        if (action.keepOpen) closeAll();
        moveFocus({ topIndex: action.topIndex, subIndex: null });
      }
    }
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    for (let topIndex = 0; topIndex < tops.length; topIndex++) {
      const entry = tops[topIndex]!;
      if (entry.trigger === target || entry.trigger.contains(target)) {
        if (!entry.positioner) return; // a leaf command activates natively, nothing to toggle
        const isOpen = entry.trigger.getAttribute("aria-expanded") === "true";
        if (isOpen) {
          closeMenu(topIndex);
          moveFocus({ topIndex, subIndex: null });
        } else {
          openMenu(topIndex);
          moveFocus({ topIndex, subIndex: null });
        }
        return;
      }
      const subIndex = entry.menuItems.indexOf(target);
      if (subIndex !== -1) {
        emit(root, "sk-menubar-activate", { value: target.dataset.value ?? target.textContent });
        closeMenu(topIndex);
        moveFocus({ topIndex, subIndex: null });
        return;
      }
    }
  };

  const onDocumentPointerDown = (event: PointerEvent) => {
    if (root.contains(event.target as Node)) return;
    closeAll();
  };

  applyTabindex({ topIndex: 0, subIndex: null });
  root.addEventListener("keydown", onKeyDown);
  root.addEventListener("click", onClick);
  root.ownerDocument.addEventListener("pointerdown", onDocumentPointerDown);
  return () => {
    root.removeEventListener("keydown", onKeyDown);
    root.removeEventListener("click", onClick);
    root.ownerDocument.removeEventListener("pointerdown", onDocumentPointerDown);
  };
}

export const mountMenubar = createConnectMount({
  key: "menubar",
  rootSelector: selector.root,
  connect,
});
