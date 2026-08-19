import { menubarParts, resolveMenubarKey, type MenubarFocus } from "@skryensya/core/menubar";
import { menuParts, type MenuApi, type MenuItem } from "@skryensya/core/menu";
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { useAnchored } from "./anchored.js";
import { Icon } from "./icon.js";
import { MenuPopup, useMenuMachine, type CheckedState } from "./menu.js";

const cx = (base: string, className: string | undefined) => (className ? `${base} ${className}` : base);

/*
 * MENUBAR, the React binding — now that each item's dropdown is a real `Menu` instance (decision:
 * see `menubar.ts`'s own header comment in core). `Menubar` owns only what Zag's own machine does
 * NOT: roving tabindex between TOP-LEVEL triggers, and the handoff that closes one item's dropdown
 * and opens the adjacent one. Everything that happens once a dropdown (or a submenu inside it) has
 * focus — Up/Down, Enter, Escape, Home/End within that list, checkbox/radio, nested submenus — is
 * `useMenuMachine`'s own, the same hook `Menu` itself uses, called here per item instead of a second,
 * poorer implementation.
 *
 * The one seam that needs care: Zag's own content keydown handler ALSO claims ArrowLeft/Right/Home/
 * End once a dropdown has focus (for nested-submenu navigation), and it runs on the BUBBLE phase.
 * This binding's own keydown handler runs on the CAPTURE phase (`onKeyDownCapture`) at the bar root
 * — capture always fires before bubble, on any ancestor — and steps aside (does nothing, lets the
 * event continue to Zag) whenever focus is inside a NESTED submenu (`[data-sk-submenu]`), or whenever
 * a dropdown is open and the key isn't Left/Right (Home/End inside an open list is Zag's own job,
 * matching APG menu conventions, not the bar's).
 */

type MenubarContextValue = {
  isTriggerStop: (topIndex: number) => boolean;
  registerTrigger: (topIndex: number, element: HTMLElement | null) => void;
  registerApi: (topIndex: number, api: MenuApi | null) => void;
  /** Closes every OTHER item's dropdown — a safety net beside Zag's own outside-dismiss handling. */
  closeSiblings: (exceptIndex: number) => void;
};

const MenubarContext = createContext<MenubarContextValue | null>(null);

function useMenubarContext(component: string): MenubarContextValue {
  const context = useContext(MenubarContext);
  if (!context) throw new Error(`Menubar.${component} must be rendered inside Menubar.`);
  return context;
}

type TopShape = { hasMenu: boolean };

/** `Menubar`'s own children → each `MenubarItem`'s shape: does it carry `items` (the contract's own
 *  `items` slot, `Menu`'s own item shape, verbatim — see `menu.ts`'s `menuItemShape`). */
function readTops(children: ReactNode): TopShape[] {
  return Children.toArray(children)
    .filter((child): child is ReactElement<MenubarItemProps> => isValidElement(child) && child.type === MenubarItem)
    .map((item) => ({ hasMenu: Boolean(item.props.items?.length) }));
}

export type MenubarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  label: string;
  children: ReactNode;
};

