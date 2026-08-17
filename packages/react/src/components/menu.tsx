import { anchoredParts } from "@skryensya/core/anchored";
import type { SignatureOptionsOf } from "@skryensya/core/contract";
import {
  menuAttrs,
  menuContract,
  menuParts,
  type MenuApi,
  type MenuItem,
  type MenuService,
} from "@skryensya/core/menu";
import { menu } from "@skryensya/core/machines";
import {
  getIntentReadout,
  type IntentReadoutHandle,
} from "@skryensya/core/menu-intent-readout";
import { createMenuSafeArea, type MenuSafeAreaHandle } from "@skryensya/core/menu-safe-area";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
type CheckedState = Record<string, boolean>;

const {
  triggerSquareStart: triggerSquareStartOption,
  triggerSquareEnd: triggerSquareEndOption,
  triggerVariant: triggerVariantOption,
  triggerSize: triggerSizeOption,
  triggerIconOnly: triggerIconOnlyOption,
} = menuContract.options;

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
  /** The TRIGGER button's own accessible name — see `menu.ts`'s identical option doc. For an
   *  icon-only trigger (leave `trigger` unset): the chevron below is painted either way, and this
   *  is what makes the button announce something instead of nothing. */
  triggerLabel?: string;
  /** Removes the trigger button's own start/end corner rounding — see `menu.ts`'s identical
   *  option doc. The same attribute (`data-square-start`/`-end`) `Button`'s own `squareStart`/
   *  `squareEnd` options write; button.css owns the rule, this only reaches the same attribute. */
  triggerSquareStart?: boolean;
  triggerSquareEnd?: boolean;
  /** Passed straight to the trigger's own `data-variant`/`data-size` — see `menu.ts`'s identical
   *  option doc. `Button`'s own `[data-variant="…"]`/`[data-size="…"]` rules (button.css) apply to
   *  the trigger directly once these are set; nothing here repeats their CSS. */
  triggerVariant?: string;
  triggerSize?: string;
  /** The SAME attribute `Button`'s own `iconOnly` option writes — see `menu.ts`'s identical
   *  option doc. */
  triggerIconOnly?: boolean;
  indicator?: ReactNode;
  itemIndicator?: ReactNode;
  submenuIndicator?: ReactNode;
  /**
   * Paints the SAFE AREA (`@skryensya/core/menu-safe-area`) over every submenu this Menu owns, plus
   * a status line saying whether it is currently holding the pointer. Not a feature this binding
   * adds and not a drawing OF one: the safe area is a real element on every submenu either way, and
   * the flag only gives it a fill, for teaching or debugging.
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
  /** The one readout for the whole menu, threaded down the same way `debugSafetyTriangle` is. */
  readout?: IntentReadoutHandle | null;
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
  readout,
  service,
  setCheckedState,
  submenuIndicator,
}: MenuListProps) {
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
          readout={readout}
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
  readout,
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
  readout?: IntentReadoutHandle | null;
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
   * The safe area (core/src/menu-safe-area.ts) belongs to this submenu, mounted on the trigger it
   * hangs off. Created once per mounted trigger rather than per render: it owns a real element and
   * four listeners, and none of that depends on anything React re-renders for. Both refs below are
   * `useRef` for the same reason — nothing this holds is ever read during render.
   */
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const safeArea = useRef<MenuSafeAreaHandle | null>(null);
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    safeArea.current = createMenuSafeArea(trigger, {
      debug: debugSafetyTriangle,
      onHoldChange: (holding) => readout?.report(id, holding),
    });
    return () => {
      safeArea.current?.destroy();
      safeArea.current = null;
      readout?.release(id);
    };
  }, [debugSafetyTriangle, id, readout]);

  /* Closed submenu, no corridor: the shape has to go, or it keeps intercepting the rows it covers. */
  useEffect(() => {
    if (!api.open) safeArea.current?.clear();
  }, [api.open]);

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
        onPointerMove={(event) => {
          parentApi.getTriggerItemProps(api).onPointerMove?.(event);
          /*
           * Aiming while the pointer is still ON the trigger is the whole trick: an element created
           * in response to `pointerleave` arrives one event too late, with Zag's 100ms close fuse
           * already lit. The submenu's own content element is the far side of the corridor, which is
           * why it needs a ref rather than a query.
           */
          const content = contentRef.current;
          if (event.pointerType !== "mouse" || !content || !api.open) return;
          safeArea.current?.aim(
            { x: event.clientX, y: event.clientY },
            content.getBoundingClientRect(),
          );
        }}
        ref={triggerRef}
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
        <div {...api.getContentProps()} className={menuParts.content} ref={contentRef}>
          <MenuList
            api={api}
            checkedState={checkedState}
            density={density}
            debugSafetyTriangle={debugSafetyTriangle}
            itemIndicator={itemIndicator}
            items={children}
            onCheckedChange={onCheckedChange}
            onSelect={onSelect}
            readout={readout}
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
  triggerLabel,
  triggerSquareStart,
  triggerSquareEnd,
  triggerVariant,
  triggerSize,
  triggerIconOnly,
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
  /*
   * ONE readout for the whole menu, owned by the root and handed down to every `Submenu`: the
   * question it answers ("is the pointer protected right now") is about the menu, not about one
   * level, and the old badge was created per open submenu — two levels open stacked two of them on
   * the same fixed coordinates. It mounts into this root, in flow (menu-intent-readout.ts), so a
   * `useState` holding the element is what makes the effect run once the root actually exists.
   */
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);
  const [readout, setReadout] = useState<IntentReadoutHandle | null>(null);
  useEffect(() => {
    if (!debugSafetyTriangle || !rootEl) {
      setReadout(null);
      return;
    }
    const handle = getIntentReadout(rootEl, {
      label: "Pointer routing",
      lockedText: "locked",
      freeText: "free",
    });
    setReadout(handle);
    return () => {
      handle.destroy();
      setReadout(null);
    };
  }, [debugSafetyTriangle, rootEl]);

  const isContextMenu = Boolean(contextTarget);
  const positionerProps = isContextMenu
    ? {
        ...api.getPositionerProps(),
        className: cx(menuParts.positioner, anchoredParts.positioner),
      }
    : anchor.positioner(api.getPositionerProps(), menuParts.positioner);

  return (
    /* The debug attribute is STAMPED here, not just threaded as a prop: menu.css keys the flagged
     * root's own column layout off it (so the readout gets its own space instead of covering the
     * trigger), and Vanilla has carried it in markup all along. */
    <div
      className={menuParts.root}
      data-density={density}
      {...(debugSafetyTriangle ? { [menuAttrs.debugSafetyTriangle]: "" } : {})}
      ref={setRootEl}
    >
      {contextTarget ? (
        <div {...api.getContextTriggerProps()}>{contextTarget}</div>
      ) : (
        <button
          {...api.getTriggerProps()}
          {...anchor.anchor(cx("sk-button", "sk-interactive", menuParts.trigger, triggerClassName))}
          aria-label={triggerLabel}
          {...{
            [triggerSquareStartOption.attr]: triggerSquareStart
              ? triggerSquareStartOption.trueValue
              : undefined,
            [triggerSquareEndOption.attr]: triggerSquareEnd ? triggerSquareEndOption.trueValue : undefined,
            [triggerVariantOption.attr]: triggerVariant,
            [triggerSizeOption.attr]: triggerSize,
            [triggerIconOnlyOption.attr]: triggerIconOnly ? triggerIconOnlyOption.trueValue : undefined,
          }}
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
              readout={readout}
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
