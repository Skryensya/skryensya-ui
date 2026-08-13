import { anchoredParts } from "@skryensya/core/anchored";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  menuContract,
  menuParts,
  type MenuApi,
  type MenuItem,
  type MenuService,
} from "@skryensya/core/menu";
import { menu } from "@skryensya/core/machines";
import {
  createAdjacentGraceController,
  hasOpenSubmenuSibling,
  type AdjacentGraceController,
} from "@skryensya/core/menu-adjacent-grace";
import {
  createIntentOverlay,
  type IntentOverlayHandle,
  type IntentPoint,
} from "@skryensya/core/menu-intent-overlay";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
type CheckedState = Record<string, boolean>;

export type MenuProps = Pick<
  SignatureOptionsOf<typeof menuContract, "Menu">,
  "density"
> & {
  id?: string;
  disabled?: boolean;
  trigger?: ReactNode;
  triggerClassName?: string;
  contextTarget?: ReactNode;
  items: readonly MenuItem[];
  label?: string;
  indicator?: ReactNode;
  itemIndicator?: ReactNode;
  submenuIndicator?: ReactNode;
  /**
   * Draws @zag-js/menu's OWN pointer-intent polygon live over every submenu this Menu owns, plus a
   * status badge for `context.pointerRoutingMode`. Not a feature this binding adds: the machine
   * already computes and enforces this ("crossing a sibling on a diagonal path toward an open
   * submenu does not steal highlight"); the flag only makes that already-real geometry visible, for
   * teaching or debugging. See `@skryensya/core/menu-intent-overlay`.
   */
  debugSafetyTriangle?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (details: { open: boolean }) => void;
  onSelect?: (details: { value: string }) => void;
  onCheckedChange?: (details: { value: string; checked: boolean }) => void;
  /**
   * Where the floating content is portalled. Defaults to `document.body`, which is right whenever
   * an ancestor might clip it. Pass a ref to keep the content inside a subtree instead: a preview
   * frame, a scoped test harness, or a dialog that owns its own stacking context.
   */
  container?: RefObject<HTMLElement>;
};

type MenuListProps = {
  api: MenuApi;
  checkedState: CheckedState;
  density?: MenuProps["density"];
  debugSafetyTriangle?: MenuProps["debugSafetyTriangle"];
  service: MenuService;
  items: readonly MenuItem[];
  itemIndicator?: ReactNode;
  submenuIndicator?: ReactNode;
  onSelect?: MenuProps["onSelect"];
  onCheckedChange?: MenuProps["onCheckedChange"];
  setCheckedState: (item: MenuItem, checked: boolean) => void;
};

function initialCheckedState(items: readonly MenuItem[]): CheckedState {
  return Object.fromEntries(
    items.flatMap((item) => [
      ...(item.checked ? [[item.value, true] as const] : []),
      ...Object.entries(initialCheckedState(item.children ?? [])),
    ]),
  );
}

