import {
  computeFlyoutFixedCoords,
  flyoutEvents,
  type FlyoutOpenDetails,
  type FlyoutValueChangeDetails,
} from "@skryensya/core/flyout";
import { applyAttrs, bindEvents } from "../runtime/apply.js";
import { createConnectMount } from "../runtime/svelte-hydrate.js";

const rootSelector = "[data-sk-flyout]";
const labelSelector = "[data-sk-flyout-label]";
const triggerSelector = "[data-sk-flyout-trigger]";
const valueSelector = "[data-sk-flyout-value]";
const panelSelector = "[data-sk-flyout-panel]";
const itemSelector = "[data-sk-flyout-item]";
const itemTextSelector = "[data-sk-flyout-item-text]";

const PANEL_GAP_PX = 4;
const VIEWPORT_PAD_PX = 8;

type Cleanup = () => void;

export type FlyoutEnhancerOptions = {
  id?: string;
  disabled?: boolean;
  defaultValue?: string[];
  placeholder?: string;
  onValueChange?: (details: FlyoutValueChangeDetails) => void;
};

type Item = {
  el: HTMLElement;
  value: string;
  label: string;
  disabled: boolean;
};

/*
 * Value picker that opens beside the trigger. No Zag machine in v1: click / keyboard open (not hover),
 * Escape / outside / item commit close, exclusive open via sk-flyout-open, and fixed placement that
 * flips/clamps so the panel stays inside the viewport (clipping ancestors included).
 */
