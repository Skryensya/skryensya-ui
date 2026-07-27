import {
  anchorNameFor,
  bindAnchor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { menu } from "@skryensya/core/machines";
import type { MenuApi, MenuItemKind, MenuService } from "@skryensya/core/menu";
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla";
import {
  applyZagProps,
  bindZagEvents,
  type DomProps,
} from "../runtime/apply.js";
import { createConnectMount, uniqueId } from "../runtime/svelte-hydrate.js";

const selector = {
  root: "[data-sk-menu]",
  trigger: "[data-sk-menu-trigger]",
  contextTrigger: "[data-sk-menu-context-trigger]",
  positioner: "[data-sk-menu-positioner]",
  content: "[data-sk-menu-content]",
  item: "[data-sk-menu-item]",
  itemLabel: "[data-sk-menu-item-label], .sk-menu__item-label",
  itemIndicator: "[data-sk-menu-item-indicator], .sk-menu__item-indicator",
} as const;

type AuthoredItem = {
  node: HTMLElement;
  value: string;
  label: string;
  kind: MenuItemKind;
  group?: string;
  labelNode: HTMLElement | null;
  indicatorNode: HTMLElement | null;
};
const boolAttr = (node: HTMLElement, name: string) => node.hasAttribute(name);
const emit = <T>(root: HTMLElement, name: string, detail: T) =>
  root.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));

type MenuInstance = { service: MenuService; getApi: () => MenuApi };
const instances = new WeakMap<HTMLElement, MenuInstance>();

function connect(root: HTMLElement): () => void {
  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const contextTrigger = root.querySelector<HTMLElement>(
    selector.contextTrigger,
  );
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);
  if ((!trigger && !contextTrigger) || !positioner || !content) return () => {};

  const items: AuthoredItem[] = Array.from(
    root.querySelectorAll<HTMLElement>(selector.item),
  )
    .filter((node) => node.closest(selector.root) === root)
    .map((node) => ({
      node,
      value: node.dataset.value ?? node.textContent?.trim() ?? "",
      label: node.dataset.valueText ?? node.textContent?.trim() ?? "",
      kind: (node.dataset.type as MenuItemKind | undefined) ?? "item",
      group: node.dataset.group,
      labelNode: node.querySelector<HTMLElement>(selector.itemLabel),
      indicatorNode: node.querySelector<HTMLElement>(selector.itemIndicator),
    }));
  /* El pattern Anclaje (ADR-25). El menu no tenía ruta de anclaje ninguna: posicionaba siempre Zag,
   * incluso en navegadores con la API. */
  const menuId = root.id || uniqueId("sk-menu");
  const anchorEl = trigger ?? contextTrigger;
  const anchorName = supportsAnchorPositioning() && anchorEl ? anchorNameFor(menuId) : null;
  let unbindAnchor: (() => void) | undefined;

  const machine = new VanillaMachine(menu.machine, {
    id: menuId,
    "aria-label": root.getAttribute("aria-label") ?? undefined,
    defaultOpen: root.hasAttribute("data-open"),
    positioning: { placement: "bottom-start" },
    onOpenChange(details) {
      emit(root, "sk-open-change", { open: details.open });
    },
  });
  machine.start();
  const getApi = () => menu.connect(machine.service, normalizeProps);
  const instance = { service: machine.service, getApi };
  instances.set(root, instance);
  const parentRoot = root.parentElement?.closest<HTMLElement>(selector.root);
  const parent = parentRoot ? instances.get(parentRoot) : undefined;
  if (parent) {
    getApi().setParent(parent.service);
    parent.getApi().setChild(machine.service);
  }
  const triggerProps = () =>
    parent
      ? parent.getApi().getTriggerItemProps(getApi())
      : getApi().getTriggerProps();
  const itemProps = (item: AuthoredItem): DomProps => {
    const api = getApi();
    if (item.kind === "item") {
      return api.getItemProps({
        value: item.value,
        valueText: item.label,
        disabled: boolAttr(item.node, "disabled"),
      });
    }
    return api.getOptionItemProps({
      value: item.value,
      valueText: item.label,
      disabled: boolAttr(item.node, "disabled"),
      type: item.kind,
      checked: boolAttr(item.node, "data-checked"),
      onCheckedChange(checked) {
        if (item.kind === "radio" && checked) {
          for (const candidate of items) {
            if (candidate.kind === "radio" && candidate.group === item.group)
              candidate.node.removeAttribute("data-checked");
          }
        }
        item.node.toggleAttribute("data-checked", checked);
        emit(root, "sk-checked-change", { value: item.value, checked });
        sync();
      },
    });
  };
  const sync = () => {
    const api = getApi();
    if (trigger) applyZagProps(trigger, triggerProps() as DomProps);
    if (contextTrigger)
      applyZagProps(contextTrigger, api.getContextTriggerProps() as DomProps);
    const positionerProps = api.getPositionerProps() as DomProps;
    applyZagProps(positioner, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);
    if (anchorName && anchorEl) unbindAnchor = bindAnchor(anchorEl, positioner, anchorName);
    applyZagProps(content, api.getContentProps() as DomProps);
    for (const item of items) {
      applyZagProps(item.node, itemProps(item));
      const baseProps = {
        value: item.value,
        valueText: item.label,
        disabled: boolAttr(item.node, "disabled"),
        checked:
          item.kind === "item"
            ? undefined
            : boolAttr(item.node, "data-checked"),
      };
      if (item.labelNode)
        applyZagProps(
          item.labelNode,
          api.getItemTextProps(baseProps) as DomProps,
        );
      if (item.indicatorNode) {
        applyZagProps(
          item.indicatorNode,
          api.getItemIndicatorProps(baseProps) as DomProps,
        );
      }
    }
  };
  const cleanups: Array<() => void> = [
    ...(trigger
      ? [bindZagEvents(trigger, () => triggerProps() as DomProps)]
      : []),
    ...(contextTrigger
      ? [
          bindZagEvents(
            contextTrigger,
            () => getApi().getContextTriggerProps() as DomProps,
          ),
        ]
      : []),
    bindZagEvents(content, () => getApi().getContentProps() as DomProps),
    ...items.map((item) => bindZagEvents(item.node, () => itemProps(item))),
  ];
  if (parent && trigger) {
    const openSubmenu = (event: KeyboardEvent) => {
      const direction =
        document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
      if (event.key === direction) getApi().setOpen(true);
    };
    trigger.addEventListener("keydown", openSubmenu);
    cleanups.push(() => trigger.removeEventListener("keydown", openSubmenu));
  }
  const unsubscribe = machine.subscribe(sync);
  sync();
  for (const item of items) {
    if (item.kind !== "item") continue;
    const onClick = () => {
      if (!boolAttr(item.node, "disabled"))
        emit(root, "sk-select", { value: item.value });
    };
    item.node.addEventListener("click", onClick);
    cleanups.push(() => item.node.removeEventListener("click", onClick));
  }
  return () => {
    unsubscribe();
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
    instances.delete(root);
    machine.stop();
  };
}

export const mountMenu = createConnectMount({
  key: "menu",
  rootSelector: selector.root,
  connect,
});