function MenuList({
  api,
  checkedState,
  density,
  debugSafetyTriangle,
  itemIndicator,
  items,
  onCheckedChange,
  onSelect,
  service,
  setCheckedState,
  submenuIndicator,
}: MenuListProps) {
  /*
   * One controller per rendered list, not per item: the hold is keyed by item value internally, so
   * a single instance already tracks "which candidate, if any, is currently being held" for this
   * whole list. `useRef` rather than `useState` because starting or clearing a hold is never
   * something this component itself needs to re-render for; only the DEFERRED `machineProps.
   * onPointerMove` call (which Zag's own state update re-renders for on its own) does.
   */
  const graceRef = useRef<AdjacentGraceController | null>(null);
  const grace = () => (graceRef.current ??= createAdjacentGraceController());
  useEffect(() => () => graceRef.current?.reset(), []);

  return items.map((item) => {
    if (item.kind === "separator") {
      return <div className={menuParts.separator} key={item.value} role="separator" />;
    }

    if (item.children?.length) {
      return (
        <Submenu
          density={density}
          debugSafetyTriangle={debugSafetyTriangle}
          item={item}
          itemIndicator={itemIndicator}
          key={item.value}
          onCheckedChange={onCheckedChange}
          onSelect={onSelect}
          parentApi={api}
          parentService={service}
          submenuIndicator={submenuIndicator}
        />
      );
    }

    const kind = item.kind ?? "item";
    const checked = item.checked ?? checkedState[item.value] ?? false;
    const machineProps =
      kind === "item"
        ? api.getItemProps({
            value: item.value,
            valueText: item.label,
            disabled: item.disabled,
          })
        : api.getOptionItemProps({
            value: item.value,
            valueText: item.label,
            disabled: item.disabled,
            type: kind,
            checked,
            onCheckedChange: (next) => {
              setCheckedState(item, next);
              onCheckedChange?.({ value: item.value, checked: next });
            },
          });

    return (
      <div
        {...machineProps}
        className={cx(menuParts.item, "sk-interactive")}
        data-tone={item.tone}
        key={item.value}
        onClick={(event) => {
          machineProps.onClick?.(event);
          if (kind === "item" && !item.disabled)
            onSelect?.({ value: item.value });
        }}
        onPointerMove={(event) => {
          /*
           * `hasOpenSubmenuSibling` is the ONLY thing gating this: with nothing open, every hold
           * would just be 200ms of nothing happening, so plain items behave exactly as before.
           *
           * NOT `() => machineProps.onPointerMove?.(event)`: a PointerEvent's `currentTarget` goes
           * back to `null` the instant dispatch finishes (React 17+ stopped POOLING synthetic
           * events, but never stopped this — it mirrors the native event it wraps), so replaying
           * the SAME event once the hold elapses hands Zag's real handler a `target` it can no
           * longer resolve to an item (measured: `highlightedValue` never left the trigger, the
           * hold "elapsed" but nothing ever committed). `setHighlightedValue` is the public,
           * event-free path for exactly this — committing a value with no event object to go stale.
           */
          if (event.pointerType === "mouse" && hasOpenSubmenuSibling(event.currentTarget)) {
            grace().hold(item.value, () => api.setHighlightedValue(item.value));
            return;
          }
          machineProps.onPointerMove?.(event);
        }}
        onPointerLeave={(event) => {
          grace().cancel(item.value);
          machineProps.onPointerLeave?.(event);
        }}
      >
        {/*
          * Zag names the label too, and only the vanilla enhancer was applying it: React shipped a
          * bare span while authored markup carried `data-part="item-text"` and the checked state.
          * The label is what a screen reader reads for the item, so this is not decoration.
          */}
        <span
          {...api.getItemTextProps({
            value: item.value,
            valueText: item.label,
            disabled: item.disabled,
            checked,
          })}
          className={menuParts.itemLabel}
        >
          {item.label}
        </span>
        {kind !== "item" ? (
          <span
            {...api.getItemIndicatorProps({
              value: item.value,
              valueText: item.label,
              disabled: item.disabled,
              checked,
            })}
            aria-hidden="true"
            className={menuParts.itemIndicator}
          >
            {itemIndicator ?? <Icon name="check" />}
          </span>
        ) : null}
      </div>
    );
  });
}