export function connectFlyout(root: HTMLElement, options: FlyoutEnhancerOptions = {}): Cleanup {
  const trigger = root.querySelector<HTMLElement>(triggerSelector);
  const valueEl = root.querySelector<HTMLElement>(valueSelector);
  const panel = root.querySelector<HTMLElement>(panelSelector);
  const itemEls = Array.from(root.querySelectorAll<HTMLElement>(itemSelector));

  if (!trigger) throw new Error("Flyout requires a [data-sk-flyout-trigger] element.");
  if (!panel) throw new Error("Flyout requires a [data-sk-flyout-panel] element.");
  if (itemEls.length === 0) throw new Error("Flyout requires at least one [data-sk-flyout-item].");

  const items = itemEls.map(readItem);
  const placeholder = options.placeholder ?? root.dataset.placeholder ?? "";
  const flyoutId = options.id ?? (root.id || `sk-flyout-${Math.random().toString(36).slice(2)}`);
  const panelId = panel.id || `${flyoutId}-panel`;
  if (!panel.id) panel.id = panelId;

  const label = root.querySelector<HTMLElement>(labelSelector);
  if (label && !label.id) label.id = `${flyoutId}-label`;

  let open = false;
  let value = options.defaultValue?.[0] ?? root.dataset.value ?? items[0]?.value ?? "";
  const disabled = () => options.disabled ?? root.hasAttribute("data-disabled");

  const placePanel = () => {
    panel.dataset.placement = "fixed";
    panel.style.position = "fixed";
    // Measure after the panel is visible (caller must render open first).
    const panelRect = panel.getBoundingClientRect();
    const coords = computeFlyoutFixedCoords({
      trigger: trigger.getBoundingClientRect(),
      panelWidth: panelRect.width || panel.offsetWidth,
      panelHeight: panelRect.height || panel.offsetHeight,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
      gap: PANEL_GAP_PX,
      padding: VIEWPORT_PAD_PX,
      rtl: getComputedStyle(root).direction === "rtl",
    });
    panel.style.top = `${coords.top}px`;
    panel.style.left = `${coords.left}px`;
    panel.style.right = "auto";
    panel.dataset.side = coords.side;
  };

  const clearPlacement = () => {
    delete panel.dataset.placement;
    delete panel.dataset.side;
    panel.style.removeProperty("position");
    panel.style.removeProperty("top");
    panel.style.removeProperty("left");
    panel.style.removeProperty("right");
  };

  const render = () => {
    const selected = items.find((item) => item.value === value);
    applyAttrs(root, {
      "data-value": value || null,
      "data-disabled": disabled() ? "" : null,
    });
    applyAttrs(trigger, {
      type: trigger instanceof HTMLButtonElement ? "button" : null,
      "aria-haspopup": "listbox",
      "aria-expanded": open ? "true" : "false",
      "aria-controls": panelId,
      "aria-labelledby": label?.id ?? null,
      "aria-disabled": disabled() ? "true" : null,
      disabled: trigger instanceof HTMLButtonElement && disabled() ? true : null,
      "data-state": open ? "open" : "closed",
      "data-disabled": disabled() ? "" : null,
    });
    applyAttrs(panel, {
      role: "listbox",
      "aria-labelledby": label?.id ?? null,
      hidden: open ? null : true,
      "data-state": open ? "open" : "closed",
      tabindex: open ? -1 : null,
    });

    for (const item of items) {
      const checked = item.value === value;
      applyAttrs(item.el, {
        role: "option",
        "aria-selected": checked ? "true" : "false",
        "aria-disabled": item.disabled ? "true" : null,
        "data-state": checked ? "checked" : null,
        "data-disabled": item.disabled ? "" : null,
        tabindex: open && checked && !item.disabled ? 0 : -1,
      });
    }

    if (valueEl) valueEl.textContent = selected?.label || placeholder;
  };

  const setOpen = (next: boolean) => {
    if (disabled()) return;
    if (next === open) {
      if (next) placePanel();
      return;
    }
    open = next;
    if (open) {
      document.dispatchEvent(
        new CustomEvent<FlyoutOpenDetails>(flyoutEvents.open, { detail: { root } }),
      );
      render();
      placePanel();
    } else {
      clearPlacement();
      render();
    }
  };

  const commit = (next: string) => {
    const item = items.find((candidate) => candidate.value === next);
    if (!item || item.disabled) return;

    value = next;
    render();
    const details: FlyoutValueChangeDetails = { value: [next] };
    options.onValueChange?.(details);
    root.dispatchEvent(
      new CustomEvent<FlyoutValueChangeDetails>(flyoutEvents.valueChange, { bubbles: true, detail: details }),
    );
    setOpen(false);
  };

  const pointerOverSurface = (target: EventTarget | null) =>
    target instanceof Node && (trigger.contains(target) || panel.contains(target));

  const onDocumentPointerDown = (event: PointerEvent) => {
    if (!open) return;
    if (pointerOverSurface(event.target)) return;
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled()) return;

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      trigger.focus();
      return;
    }

    if (event.target === trigger) {
      if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
        const selected = items.find((item) => item.value === value && !item.disabled) ?? items.find((item) => !item.disabled);
        selected?.el.focus();
      }
      return;
    }

    if (!open || !(event.target instanceof HTMLElement) || !panel.contains(event.target)) return;

    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.el === event.target || item.el.contains(event.target as Node));
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (enabled.length === 0) return;
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next = enabled[(Math.max(currentIndex, 0) + delta + enabled.length) % enabled.length];
      next.el.focus();
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      enabled[0]?.el.focus();
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      enabled.at(-1)?.el.focus();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      const item = items.find((candidate) => candidate.el === event.target || candidate.el.contains(event.target as Node));
      if (!item) return;
      event.preventDefault();
      commit(item.value);
    }
  };

  const cleanups: Cleanup[] = [
    bindEvents(trigger, {
      click: () => setOpen(!open),
      keydown: onKeyDown as EventListener,
    }),
    bindEvents(panel, {
      keydown: onKeyDown as EventListener,
    }),
    ...items.map((item) =>
      bindEvents(item.el, {
        click: () => commit(item.value),
        keydown: onKeyDown as EventListener,
      }),
    ),
  ];

  const onDocPointerDown = (event: Event) => onDocumentPointerDown(event as PointerEvent);
  const onExclusiveOpen = (event: Event) => {
    const detail = (event as CustomEvent<FlyoutOpenDetails>).detail;
    if (!detail || detail.root === root) return;
    if (open) setOpen(false);
  };
  const onViewportChange = () => {
    if (open) placePanel();
  };
  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener(flyoutEvents.open, onExclusiveOpen);
  window.addEventListener("resize", onViewportChange);
  window.addEventListener("scroll", onViewportChange, true);
  cleanups.push(() => {
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener(flyoutEvents.open, onExclusiveOpen);
    window.removeEventListener("resize", onViewportChange);
    window.removeEventListener("scroll", onViewportChange, true);
  });

  render();

  return () => {
    clearPlacement();
    for (const cleanup of cleanups) cleanup();
  };
}

function readItem(el: HTMLElement): Item {
  const value = el.dataset.value;
  if (!value) throw new Error("Every [data-sk-flyout-item] needs a non-empty data-value.");
  const text = el.querySelector<HTMLElement>(itemTextSelector) ?? el;
  return {
    el,
    value,
    label: text.textContent?.trim() || value,
    disabled: el.hasAttribute("data-disabled"),
  };
}

export const mountFlyout = createConnectMount({
  key: "flyout",
  rootSelector,
  connect: (root) => connectFlyout(root),
});
