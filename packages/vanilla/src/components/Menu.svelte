<script module lang="ts">
  import type { MenuApi, MenuService } from "@skryensya/core/menu";

  /*
   * Ligado padre/hijo entre menús anidados: un submenú encuentra su padre subiendo por `closest()`
   * sobre el DOM (vanilla nunca portales), y esto es lo que empareja cada root con su machine.
   * Bloque `module`: UNA instancia por módulo, compartida por todos los `Menu.svelte` que este
   * archivo monta — si viviera en el `<script>` normal, cada componente tendría su PROPIO WeakMap y
   * un submenú nunca encontraría a su padre.
   */
  type MenuInstance = { service: MenuService; getApi: () => MenuApi };
  const instances = new WeakMap<HTMLElement, MenuInstance>();
</script>

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
  import { getRoot, uniqueId } from "../runtime/svelte-hydrate";

  /*
   * MENU, enhancer machine-backed sobre `@zag-js/menu` (la MISMA máquina que usa React, vía
   * `@skryensya/core/machines`). No renderiza estructura: escanea su markup autorado y parchea los
   * atributos que devuelve `connect` sobre esos nodos.
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
   * El pattern Anclaje (ADR-25). SOLO el TRIGGER (botón) entra por esa ruta: un context trigger no
   * es un punto fijo del layout, es la región que capturó el right-click, y la machine ya resuelve
   * ese caso sola con `getContextTriggerProps`/`anchorPoint`.
   *
   * Capturado UNA vez: `getRootProps` de este machine no toca `root.id`, pero el trigger/content sí
   * reciben ids namespaced que `applyZagProps` escribe de vuelta — el mismo motivo por el que el id
   * del machine nunca se relee en vivo del DOM en el resto de esta migración.
   */
  const menuId = root.id || uniqueId("sk-menu");
  const anchorEl = trigger;
  const anchorName = supportsAnchorPositioning() && anchorEl ? anchorNameFor(menuId) : null;
  let unbindAnchor: (() => void) | undefined;

  const service = useMachine(menu.machine, () => ({
    id: menuId,
    "aria-label": root.getAttribute("aria-label") ?? undefined,
    defaultOpen: root.hasAttribute("data-open"),
    positioning: { placement: "bottom-start" as const },
    onOpenChange(details: { open: boolean }) {
      root.dispatchEvent(new CustomEvent("sk-open-change", { bubbles: true, detail: { open: details.open } }));
    },
  }));

  const api = $derived(menu.connect(service, normalizeProps));

  // Ligado padre/hijo: un submenú encuentra su padre por closest() sobre el DOM. `parentRoot`/
  // `parent` se resuelven ya, síncronos, porque `instances` es del padre HACIA ABAJO (el padre se
  // registra ANTES de que su hijo empiece a montar, mismo orden que garantiza querySelectorAll).
  const parentRoot = root.parentElement?.closest<HTMLElement>(selector.root);
  const parent = parentRoot ? instances.get(parentRoot) : undefined;
  instances.set(root, { service, getApi: () => api });

  /*
   * Vanilla nunca portala: cada root de submenú sigue siendo descendiente real del que lleva la
   * flag, así que `closest()` solo la encuentra en este root o en un ancestro.
   */
  const flaggedRoot = root.closest<HTMLElement>(`[${menuAttrs.debugSafetyTriangle}]`);
  const readout: IntentReadoutHandle | null = flaggedRoot
    ? getIntentReadout(flaggedRoot, { label: "Pointer routing", lockedText: "locked", freeText: "free" })
    : null;
  const ownsReadout = flaggedRoot === root;

  /*
   * La zona segura (core/src/menu-safe-area.ts) pertenece al SUBMENÚ, montada en el trigger del que
   * cuelga: es lo que mantiene el puntero contando como ese trigger mientras el lector cruza las
   * filas entre ellos. Un menú de nivel superior no tiene ese corredor.
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
     * Recién ACÁ, no en el cuerpo del script: `@zag-js/svelte`'s `useMachine` arranca la máquina
     * (status → Started) desde SU PROPIO onMount, registrado antes que este por orden de
     * declaración. `send()` — lo que `setParent`/`setChild` disparan por debajo — descarta en
     * silencio cualquier evento mandado antes de eso (`status !== Started`), así que hacerlo en el
     * top level del script (antes de que exista NINGÚN onMount) nunca movía `isSubmenu`, y el
     * primer render de un submenú salía con `data-part="trigger"` en vez de `"trigger-item"`.
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
     * Aiming: mientras el puntero está SOBRE el trigger, no en `pointerleave` (que ya sería un
     * evento tarde). `addEventListener` liso, no un prop de Zag envuelto: esto solo AGREGA un
     * handler, nunca reemplaza uno de la máquina.
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
    instances.delete(root);
  });
</script>