function Submenu({
  density,
  debugSafetyTriangle,
  item,
  itemIndicator,
  onCheckedChange,
  onSelect,
  parentApi,
  parentService,
  submenuIndicator,
}: {
  density?: MenuProps["density"];
  debugSafetyTriangle?: MenuProps["debugSafetyTriangle"];
  item: MenuItem;
  itemIndicator?: ReactNode;
  onCheckedChange?: MenuProps["onCheckedChange"];
  onSelect?: MenuProps["onSelect"];
  parentApi: MenuApi;
  parentService: MenuService;
  submenuIndicator?: ReactNode;
}) {
  const id = useId();
  const children = item.children ?? [];
  const [checkedState, setChecked] = useState<CheckedState>(() =>
    initialCheckedState(children),
  );
  const service = useMachine(menu.machine, {
    id,
    "aria-label": item.label,
    positioning: { placement: "right-start", gutter: 4 },
  });
  const api = menu.connect(service, normalizeProps);
  const anchor = useAnchored(id);

  useEffect(() => {
    api.setParent(parentService);
    parentApi.setChild(service);
  }, [parentService, service]);

  /*
   * `context.get(...)` below is read fresh on every render, and a `useEffect` with no dependency
   * array runs after every one of them: cheap here (three DOM writes, no allocation Zag itself
   * would not already have caused), and simpler than hand-picking which of `open`/highlight/pointer
   * events should count as "the polygon might have changed" when the honest answer is "any of
   * them, and only Zag knows which fired." Destroying the handle on unmount is the only cleanup
   * this needs; `update()` itself removes the DOM when the polygon goes empty (submenu closed or
   * pointer left it), so there is no separate "close" branch to keep in sync.
   */
  const debugOverlay = useRef<IntentOverlayHandle | null>(null);
  useEffect(() => {
    if (!debugSafetyTriangle) {
      debugOverlay.current?.destroy();
      debugOverlay.current = null;
      return;
    }
    debugOverlay.current ??= createIntentOverlay();
    debugOverlay.current.update({
      polygon: service.context.get("intentPolygon") as readonly IntentPoint[] | null,
      locked: parentService.context.get("pointerRoutingMode") === "locked",
      label: "Pointer routing",
      lockedText: "locked",
      freeText: "free",
    });
  });
  useEffect(() => () => debugOverlay.current?.destroy(), []);

  const setCheckedState = (changedItem: MenuItem, checked: boolean) => {
    setChecked((current) => {
      if (changedItem.kind !== "radio" || !checked) {
        return { ...current, [changedItem.value]: checked };
      }
      const next = { ...current };
      for (const candidate of children) {
        if (
          candidate.kind === "radio" &&
          candidate.group === changedItem.group
        ) {
          next[candidate.value] = false;
        }
      }
      next[changedItem.value] = true;
      return next;
    });
  };

  return (
    /*
     * Wrapped in a menu root, like the markup emits, and NOT portalled: a submenu's trigger and its
     * own positioner stay siblings under this one `.sk-menu`, same as Vanilla's nested markup.
     *
     * Portalling here (the old approach) put the positioner ahead of its own trigger in DOM order
     * once a THIRD level was involved: React commits a nested `<Portal>` before the parent's own
     * portal finishes, so `document.body`'s children came out child-first — the deepest submenu's
     * positioner landed on the page before the ancestor tree that contains its trigger button. CSS
     * anchor positioning silently drops a `position-anchor` reference to an anchor that appears
     * LATER in tree order than the query element (measured with a two-node repro: swapping which of
     * two `position: fixed` siblings comes first in markup was the only variable, and the one whose
     * anchor came after it always fell back to the UA default top-left corner, `position-anchor`
     * still reading back the right custom ident and `position-area` still reading back the right
     * keywords — the computed values lie, only the rendered rect tells the truth). Every submenu
     * beyond the first level shared this exact ordering bug, and "el placement de los segundos
     * niveles" was that: not a wrong `position-area`, an anchor the browser refused to use because
     * of DOM order alone.
     *
     * Staying nested keeps trigger-before-positioner true AT EVERY DEPTH by construction: each
     * `Submenu` is one self-contained tree, so there is no portal commit order to fight. `position:
     * fixed` still escapes an ancestor's `overflow: auto` (patterns/anchored.css), so the panel does
     * not need `document.body` for that either — Vanilla never portals anything and needs none of
     * this. The top-level `Menu` keeps its own `<Portal>`: single level, its trigger renders inline
     * and its positioner reaches `document.body` afterward, so trigger already precedes positioner
     * there and the ordering bug never applied to it.
     */
    <div className={menuParts.root}>
      {/*
        * A BUTTON, like the markup emits. The contract describes one shape; two elements for one
        * node is the divergence this whole arrangement exists to prevent, and a submenu trigger is
        * a control either way. `type="button"` keeps it out of form submission, and Zag's props
        * still own the role and the roving tabindex.
        */}
      <button
        {...parentApi.getTriggerItemProps(api)}
        {...anchor.anchor(cx(menuParts.item, "sk-interactive"))}
        onKeyDown={(event) => {
          parentApi.getTriggerItemProps(api).onKeyDown?.(event);
          const direction =
            document.documentElement.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
          if (event.key === direction) api.setOpen(true);
        }}
        type="button"
      >
        <span className={menuParts.itemLabel}>{item.label}</span>
        {/*
          * No `getIndicatorProps` here. It is `aria-hidden` decoration, and the vanilla enhancer has
          * no selector that reaches a submenu trigger's chevron, so naming it in one binding only
          * bought a divergence and no behaviour.
          */}
        <span aria-hidden="true" className={menuParts.itemIndicator}>
          {submenuIndicator ?? <Icon name="chevron-right" />}
        </span>
      </button>
      <div
        {...anchor.positioner(api.getPositionerProps(), menuParts.positioner)}
        data-density={density}
        data-sk-submenu=""
      >
        <div {...api.getContentProps()} className={menuParts.content}>
          <MenuList
            api={api}
            checkedState={checkedState}
            density={density}
            debugSafetyTriangle={debugSafetyTriangle}
            itemIndicator={itemIndicator}
            items={children}
            onCheckedChange={onCheckedChange}
            onSelect={onSelect}
            service={service}
            setCheckedState={setCheckedState}
            submenuIndicator={submenuIndicator}
          />
        </div>
      </div>
    </div>
  );
}