export function Menubar({ children, className, label, ...props }: MenubarProps) {
  const [focus, setFocus] = useState<MenubarFocus>({ topIndex: 0, subIndex: null });
  const triggers = useRef(new Map<number, HTMLElement>());
  const apis = useRef(new Map<number, MenuApi>());

  const tops = useMemo(() => readTops(children), [children]);
  const topCount = tops.length;
  const hasMenuAt = (topIndex: number) => tops[topIndex]?.hasMenu ?? false;
  // Never exercised by the keys this handler actually resolves (see the note on `onKeyDown` below),
  // kept only because `resolveMenubarKey`'s signature requires it — its own logic isn't changing.
  const subCountOf = () => 0;

  const openTopIndex = () => {
    for (const [topIndex, api] of apis.current) if (api.open) return topIndex;
    return -1;
  };

  const currentFocus = (): MenubarFocus => {
    const active = document.activeElement;
    for (const [topIndex, element] of triggers.current) if (element === active) return { topIndex, subIndex: null };
    const open = openTopIndex();
    if (open !== -1) return { topIndex: open, subIndex: 0 };
    return focus;
  };

  const applyTabindex = (next: MenubarFocus) => setFocus(next);

  const moveFocus = (next: MenubarFocus) => {
    applyTabindex(next);
    if (next.subIndex === null) triggers.current.get(next.topIndex)?.focus();
    // Focus onto an open dropdown's own content is Zag's own job as part of opening it.
  };

  const closeAll = (except?: number) => {
    for (const [topIndex, api] of apis.current) if (topIndex !== except) api.setOpen(false);
  };

  /*
   * Only ArrowLeft/Right/Home/End ever reach `resolveMenubarKey` here — ArrowDown/Up/Enter/Space are
   * Zag's own, already wired via `getTriggerProps()` on each item's trigger, and Escape is Zag's own
   * standard menu behavior (closes and returns focus to ITS trigger) once a dropdown has focus.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !topCount) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-sk-submenu]")) return; // defer entirely to Zag

    const focusNow = currentFocus();
    const dropdownOpen = focusNow.subIndex !== null;
    if ((event.key === "Home" || event.key === "End") && dropdownOpen) return; // Zag's own list nav

    const action = resolveMenubarKey({ key: event.key, focus: focusNow, topCount, hasMenuAt, subCountOf });
    if (action.kind === "none") return;
    event.preventDefault();
    event.stopPropagation();

    if (action.kind === "moveTop") {
      if (action.keepOpen && hasMenuAt(action.topIndex)) {
        closeAll(action.topIndex);
        apis.current.get(action.topIndex)?.setOpen(true);
        applyTabindex({ topIndex: action.topIndex, subIndex: null });
      } else {
        if (action.keepOpen) closeAll();
        moveFocus({ topIndex: action.topIndex, subIndex: null });
      }
    } else if (action.kind === "move") {
      moveFocus(action.focus);
    }
  };

  const context: MenubarContextValue = {
    isTriggerStop: (topIndex) => focus.topIndex === topIndex && focus.subIndex === null,
    registerTrigger: (topIndex, element) => {
      if (element) triggers.current.set(topIndex, element);
      else triggers.current.delete(topIndex);
    },
    registerApi: (topIndex, api) => {
      if (api) apis.current.set(topIndex, api);
      else apis.current.delete(topIndex);
    },
    closeSiblings: (exceptIndex) => closeAll(exceptIndex),
  };

  const items = Children.map(children, (child, index) =>
    isValidElement(child) && child.type === MenubarItem
      ? cloneElement(child as ReactElement<Record<string, unknown>>, { topIndex: index })
      : child,
  );

  return (
    <MenubarContext.Provider value={context}>
      <div
        {...props}
        aria-label={label}
        className={cx(menubarParts.root, className)}
        onFocus={() => applyTabindex(currentFocus())}
        onKeyDownCapture={onKeyDown}
        role="menubar"
      >
        {items}
      </div>
    </MenubarContext.Provider>
  );
}

export type MenubarItemProps = {
  /** The command's own name — the contract's `children` slot. */
  children: ReactNode;
  /** The dropdown this item opens, if it is a trigger rather than a plain command — `Menu`'s own
   *  item shape, verbatim (the same `MenuItem[]` its own `items` prop takes). */
  items?: readonly MenuItem[];
  /** Fires when a LEAF item (no dropdown) is activated. */
  onActivate?: () => void;
  /** Fires when a command inside this item's dropdown is chosen — `Menu`'s own `onSelect`, threaded
   *  straight through since the popup here IS `Menu`'s own. */
  onSelect?: (details: { value: string }) => void;
  /** Where the dropdown portals — `Menu`'s own `container`, see its identical doc. */
  container?: RefObject<HTMLElement>;
  /** Styles the trigger as `nav-list`'s own link instead of a Button — see `menubar.ts`'s own doc
   *  on the contract option this mirrors. Every bit of Menubar's own behavior is unchanged. */
  nav?: boolean;
};

/** `topIndex` is injected by the parent `Menubar` — never author-set. */
type InjectedMenubarItemProps = MenubarItemProps & { topIndex: number };

function initialCheckedState(items: readonly MenuItem[]): CheckedState {
  return Object.fromEntries(
    items.flatMap((item) => [
      ...(item.checked ? [[item.value, true] as const] : []),
      ...Object.entries(initialCheckedState(item.children ?? [])),
    ]),
  );
}

