import {
  anchorNameFor,
  bindAnchor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { menu } from "@skryensya/core/machines";
import { menuAttrs, type MenuApi, type MenuItemKind, type MenuService } from "@skryensya/core/menu";
import {
  getIntentReadout,
  type IntentReadoutHandle,
} from "@skryensya/core/menu-intent-readout";
import { createMenuSafeArea, type MenuSafeAreaHandle } from "@skryensya/core/menu-safe-area";
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

/*
 * `"separator"` never reaches here: `selector.item` is `[data-sk-menu-item]`, and the contract's
 * item-row template excludes exactly that kind (core/src/menu.ts), so a separator entry mounts as
 * `[data-sk-menu-separator]` instead and this querySelectorAll never sees it.
 */
type AuthoredItem = {
  node: HTMLElement;
  value: string;
  label: string;
  kind: Exclude<MenuItemKind, "separator">;
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
      kind: (node.dataset.type as Exclude<MenuItemKind, "separator"> | undefined) ?? "item",
      group: node.dataset.group,
      labelNode: node.querySelector<HTMLElement>(selector.itemLabel),
      indicatorNode: node.querySelector<HTMLElement>(selector.itemIndicator),
    }));
  /*
   * El pattern Anclaje (ADR-25). El menu no tenía ruta de anclaje ninguna: posicionaba siempre Zag,
   * incluso en navegadores con la API.
   *
   * SOLO el TRIGGER (botón) entra por esa ruta. El anclaje del pattern es a un ELEMENTO, y un
   * context trigger no es un punto fijo del layout: es la región entera que capturó el right-click,
   * y lo que importa es DÓNDE DENTRO de ella cayó el clic, algo que un `anchor-name` sobre la caja
   * entera no puede expresar. La machine ya resuelve exactamente ese caso sola — `getContextTriggerProps`
   * manda el punto del evento (`event.point`) a la machine, que lo guarda como `anchorPoint` y lo usa
   * como referencia de floating-ui con el placement por defecto (`bottom-start`, la MISMA constante
   * de abajo): el menú crece abajo-a-la-derecha del clic, con flip automático cerca del borde, sin
   * una sola línea de anclaje propia. Dejar `anchorName` en null para un context trigger es lo que
   * deja el `style` de la machine intacto (ver `sync` más abajo) en vez de que este binding se lo pise
   * con una colocación pensada para un botón.
   */
  const menuId = root.id || uniqueId("sk-menu");
  const anchorEl = trigger;
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

  /*
   * Vanilla never portals: every submenu root stays a real DOM descendant of the one that carries
   * the flag, so `closest()` alone finds it — on this root or any ancestor, no threading needed the
   * way React's `debugSafetyTriangle` prop has to be. It matches THIS root too when this root is
   * the flagged one, which is what makes both bindings agree: the readout belongs to the flagged
   * root itself, not to whichever submenu happened to mount first, so a flagged menu shows it with
   * or without submenus (React's `Menu` creates it unconditionally for the same reason). The
   * WeakMap inside `getIntentReadout` is what keeps that one element to one root no matter how many
   * levels ask for it.
   */
  const flaggedRoot = root.closest<HTMLElement>(`[${menuAttrs.debugSafetyTriangle}]`);
  const readout: IntentReadoutHandle | null = flaggedRoot
    ? getIntentReadout(flaggedRoot, {
        label: "Pointer routing",
        lockedText: "locked",
        freeText: "free",
      })
    : null;
  /* Only the root that OWNS the element tears it down; a submenu just stops reporting into it. */
  const ownsReadout = flaggedRoot === root;

  /*
   * The safe area (core/src/menu-safe-area.ts) belongs to the SUBMENU, mounted on the trigger it
   * hangs off: it is what keeps the pointer counting as that trigger while the reader crosses the
   * rows between them. A top-level menu has no such corridor, hence the `parent` guard.
   *
   * A plain `addEventListener` rather than a wrapped Zag prop: this only ADDS a handler, it never
   * has to replace Zag's own, so none of the duplicate-key care `applyZagProps` needs elsewhere
   * applies. Aiming happens while the pointer is still ON the trigger — an element created in
   * response to `pointerleave` would already be one event too late.
   */
  const cleanups: Array<() => void> = [];
  let safeArea: MenuSafeAreaHandle | null = null;
  if (parent && trigger) {
    safeArea = createMenuSafeArea(trigger, {
      debug: flaggedRoot != null,
      onHoldChange: (holding) => readout?.report(menuId, holding),
    });
    const aim = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (content.dataset.state !== "open") return;
      safeArea?.aim(
        { x: event.clientX, y: event.clientY },
        content.getBoundingClientRect(),
      );
    };
    trigger.addEventListener("pointermove", aim);
    cleanups.push(() => trigger.removeEventListener("pointermove", aim));
  }
  /* Closed submenu, no corridor: the shape has to go, or it keeps intercepting the rows it covers. */
  const syncSafeArea = () => {
    if (content.dataset.state !== "open") safeArea?.clear();
  };

  const triggerProps = () =>
    parent
      ? parent.getApi().getTriggerItemProps(getApi())
      : getApi().getTriggerProps();
  /*
   * Items take Zag's props untouched. They used to be wrapped in a 200ms timed hold that delayed a
   * sibling's highlight while a submenu was open, standing in for a safe area the system did not
   * have; with a real one (menu-safe-area.ts) the pointer never reaches these rows during a
   * crossing at all, so the hold protected nothing and only made a DELIBERATE move to the next row
   * arrive late — measured, it still committed that highlight 200ms after the submenu had already
   * closed underneath it, which is the worst of both.
   */
  const itemProps = (item: AuthoredItem): DomProps => {
    const api = getApi();
    const base: DomProps =
      item.kind === "item"
        ? api.getItemProps({
            value: item.value,
            valueText: item.label,
            disabled: boolAttr(item.node, "disabled"),
          })
        : api.getOptionItemProps({
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
    return base;
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
    syncSafeArea();
  };
  cleanups.push(
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
  );
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
    safeArea?.destroy();
    if (ownsReadout) readout?.destroy();
    else readout?.release(menuId);
    instances.delete(root);
    machine.stop();
  };
}

export const mountMenu = createConnectMount({
  key: "menu",
  rootSelector: selector.root,
  connect,
});