export function Menu({
  container,
  contextTarget,
  density,
  debugSafetyTriangle,
  disabled,
  defaultOpen,
  id,
  indicator,
  itemIndicator,
  items,
  label,
  onCheckedChange,
  onOpenChange,
  onSelect,
  open,
  submenuIndicator,
  trigger,
  triggerClassName,
}: MenuProps) {
  const generatedId = useId();
  const [checkedState, setChecked] = useState<CheckedState>(() =>
    initialCheckedState(items),
  );
  const service = useMachine(menu.machine, {
    id: id ?? generatedId,
    "aria-label": label,
    defaultOpen,
    open,
    onOpenChange,
    positioning: { placement: "bottom-start" },
  });
  const api = menu.connect(service, normalizeProps);
  const anchor = useAnchored(id ?? generatedId);

  const setCheckedState = (changedItem: MenuItem, checked: boolean) => {
    setChecked((current) => {
      if (changedItem.kind !== "radio" || !checked) {
        return { ...current, [changedItem.value]: checked };
      }
      const next = { ...current };
      for (const candidate of items) {
        if (
          candidate.kind === "radio" &&
          candidate.group === changedItem.group
        ) {
          next[candidate.value] = false;
        }
      }
      next[changedItem.value] = true;
      return next;
    });
  };

  /*
   * A CONTEXT trigger never takes the native-anchor route (see the matching comment in
   * `packages/vanilla/src/components/menu.ts`): the pattern anchors to an ELEMENT, and what matters
   * here is WHERE INSIDE that (possibly page-wide) element the right-click landed, not the element's
   * own box. The machine already solves exactly this — `getContextTriggerProps` forwards the click's
   * point, the machine stores it and hands floating-ui a zero-size anchor rect at that point, so
   * `getPositionerProps()` comes back with a real `style` placing the menu at the pointer with the
   * SAME `bottom-start` default as a trigger button (below, growing toward the inline-end). Both
   * bindings read this off the one shared machine; neither has positioning logic of its own to keep
   * in sync.
   */
  const isContextMenu = Boolean(contextTarget);
  const positionerProps = isContextMenu
    ? {
        ...api.getPositionerProps(),
        className: cx(menuParts.positioner, anchoredParts.positioner),
      }
    : anchor.positioner(api.getPositionerProps(), menuParts.positioner);

  return (
    <div className={menuParts.root} data-density={density}>
      {contextTarget ? (
        <div {...api.getContextTriggerProps()}>{contextTarget}</div>
      ) : (
        <button
          {...api.getTriggerProps()}
          {...anchor.anchor(cx("sk-button", "sk-interactive", menuParts.trigger, triggerClassName))}
          disabled={disabled}
          type="button"
        >
          {trigger}
          {/*
            * The chevron is the DEFAULT, not an opt-in. The contract template paints one on every
            * menu trigger, so authored markup always had it and React only rendered one when the
            * caller remembered to pass `indicator`: the same tree came out 28px narrower here
            * than in Vanilla. Pass `indicator={null}` to suppress it deliberately.
            */}
          <span aria-hidden="true">
            {indicator === undefined ? <Icon name="chevron-down" /> : indicator}
          </span>
        </button>
      )}
      <Portal container={container}>
        {/* `data-density` re-stamped here, not inherited from the root above: this positioner just
          * portalled to `<body>`, a different DOM subtree, same reason menu.css re-declares the
          * appearance hooks on `.sk-menu__positioner`. */}
        <div {...positionerProps} data-density={density}>
          <div {...api.getContentProps()} className={menuParts.content}>
            <MenuList
              api={api}
              checkedState={checkedState}
              density={density}
              debugSafetyTriangle={debugSafetyTriangle}
              itemIndicator={itemIndicator}
              items={items}
              onCheckedChange={onCheckedChange}
              onSelect={onSelect}
              service={service}
              setCheckedState={setCheckedState}
              submenuIndicator={submenuIndicator}
            />
          </div>
        </div>
      </Portal>
    </div>
  );
}