export function MenubarItem(publicProps: MenubarItemProps) {
  const { children, container, items, nav, onActivate, onSelect, topIndex } =
    publicProps as InjectedMenubarItemProps;
  const context = useMenubarContext("Item");
  const hasMenu = Boolean(items?.length);
  const id = useId();
  const { service, api } = useMenuMachine({ id, defaultOpen: false });
  const anchor = useAnchored(id);
  const [checkedState, setChecked] = useState<CheckedState>(() => initialCheckedState(items ?? []));

  useEffect(() => {
    context.registerApi(topIndex, hasMenu ? api : null);
    return () => context.registerApi(topIndex, null);
  });

  // Zag's own open transition is the trigger, not the click that caused it — this also covers
  // opening via keyboard (ArrowDown/Enter/Space), which a click-only handler would miss.
  useEffect(() => {
    if (hasMenu && api.open) context.closeSiblings(topIndex);
  }, [api.open, hasMenu, topIndex]);

  const setCheckedState = (changedItem: MenuItem, checked: boolean) => {
    setChecked((current) => {
      if (changedItem.kind !== "radio" || !checked) return { ...current, [changedItem.value]: checked };
      const next = { ...current };
      for (const candidate of items ?? []) {
        if (candidate.kind === "radio" && candidate.group === changedItem.group) next[candidate.value] = false;
      }
      next[changedItem.value] = true;
      return next;
    });
  };

  const tabIndex = context.isTriggerStop(topIndex) ? 0 : -1;
  const ref = (element: HTMLElement | null) => context.registerTrigger(topIndex, element);

  return (
    <div className={cx(menubarParts.itemWrapper, menuParts.root)}>
      {hasMenu ? (
        <button
          {...api.getTriggerProps()}
          {...anchor.anchor(
            cx(menubarParts.item, nav ? "sk-nav-list__link sk-interactive" : "sk-button sk-interactive"),
          )}
          {...(nav ? {} : { "data-size": "sm", "data-variant": "ghost" })}
          ref={ref}
          role="menuitem"
          tabIndex={tabIndex}
          type="button"
        >
          {nav ? <span className="sk-nav-list__label">{children}</span> : children}
          {/* Same glyph as Menu's own top-level trigger (`menu.tsx`), so the two read as the same
            * affordance everywhere: this item opens something, absent on a leaf command. `menubar.css`
            * rotates it on `[aria-expanded="true"]` — the glyph says "opens", the rotation says "is
            * open right now", which a bar item otherwise has no pressed/visited look to say on its
            * own. */}
          <span aria-hidden="true" className={menubarParts.itemIndicator}>
            <Icon name="chevron-down" />
          </span>
        </button>
      ) : (
        <button
          // `sk-anchor` even with no popup to anchor: the contract's own shared trigger node
          // carries it unconditionally too (`menubar.ts`) — inert without a name ever written on
          // it (`anchored.ts`'s own doc), so matching that here is simpler than a second, leaf-only
          // class list to keep symmetric. `sk-button`/`ghost`/`sm` mirror the core template's own
          // attrs for the identical node — a bar item is a real Button, sized and skinned to sit
          // flush in a row of siblings, not the filled default a lone page action wants.
          // `nav` mirrors the core template's other sibling node instead: `sk-nav-list__link`, no
          // Button-specific attrs, its label wrapped the same way `NavListLink` wraps its own.
          className={cx(
            menubarParts.item,
            nav ? "sk-nav-list__link sk-interactive sk-anchor" : "sk-button sk-interactive sk-anchor",
          )}
          {...(nav ? {} : { "data-size": "sm", "data-variant": "ghost" })}
          onClick={() => onActivate?.()}
          ref={ref}
          role="menuitem"
          tabIndex={tabIndex}
          type="button"
        >
          {nav ? <span className="sk-nav-list__label">{children}</span> : children}
        </button>
      )}
      {hasMenu ? (
        <MenuPopup
          api={api}
          checkedState={checkedState}
          container={container}
          items={items!}
          onSelect={onSelect}
          positionerProps={anchor.positioner(api.getPositionerProps(), menuParts.positioner)}
          service={service}
          setCheckedState={setCheckedState}
        />
      ) : null}
    </div>
  );
}
