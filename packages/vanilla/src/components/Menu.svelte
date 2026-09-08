<script lang="ts">
  import {
    anchorNameFor,
    bindAnchor,
    stripPositioningStyle,
    supportsAnchorPositioning,
  } from "@skryensya/core/anchored";
  import { menu } from "@skryensya/core/machines";
  import { menuAttrs, type MenuItemKind } from "@skryensya/core/menu";
  import { getIntentReadout, type IntentReadoutHandle } from "@skryensya/core/menu-intent-readout";
  import { createMenuSafeArea, type MenuSafeAreaHandle } from "@skryensya/core/menu-safe-area";
  import { normalizeProps, useMachine } from "@zag-js/svelte";
  import { onDestroy, onMount } from "svelte";
  import { applyZagProps, bindZagEvents, type DomProps } from "../runtime/apply";
  import { deleteMenuInstance, getMenuInstance, setMenuInstance } from "./menu-registry.js";
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * MENU, a machine-backed enhancer over `@zag-js/menu` (the SAME machine React uses, via
   * `@skryensya/core/machines`). It renders no structure: it scans its authored markup and patches the
   * attributes `connect` returns onto those nodes.
   */
  const root = getRoot();

  const selector = {
    trigger: "[data-sk-menu-trigger]",
    contextTrigger: "[data-sk-menu-context-trigger]",
    positioner: "[data-sk-menu-positioner]",
    content: "[data-sk-menu-content]",
    item: "[data-sk-menu-item]",
    itemLabel: "[data-sk-menu-item-label], .sk-menu__item-label",
    itemIndicator: "[data-sk-menu-item-indicator], .sk-menu__item-indicator",
    root: "[data-sk-menu]",
  } as const;

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

  const trigger = root.querySelector<HTMLElement>(selector.trigger);
  const contextTrigger = root.querySelector<HTMLElement>(selector.contextTrigger);
  const positioner = root.querySelector<HTMLElement>(selector.positioner);
  const content = root.querySelector<HTMLElement>(selector.content);
  const ready = Boolean((trigger || contextTrigger) && positioner && content);

  const items: AuthoredItem[] = Array.from(root.querySelectorAll<HTMLElement>(selector.item))
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
   * The Anchoring pattern (ADR-25). ONLY the TRIGGER (button) goes down that path: a context trigger is
   * not a fixed point of the layout, it is the region that captured the right-click, and the machine
   * already resolves that case on its own with `getContextTriggerProps`/`anchorPoint`.
   *
   * Captured ONCE: this machine's `getRootProps` does not touch `root.id`, but the trigger/content do
   * receive namespaced ids that `applyZagProps` writes back. The same reason the machine's id is never
   * re-read live from the DOM anywhere else in this migration.
   */
  const menuId = root.id || uniqueId("sk-menu");
  const anchorEl = trigger;
  /*
   * `!hasSubmenu`: a submenu's trigger lives INSIDE the parent menu's own anchor-positioned panel,
   * and the browser's anchor-positioning engine cannot paint a box anchored to something inside
   * ANOTHER anchor-positioned box. Measured against a live nested Menu, the computed rect comes
   * back correct and nothing ever paints there. So a submenu always falls back to the machine's own
   * placement instead (the fallback this pattern already ships for browsers with no engine at all).
   *
   * The TOP level withholds native positioning too, whenever it HAS a submenu, not only the submenu
   * itself: mixing engines one level apart put the two out of the same coordinate space. The
   * submenu's `--x`/`--y` are the machine's own measurement, taken relative to the viewport; but the
   * browser resolves the SUBMENU's `position: fixed` against the nearest ancestor that is itself
   * anchor-positioned (the top level's OWN positioner, still carrying `anchor-name` unconditionally
   * whether or not it is placed via `@supports`) rather than the viewport. Measured against a live
   * nested Menu: a submenu math-correct in viewport terms rendered offset by roughly the top level
   * panel's own on-screen position. One engine for the whole tree removes the mismatch instead of
   * chasing which ancestor property makes it a containing block.
   */
  const isSubmenu = Boolean(root.parentElement?.closest<HTMLElement>(selector.root));
  const hasSubmenu = isSubmenu || Boolean(root.querySelector<HTMLElement>(selector.root));
  const anchorName = supportsAnchorPositioning() && !hasSubmenu && anchorEl ? anchorNameFor(menuId) : null;
  let unbindAnchor: (() => void) | undefined;

  const service = useMachine(menu.machine, () => ({
    id: menuId,
    "aria-label": root.getAttribute("aria-label") ?? undefined,
    defaultOpen: root.hasAttribute("data-open"),
    /*
     * `strategy: "fixed"`, not the machine's own default (`absolute`): irrelevant while the browser
     * places this box (`anchorName`), but it is what the machine writes into its OWN inline style,
     * which is what actually positions a SUBMENU now that `anchorName` is withheld from one (see the
     * note above). `absolute`'s containing block is the nearest positioned ancestor, here the parent
     * menu's own panel, so a submenu measuring past that panel's edge grew ITS `overflow: auto`
     * scrollport instead of floating free. The exact failure `patterns/anchored.css` already
     * explains choosing `fixed` over `absolute` to avoid for the browser-placed case.
     */
    positioning: { placement: "bottom-start" as const, strategy: "fixed" as const },
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(new CustomEvent("sk-open-change", { bubbles: true, detail: { open: details.open } }));
    },
  }));

  const api = $derived(menu.connect(service, normalizeProps));

  // Parent/child binding: a submenu finds its parent with closest() over the DOM. `parentRoot`/
  // `parent` resolve right away, synchronously, because the registry (`menu-registry.ts`) is filled
  // from the parent DOWNWARD (the parent registers BEFORE its child starts mounting, the same order
  // querySelectorAll guarantees).
  const parentRoot = root.parentElement?.closest<HTMLElement>(selector.root);
  const parent = parentRoot ? getMenuInstance(parentRoot) : undefined;
  setMenuInstance(root, { service, getApi: () => api });

  /*
   * Vanilla never portals: every submenu root is still a real descendant of the one carrying the flag,
   * so `closest()` only finds it on this root or on an ancestor.
   */
  const flaggedRoot = root.closest<HTMLElement>(`[${menuAttrs.debugSafetyTriangle}]`);
  const readout: IntentReadoutHandle | null = flaggedRoot
    ? getIntentReadout(flaggedRoot, { label: "Pointer routing", lockedText: "locked", freeText: "free" })
    : null;
  const ownsReadout = flaggedRoot === root;

  /*
   * The safe area (core/src/menu-safe-area.ts) belongs to the SUBMENU, mounted on the trigger it hangs
   * off: it is what keeps the pointer counting as that trigger while the reader crosses the rows between
   * them. A top-level menu has no such corridor.
   */
  let safeArea: MenuSafeAreaHandle | null = null;
  if (parent && trigger) {
    safeArea = createMenuSafeArea(trigger, {
      debug: flaggedRoot != null,
      onHoldChange: (holding) => readout?.report(menuId, holding),
    });
  }
  const syncSafeArea = () => {
    if (content && content.dataset.state !== "open") safeArea?.clear();
  };

  /*
   * `@zag-js/menu`'s connect() types its props against the SVELTE framework binding (`T["element"]`
   * / `T["button"]`, Svelte's own `HTMLAttributes`/`HTMLButtonAttributes`), unlike most other Zag
   * packages this migration touches, which return loose `Record<string, any>` regardless of
   * framework. Those are structurally closed interfaces with no index signature, so a plain
   * `as DomProps` is rejected; the values ARE plain objects at runtime, so `as unknown as` here is
   * the same escape hatch this codebase already uses for other framework-typed values (test-setup.ts).
   */
  const triggerProps = (): DomProps =>
    (parent ? parent.getApi().getTriggerItemProps(api) : api.getTriggerProps()) as unknown as DomProps;

  const itemProps = (item: AuthoredItem): DomProps => {
    const base =
      item.kind === "item"
        ? api.getItemProps({ value: item.value, valueText: item.label, disabled: boolAttr(item.node, "disabled") })
        : api.getOptionItemProps({
            value: item.value,
            valueText: item.label,
            disabled: boolAttr(item.node, "disabled"),
            type: item.kind,
            checked: boolAttr(item.node, "data-checked"),
            onCheckedChange(checked: boolean) {
              if (item.kind === "radio" && checked) {
                for (const candidate of items)
                  if (candidate.kind === "radio" && candidate.group === item.group)
                    candidate.node.removeAttribute("data-checked");
              }
              item.node.toggleAttribute("data-checked", checked);
              root.dispatchEvent(
                new CustomEvent("sk-checked-change", { bubbles: true, detail: { value: item.value, checked } }),
              );
            },
          });
    return base as unknown as DomProps;
  };

  $effect(() => {
    if (!ready || !positioner || !content) return;
    if (trigger) applyZagProps(trigger, triggerProps());
    if (contextTrigger) applyZagProps(contextTrigger, api.getContextTriggerProps() as unknown as DomProps);
    const positionerProps = api.getPositionerProps() as unknown as DomProps;
    applyZagProps(positioner, anchorName ? (stripPositioningStyle(positionerProps) as DomProps) : positionerProps);
    if (anchorName && anchorEl) unbindAnchor = bindAnchor(anchorEl, positioner, anchorName);
    applyZagProps(content, api.getContentProps() as unknown as DomProps);
    for (const item of items) {
      applyZagProps(item.node, itemProps(item));
      const baseProps = {
        value: item.value,
        valueText: item.label,
        disabled: boolAttr(item.node, "disabled"),
        checked: item.kind === "item" ? undefined : boolAttr(item.node, "data-checked"),
      };
      if (item.labelNode) applyZagProps(item.labelNode, api.getItemTextProps(baseProps) as unknown as DomProps);
      if (item.indicatorNode) applyZagProps(item.indicatorNode, api.getItemIndicatorProps(baseProps) as unknown as DomProps);
    }
    syncSafeArea();
  });

  const cleanups: Array<() => void> = [];
  onMount(() => {
    if (!ready) return;

    /*
     * Only HERE, not in the script body: `@zag-js/svelte`'s `useMachine` starts the machine
     * (status → Started) from ITS OWN onMount, registered before this one by declaration order.
     * `send()`. Which is what `setParent`/`setChild` fire underneath. Silently discards any event sent
     * before that (`status !== Started`), so doing it at the script's top level (before ANY onMount
     * exists) never moved `isSubmenu`, and a submenu's first render came out with `data-part="trigger"`
     * instead of `"trigger-item"`.
     */
    if (parent) {
      menu.connect(service, normalizeProps).setParent(parent.service);
      parent.getApi().setChild(service);
    }

    if (trigger) cleanups.push(bindZagEvents(trigger, () => triggerProps()));
    if (contextTrigger) cleanups.push(bindZagEvents(contextTrigger, () => api.getContextTriggerProps() as unknown as DomProps));
    if (content) cleanups.push(bindZagEvents(content, () => api.getContentProps() as unknown as DomProps));
    for (const item of items) cleanups.push(bindZagEvents(item.node, () => itemProps(item)));

    /*
     * Aiming: while the pointer is OVER the trigger, not on `pointerleave` (which would already be an
     * event too late). A plain `addEventListener`, not a wrapped Zag prop: this only ADDS a handler, it
     * never replaces one of the machine's.
     */
    if (safeArea && trigger) {
      const aim = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        if (!content || content.dataset.state !== "open") return;
        safeArea?.aim({ x: event.clientX, y: event.clientY }, content.getBoundingClientRect());
      };
      trigger.addEventListener("pointermove", aim);
      cleanups.push(() => trigger.removeEventListener("pointermove", aim));
    }

    if (parent && trigger) {
      const openSubmenu = (event: KeyboardEvent) => {
        const direction = document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
        if (event.key === direction) api.setOpen(true);
      };
      trigger.addEventListener("keydown", openSubmenu);
      cleanups.push(() => trigger.removeEventListener("keydown", openSubmenu));
    }

    for (const item of items) {
      if (item.kind !== "item") continue;
      const onClick = () => {
        if (!boolAttr(item.node, "disabled"))
          root.dispatchEvent(new CustomEvent("sk-select", { bubbles: true, detail: { value: item.value } }));
      };
      item.node.addEventListener("click", onClick);
      cleanups.push(() => item.node.removeEventListener("click", onClick));
    }
  });

  onDestroy(() => {
    for (const cleanup of cleanups) cleanup();
    unbindAnchor?.();
    safeArea?.destroy();
    if (ownsReadout) readout?.destroy();
    else readout?.release(menuId);
    deleteMenuInstance(root);
  });
</script>
