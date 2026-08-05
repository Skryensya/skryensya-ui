import {
  menuParts,
  type MenuApi,
  type MenuItem,
  type MenuService,
} from "@skryensya/core/menu";
import { menu } from "@skryensya/core/machines";
import { normalizeProps, Portal, useMachine } from "@zag-js/react";
import { useEffect, useId, useState, type ReactNode, type RefObject } from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";

const cx = (...classes: Array<string | undefined>) =>
  classes.filter(Boolean).join(" ");
type CheckedState = Record<string, boolean>;

export type MenuProps = {
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
  /** Inherited from the Menu, so every level portals to the same place. */
  container?: RefObject<HTMLElement>;
  api: MenuApi;
  checkedState: CheckedState;
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
  container,
  checkedState,
  itemIndicator,
  items,
  onCheckedChange,
  onSelect,
  service,
  setCheckedState,
  submenuIndicator,
}: MenuListProps) {
  return items.map((item) => {
    if (item.children?.length) {
      return (
        <Submenu
          container={container}
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
  container,
  item,
  itemIndicator,
  onCheckedChange,
  onSelect,
  parentApi,
  parentService,
  submenuIndicator,
}: {
  /** Inherited from the Menu that owns this submenu, so both portal to the same place. */
  container?: RefObject<HTMLElement>;
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
    <>
      {/*
        * Wrapped in a menu root, like the markup emits. Vanilla needs this element because it is
        * where the submenu machine mounts; React has no such need, and for a while that was the
        * excuse for the two producing different DOM. It is only an excuse: `.sk-menu` inside a
        * content panel is now laid out as a full-width row, so the wrapper costs nothing here and
        * the two bindings finally nest the same.
        */}
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
      </div>
      <Portal container={container}>
        {/* Un submenú sale al COSTADO y alineado arriba, que no está en el juego de cuatro; se pide
          * por el hook de escape del pattern (menu.css), no agrandando el vocabulario público. */}
        <div
          {...anchor.positioner(api.getPositionerProps(), menuParts.positioner)}
          data-sk-submenu=""
        >
          <div {...api.getContentProps()} className={menuParts.content}>
            <MenuList
              api={api}
              container={container}
              checkedState={checkedState}
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
      </Portal>
    </>
  );
}

export function Menu({
  container,
  contextTarget,
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

  return (
    <div className={menuParts.root}>
      {contextTarget ? (
        <div {...api.getContextTriggerProps()} {...anchor.anchor("")}>{contextTarget}</div>
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
        <div {...anchor.positioner(api.getPositionerProps(), menuParts.positioner)}>
          <div {...api.getContentProps()} className={menuParts.content}>
            <MenuList
              api={api}
              container={container}
              checkedState={checkedState}
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
