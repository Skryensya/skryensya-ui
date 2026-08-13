import {
  anchorNameFor,
  bindAnchor,
  stripPositioningStyle,
  supportsAnchorPositioning,
} from "@skryensya/core/anchored";
import { menu } from "@skryensya/core/machines";
import {
  createAdjacentGraceController,
  hasOpenSubmenuSibling,
} from "@skryensya/core/menu-adjacent-grace";
import { menuAttrs, type MenuApi, type MenuItemKind, type MenuService } from "@skryensya/core/menu";
import {
  createIntentOverlay,
  type IntentOverlayHandle,
  type IntentPoint,
} from "@skryensya/core/menu-intent-overlay";
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
   * Vanilla never portals (packages/core/src/menu-intent-overlay.ts's own header explains WHY this
   * exists at all): every submenu root stays a real DOM descendant of the one that carries the
   * flag, so `closest()` alone finds it, on this root or any ancestor, no threading needed the way
   * React's `debugSafetyTriangle` prop has to be. Only meaningful with a `parent`: the overlay
   * always concerns the safety triangle BETWEEN a submenu and the parent it hangs off, and the
   * top-level menu is never itself the subject of one.
   */
  const debugSafetyTriangle = parent && root.closest(`[${menuAttrs.debugSafetyTriangle}]`) != null;
  let debugOverlay: IntentOverlayHandle | null = null;
  const syncDebugOverlay = () => {
    if (!debugSafetyTriangle || !parent) return;
    debugOverlay ??= createIntentOverlay();
    debugOverlay.update({
      polygon: machine.service.context.get("intentPolygon") as readonly IntentPoint[] | null,
      locked: parent.service.context.get("pointerRoutingMode") === "locked",
      label: "Pointer routing",
      lockedText: "locked",
      freeText: "free",
    });
  };

  const triggerProps = () =>
    parent
      ? parent.getApi().getTriggerItemProps(getApi())
      : getApi().getTriggerProps();
  /*
   * One controller for this whole item list: `menu-adjacent-grace.ts` explains what it holds and
   * why (Zag's own `intentPolygon` protects a diagonal approach, not a pointer leaving the trigger
   * straight onto the very next row). `selector.item` never matches a submenu's own trigger (that
   * is `selector.trigger` on a nested root), so every entry here really is "some OTHER item," the
   * only case this hold should ever apply to.
   */
  const adjacentGrace = createAdjacentGraceController();
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
    /*
     * `@zag-js/vanilla`'s `normalizeProps` names these `onpointermove`/`onpointerleave`, all
     * lowercase (the plain-HTML-attribute convention), NOT the `onPointerMove` casing React's own
     * normalizer uses. Spreading `base` and adding `onPointerMove` alongside it does not override
     * anything: they are two DIFFERENT keys, `bindZagEvents` finds both (its `isEventKey`/
     * `eventName` fold either casing to the same "pointermove" DOM event), and both end up
     * `addEventListener`'d — Zag's own untouched handler running right alongside the wrapped one,
     * which is what let a sibling's highlight commit immediately no matter how this hold was
     * written (measured: two "pointermove" listeners on one item node, one of them always the
     * original). Deleting every casing of the two keys before adding a single lowercase one back
     * is what actually makes this the only handler `bindZagEvents` ever finds.
     */
    const realOnPointerMove = (base.onpointermove ?? base.onPointerMove) as
      | ((event: Event) => void)
      | undefined;
    const realOnPointerLeave = (base.onpointerleave ?? base.onPointerLeave) as
      | ((event: Event) => void)
      | undefined;
    const wrapped: DomProps = { ...base };
    for (const key of Object.keys(wrapped)) {
      if (/^onpointermove$/i.test(key) || /^onpointerleave$/i.test(key)) delete wrapped[key];
    }
    wrapped.onpointermove = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && hasOpenSubmenuSibling(item.node)) {
        /*
         * NOT `() => realOnPointerMove?.(event)`: a native `PointerEvent`'s `currentTarget` goes
         * back to `null` the instant dispatch finishes, so replaying the SAME event object once
         * the hold elapses hands Zag's real handler a `target` it can no longer resolve to an item
         * (measured: `highlightedValue` never left the trigger, the hold "elapsed" but nothing
         * ever committed). `setHighlightedValue` is the public, event-free path for exactly this —
         * committing a value with no event object to go stale.
         */
        adjacentGrace.hold(item.value, () => getApi().setHighlightedValue(item.value));
        return;
      }
      realOnPointerMove?.(event);
    };
    wrapped.onpointerleave = (event: Event) => {
      adjacentGrace.cancel(item.value);
      realOnPointerLeave?.(event);
    };
    return wrapped;
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
    syncDebugOverlay();
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
    debugOverlay?.destroy();
    adjacentGrace.reset();
    instances.delete(root);
    machine.stop();
  };
}

export const mountMenu = createConnectMount({
  key: "menu",
  rootSelector: selector.root,
  connect,
});
